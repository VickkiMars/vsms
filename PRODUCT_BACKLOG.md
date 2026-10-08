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

---

## Epic 6: Automated Overstay Surveillance & Audible Alerting Engine
| ID | Story | Priority | Est. | Depends on | Notes |
|---|---|---|---|---|---|
| OA-601 | As a Receptionist/Security Officer, I want the system to continuously monitor active visitors against `expectedDurationMinutes` and transition them to `Overdue` status when their time expires. | High | S | — | Reactive duration watcher |
| OA-602 | As a Receptionist/Security Officer, I want an audible alert sound (synthesized via Web Audio API) to play when a visitor enters overdue state so I notice immediate security breaches. | High | S | OA-601 | Zero-dependency synthesized chime |
| OA-603 | As a Desk Officer, I want audio mute/unmute toggles, volume controls, and alert acknowledge/snooze options so the chime notifies without spamming the front desk. | Medium | S | OA-602 | Audio preferences & state controls |
| OA-604 | As a Security Officer, I want overdue visitors highlighted in the Live Tracker with flashing alert borders, overdue time counter, and quick escort dispatch actions. | High | S | OA-601 | Front-desk visual prominence |

---

## Epic 7: Blacklist & Police Wanted Criminal Registry Integration
| ID | Story | Priority | Est. | Depends on | Notes |
|---|---|---|---|---|---|
| BL-701 | As a system, I want a `police_wanted_registry` database table and connector service storing wanted criminals, warrant numbers, offenses, severity, and caution notes. | High | M | — | Police DB schema & sync engine |
| BL-702 | As a Receptionist, I want real-time screening against the local police wanted database and facility blacklist as visitor name, ID number, or phone is entered. | High | M | BL-701 | Debounced real-time intercept |
| BL-703 | As a Security Officer, I want a High-Priority Wanted Criminal Intercept Modal displaying matched mugshots, warrant details, and protocol actions (Dispatch Escort, Override, Refuse Entry). | High | M | BL-702 | Security intercept UI & protocol |
| BL-704 | As a Security Auditor, I want all police database hits, suspect intercept actions, and supervisor overrides permanently logged in `audit_logs` with full metadata. | High | S | BL-703 | Compliance audit trail |
| BL-705 | As an Admin, I want a Watchlist & Police DB management interface in Settings to search wanted records, test screening queries, and inspect connection status. | Medium | S | BL-701 | Watchlist administrative controls |

---

## Epic 8: Front-Desk Webcam Visitor Photo Capture
| ID | Story | Priority | Est. | Depends on | Notes |
|---|---|---|---|---|---|
| WC-801 | As a Receptionist, I want to access the front-desk webcam (`MediaDevices.getUserMedia`) inside Quick Check-In to capture live visitor portraits. | High | M | — | Hardware camera stream integration |
| WC-802 | As a Receptionist, I want a camera viewfinder with an oval face-guide framing reticle, camera switcher, snapshot freeze, and Retake/Accept buttons. | High | S | WC-801 | Front-desk photo capture UX |
| WC-803 | As a Receptionist, I want captured webcam photos to be compressed to high-contrast JPEG data URLs, saved as visitor avatars, and rendered onto printed visitor badges. | High | S | WC-802 | Avatar persistence & badge pass |
| WC-804 | As a Receptionist, I want graceful fallback to file upload or avatar initials if the webcam is blocked, unavailable, or permissions are denied, plus clean stream teardown. | Medium | S | WC-801 | Permission & hardware fallback |

