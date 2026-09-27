# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Receptionists and security officers operating a front-desk tablet or PC at the entrance of a corporate facility — their job is to log every visitor quickly, accurately, and without error while managing physical foot traffic.

**Secondary:** Organization administrators who configure the workspace, define the visitor form schema, provision front-desk staff, and review visitor logs and analytics.

**Operating scene:** Fixed-installation device (tablet or desktop monitor) in a reception lobby or security desk; ambient noise, interruption, and time pressure are constants. Speed and clarity of the check-in flow directly affect the physical queue at the entrance.

## Product Purpose

VSMS is a multi-tenant organization-facing visitor management system. Organizations register once, configure their visitor check-in schema (fields, labels, data types), provision receptionist accounts, and immediately have a production-ready front-desk tool. Every visitor who enters the building is logged, badged, and trackable in real time. The system eliminates paper sign-in sheets and generic visitor book software by giving each organization a workspace tailored to their exact information requirements.

Success means: a receptionist can register a new visitor in under 10 seconds using a form their own admin designed, print a badge, and surface that visitor's record to security — all without switching tools or relying on a network connection.

## Positioning

**Organization-configurable check-in schemas — every field, every label, every data type set by the org admin, with zero locked templates.** No neighboring visitor management product lets an admin define the exact data model their organization collects at check-in without paying for enterprise customization or writing code. VSMS ships this as the default, first-run experience, inside a 3-step onboarding wizard.

## Operating Context

- **Physical access environments:** corporate office lobbies, hospital reception desks, government building entrances, enterprise co-working spaces.
- **Device profile:** fixed tablet (landscape) or widescreen desktop monitor at a front desk.
- **Workflow rhythm:** a visitor walks in → receptionist opens the check-in modal → fills org-defined fields → system logs the visitor and prints or displays a badge → security can see the live presence board on a separate console.
- **Admin workflow:** org admin runs the 3-step wizard once (org profile → form builder → receptionist provisioning), then manages ongoing configuration from the Settings view (field editor, staff management, analytics).
- **Session model:** each staff member logs in with their email; role is auto-detected (admin, receptionist, security/guard). Sessions are browser-local; no server authentication round-trip.
- **Data persistence:** client-side SQLite via Wasm (sql.js) serialized to LocalStorage binary. No cloud backend. Fully offline-capable once the page is loaded.

## Capabilities and Constraints

**Confirmed capabilities:**
- Multi-tenant isolation: each organization has its own schema, users, and visitor records.
- Dynamic visitor form schema: admin configures field names, placeholders, data types (`text`, `number`, `email`, `select`, `checkbox`, `textarea`, `date`, `photo`, `host_picker`), required flag, show-in-table flag (max 5 slots), show-on-badge flag.
- 3-step onboarding wizard: Organization & Admin Profile → Dynamic Form Builder → Receptionist Provisioning → Launch.
- Role-separated consoles: admin sees analytics, settings, staff management; receptionist sees live tracker, check-in, visitor log; guard/security sees presence board.
- Live presence board: real-time view of checked-in visitors.
- Visitor badge / pass printing.
- Visitor profile drawer with full custom-field audit trail.
- Global search across standard and custom fields.
- CSV export.
- Command palette (⌘K).
- Dark/light theme toggle (app interior).

**Technical constraints:**
- No server, no cloud storage, no network dependency after initial page load.
- Planned deployment: Dockerfile on Vercel (stateless HTTP server, listens on `$PORT`).
- Client-side-only data — browser storage is the source of truth.
- SQLite Wasm persistence; data lives in the user's browser and does not sync across devices.

**Undecided:**
- Long-form product name beyond "VSMS".
- Pricing / SaaS model (free tier, paid plans, self-hosted).
- Native mobile app version.
- Data export / backup strategy (beyond CSV).

## Brand Commitments

- **Name:** VSMS (acronym only; no long-form name confirmed).
- **Palette constraint:** monochrome / near-monochrome palette for the application interior — no colored Tailwind utility classes (no `emerald`, `amber`, `rose`, etc.). Lime (`#d7f4b7`) is the one permitted accent, used only as a status indicator (live/active state).
- **Landing page:** permanent dark groundplane (`#0a0c0f`). App interior remains light.
- **Target market:** strictly corporate / enterprise environments.

## Evidence on Hand

- Full working codebase with multi-tenant schema (SQLite Wasm), 3-step wizard, dynamic check-in form, role-separated header/sidebar, live tracker, visitor log, analytics view, departments view, settings view, visitor pass modal, and command palette — all implemented and passing build.
- Product Backlog (`PRODUCT_BACKLOG.md`) and Sprint 1 plan (`SPRINT_1.md`) with task status.
- No real customer testimonials, pricing data, or production traffic metrics on hand — future work must not fabricate them.

## Product Principles

1. **Schema ownership by the organization.** The org admin, not the software vendor, decides what data a visitor provides. No field is mandatory beyond the system minimum; no field is hidden from configuration.
2. **Speed at the desk is the product.** Every interaction a receptionist takes under time pressure is a UX contract. Complexity belongs in the admin setup, not the front-desk flow.
3. **Offline by design.** The product must function without a reliable network connection once loaded. Architecture decisions that introduce cloud dependencies require explicit opt-in.
4. **Role clarity, not role sprawl.** Each role sees exactly the surface they need. Admins and receptionists and security officers do not share a single cluttered console.
5. **Honest data.** The system logs what actually happened — who arrived, when, and why — with no soft-delete or opaque overwrite. Audit access is a first-class feature, not an afterthought.

## Accessibility & Inclusion

WCAG 2.1 AA is the minimum standard. The primary operating surface (check-in modal, live tracker, visitor log) must meet AA contrast and keyboard-operability requirements. The front-desk device may be operated by any staff member regardless of visual acuity differences.
