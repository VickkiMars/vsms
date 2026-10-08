# Architecture & Technical Design Specification — Sprint 3

**Features:**
1. Automated Overstay Surveillance & Audible Web Audio Alert
2. Police Wanted Criminal & Blacklist Screening Engine
3. Front-Desk Webcam Visitor Photo Capture

---

## 1. Architectural Decisions & Trade-Offs

### ADR-01: Native Web Audio API Oscillator Synthesis vs. Audio Asset Files
- **Context:** An audible alert must sound when an on-site visitor's stay exceeds `expectedDurationMinutes`.
- **Options Considered:**
  1. *Static MP3/WAV Audio File:* Load `/sounds/alert.mp3` via `<audio>` tag.
  2. *Web Audio API Oscillator Node:* Procedurally synthesize alert tones (sine/triangle waves at calibrated frequencies) using the browser's native `AudioContext`.
- **Decision:** **Web Audio API Oscillator Node**.
- **Rationale:** 
  - Zero external asset dependency: Cannot fail due to 404s, slow network loading, CORS, or asset bundling paths.
  - Fully offline capable in air-gapped security guard booths.
  - Granular control over attack, decay, sustain, release (ADSR), frequencies, and volume gain.
  - **Browser Policy Handling:** Modern browsers suspend `AudioContext` until the first user interaction. `audioAlertService` binds a one-time click/keydown listener on `document` to immediately call `audioContext.resume()`.

### ADR-02: Dual-Tier Police Wanted Registry & Screening Adapter
- **Context:** System must flag blacklisted individuals and connect to a local police database of wanted criminals.
- **Options Considered:**
  1. *Direct External HTTP-only Call:* Call a remote police API on every keystroke.
  2. *Dual-Tier Adapter (Local Police DB + Remote REST Hook):* Maintain a local relational table (`police_wanted_registry`) seeded with active warrants and law enforcement records, paired with an asynchronous adapter (`policeDbService`) that can query local SQLite/Supabase or proxy to a local precinct REST endpoint (`/api/police-db/wanted`).
- **Decision:** **Dual-Tier Adapter Pattern**.
- **Rationale:**
  - High availability: Facility check-in cannot halt if the municipal police server experiences downtime or high latency.
  - Offline resilience: Front-desk checkpoints operate continuously even during internet outages.
  - Privacy and regulatory compliance: Queries stay within the local boundary unless explicitly configured to push to law enforcement webhooks.
  - Multi-attribute screening: Match on National ID/Passport (exact), Phone (normalized digits), and Full Name (case-insensitive token overlap).

### ADR-03: Native HTML5 `getUserMedia` & Canvas Capture vs. 3rd-Party Library
- **Context:** Capture live facial photos of visitors during front-desk registration.
- **Options Considered:**
  1. *Third-Party Dependency (`react-webcam` or `@react-camera`):* Introduces third-party package dependencies, version lock-in, and peer dependency conflicts with React 18/Vite.
  2. *Native `navigator.mediaDevices.getUserMedia` + HTML5 Canvas:* Directly access standard browser media stream APIs and draw frames to an in-memory canvas.
- **Decision:** **Native `getUserMedia` + HTML5 Canvas**.
- **Rationale:**
  - Zero additional bundle weight or external supply-chain risk.
  - Direct control over video track lifecycle (essential for calling `track.stop()` to turn off the hardware camera indicator light on unmount).
  - Built-in graceful degradation: Detect lack of camera hardware or permission denial, immediately falling back to file picker / image upload.
  - High-performance JPEG compression: Downsamples frames to 400x400 square crop with 0.82 JPEG compression, producing compact (~30–45 KB) base64 strings safe for database storage.

---

## 2. Database Schema Extensions

### 2.1 Table: `police_wanted_registry`
Added to both Supabase (`supabase/schema.sql`) and SQLite (`src/db/sqliteDb.js`):

```sql
CREATE TABLE IF NOT EXISTS public.police_wanted_registry (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  aliases TEXT,
  idType TEXT,
  idNumber TEXT,
  phone TEXT,
  severity TEXT NOT NULL DEFAULT 'WARRANT_ACTIVE', -- 'CRITICAL_FELONY' | 'WARRANT_ACTIVE' | 'WATCHLIST_HIGH' | 'CAUTION'
  offenseCategory TEXT NOT NULL,                  -- e.g. 'Armed Robbery', 'Corporate Fraud', 'Trespassing'
  warrantNumber TEXT NOT NULL,
  issuingAgency TEXT NOT NULL,                    -- e.g. 'State Police Command', 'Anti-Kidnapping Squad'
  photoUrl TEXT,
  cautionNotes TEXT,
  activeStatus INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for sub-5ms screening lookups
CREATE INDEX IF NOT EXISTS idx_wanted_idnumber ON public.police_wanted_registry (idNumber);
CREATE INDEX IF NOT EXISTS idx_wanted_fullname ON public.police_wanted_registry (fullName);
CREATE INDEX IF NOT EXISTS idx_wanted_phone ON public.police_wanted_registry (phone);
```

---

## 3. Component Architecture & Data Flows

### 3.1 Overstay Surveillance State Machine
```
[Visitor Checked In] 
       │
       ▼ (Every 10s Heartbeat)
[Check Elapsed: now - checkInTime > expectedDurationMinutes * 60 * 1000]
       │
       ├─ No ──► Keep Status 'Checked-In'
       │
       └─ Yes ─► [Transition to 'Overdue']
                      │
                      ├── Persist: updateVisitorStatus(id, 'Overdue')
                      ├── Audio: audioAlertService.playOverstayChime()
                      ├── UI Toast: "Overstay Alert: [Name] exceeded visit limit"
                      └── Live Tracker: Red Flashing Border + Escort Action
```

### 3.2 Police Screening Intercept Flow
```
[Receptionist Types in QuickCheckInModal]
       │ (Debounce 300ms on Name, ID Number, Phone)
       ▼
[policeDbService.screenVisitor(input)]
       │
       ├─ No Match ──► Normal check-in continues
       │
       └─ Match Found ──► [Trigger Security Red Alert Intercept Modal]
                              │
                              ├── Display Offender Photo & Warrant Details
                              ├── Display Issuing Agency & Caution Instructions
                              ├── Log Event: audit_logs (SECURITY_CRITICAL)
                              └── Receptionist Options:
                                   ├─ Option A: [Dispatch Security Escort / Lock Gate]
                                   ├─ Option B: [Supervisor Passphrase Override]
                                   └─ Option C: [Refuse Entry & Abort Check-In]
```

### 3.3 Webcam Capture Lifecycle
```
[User clicks "Take Photo" in Modal]
       │
       ▼
[navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })]
       │
       ├─ Permission Granted ──► Show Live Video Stream + Oval Face Guide HUD
       │                               │
       │                               ▼
       │                         [Capture Snapshot]
       │                               │
       │                               ▼
       │                         [Offscreen Canvas 400x400 JPEG (0.82)]
       │                               │
       │                               ▼
       │                         [Set formData.avatar & formData.photo]
       │                               │
       │                               ▼
       │                         [Stop all MediaStream tracks]
       │
       └─ Permission Denied / No Cam ──► Show Error Banner + "Upload File" fallback
```

---

## 4. API & Service Contracts

### 4.1 `audioAlertService` Interface
```javascript
export const audioAlertService = {
  // Play alert sound with customizable frequencies and duration
  playOverstayChime: (options?: { volume?: number }) => void,
  playSecurityWarningAlarm: () => void,
  
  // Audio state management
  isMuted: () => boolean,
  setMuted: (muted: boolean) => void,
  toggleMute: () => boolean,
  
  // Cooldown / deduplication so same visitor isn't dinged continuously
  canAlertVisitor: (visitorId: string, cooldownMs?: number) => boolean,
  recordAlert: (visitorId: string) => void,
  acknowledgeAlert: (visitorId: string) => void,
};
```

### 4.2 `policeDbService` Interface
```javascript
export const policeDbService = {
  // Screen visitor against police registry and blacklist
  screenVisitor: async (visitor: { fullName?: string, idNumber?: string, phone?: string }) => {
    isMatch: boolean,
    matchType: 'EXACT_ID' | 'EXACT_PHONE' | 'NAME_MATCH' | null,
    record: PoliceRecord | null,
    confidence: number,
  },
  
  // Registry management
  getAllWantedRecords: async () => PoliceRecord[],
  addWantedRecord: async (record: PoliceRecord) => PoliceRecord,
  deleteWantedRecord: async (recordId: string) => boolean,
  
  // Connection diagnostics
  checkConnectionStatus: async () => ({ status: 'CONNECTED' | 'OFFLINE_FALLBACK', recordCount: number }),
};
```

---

## 5. Security & NDPR / Privacy Safeguards
1. **Camera Privacy:** Media stream tracks are immediately stopped when the modal is closed or unmounted. Video is never streamed to external third parties; all processing happens strictly in-browser memory.
2. **PII Minimization:** Mugshots and police registry records are read-only to front-desk personnel and cannot be exported into public CSV logs.
3. **Audit Trail Accountability:** Every screening match and supervisor override requires an authenticated officer ID and is timestamped into immutable `audit_logs`.
