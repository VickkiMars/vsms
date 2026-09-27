# Sprint 1 — Multi-Tenant Organization Foundations & Dynamic Check-In

**Goal:** Deliver a fully functional multi-tenant organization visitor management system with 3-step onboarding wizard, dynamic visitor schema builder with type definitions & table slot allocation, dynamic check-in modal, role-separated workspaces (Admin vs Receptionist), and turnkey demo org.  
**Timebox:** 1 sprint iteration / immediate delivery.  
**Pulled from:** PRODUCT_BACKLOG.md items `MT-101`, `MT-102`, `MT-103`, `MT-104`, `FB-201`, `FB-202`, `FB-203`, `FB-204`, `RO-301`, `RO-302`, `RO-303`, `RO-304`, `DP-401`, `DP-402`, `AD-501`, `AD-502`.

---

## Committed Tasks
| ID | Task | Depends on | Status |
|---|---|---|---|
| T1 | Upgrade SQLite schema (`organizations`, `organization_fields`, `users`, `visitors`) with multi-tenant relational persistence & seed data | — | In Progress |
| T2 | Update `AuthContext.jsx` with organization session tracking, auto-detection, demo org switcher, and receptionist provisioning | T1 | Not started |
| T3 | Update `VisitorContext.jsx` with dynamic `orgFields`, table column slot constraints, and resilient JSON custom data handling | T1, T2 | Not started |
| T4 | Build Guided 3-Step Organization Setup Wizard modal / screen (Profile -> Dynamic Form Builder -> Receptionist Provisioning -> Launch) | T1, T2, T3 | Not started |
| T5 | Refactor `QuickCheckInModal.jsx` to dynamically render fields from active organization's schema with type-specific inputs and host picker | T3 | DONE |
| T6 | Update `VisitorLogView.jsx` and `LiveTrackerView.jsx` to render dynamic table display columns + full Visitor Details Drawer | T3, T5 | Not started |
| T7 | Update `VisitorPassModal.jsx` to dynamically render configured badge fields | T3, T5 | Not started |
| T8 | Partition Admin vs Receptionist consoles (role-separated navigation, receptionist console, admin form builder & staff management) | T2, T3 | Not started |
| T9 | Validate end-to-end flow: setup new org -> configure custom fields -> provision receptionist -> log in as receptionist -> register visitor -> view log & pass | T1-T8 | Not started |

---

## Definition of Done
- Complete multi-tenant schema with data isolation.
- 3-step organization setup wizard functions seamlessly.
- Baseline fields strictly `fullName` and `phone`; custom fields support all major data types.
- Fixed table slot limit respected with toggle constraint.
- Receptionists log in and operate dynamic check-in without seeing restricted admin areas.
- Turnkey demo org works out of the box with quick switcher.
- Production build passes with zero errors.
