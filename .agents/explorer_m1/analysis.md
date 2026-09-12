# Milestone 1: Monochrome Design System & Core Tokens Blueprint

**Project**: VSMS — Computerized Guest Information Tracking System  
**Milestone**: M1 (Monochrome Design System & Core Tokens)  
**Author**: Explorer M1  
**Target Date**: 2026-08-18  

---

## 1. Executive Summary

Milestone 1 establishes the foundational design system and visual token architecture for the VSMS frontend overhaul. All legacy OpenAI emerald, amber, blue, and colored accents across CSS variables, Tailwind configurations, typography declarations, and confetti micro-interactions are replaced with a strict, high-contrast Black & White monochrome design system:
- **Palette**: Pure Black (`#000000`), Pure White (`#ffffff`), Off-Blacks (`#0a0a0a`, `#111111`, `#171717`), Dark Slate/Zinc Grays (`#262626`, `#333333`, `#404040`), Neutral Grays (`#737373`, `#a3a3a3`, `#d4d4d4`), and Off-Whites (`#e5e5e5`, `#f5f5f5`, `#fafafa`).
- **Surfaces**: Crisp high-contrast surface elevation system for both Dark Mode and Light Mode.
- **Typography**: Sans-serif hierarchy (`Plus Jakarta Sans` as primary display/body, `Inter` as secondary interface sans, `JetBrains Mono` for badge IDs, timestamps, and codes).
- **Borders & Focus States**: 1px/2px solid crisp borders with high-contrast `:focus-visible` rings.
- **Media & Micro-interactions**: Grayscale image filters for visitor avatars and pure monochrome particle confetti (`['#000000', '#ffffff', '#737373', '#d4d4d4', '#262626']`).

---

## 2. Token Architecture & Color Mapping

### 2.1 Design System Palette Matrix

| Semantic Token | Light Mode Value | Dark Mode Value | Usage / Description |
|---|---|---|---|
| `--m3-surface-0` (Base Canvas) | `#ffffff` | `#000000` | Main application background |
| `--m3-surface-1` (Card Base) | `#ffffff` | `#0d0d0d` / `#111111` | Primary cards, panels, sidebar base |
| `--m3-surface-2` (Elevated Surface) | `#f5f5f5` | `#171717` / `#1a1a1a` | Input fields, hover backgrounds, secondary buttons |
| `--m3-surface-3` (Active Surface) | `#e5e5e5` | `#262626` | Pressed states, active navigation pills |
| `--m3-surface-4` (Deep Highlight) | `#d4d4d4` | `#333333` | Modal backdrops, active tabs |
| `--m3-surface-5` (Muted Accent) | `#a3a3a3` | `#404040` | Subtle contrast dividers |
| `--m3-primary` (Primary Action) | `#000000` | `#ffffff` | Primary CTA buttons, key headings |
| `--m3-primary-container` | `#000000` | `#ffffff` | High-emphasis badge fills |
| `--m3-on-primary-container` | `#ffffff` | `#000000` | Text on high-emphasis badges |
| `--m3-outline` (Crisp Border) | `#e5e5e5` | `#262626` | Card borders, table grid lines, dividers |
| `--m3-outline-variant` | `#f0f0f0` | `#1a1a1a` | Subtle secondary borders |
| `--openai-accent` (Backward Alias) | `#000000` | `#ffffff` | Transitional alias mapped to monochrome |
| `--openai-accent-hover` (Backward Alias) | `#262626` | `#e5e5e5` | Hover state for transitional alias |
| Text Primary | `#000000` / `#0a0a0a` | `#ffffff` / `#fafafa` | Headings, labels, table data |
| Text Secondary / Muted | `#525252` / `#737373` | `#a3a3a3` / `#737373` | Captions, timestamps, secondary labels |

---

## 3. Detailed File Modification Specifications

### 3.1 File: `tailwind.config.js`
**Path**: `/home/kami/Desktop/codebase/vsms/tailwind.config.js`

#### Proposed Content:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pure Monochrome Core System
        mono: {
          black: '#000000',
          white: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
          surface: {
            DEFAULT: '#000000',
            elevated: '#111111',
            card: '#171717',
            border: '#262626',
          }
        },
        // Transitional Monochrome-Mapped Aliases (Replaces green/emerald with black/white)
        openai: {
          dark: '#000000',
          surface: '#0d0d0d',
          elevated: '#171717',
          border: '#262626',
          accent: 'var(--openai-accent)',
          accentHover: 'var(--openai-accent-hover)',
          subtle: '#a3a3a3',
          muted: '#737373',
        },
        // Material 3 Monochrome Tonal Surface System
        m3: {
          surface0: 'var(--m3-surface-0)',
          surface1: 'var(--m3-surface-1)',
          surface2: 'var(--m3-surface-2)',
          surface3: 'var(--m3-surface-3)',
          surface4: 'var(--m3-surface-4)',
          surface5: 'var(--m3-surface-5)',
          primary: 'var(--m3-primary)',
          primaryContainer: 'var(--m3-primary-container)',
          onPrimaryContainer: 'var(--m3-on-primary-container)',
          secondaryContainer: 'var(--m3-secondary-container)',
          onSecondaryContainer: 'var(--m3-on-secondary-container)',
          outline: 'var(--m3-outline)',
          outlineVariant: 'var(--m3-outline-variant)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      borderWidth: {
        '1': '1px',
        '1.5': '1.5px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 0 0 1px #262626, 0 4px 12px 0 rgba(0, 0, 0, 0.5)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        'glow-mono': '0 0 20px rgba(255, 255, 255, 0.12)',
        'glow-emerald': '0 0 15px rgba(255, 255, 255, 0.15)', // Aliased to monochrome glow
        'm3-1': '0px 1px 3px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(0, 0, 0, 0.12)',
        'm3-2': '0px 2px 6px 2px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(0, 0, 0, 0.12)',
        'm3-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.08), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
        'm3-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.08), 0px 2px 3px 0px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
};
```

---

### 3.2 File: `src/index.css`
**Path**: `/home/kami/Desktop/codebase/vsms/src/index.css`

#### Proposed Content:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Strict Light Mode Monochrome Tokens */
    --m3-surface-0: #ffffff;
    --m3-surface-1: #ffffff;
    --m3-surface-2: #f5f5f5;
    --m3-surface-3: #e5e5e5;
    --m3-surface-4: #d4d4d4;
    --m3-surface-5: #a3a3a3;

    --m3-primary: #000000;
    --m3-primary-container: #000000;
    --m3-on-primary-container: #ffffff;
    --m3-secondary-container: #f5f5f5;
    --m3-on-secondary-container: #111111;
    --m3-outline: #e5e5e5;
    --m3-outline-variant: #f0f0f0;

    --openai-accent: #000000;
    --openai-accent-hover: #262626;

    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f5f5f5;
    --color-bg-tertiary: #e5e5e5;
    --color-text-primary: #000000;
    --color-text-secondary: #525252;
    --color-text-muted: #737373;
    --color-border: #e5e5e5;
    --color-border-strong: #000000;
  }

  .dark {
    /* Strict Dark Mode Monochrome Tokens */
    --m3-surface-0: #000000;
    --m3-surface-1: #0d0d0d;
    --m3-surface-2: #171717;
    --m3-surface-3: #262626;
    --m3-surface-4: #333333;
    --m3-surface-5: #404040;

    --m3-primary: #ffffff;
    --m3-primary-container: #ffffff;
    --m3-on-primary-container: #000000;
    --m3-secondary-container: #171717;
    --m3-on-secondary-container: #e5e5e5;
    --m3-outline: #262626;
    --m3-outline-variant: #1a1a1a;

    --openai-accent: #ffffff;
    --openai-accent-hover: #e5e5e5;

    --color-bg-primary: #000000;
    --color-bg-secondary: #0d0d0d;
    --color-bg-tertiary: #171717;
    --color-text-primary: #ffffff;
    --color-text-secondary: #d4d4d4;
    --color-text-muted: #737373;
    --color-border: #262626;
    --color-border-strong: #ffffff;
  }

  * {
    border-color: var(--m3-outline);
  }

  body {
    background-color: var(--m3-surface-0);
    color: var(--color-text-primary);
    font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::selection {
    background-color: #000000;
    color: #ffffff;
  }

  .dark ::selection {
    background-color: #ffffff;
    color: #000000;
  }
}

/* Grayscale Avatar & Media Filters for Pure B&W Aesthetic */
img, .avatar-grayscale, .avatar-mono {
  filter: grayscale(100%) contrast(105%);
}

/* Custom High-Contrast Scrollbars */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 9999px;
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Glassmorphism Monochrome Panels */
.glass-panel {
  background: rgba(13, 13, 13, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid #262626;
}

:root:not(.dark) .glass-panel,
.light .glass-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid #e5e5e5;
}

/* High-Contrast Status Badge Utility Classes */
.pill-badge-active {
  background-color: #000000;
  color: #ffffff;
  border: 1px solid #000000;
}
.dark .pill-badge-active {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #ffffff;
}

.pill-badge-overdue {
  background-color: transparent;
  color: #000000;
  border: 2px solid #000000;
  font-weight: 700;
}
.dark .pill-badge-overdue {
  background-color: transparent;
  color: #ffffff;
  border: 2px solid #ffffff;
  font-weight: 700;
}

.pill-badge-checkedout {
  background-color: transparent;
  color: #737373;
  border: 1px solid #d4d4d4;
}
.dark .pill-badge-checkedout {
  background-color: transparent;
  color: #737373;
  border: 1px solid #333333;
}

/* Print Styles for Visitor Badge */
@media print {
  body * {
    visibility: hidden;
  }
  #printable-badge, #printable-badge * {
    visibility: visible;
  }
  #printable-badge {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 24px;
    box-shadow: none !important;
    background: #ffffff !important;
    color: #000000 !important;
    border: 2px solid #000000 !important;
  }
}
```

---

### 3.3 File: `index.html`
**Path**: `/home/kami/Desktop/codebase/vsms/index.html`

#### Changes:
1. Update Google Fonts link to ensure full font weight range (300 to 800) for `Plus Jakarta Sans`, `Inter`, and `JetBrains Mono`.
2. Update body class to `bg-m3-surface0 text-neutral-900 dark:text-neutral-100 antialiased font-sans overflow-x-hidden selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`.

#### Proposed Content:
```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VSMS | Computerized Guest Information Tracking System</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-m3-surface0 text-neutral-900 dark:text-neutral-100 antialiased font-sans overflow-x-hidden selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### 3.4 File: `src/App.jsx`
**Path**: `/home/kami/Desktop/codebase/vsms/src/App.jsx`

#### Changes:
1. Update `MainLayout` top-level container classes:
   - Replace `text-slate-900 dark:text-slate-100 selection:bg-openai-accent selection:text-white` with `text-neutral-900 dark:text-neutral-100 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`.

#### Proposed Content:
```jsx
import React from 'react';
import { VisitorProvider, useVisitorContext } from './context/VisitorContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickCheckInModal } from './components/QuickCheckInModal';
import { VisitorPassModal } from './components/VisitorPassModal';
import { CommandPalette } from './components/CommandPalette';
import { LiveTrackerView } from './views/LiveTrackerView';
import { VisitorLogView } from './views/VisitorLogView';
import { AnalyticsView } from './views/AnalyticsView';
import { DepartmentsView } from './views/DepartmentsView';
import { SettingsView } from './views/SettingsView';

const MainLayout = () => {
  const { activeView } = useVisitorContext();

  return (
    <div className="min-h-screen flex bg-m3-surface0 text-neutral-900 dark:text-neutral-100 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {activeView === 'live' && <LiveTrackerView />}
          {activeView === 'log' && <VisitorLogView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'departments' && <DepartmentsView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals & Overlays */}
      <QuickCheckInModal />
      <VisitorPassModal />
      <CommandPalette />
    </div>
  );
};

export default function App() {
  return (
    <VisitorProvider>
      <MainLayout />
    </VisitorProvider>
  );
}
```

---

### 3.5 File: `src/context/VisitorContext.jsx`
**Path**: `/home/kami/Desktop/codebase/vsms/src/context/VisitorContext.jsx`

#### Changes:
1. Update confetti colors in `registerVisitor` (lines 113-118):
   - Replace `['#10a37f', '#34d399', '#60a5fa']` with `['#000000', '#ffffff', '#737373', '#d4d4d4', '#262626']`.
2. Enhance avatar fallback generation:
   - Add neutral background and text color parameters to DiceBear initials generator.
3. Prevent badge ID collisions:
   - Calculate max numerical value from existing `badgeId`s rather than simple array length.
4. Ensure theme sync sets `color-scheme` in addition to `class="dark" | "light"`.

#### Proposed Content:
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_VISITORS, DEPARTMENTS, HOSTS } from '../data/initialData';
import confetti from 'canvas-confetti';

const VisitorContext = createContext(null);

export const VisitorProvider = ({ children }) => {
  // LocalStorage state for visitor records
  const [visitors, setVisitors] = useState(() => {
    const saved = localStorage.getItem('vsms_visitors');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_VISITORS;
  });

  // LocalStorage state for dark / light theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vsms_theme') || 'dark';
  });

  // User Role: 'security' | 'admin'
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('vsms_role') || 'admin';
  });

  // Active View: 'live' | 'log' | 'analytics' | 'departments' | 'settings'
  const [activeView, setActiveView] = useState('live');

  // Modals & Panels
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [selectedVisitorForBadge, setSelectedVisitorForBadge] = useState(null);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  // Search & Filter Global State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Save visitors to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('vsms_visitors', JSON.stringify(visitors));
  }, [visitors]);

  // Sync theme with HTML document class and color scheme
  useEffect(() => {
    localStorage.setItem('vsms_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Sync role to LocalStorage
  useEffect(() => {
    localStorage.setItem('vsms_role', userRole);
  }, [userRole]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdKOpen(false);
        setIsCheckInOpen(false);
        setIsBadgeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Action: Register New Visitor
  const registerVisitor = (formData) => {
    const newId = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingMaxBadge = visitors.reduce((max, v) => {
      const num = parseInt(v.badgeId?.replace(/^BDG-/, '') || '0', 10);
      return num > max ? num : max;
    }, 80);
    const badgeId = `BDG-${String(existingMaxBadge + 1).padStart(3, '0')}`;

    const newVisitor = {
      id: newId,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || 'N/A',
      company: formData.company || 'Private Guest',
      idType: formData.idType,
      idNumber: formData.idNumber,
      hostName: formData.hostName,
      department: formData.department,
      purpose: formData.purpose,
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      status: 'Checked-In',
      badgeId: badgeId,
      expectedDurationMinutes: parseInt(formData.expectedDurationMinutes || '60', 10),
      vehiclePlate: formData.vehiclePlate || 'N/A',
      notes: formData.notes || '',
      avatar: formData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName)}&backgroundColor=171717,262626,404040,737373&textColor=ffffff`,
    };

    setVisitors(prev => [newVisitor, ...prev]);
    setIsCheckInOpen(false);

    // Trigger monochrome celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#000000', '#ffffff', '#737373', '#d4d4d4', '#262626']
      });
    } catch (e) {
      console.log('Confetti failed gracefully', e);
    }

    // Auto open visitor badge modal
    setSelectedVisitorForBadge(newVisitor);
    setIsBadgeModalOpen(true);
    return newVisitor;
  };

  // Action: Check Out Visitor
  const checkOutVisitor = (visitorId) => {
    setVisitors(prev => prev.map(v => {
      if (v.id === visitorId) {
        return {
          ...v,
          checkOutTime: new Date().toISOString(),
          status: 'Checked-Out'
        };
      }
      return v;
    }));
  };

  // Action: Open Badge Modal
  const openBadgeModal = (visitor) => {
    setSelectedVisitorForBadge(visitor);
    setIsBadgeModalOpen(true);
  };

  // Action: Reset Data
  const resetToDemoData = () => {
    setVisitors(INITIAL_VISITORS);
    localStorage.removeItem('vsms_visitors');
  };

  // Helper: Export to CSV
  const exportToCSV = () => {
    const headers = ['Visitor ID', 'Full Name', 'Phone', 'Email', 'Company', 'ID Type', 'ID Number', 'Host', 'Department', 'Purpose', 'Check-In', 'Check-Out', 'Status', 'Badge ID'];
    const rows = visitors.map(v => [
      v.id,
      `"${(v.fullName || '').replace(/"/g, '""')}"`,
      `"${(v.phone || '').replace(/"/g, '""')}"`,
      `"${(v.email || '').replace(/"/g, '""')}"`,
      `"${(v.company || '').replace(/"/g, '""')}"`,
      `"${(v.idType || '').replace(/"/g, '""')}"`,
      `"${(v.idNumber || '').replace(/"/g, '""')}"`,
      `"${(v.hostName || '').replace(/"/g, '""')}"`,
      `"${(v.department || '').replace(/"/g, '""')}"`,
      `"${(v.purpose || '').replace(/"/g, '""')}"`,
      `"${new Date(v.checkInTime).toLocaleString()}"`,
      v.checkOutTime ? `"${new Date(v.checkOutTime).toLocaleString()}"` : 'Active',
      v.status,
      v.badgeId
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VSMS_Visitor_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <VisitorContext.Provider value={{
      visitors,
      departments: DEPARTMENTS,
      hosts: HOSTS,
      theme,
      toggleTheme,
      userRole,
      setUserRole,
      activeView,
      setActiveView,
      isCheckInOpen,
      setIsCheckInOpen,
      isBadgeModalOpen,
      setIsBadgeModalOpen,
      selectedVisitorForBadge,
      setSelectedVisitorForBadge,
      openBadgeModal,
      isCmdKOpen,
      setIsCmdKOpen,
      globalSearchQuery,
      setGlobalSearchQuery,
      selectedDeptFilter,
      setSelectedDeptFilter,
      selectedStatusFilter,
      setSelectedStatusFilter,
      registerVisitor,
      checkOutVisitor,
      resetToDemoData,
      exportToCSV,
    }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitorContext = () => useContext(VisitorContext);
```

---

## 4. Verification Method & Success Criteria

1. **Static Analysis & Token Purity**:
   - `grep_search` across `tailwind.config.js` and `src/index.css` for `#10a37f`, `emerald`, `amber`, `blue`, and ensure all color variables are strictly high-contrast monochrome tokens.
2. **Backward Compatibility**:
   - The `--openai-accent` CSS variable mapping in both `:root` (`#000000`) and `.dark` (`#ffffff`) guarantees that existing components that reference `openai-accent` immediately render in monochrome during milestone progression without visual breakage.
3. **Typography & Layout**:
   - Google Fonts preconnect and font rules enforce `Plus Jakarta Sans` as the primary sans-serif face, `Inter` as fallback sans, and `JetBrains Mono` for monospace metrics.
4. **Grayscale Images**:
   - Global `img` filter rule `filter: grayscale(100%) contrast(105%);` ensures all avatar photos render in monochrome.
5. **Monochrome Confetti**:
   - Particle palette in `VisitorContext.jsx` verified to use only `['#000000', '#ffffff', '#737373', '#d4d4d4', '#262626']`.
6. **Build Integrity**:
   - `npm run build` must execute cleanly and generate optimized bundles with 0 syntax or PostCSS errors.
