# Sprint 1 Backlog: Core Authentication, Registration, Check-In & Badge Pass

**Sprint Duration:** 1 Week Timebox  
**Sprint Goal:** Deliver a fully functional core visitor entry/exit slice including user authentication, guest registration form with inline validation, automatic ID/Badge generation, printable pass with QR code, and real-time live presence tracking.

---

## Sprint 1 Committed Backlog Items

| Story ID | Story Title | Priority | Points | Owner | Status |
|---|---|---|---|---|---|
| **VSMS-101** | User Authentication & Login Interface | P0 | 3 | Fullstack Dev | DONE |
| **VSMS-102** | User Logout & Role Session Switcher | P0 | 1 | Fullstack Dev | DONE |
| **VSMS-201** | Guest Registration Form with Validation | P0 | 5 | Frontend Dev | DONE |
| **VSMS-202** | Department-Host Cascade Selector | P1 | 2 | Frontend Dev | DONE |
| **VSMS-203** | Auto-ID (`VIS-xxxx`) & Badge ID (`BDG-xxxx`) Generator | P0 | 2 | Backend Dev | DONE |
| **VSMS-204** | Printable Visitor Badge Pass with QR Code | P1 | 3 | Frontend Dev | DONE |
| **VSMS-301** | Live Presence Tracking Board | P0 | 3 | Frontend Dev | DONE |
| **VSMS-302** | 1-Click Check-Out & Duration Calculator | P0 | 2 | Fullstack Dev | DONE |
| **VSMS-303** | Overdue Visitor Indicator & Duration Alerts | P1 | 2 | Frontend Dev | DONE |
| **VSMS-601** | WebAssembly SQLite Storage & LocalStorage Persistence | P0 | 5 | Core Dev | DONE |

---

## Total Sprint 1 Commitment
- **Total Velocity Points:** 28 Points
- **Status:** 100% Completed & Verified

---

## Definition of Done for Sprint 1
1. Security officers can log in with valid credentials (`admin@vsms.com`/`admin123` or `guard@vsms.com`/`guard123`).
2. Visitors can be registered electronically without page reloads.
3. Visitor passes render crisp QR codes and printable styling.
4. Active visitors appear on the Live Tracker board immediately.
5. 1-Click check-out updates status to `Checked-Out` and calculates visit duration.
6. SQLite database binary persists state cleanly across restarts.
