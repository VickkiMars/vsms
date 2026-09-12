# Product Backlog: Computerized Guest Information Tracking System (VSMS)

**Source Spec:** [`Computerised.docx`](file:///home/kami/Desktop/codebase/vsms/Computerised.docx)  
**Team Assumption:** Single full-stack engineer / pair programming squad.  
**Sprint Cycle:** 1-week timeboxed iterations.  

---

## Epics Overview

- **Epic 1: Authentication & Access Control (FR-AUTH)**
- **Epic 2: Visitor Registration & Badge Issuance (FR-REG / FR-CHK)**
- **Epic 3: Live Presence Tracking & Check-Out (FR-OUT / FR-DSH)**
- **Epic 4: Master Visitor Log, Search & Filtering (FR-REC)**
- **Epic 5: Administrative Analytics, Reporting & CSV Export (FR-REP)**
- **Epic 6: Relational Data Persistence & Audit Logging (FR-SEC)**

---

## Detailed User Stories & Backlog Table

| Story ID | Epic | User Story Statement | Priority | Story Points | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|---|
| **VSMS-101** | Auth | As a system administrator/security officer, I want to log in using credentials so that unauthorized persons cannot access guest data. | P0 | 3 | None | Validates user against `users` table; sets session role (`admin`, `security`, `reception`). |
| **VSMS-102** | Auth | As a user, I want to log out and switch roles safely so that session security is maintained. | P0 | 1 | VSMS-101 | Clears active session state; redirects to login modal. |
| **VSMS-201** | Registration | As a receptionist, I want to register a visitor with full details (Name, Phone, Email, Company, ID Type/Number, Host, Department, Purpose, Expected Stay) so entry is digitized. | P0 | 5 | VSMS-101 | Inline form validation prevents empty submissions; saves record to SQLite DB. |
| **VSMS-202** | Registration | As a receptionist, I want the system to auto-cascade hosts based on selected department so data entry is error-free. | P1 | 2 | VSMS-201 | Selecting a department dynamically filters host dropdown roster. |
| **VSMS-203** | Check-In | As a receptionist, I want the system to issue a unique Visitor ID (`VIS-xxxx`) and Badge ID (`BDG-xxxx`) upon registration. | P0 | 2 | VSMS-201 | Automatic sequential string ID generation without duplicates. |
| **VSMS-204** | Check-In | As a visitor/security officer, I want a printable security pass badge with a scannable QR code containing visitor details. | P1 | 3 | VSMS-203 | Modal renders high-contrast QR code (`qrcode.react`), visitor details, host info, print CSS. |
| **VSMS-301** | Live Tracker | As a security officer, I want a live presence board showing all currently checked-in guests so I know who is inside the facility. | P0 | 3 | VSMS-201 | Displays active visitors sorted by check-in time with stay duration counter. |
| **VSMS-302** | Check-Out | As a security officer, I want a 1-click Check-Out button that updates status to `Checked-Out` and stamps departure time. | P0 | 2 | VSMS-301 | Updates `checkOutTime` and `status` in SQLite DB; updates live counters. |
| **VSMS-303** | Live Tracker | As a security officer, I want automatic flagging of overdue guests who exceed expected visit duration. | P1 | 2 | VSMS-301 | Compares stay duration against `expectedDurationMinutes`; displays high-contrast overdue pill badge. |
| **VSMS-401** | Master Log | As an administrator, I want a master table displaying historical visitor records with pagination controls. | P0 | 3 | VSMS-201 | Paginated rendering (10/25/50 items per page) with page navigation controls. |
| **VSMS-402** | Master Log | As an administrator, I want multi-field global search (Name, Phone, ID Number, Badge ID, Host, Company). | P0 | 3 | VSMS-401 | Sub-10ms search filtering across all visitor attributes. |
| **VSMS-403** | Master Log | As an administrator, I want filter controls by Department and Visit Status. | P1 | 2 | VSMS-401 | Dropdown filters correctly restrict visible table rows. |
| **VSMS-404** | Global UX | As any user, I want an accessible Command Palette (`Cmd+K` / `Ctrl+K`) for rapid keyboard navigation. | P2 | 3 | VSMS-402 | Global modal opens on shortcut; keyboard arrow keys navigate options. |
| **VSMS-501** | Analytics | As an administrator, I want visual dashboard metrics (Total Guests, Today's Visits, Active Guests, Overdue Count). | P0 | 2 | VSMS-301 | Metric cards display real-time calculated aggregate counts. |
| **VSMS-502** | Analytics | As an administrator, I want analytics charts for department distribution and peak visit hours. | P1 | 3 | VSMS-501 | Visual bar/pie charts displaying visitor distribution across departments. |
| **VSMS-503** | Reporting | As an administrator, I want to export visitor records to CSV format adhering to RFC-4180 standards. | P0 | 3 | VSMS-401 | Exports properly escaped CSV file with exact headers and quoted special characters. |
| **VSMS-601** | Persistence | As a developer, I want the system to persist relational SQLite database binaries in LocalStorage. | P0 | 5 | None | WebAssembly `sql.js` database serializes to `vsms_sqlite_db_bin` synchronously. |
| **VSMS-602** | Audit Trail | As an administrator, I want system events logged to an `audit_logs` table for compliance tracking. | P1 | 3 | VSMS-601 | Records login, check-in, check-out, data export, and reset events. |
