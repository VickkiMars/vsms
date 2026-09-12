# Product Backlog: Computerized Guest Information Tracking System (VSMS)

**Project Goal:** Modernize visitor management from paper registers to a high-speed, secure, digitized web application with OpenAI precision and Material 3 expressiveness.

**Team Size Assumption:** Single full-stack engineer / pair programming squad.  
**Sprint Cycle:** 1-week timeboxed iterations.

---

## Epics & User Stories

### Epic 1: Visitor Registration & Check-In (Core Value)
- **VSMS-101** *(High / P0)*: As a security officer or receptionist, I want to register a new visitor with their contact details, host, department, and visit purpose so that entry is logged digitally.
- **VSMS-102** *(High / P0)*: As a receptionist, I want to issue/print a digital visitor badge with a unique QR code so visitors can be identified easily.
- **VSMS-103** *(Medium / P1)*: As a receptionist, I want to capture or select a visitor photo/avatar to verify identity.

### Epic 2: Real-time Visitor Tracking & Operations
- **VSMS-201** *(High / P0)*: As a security officer, I want a Live Tracker board showing all currently checked-in guests so I know who is currently in the building.
- **VSMS-202** *(High / P0)*: As a security officer, I want a 1-click Check-Out button that calculates visit duration and records exit timestamp automatically.
- **VSMS-203** *(Medium / P1)*: As a receptionist, I want automatic flagging of overdue/late visitors who have exceeded expected visit duration.

### Epic 3: Administrative Analytics & Record Management
- **VSMS-301** *(High / P0)*: As an administrator, I want a searchable, filterable master log table with date/department filters to locate historical records instantly.
- **VSMS-302** *(High / P0)*: As an administrator, I want to export visitor records to CSV/PDF reports for auditing.
- **VSMS-303** *(Medium / P1)*: As an administrator, I want dashboard charts showing daily traffic trends, peak hours, and top visited departments.

### Epic 4: System Architecture, UX & Design System
- **VSMS-401** *(High / P0)*: As any user, I want an OpenAI + Material 3 UI design with smooth light/dark mode, keyboard shortcuts (`Cmd+K`), and accessible components.
- **VSMS-402** *(Low / P2)*: As an administrator, I want role switcher simulation (Security Officer vs System Administrator) to test permission boundaries.
