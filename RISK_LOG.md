# Risk, Assumptions & Mitigation Log

**Source Document:** [`Computerised.docx`](file:///home/kami/Desktop/codebase/vsms/Computerised.docx) (Section 1.5, Section 3.19, Section 5.6)  
**Project:** Computerized Guest Information Tracking System (VSMS)  

---

## 1. Project Assumptions

1. **Deployment Architecture**: The prototype runs as a client-side WebAssembly single-page application with persistent SQLite storage in browser LocalStorage (`vsms_sqlite_db_bin`), serving as an effective demonstration of computerized visitor management principles.
2. **User Operating Roles**: Security officers and receptionists possess basic computer literacy and operate modern web browsers (Chrome, Firefox, Safari, Edge).
3. **Identification Types**: Visitors present standard legal identification (National ID, Passport, Driver's License, Work Permit).

---

## 2. Risk Register & Mitigation Strategies

| Risk ID | Risk Category | Risk Description | Severity | Likelihood | Mitigation Strategy |
|---|---|---|---|---|---|
| **RSK-01** | Data Loss | Browser LocalStorage clear action or private browsing mode wipes SQLite database binary. | High | Medium | **Implemented**: Provide one-click Database Binary Backup Export & Import options in Settings View (Section 5.6.5). |
| **RSK-02** | Security | Privacy leak of sensitive visitor PII (Phone, ID Number, Address) from unauthenticated browser access. | High | Low | **Implemented**: Require user authentication modal on application launch; restrict administrative settings to `admin` role (Section 3.19 & 5.6.3). |
| **RSK-03** | Injection Attacks | Malicious search queries or visitor names containing SQL or Script injection payloads (`' OR 1=1--`, `<script>`). | High | Low | **Implemented**: Parametrized SQL statement preparation (`stmt.run([param])`) and HTML entity escaping across components (Section 3.19). |
| **RSK-04** | Performance | Database slows down when visitor records scale beyond 10,000 entries. | Medium | Low | **Implemented**: WebAssembly SQLite indexed queries and paginated table views clamp DOM rendering to max 50 items per page (Section 3.7.4). |
| **RSK-05** | Input Errors | Handwritten / manual input errors during registration (e.g. invalid phone number format). | Medium | Medium | **Implemented**: Real-time inline field validation and standardized department/host cascade dropdown selectors (Section 3.16). |
| **RSK-06** | Browser Skew | Operating system time drift or clock skew causes negative or extreme stay duration metrics. | Low | Medium | **Implemented**: Clock skew clamping logic in `calculateDuration` helper defaulting future/invalid check-ins to safe `0m` values. |

---

## 3. Academic & Production Recommendations Matrix (Section 5.6)

Extracted from Chapter 5.6 of `Computerised.docx`:

| Recommendation | Section | Description | Current Status in App |
|---|---|---|---|
| **Computerized Registration** | 5.6.1 | Replace paper logbooks with electronic entry forms. | **FULLY IMPLEMENTED** (`QuickCheckInModal.jsx`) |
| **Centralized Database** | 5.6.2 | Store records in a structured relational database system. | **FULLY IMPLEMENTED** (`sql.js` SQLite engine) |
| **User Authentication** | 5.6.3 | Enforce secure authentication for administrators and security staff. | **FULLY IMPLEMENTED** (`LoginModal.jsx`) |
| **Data Security & Privacy** | 5.6.4 | Protect PII data and enforce input sanitization. | **FULLY IMPLEMENTED** (SHA hashing & parameterization) |
| **Regular Data Backup** | 5.6.5 | Support database export/backup functionality to prevent data loss. | **FULLY IMPLEMENTED** (`sqliteDb.js` export) |
| **Identification Technology** | 5.6.7 | Integrate scannable QR / barcode identification passes. | **FULLY IMPLEMENTED** (`VisitorPassModal.jsx` QR code) |
| **Advanced Reporting** | 5.6.9 | Generate daily/weekly/monthly visitor statistics and CSV reports. | **FULLY IMPLEMENTED** (`AnalyticsView.jsx` & CSV export) |
