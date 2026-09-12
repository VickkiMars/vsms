# E2E Test Infra: VSMS Frontend Redesign

## Test Philosophy
- **Requirement-Driven & Opaque-Box**: Tests evaluate the system purely from user requirements specified in `ORIGINAL_REQUEST.md`, exercising the data contracts, validation rules, UI rendering tokens, state transitions, and build outputs.
- **Methodology**: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Scenarios.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Requirement Source | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|-------------------|:----------------:|:-----------------:|:-----------------:|:-----------------:|
| F1 | Strict Monochrome Palette (#000000, #ffffff, #111111, #f5f5f5, #e5e5e5) & No Colored Accents | R1 & AC | 5 | 5 | ✓ | ✓ |
| F2 | High-Contrast Typography (Plus Jakarta Sans / Inter) & Crisp Borders | R1 & AC | 5 | 5 | ✓ | ✓ |
| F3 | Fast Guest Registration with Inline Validation & Dept/Host Cascade | R2 & AC | 5 | 5 | ✓ | ✓ |
| F4 | Live Presence Tracker & 1-Click Check-Out with Instant Feedback | R2 & AC | 5 | 5 | ✓ | ✓ |
| F5 | High-Contrast Printable Visitor Pass & QR Code Generation | R2 & AC | 5 | 5 | ✓ | ✓ |
| F6 | Master Visitor Log Search, Department Filter, Pagination & CSV Export | R2 & AC | 5 | 5 | ✓ | ✓ |
| F7 | Command Palette (Cmd+K / Ctrl+K) & Keyboard Navigation Traversal | R2 & AC | 5 | 5 | ✓ | ✓ |
| F8 | Clean Build Verification (`npm run build` with 0 errors) | R3 & AC | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Runner**: Node.js automated test harness (`test/run-e2e-tests.js`).
- **Test Categories**:
  - `Tier 1: Feature Coverage`: Validates isolated execution of all 8 core features.
  - `Tier 2: Boundary & Edge Cases`: Validates extreme inputs, empty search queries, invalid phone/ID strings, single/multiple pagination limits, zero active visitors, overdue timing edges.
  - `Tier 3: Cross-Feature Interactions`: Validates interactions between Registration -> Badge -> Live Tracker -> Checkout -> Master Log -> CSV Export -> Command Palette.
  - `Tier 4: Real-World Workloads`: Simulates end-to-end security desk workflows: high-volume visitor check-ins, rapid checkout bursts, VIP badge printing, department audit filtering, and theme switching.
- **Pass/Fail Semantics**: Exit code 0 on 100% test pass. Exit code 1 on any assertion failure.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Morning Security Rush: Multi-visitor rapid registration, badge generation & live presence monitoring | F1, F3, F4, F5 | High |
| 2 | Executive VIP Delegation: Department/Host cascade, customized note/vehicle plate, high-contrast pass printout | F1, F3, F5 | Medium |
| 3 | Peak Departure Wave: 1-Click rapid checkout across multiple active cards with duration verification | F4, F6 | High |
| 4 | Security Officer Master Audit: Compound query search, department filtering, pagination traversal & CSV export download | F6, F7 | High |
| 5 | Keyboard-Only Navigation: Cmd+K invocation, search filtering, arrow key navigation, and modal dismiss | F7, F2 | Medium |

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥ 40 tests (≥ 5 tests across 8 features)
- **Tier 2 (Boundary & Corner)**: ≥ 40 tests (≥ 5 boundary tests across 8 features)
- **Tier 3 (Cross-Feature Combinations)**: ≥ 10 tests covering major feature interactions
- **Tier 4 (Real-World Workloads)**: ≥ 5 comprehensive scenario workflows
- **Total Minimum Target**: ≥ 95 automated test cases
