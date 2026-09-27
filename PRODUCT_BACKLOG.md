# Product Backlog — Multi-Tenant Organization VSMS

Assumption: Pair programming with user; client-side SQLite (Wasm sql.js) persistence with LocalStorage binary serialization; fast vertical slices prioritized by multi-tenant architectural foundations.

---

## Epic 1: Multi-Tenancy & Organization Setup
| ID | Story | Priority | Est. | Depends on | Notes |
|---|---|---|---|---|---|
| MT-101 | As an Organization Admin, I want to complete a 3-step setup wizard (Profile, Form Builder, Receptionist Provisioning) so that my organization has a tailored visitor management workspace. | High | M | MT-102 | Core onboarding experience |
| MT-102 | As a system, I want a relational multi-tenant schema (`organizations`, `organization_fields`, `users`, `visitors`) in SQLite so that tenant data is isolated and resilient. | High | M | — | Architectural foundation |
| MT-103 | As any user, I want direct email login with auto-detection of my organization and assigned role (Admin vs Receptionist). | High | S | MT-102 | Frictionless authentication |
| MT-104 | As a user/evaluator, I want a turnkey demo organization pre-loaded with sample data and a persistent "+ Setup New Organization" launcher. | Medium | S | MT-101 | Instant evaluation & testing |

---

## Epic 2: Dynamic Visitor Form Builder Engine
| ID | Story | Priority | Est. | Depends on | Notes |
|---|---|---|---|---|---|
| FB-201 | As an Org Admin, I want `fullName` and `phone` to be standard baseline fields, with all other fields configurable with custom names and data types (`text`, `number`, `email`, `select`, `checkbox`, `textarea`, `date`, `photo`, `host_picker`). | High | M | MT-102 | Flexible schema engine |
| FB-202 | As an Org Admin, I want a toggle on each field to mark it as Required or Optional. | High | S | FB-201 | Validation rules |
| FB-203 | As an Org Admin, I want to toggle "Show in Table / Summary Pane" for fields up to a fixed slot limit (e.g. 4-5 slots) so tables maintain visual integrity. | High | S | FB-201 | Table visual guardrail |
| FB-204 | As an Org Admin, I want to toggle "Show on Badge" for fields with a live preview so printed security passes display chosen attributes. | Medium | S | FB-201 | Badge layout customizer |

---

## Epic 3: Receptionist Operations & Dynamic Check-In
| ID | Story | Priority | Est. | Depends on | Notes |
|---|---|---|---|---|---|
| RO-301 | As a Receptionist, I want the Visitor Registration Modal to render the organization's dynamic schema so I can collect required visitor info. | High | M | FB-201 | Dynamic form renderer |
| RO-302 | As a Receptionist, I want a specialized Host Picker field that live-searches the internal employee roster and resolves department. | High | S | RO-301 | Staff arrival workflow |
| RO-303 | As a Receptionist, I want to print high-contrast visitor passes containing the organization's selected badge attributes and QR code. | High | S | FB-204 | Pass generation |
| RO-304 | As a Receptionist, I want a dedicated front-desk console (Live Tracker, Check-In, Visitor Log, Host Directory) free of administrative clutter. | High | S | MT-103 | Role-separated workspace |

---

## Epic 4: Data Presentation & Display Allocation
| ID | Story | Priority | Est. | Depends on | Notes |
|---|---|---|---|---|---|
| DP-401 | As a Receptionist/Admin, I want the Visitor Log and Live Tracker tables to render the fixed display slots configured by the organization. | High | M | FB-203 | Configurable table columns |
| DP-402 | As a user, I want a Visitor Profile Drawer that displays all custom field responses for a visitor record regardless of table column limits. | High | S | DP-401 | Full audit access |
| DP-403 | As a user, I want multi-field search to query both standard fields and dynamic custom field values seamlessly. | Medium | S | DP-401 | Global search filter |

---

## Epic 5: Administrative Console & Staff Provisioning
| ID | Story | Priority | Est. | Depends on | Notes |
|---|---|---|---|---|---|
| AD-501 | As an Org Admin, I want to provision new Receptionist accounts with name, email, password, and desk location. | High | S | MT-102 | Front-desk staff management |
| AD-502 | As an Org Admin, I want an in-app Form Builder tab in Settings to edit, reorder, or add custom fields post-onboarding. | Medium | M | FB-201 | Continuous configuration |
| AD-503 | As an Org Admin, I want executive analytics and audit logs scoped strictly to my organization's data. | Medium | S | MT-102 | Tenant-isolated analytics |
