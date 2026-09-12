# VSMS Codebase Survey & Monochrome Frontend Architecture Analysis

**Author**: Explorer Survey Agent 3  
**Date**: 2026-08-18  
**Scope**: Full survey of build configuration, styling architecture, Tailwind/CSS setup, typography, dark/light theme implementation, dependencies, keyboard navigation, and colored accent violations across `/home/kami/Desktop/codebase/vsms`.

---

## 1. Executive Summary

The **VSMS (Computerized Guest Information Tracking System)** is a React 18 single-page web application built with **Vite 6** and styled with **Tailwind CSS 3.4**. The application manages visitor registrations, active visitor tracking, pass printing, audit logs, and analytics.

While the existing system provides solid functionality and layout scaffolding, the styling is heavily infused with **OpenAI emerald green accents (`#10a37f`)**, **amber alerts**, **blue stats**, **rose badges**, and **multi-colored confetti**. To satisfy Requirement **R1** (Strict Black & White Monochrome Aesthetic & Typography: `#000000`, `#ffffff`, `#111111`, `#f5f5f5`, `#e5e5e5`), every colored badge, button, icon, highlight, border, glow, and theme variable must be refactored into high-contrast monochrome treatments (solid black, crisp white, clean borders, inverted fills, and subtle grayscale shifts).

---

## 2. Build & Runtime Environment Survey

### 2.1 Dependencies (`package.json`)
```json
{
  "name": "vsms-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "lucide-react": "^0.469.0",
    "qrcode.react": "^4.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.7"
  }
}
```

### 2.2 Build & Dev Tooling Assessment
| Tool | Configuration / Version | Notes |
|---|---|---|
| **Vite** | `vite.config.js` with `@vitejs/plugin-react` (port 3000) | Standard ESM build system, outputs to `dist/`. |
| **PostCSS** | `postcss.config.js` | Autoprefixer + Tailwind CSS plugins. |
| **Icons** | `lucide-react@0.469.0` | Comprehensive icon set used across all views and modals. |
| **QR Generation** | `qrcode.react@4.2.0` | Uses `QRCodeSVG` in `VisitorPassModal.jsx` for digital badges. |
| **Animation / FX** | `canvas-confetti@1.9.4` | Used on check-in registration success; currently colored `#10a37f`, `#34d399`, `#60a5fa`. |

---

## 3. Styling Architecture & Theme System

### 3.1 Tailwind Configuration (`tailwind.config.js`)
- **Dark Mode Strategy**: `darkMode: 'class'` (toggled via `.dark` on `document.documentElement`).
- **Custom Color Palettes**:
  - `openai`: Defines `accent: '#10a37f'`, `accentHover: '#1a7f64'`, `dark: '#09090b'`, `surface: '#121215'`, `elevated: '#1c1c21'`.
  - `m3`: Maps CSS custom properties (`--m3-surface-0` through `--m3-surface-5`, `--m3-primary`, `--m3-primary-container`, `--m3-outline`, etc.).
- **Custom Shadows**:
  - Includes `glow-emerald: '0 0 20px rgba(16, 163, 127, 0.25)'` which introduces emerald glows.
- **Font Families**:
  - `sans`: `['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']`
  - `mono`: `['JetBrains Mono', 'Fira Code', 'monospace']`

### 3.2 Typography & Font Delivery (`index.html`)
- Google Fonts are linked in `index.html`:
  - `Inter` (weights: 300, 400, 500, 600, 700)
  - `Plus Jakarta Sans` (weights: 400, 500, 600, 700, 800)
  - `JetBrains Mono` (weights: 400, 500, 600)
- Font application:
  - Sans-serif is globally active via `font-sans` on `<body>`.
  - Monospace is used for IDs, timestamps, badge codes, and counters.

### 3.3 CSS Variables & Theme Implementation (`src/index.css`)
- **Light Mode (`:root`)**:
  - `--m3-surface-0: #f8f9fa`
  - `--m3-surface-1: #ffffff`
  - `--m3-surface-2: #f1f3f5`
  - `--m3-surface-3: #e9ecef`
  - `--m3-surface-4: #dee2e6`
  - `--m3-surface-5: #ced4da`
  - `--m3-primary: #0f172a`
  - `--openai-accent: #10a37f` (Green accent)
- **Dark Mode (`.dark`)**:
  - `--m3-surface-0: #09090b`
  - `--m3-surface-1: #121215`
  - `--m3-surface-2: #1c1c21`
  - `--m3-surface-3: #27272e`
  - `--m3-surface-4: #32323b`
  - `--m3-surface-5: #3e3e4a`
  - `--m3-primary: #10a37f` (Green accent)
  - `--m3-primary-container: #102a24` (Dark green)
  - `--m3-on-primary-container: #6ee7b7` (Light green)
  - `--openai-accent: #10a37f` (Green accent)
- **Theme Persistence & React Context**:
  - `VisitorContext.jsx` manages `theme` state (`'dark' | 'light'`) with `localStorage` persistence.
  - Adds/removes `dark` and `light` classes on `document.documentElement`.
  - Toggle button in `Sidebar.jsx` (Sun / Moon icon).

---

## 4. Full Codebase Color Violation Inventory

Below is the complete, line-by-line audit of all non-monochrome accents, badges, chips, backgrounds, and text colors across the entire repository.

### 4.1 Global Config & Styles
| File | Line(s) | Violation Code / Token | Aesthetic Issue |
|---|---|---|---|
| `tailwind.config.js` | 17-18 | `accent: '#10a37f'`, `accentHover: '#1a7f64'` | Emerald green primary accent |
| `tailwind.config.js` | 48 | `'glow-emerald': '0 0 20px rgba(16, 163, 127, 0.25)'` | Colored glow shadow |
| `src/index.css` | 23-24 | `--openai-accent: #10a37f; --openai-accent-hover: #0d8a6c;` | Light theme green variables |
| `src/index.css` | 36-38 | `--m3-primary: #10a37f; --m3-primary-container: #102a24; --m3-on-primary-container: #6ee7b7;` | Dark theme green primary tokens |
| `src/index.css` | 44-45 | `--openai-accent: #10a37f; --openai-accent-hover: #1a7f64;` | Dark theme green variables |

### 4.2 App & Context
| File | Line(s) | Violation Code / Token | Aesthetic Issue |
|---|---|---|---|
| `src/App.jsx` | 18 | `selection:bg-openai-accent selection:text-white` | Emerald green text selection highlight |
| `src/context/VisitorContext.jsx` | 117 | `colors: ['#10a37f', '#34d399', '#60a5fa']` | Multi-colored confetti (emerald, mint, blue) |

### 4.3 Navigation & Header Components
| File | Line(s) | Violation Code / Token | Aesthetic Issue |
|---|---|---|---|
| `src/components/Sidebar.jsx` | 47 | `bg-openai-accent flex items-center justify-center text-white shadow-glow-emerald` | Green logo badge with green glow |
| `src/components/Sidebar.jsx` | 60 | `bg-openai-accent hover:bg-openai-accentHover` | Green "Register New Guest" button |
| `src/components/Sidebar.jsx` | 80 | `dark:bg-emerald-950/50 dark:text-emerald-400 dark:border dark:border-emerald-500/20` | Emerald active navigation pill |
| `src/components/Sidebar.jsx` | 85 | `text-openai-accent` | Emerald icon on active nav |
| `src/components/Sidebar.jsx` | 89 | `bg-openai-accent text-white` | Emerald visitor count badge |
| `src/components/Sidebar.jsx` | 132 | `<Sun className="w-4 h-4 text-amber-400" />` | Amber colored theme toggle icon |
| `src/components/Header.jsx` | 32, 40 | `focus:border-openai-accent focus:ring-1 focus:ring-openai-accent` | Green focus ring on search & filter |
| `src/components/Header.jsx` | 54 | `<UserCheck className="w-3.5 h-3.5 text-emerald-500" />` | Emerald green counter icon |
| `src/components/Header.jsx` | 60, 62 | `<ShieldAlert className="w-3.5 h-3.5 text-amber-500" />`, `text-amber-500` | Amber overdue counter icon and text |
| `src/components/Header.jsx` | 68 | `<Clock className="w-3.5 h-3.5 text-blue-500" />` | Blue total counter icon |
| `src/components/Header.jsx` | 80 | `<Download className="w-3.5 h-3.5 text-openai-accent" />` | Green download icon |
| `src/components/Header.jsx` | 87 | `hover:text-amber-500` | Amber hover on reset button |

### 4.4 Modals & Command Palette
| File | Line(s) | Violation Code / Token | Aesthetic Issue |
|---|---|---|---|
| `src/components/QuickCheckInModal.jsx` | 54 | `bg-openai-accent/15 border border-openai-accent/30 text-openai-accent` | Green header icon box |
| `src/components/QuickCheckInModal.jsx` | 60 | `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20` | Green "LIVE ENTRY" pill badge |
| `src/components/QuickCheckInModal.jsx` | 80, 149, 219 | `text-openai-accent` | Green section header icons |
| `src/components/QuickCheckInModal.jsx` | 87, 101, 169 | `text-rose-500` | Red/rose required asterisk `*` |
| `src/components/QuickCheckInModal.jsx` | 95-283 | `focus:border-openai-accent` (12 occurrences) | Green input focus borders |
| `src/components/QuickCheckInModal.jsx` | 300 | `bg-openai-accent hover:bg-openai-accentHover` | Green primary submit button |
| `src/components/VisitorPassModal.jsx` | 34 | `text-openai-accent` | Green title icon |
| `src/components/VisitorPassModal.jsx` | 48-49 | `border-2 border-emerald-500/30 ... bg-emerald-500/5 dark:bg-emerald-950/20 ... text-emerald-500` | Green badge watermark & card background |
| `src/components/VisitorPassModal.jsx` | 54, 57 | `bg-openai-accent ... shadow-glow-emerald`, `text-emerald-400` | Green badge ID pill & green text |
| `src/components/VisitorPassModal.jsx` | 68, 73 | `border-2 border-openai-accent`, `bg-emerald-500` | Green avatar border & green checkmark badge |
| `src/components/VisitorPassModal.jsx` | 86, 93, 100, 109, 120 | `text-openai-accent` | Green icons & green ID code |
| `src/components/VisitorPassModal.jsx` | 138 | `bg-openai-accent hover:bg-openai-accentHover` | Green "Print Visitor Badge" button |
| `src/components/CommandPalette.jsx` | 42 | `text-openai-accent` | Green search input icon |
| `src/components/CommandPalette.jsx` | 81, 106, 132 | `text-openai-accent`, `bg-openai-accent/10 ... text-openai-accent` | Green badges, action buttons, command icons |
| `src/components/CommandPalette.jsx` | 96 | `bg-amber-500/10 hover:bg-amber-500/20 text-amber-400` | Amber check-out action button |

### 4.5 Application Views
| File | Line(s) | Violation Code / Token | Aesthetic Issue |
|---|---|---|---|
| `src/views/LiveTrackerView.jsx` | 51 | `bg-emerald-500 animate-ping` | Green pulsing live dot |
| `src/views/LiveTrackerView.jsx` | 62 | `bg-openai-accent hover:bg-openai-accentHover` | Green button |
| `src/views/LiveTrackerView.jsx` | 74, 148, 154, 160, 167, 181 | `text-openai-accent` | Green view icons |
| `src/views/LiveTrackerView.jsx` | 101, 114, 187 | `border-amber-500/50 bg-amber-500/5 ... text-amber-500 ... bg-amber-500/10` | Amber overdue card border, badge, and check-out button |
| `src/views/LiveTrackerView.jsx` | 108, 162 | `bg-openai-accent/15 text-openai-accent`, `text-openai-accent` | Green badge ID pill & stay duration text |
| `src/views/LiveTrackerView.jsx` | 119-120 | `bg-emerald-500/10 text-emerald-400 ... bg-emerald-500 animate-pulse` | Green "INSIDE" badge and pulsating dot |
| `src/views/VisitorLogView.jsx` | 46, 180 | `text-openai-accent` | Green view title icon & QR button icon |
| `src/views/VisitorLogView.jsx` | 69 | `bg-openai-accent hover:bg-openai-accentHover` | Green "Export CSV" button |
| `src/views/VisitorLogView.jsx` | 119 | `text-openai-accent` | Green badge ID text |
| `src/views/VisitorLogView.jsx` | 162-168 | `text-amber-500 bg-amber-500/10`, `text-emerald-400 bg-emerald-500/10` | Amber "Overdue" badge, Green "Inside" badge |
| `src/views/VisitorLogView.jsx` | 186 | `bg-amber-500/10 hover:bg-amber-500/20 text-amber-500` | Amber check-out action button |
| `src/views/AnalyticsView.jsx` | 32, 46, 89, 117, 129 | `text-openai-accent`, `bg-openai-accent/15` | Green section icons and ranking number pill |
| `src/views/AnalyticsView.jsx` | 49, 58, 60 | `text-emerald-400` | Green trend text, clock icon, active count |
| `src/views/AnalyticsView.jsx` | 67, 69 | `text-blue-400` | Blue exit check icon & total number |
| `src/views/AnalyticsView.jsx` | 76, 78, 79 | `text-amber-500` | Amber security alert icon, overdue count, alert text |
| `src/views/AnalyticsView.jsx` | 104 | `bg-gradient-to-r from-openai-accent to-emerald-400` | Green gradient progress bars |
| `src/views/DepartmentsView.jsx` | 14, 30, 34, 68 | `text-openai-accent`, `hover:border-openai-accent/40` | Green banner icon, card hover border, dept code, host email |
| `src/views/DepartmentsView.jsx` | 39 | `text-rose-400` | Rose map pin icon |
| `src/views/DepartmentsView.jsx` | 44 | `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20` | Green active guests count badge |
| `src/views/SettingsView.jsx` | 25, 44, 91, 149 | `text-openai-accent` | Green view & section icons |
| `src/views/SettingsView.jsx` | 35, 81 | `bg-emerald-500/10 ... text-emerald-400` | Green save feedback alert & encryption active pill |
| `src/views/SettingsView.jsx` | 57, 67, 139 | `bg-openai-accent text-white`, `bg-openai-accent hover:bg-openai-accentHover` | Green role toggle button & submit button |
| `src/views/SettingsView.jsx` | 105, 118 | `accent-openai-accent` | Green HTML checkbox accent color |
| `src/views/SettingsView.jsx` | 164 | `bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30` | Rose "Reset Demo Data" button |

---

## 5. Keyboard Navigation & Interaction Architecture

### 5.1 Global Shortcuts
- **Trigger**: `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) via `window.addEventListener('keydown')` in `VisitorContext.jsx`.
- **Dismiss**: `Escape` key closes `CommandPalette`, `QuickCheckInModal`, and `VisitorPassModal`.
- **Features in `CommandPalette`**:
  - Live visitor filtering by query (searches full name, company, host, badge ID, and visitor ID).
  - 1-click Check-Out button.
  - 1-click View Pass Modal trigger.
  - Quick action shortcuts to navigate to any of the 5 views or trigger guest registration.

### 5.2 Flow & State Management
- **State Store**: `VisitorContext` provides centralized state for:
  - `visitors`: List of visitor objects, automatically synced to `localStorage['vsms_visitors']`.
  - `theme`: `'dark' | 'light'`, synced to `localStorage['vsms_theme']`.
  - `userRole`: `'admin' | 'security'`, synced to `localStorage['vsms_role']`.
  - `activeView`: `'live' | 'log' | 'analytics' | 'departments' | 'settings'`.
  - `globalSearchQuery`, `selectedDeptFilter`, `selectedStatusFilter`.
  - `registerVisitor(formData)`: creates ID, assigns badge number, sets status, triggers confetti (to be refactored to monochrome), and auto-opens `VisitorPassModal`.
  - `checkOutVisitor(id)`: updates check-out timestamp and status to `'Checked-Out'`.
  - `exportToCSV()`: generates and downloads RFC4180-compliant CSV.
  - `resetToDemoData()`: resets store back to `INITIAL_VISITORS`.

---

## 6. Recommended Monochrome Design System Replacements

| Component / State | Current Colored Style | Target Pure Monochrome Style |
|---|---|---|
| **Primary Buttons** | `bg-openai-accent hover:bg-openai-accentHover text-white` | `bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-black dark:border-white font-medium` |
| **Secondary Buttons** | `bg-m3-surface2 hover:bg-m3-surface3 text-slate-700` | `bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 font-medium` |
| **Active / Inside Badge** | `bg-emerald-500/10 text-emerald-400 border border-emerald-500/30` | `bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-black dark:border-white` (Solid Inverted Pill) |
| **Overdue Status Badge** | `bg-amber-500/10 text-amber-500 border border-amber-500/30` | `bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-2 border-dashed border-zinc-900 dark:border-zinc-100 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1` (High-Contrast Outlined / Dashed Pill) |
| **Checked-Out Badge** | `bg-slate-500/10 text-slate-400 border border-slate-500/20` | `bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 border border-zinc-300 dark:border-zinc-800 font-mono text-[10px] px-2.5 py-0.5 rounded-full` |
| **Live Pulsing Indicator** | `bg-emerald-500 animate-ping` | `bg-black dark:bg-white animate-ping` + solid inner ring |
| **Progress / Metric Bars** | `bg-gradient-to-r from-openai-accent to-emerald-400` | `bg-black dark:bg-white` track with `bg-zinc-200 dark:bg-zinc-800` background |
| **Form Focus Rings** | `focus:border-openai-accent focus:ring-openai-accent` | `focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white` |
| **Check-In Celebration** | Green/blue confetti particles | Monochrome particles: `['#000000', '#ffffff', '#888888', '#cccccc', '#333333']` |
| **Pass Watermark & Border**| `border-emerald-500/30 bg-emerald-500/5` | `border-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-950` with high-contrast barcode / QR frame |
| **Dark Theme Canvas** | `#09090b` surface, `#10a37f` primary | Pure deep black `#000000` / `#0a0a0a` / `#111111` canvas with crisp `#ffffff` text & `#262626` borders |
| **Light Theme Canvas** | `#f8f9fa` surface, `#0f172a` primary | Crisp white `#ffffff` canvas with `#000000` text & `#e5e5e5` borders |

---

## 7. Next Steps for Implementation Team

1. **Update `tailwind.config.js` and `src/index.css`**: Replace all emerald/OpenAI and M3 green variables with strict monochrome grayscale tokens (`#000000`, `#ffffff`, `#111111`, `#1a1a1a`, `#262626`, `#e5e5e5`, `#f5f5f5`).
2. **Refactor Components**:
   - `Sidebar.jsx`: Remove green FAB and green nav pills; use solid black/white inverted pills for active views and badge counters.
   - `Header.jsx`: Convert stats counters to monochrome; eliminate colored icons.
   - `QuickCheckInModal.jsx`: Convert header, required indicators, inputs, and submit button to monochrome.
   - `VisitorPassModal.jsx`: Refactor pass into a sleek, gallery-grade monochrome security badge.
   - `CommandPalette.jsx`: Update search bar, match items, and buttons to monochrome.
   - `LiveTrackerView.jsx`: High-contrast card borders and solid/outline status badges.
   - `VisitorLogView.jsx`: Clean, monochrome data grid with solid/dashed status pills.
   - `AnalyticsView.jsx`: Grayscale charts and metric cards.
   - `DepartmentsView.jsx` & `SettingsView.jsx`: High-contrast directory and policy toggles.
3. **Verify Build**: Ensure `npm run build` succeeds cleanly with 0 warnings or errors.
