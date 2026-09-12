# Project: VSMS Frontend Monochrome Redesign

## Architecture
- **Framework**: React 18.3 (SPA with Context API) + Vite 6.0 + Tailwind CSS 3.4.
- **State Store**: `src/context/VisitorContext.jsx` provides global reactive state for visitors, active view, search query, department filter, modals, theme (dark/light), and user roles. Persisted synchronously to `localStorage`.
- **Styling & Design System**: Strict black/white/grayscale palette (`#000000`, `#ffffff`, `#111111`, `#1a1a1a`, `#262626`, `#e5e5e5`, `#f5f5f5`, `#737373`), crisp borders, high-contrast sans-serif typography (`Plus Jakarta Sans`, `Inter`), high-contrast pill status badges (solid inverted vs outline), grayscale avatar images, and monochrome confetti.
- **Routing & Views**: View switcher controlled by `currentView` in `VisitorContext` ('live', 'log', 'analytics', 'departments', 'settings').

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Strict B&W Monochrome Design System | Replace all OpenAI emerald, amber, blue, and rose CSS tokens/classes with pure B&W monochrome tokens in Tailwind and CSS variables for both light and dark modes | M1 | Survey & R1 |
| 2 | High-Contrast Typography & Global Layout | Configure Plus Jakarta Sans / Inter fonts, crisp borders, neutral selection, and grayscale avatar filters | M1 | Survey & R1 |
| 3 | Monochrome App Shell (Sidebar & Header) | High-contrast sidebar with active view indicators, top header with search trigger, quick check-in button, presence counters, role badge, and theme switcher | M2 | Survey & R1/R2 |
| 4 | Accessible Command Palette (Cmd+K) | Global modal supporting keyboard shortcut (`Cmd+K`/`Ctrl+K`), search across visitors & actions, and keyboard arrow traversal (`ArrowUp`/`ArrowDown`/`Enter`) | M2 | Survey & R2 |
| 5 | Fast Guest Registration Modal | Zero-friction modal with instant inline validation (replaces browser alerts), department/host cascade selector, clear focus states, and direct pass generation | M3 | Survey & R2 |
| 6 | Printable High-Contrast Visitor Pass | Clean monochrome security badge layout with pure black QR code (`qrcode.react`), visitor details, host info, expiration date, and print styling | M3 | Survey & R2 |
| 7 | Live Presence Tracker & 1-Click Check-Out | Real-time presence board with high-contrast status pill indicators (solid vs outline), live stay duration timer, and 1-click check-out with confirmation toast feedback | M4 | Survey & R2 |
| 8 | Master Visitor Log Table & Tools | Comprehensive paginated visitor log with real-time search, department filtering, status filtering, pagination controls, and CSV export | M4 | Survey & R2 |
| 9 | Monochrome Analytics, Departments & Settings | High-contrast charts/bars in Analytics view, Department roster cards, and Settings toggles/data reset dialog | M5 | Survey & R1 |
| 10 | E2E Automated Verification & Adversarial Hardening | Comprehensive automated test runner covering all Tiers 1-4 and Tier 5 adversarial stress testing | M6 | Survey & R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Monochrome Design System & Core Tokens | `tailwind.config.js`, `src/index.css`, `index.html`, `src/App.jsx`, `src/context/VisitorContext.jsx` | none | DONE |
| M2 | App Shell, Navigation & Accessible Command Palette | `src/components/Sidebar.jsx`, `src/components/Header.jsx`, `src/components/CommandPalette.jsx` | M1 | DONE |
| M3 | Fast Guest Registration & Printable Badge | `src/components/QuickCheckInModal.jsx`, `src/components/VisitorPassModal.jsx` | M1 | DONE |
| M4 | Live Tracker & Master Visitor Log Views | `src/views/LiveTrackerView.jsx`, `src/views/VisitorLogView.jsx` | M1, M2, M3 | DONE |
| M5 | Secondary Views & Final UI Refinement | `src/views/AnalyticsView.jsx`, `src/views/DepartmentsView.jsx`, `src/views/SettingsView.jsx` | M1, M2 | DONE |
| M6 | Full E2E Verification & Hardening | E2E Test Suite (Tiers 1-4), Tier 5 Adversarial Hardening, `npm run build` verification | M1, M2, M3, M4, M5 | IN_PROGRESS |

## Interface Contracts

### Visitor Entity Schema
```typescript
interface Visitor {
  id: string; // e.g. "VIS-1082"
  fullName: string;
  phone: string;
  email: string;
  company: string;
  idType: 'National ID' | 'Passport' | 'Driver License' | 'Work Permit' | 'Other';
  idNumber: string;
  hostName: string;
  department: 'EXEC' | 'ITCS' | 'HR' | 'FIN' | 'LEGAL' | 'PROC';
  purpose: string;
  checkInTime: string; // ISO 8601
  checkOutTime: string | null; // ISO 8601 or null
  status: 'Checked-In' | 'Checked-Out' | 'Overdue';
  badgeId: string; // e.g. "BDG-1082"
  expectedDurationMinutes: number;
  vehiclePlate?: string;
  notes?: string;
  avatar: string;
}
```

### VisitorContext Contract
- `visitors: Visitor[]`
- `activeVisitorsCount: number`
- `overdueVisitorsCount: number`
- `todayTotalVisitorsCount: number`
- `currentView: string` ('live' | 'log' | 'analytics' | 'departments' | 'settings')
- `setCurrentView: (view: string) => void`
- `isCheckInOpen: boolean`, `setIsCheckInOpen: (open: boolean) => void`
- `isPassModalOpen: boolean`, `setIsPassModalOpen: (open: boolean) => void`
- `selectedVisitorForPass: Visitor | null`, `setSelectedVisitorForPass: (visitor: Visitor | null) => void`
- `isCommandPaletteOpen: boolean`, `setIsCommandPaletteOpen: (open: boolean) => void`
- `globalSearchQuery: string`, `setGlobalSearchQuery: (query: string) => void`
- `selectedDeptFilter: string`, `setSelectedDeptFilter: (dept: string) => void`
- `theme: 'dark' | 'light'`, `toggleTheme: () => void`
- `userRole: 'admin' | 'security' | 'host'`, `setUserRole: (role: string) => void`
- `registerVisitor: (formData: Partial<Visitor>) => Visitor`
- `checkOutVisitor: (id: string) => void`
- `exportToCSV: () => void`
- `resetToDemoData: () => void`

## Code Layout
- `src/main.jsx`: Application bootstrap
- `src/App.jsx`: Main application container and modal mounting
- `src/index.css`: CSS variables, monochrome root tokens, typography, print styles
- `src/context/VisitorContext.jsx`: State provider and business operations
- `src/data/initialData.js`: Departments, hosts, initial seed visitors, enumerations
- `src/components/Sidebar.jsx`: Monochrome left navigation
- `src/components/Header.jsx`: Top navigation, search trigger, presence badges, theme toggle
- `src/components/QuickCheckInModal.jsx`: Registration modal with inline validation
- `src/components/VisitorPassModal.jsx`: High-contrast printable badge with QR code
- `src/components/CommandPalette.jsx`: Keyboard-driven command palette modal
- `src/views/LiveTrackerView.jsx`: Live presence tracking board with 1-click check-out
- `src/views/VisitorLogView.jsx`: Master visitor records table with filtering & CSV export
- `src/views/AnalyticsView.jsx`: Monochrome charts and metric cards
- `src/views/DepartmentsView.jsx`: Department directory cards
- `src/views/SettingsView.jsx`: Theme/role toggles and reset controls
- `test/`: Automated test suite
