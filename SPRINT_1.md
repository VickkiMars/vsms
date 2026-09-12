# Sprint 1 Backlog: Core Frontend MVP

**Sprint Goal:** Ship a fully interactive, production-ready frontend for VSMS featuring guest registration, real-time tracking, badge generation with QR codes, analytics, and OpenAI + Material 3 design system.

---

## Committed Stories for Sprint 1

| Story ID | Title | Estimate | Status | Dependencies |
|---|---|---|---|---|
| **VSMS-101** | Visitor Check-In Form Dialog (M3 Modal + Form Validation) | 3 pts | Ready | None |
| **VSMS-102** | Printable Digital Visitor Badge with Live QR Code | 2 pts | Ready | VSMS-101 |
| **VSMS-201** | Live Visitors Tracker Dashboard (Real-time Status Board) | 3 pts | Ready | VSMS-101 |
| **VSMS-202** | Quick Check-Out Action & Time Tracking | 2 pts | Ready | VSMS-201 |
| **VSMS-301** | Master Log Table with Search, Filter & CSV Export | 3 pts | Ready | VSMS-101 |
| **VSMS-302** | Admin Analytics Dashboard (Traffic Trends & Department Charts) | 3 pts | Ready | VSMS-301 |
| **VSMS-401** | OpenAI + Material 3 Theme System (Dark/Light + Cmd+K Palette) | 3 pts | Ready | None |

---

## Definition of Done (DoD)
1. Clean React + Vite build with zero runtime errors or console warnings.
2. Fully responsive across desktop, tablet, and mobile breakpoints.
3. OpenAI minimalist dark mode & high-contrast light mode with Material 3 dynamic surfaces.
4. Interactive mock database in LocalStorage with rich initial data.
5. All actions (Check-In, Check-Out, Search, Export, Badge Print) function smoothly.
