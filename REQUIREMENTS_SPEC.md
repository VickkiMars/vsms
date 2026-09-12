# Software Requirements Specification (SRS)
## Computerized Guest Information Tracking System (VSMS)

**Source Document:** [`Computerised.docx`](file:///home/kami/Desktop/codebase/vsms/Computerised.docx)  
**System Title:** Computerized Guest Information Tracking System (VSMS)  
**Date Extracted:** September 12, 2026  

---

## 1. Introduction & Purpose

The purpose of this specification is to define the full functional, non-functional, hardware, software, and interface requirements for the Computerized Guest Information Tracking System (VSMS). The system replaces paper-based visitor logbooks with a secure, high-speed, digitized web application that records visitor entry/exit timestamps, issues digital/printable security passes with QR codes, tracks real-time visitor presence, and provides administrative analytics and reports.

---

## 2. System Scope & Boundaries

### 2.1 In-Scope Features
- **Administrator Authentication Module**: Secure authentication, user roles (`admin`, `security`, `reception`), session management, and hashed credentials.
- **Guest Registration Module**: Electronic capture of visitor personal details, identity documents, visit purpose, host selection, department selection, and vehicle registration.
- **Visitor Check-In Module**: Automatic assignment of unique Visitor ID (`VIS-xxxx`) and Badge ID (`BDG-xxxx`), real-time entry timestamping, and printable security pass with QR code generation.
- **Visitor Check-Out Module**: One-click check-out recording exit timestamp, automated duration calculation, and status updating (`Checked-Out`).
- **Live Presence Tracker**: Real-time operational dashboard monitoring currently active guests, stay duration counters, and overdue visitor indicators.
- **Master Visitor Log & Search**: Comprehensive paginated table with real-time multi-field search (Name, ID, Badge, Host, Phone, Company) and filter controls (Department, Status, Date).
- **Reporting & Data Export Module**: Exporting filtered records to RFC-4180 compliant CSV formats, generating daily/weekly/monthly visitor statistics.
- **Relational Data Storage**: Client-side SQLite database (`sql.js`) with persistent binary LocalStorage backing for relational integrity across `users`, `visitors`, `departments`, `hosts`, and `audit_logs`.

### 2.2 Out-of-Scope (Prototype Limitations)
- Physical hardware gate integration / electronic door triggers (Section 1.5 & 5.6.7).
- Advanced biometric facial recognition / fingerprint scanner hardware (Section 1.5).
- Multi-tenant enterprise cloud synchronization across distinct remote branches (Section 5.7.6).

---

## 3. Functional Requirements (FR)

Extracted from Section 3.6.1 & 3.11 of `Computerised.docx`:

| Req ID | Module | Requirement Description | Priority |
|---|---|---|---|
| **FR-AUTH-01** | Authentication | The system shall provide a secure login interface for administrators and security officers. | P0 |
| **FR-AUTH-02** | Authentication | The system shall enforce role-based access control (Admin, Security Officer, Front Desk Reception). | P0 |
| **FR-AUTH-03** | Authentication | The system shall maintain session state and provide explicit logout capabilities. | P0 |
| **FR-REG-01** | Guest Registration | The system shall capture visitor Full Name, Phone Number, Email, Address, Company/Organization. | P0 |
| **FR-REG-02** | Guest Registration | The system shall record Identification Type (National ID, Passport, Driver's License, Work Permit) and ID Number. | P0 |
| **FR-REG-03** | Guest Registration | The system shall capture Visit Purpose, Host Name, Department, Expected Stay Duration, and optional Vehicle Plate. | P0 |
| **FR-REG-04** | Guest Registration | The system shall validate all required input fields before processing registration. | P0 |
| **FR-CHK-01** | Check-In | The system shall automatically generate a unique Visitor ID (`VIS-xxxx`) and Badge ID (`BDG-xxxx`). | P0 |
| **FR-CHK-02** | Check-In | The system shall stamp the exact ISO 8601 date and time of arrival (`checkInTime`). | P0 |
| **FR-CHK-03** | Check-In | The system shall generate a printable Visitor Pass containing visitor details and a scannable QR Code. | P1 |
| **FR-OUT-01** | Check-Out | The system shall allow 1-click check-out for active visitors, recording departure timestamp (`checkOutTime`). | P0 |
| **FR-OUT-02** | Check-Out | The system shall calculate visit duration in minutes/hours upon check-out. | P0 |
| **FR-OUT-03** | Check-Out | The system shall update visitor status from `Checked-In` to `Checked-Out`. | P0 |
| **FR-REC-01** | Visitor Records | The system shall display historical visitor records in a structured tabular view with pagination controls. | P0 |
| **FR-REC-02** | Master Log | The system shall provide multi-parameter searching (Name, Phone, ID Number, Badge ID, Host, Company). | P0 |
| **FR-REC-03** | Master Log | The system shall support filtering by Department (EXEC, ITCS, HR, FIN, LEGAL, PROC) and Status. | P1 |
| **FR-DSH-01** | Dashboard | The system shall display real-time metric cards: Total Guests, Today's Visits, Currently Checked-In, Overdue Visitors. | P0 |
| **FR-DSH-02** | Dashboard | The system shall highlight guests whose visit duration exceeds their expected stay duration. | P1 |
| **FR-REP-01** | Reporting | The system shall generate department traffic distribution and peak visit hour analytics charts. | P1 |
| **FR-REP-02** | Reporting | The system shall export visitor records to CSV format adhering to RFC-4180 standards. | P0 |
| **FR-SEC-01** | Audit Logging | The system shall record administrative actions (login, check-in, check-out, data reset) in an audit log. | P1 |

---

## 4. Non-Functional Requirements (NFR)

Extracted from Section 3.7 of `Computerised.docx`:

### 4.1 Usability (NFR-01)
- **UI Responsiveness**: Intuitive, high-contrast user interface adhering to Material Design 3 and OpenAI visual principles.
- **Keyboard Access**: Global command palette accessible via `Cmd+K` / `Ctrl+K` for immediate navigation and search without mouse interaction.

### 4.2 Security & Data Protection (NFR-02)
- **Credential Protection**: Administrator passwords shall be stored as cryptographic hashes (`password_hash`), never plain text.
- **Input Sanitization**: User input must be sanitized against SQL Injection, ReDoS, and Cross-Site Scripting (XSS).
- **Access Control**: Administrative functions (data reset, user creation) restricted to authenticated administrators.

### 4.3 Reliability & Availability (NFR-03)
- **Data Persistence**: Local database binary stored in LocalStorage (`vsms_sqlite_db_bin`) ensures zero data loss upon page refresh or network disconnection.
- **Fault Recovery**: Automatic database schema self-healing and recovery from malformed storage states.

### 4.4 Performance (NFR-04)
- **Search & Filter Velocity**: Query execution and filter operations execute in under 10 milliseconds for datasets up to 10,000 records.
- **Page Render Velocity**: SPA route transitions execute instantaneously (< 50ms) without page reloads.

### 4.5 Maintainability & Scalability (NFR-05)
- **Modular Component Architecture**: Decoupled 3-tier structure (Presentation, Application Context, SQLite Storage).
- **Relational Integrity**: Standardized SQL relational table schemas (`users`, `visitors`, `departments`, `hosts`, `audit_logs`).

---

## 5. System Requirements Hardware & Software

Extracted from Section 3.8 & 3.9 of `Computerised.docx`:

### 5.1 Hardware Requirements (Section 3.8)
- **Processor**: Dual-Core 2.0 GHz or higher (Intel Core i3 / AMD Ryzen 3 or equivalent).
- **RAM**: 4 GB minimum (8 GB recommended).
- **Storage**: 10 GB available SSD/HDD disk space.
- **Display**: Minimum 1280x720 resolution (1920x1080 recommended).
- **Peripherals**: Standard keyboard, mouse/trackpad, optional printer for badge passes.

### 5.2 Software Requirements (Section 3.9)
- **Operating System**: Windows 10/11, macOS 12+, Linux (Ubuntu 20.04+).
- **Web Browser**: Modern ECMAScript 2022 compliant browser (Google Chrome 100+, Mozilla Firefox 100+, Apple Safari 15+, Microsoft Edge).
- **Runtime & Build Tools**: Node.js v18+, Vite 6.0, React 18.3, Tailwind CSS 3.4.
- **Database Engine**: WebAssembly-based SQLite (`sql.js`) with LocalStorage binary serialization.
