import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { useAuthContext } from '../context/AuthContext';
import { 
  Search, 
  UserPlus, 
  Table, 
  Activity, 
  BarChart3, 
  Building2, 
  Settings, 
  X, 
  ArrowRight,
  Sun,
  Moon,
  Download,
  RefreshCw,
  QrCode,
  LogOut,
  Database
} from 'lucide-react';

export const CommandPalette = () => {
  const { 
    isCmdKOpen, 
    setIsCmdKOpen, 
    visitors, 
    setActiveView, 
    setIsCheckInOpen, 
    openBadgeModal,
    checkOutVisitor,
    theme,
    toggleTheme,
    exportToCSV,
    resetToDemoData
  } = useVisitorContext();

  const { switchUserRole } = useAuthContext();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Define static navigation & utility actions
  const allActions = useMemo(() => [
    { 
      type: 'action',
      id: 'action-register',
      label: 'Register New Guest Check-In', 
      category: 'Quick Action',
      icon: UserPlus, 
      keywords: 'check in new visitor register add guest form',
      run: () => { setIsCmdKOpen(false); setIsCheckInOpen(true); } 
    },
    { 
      type: 'action',
      id: 'action-live',
      label: 'Go to Live Tracker', 
      category: 'Navigation',
      icon: Activity, 
      keywords: 'live tracker presence active inside duration realtime',
      run: () => { setIsCmdKOpen(false); setActiveView('live'); } 
    },
    { 
      type: 'action',
      id: 'action-log',
      label: 'Go to Master Visitor Log', 
      category: 'Navigation',
      icon: Table, 
      keywords: 'master log table records history audit all visitors',
      run: () => { setIsCmdKOpen(false); setActiveView('log'); } 
    },
    { 
      type: 'action',
      id: 'action-analytics',
      label: 'Go to Analytics & Reports', 
      category: 'Navigation',
      icon: BarChart3, 
      keywords: 'analytics charts reports metrics stats peak hours',
      run: () => { setIsCmdKOpen(false); setActiveView('analytics'); } 
    },
    { 
      type: 'action',
      id: 'action-departments',
      label: 'Go to Departments & Hosts', 
      category: 'Navigation',
      icon: Building2, 
      keywords: 'departments directory hosts staff personnel roster floors',
      run: () => { setIsCmdKOpen(false); setActiveView('departments'); } 
    },
    { 
      type: 'action',
      id: 'action-settings',
      label: 'Go to System Settings', 
      category: 'Navigation',
      icon: Settings, 
      keywords: 'settings configuration preferences system options db',
      run: () => { setIsCmdKOpen(false); setActiveView('settings'); } 
    },
    { 
      type: 'action',
      id: 'action-export',
      label: 'Export Master Log (CSV)', 
      category: 'System Tool',
      icon: Download, 
      keywords: 'export csv download data backup log spreadsheet',
      run: () => { setIsCmdKOpen(false); exportToCSV(); } 
    },
    { 
      type: 'action',
      id: 'action-theme',
      label: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, 
      category: 'Appearance',
      icon: theme === 'dark' ? Sun : Moon, 
      keywords: 'theme dark mode light mode toggle appearance color',
      run: () => { setIsCmdKOpen(false); toggleTheme(); } 
    },
    { 
      type: 'action',
      id: 'action-role-admin',
      label: 'Switch Role: Administrator', 
      category: 'Security Access',
      icon: Database, 
      keywords: 'switch role admin manager director full control',
      run: () => { setIsCmdKOpen(false); switchUserRole('admin'); } 
    },
    { 
      type: 'action',
      id: 'action-role-guard',
      label: 'Switch Role: Security Guard', 
      category: 'Security Access',
      icon: Database, 
      keywords: 'switch role security guard desk officer',
      run: () => { setIsCmdKOpen(false); switchUserRole('security'); } 
    },
    { 
      type: 'action',
      id: 'action-reset',
      label: 'Reset Database to Demo Seed', 
      category: 'System Tool',
      icon: RefreshCw, 
      keywords: 'reset clear data restore default sample seed clean',
      run: () => { setIsCmdKOpen(false); resetToDemoData(); } 
    }
  ], [theme, setIsCmdKOpen, setIsCheckInOpen, setActiveView, exportToCSV, toggleTheme, switchUserRole, resetToDemoData]);

  // Combine actions and dynamic visitor records
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();

    const matchingActions = allActions.filter(act => 
      !q || 
      act.label.toLowerCase().includes(q) || 
      act.category.toLowerCase().includes(q) || 
      act.keywords.includes(q)
    );

    const matchingVisitors = visitors.filter(v => 
      q && (
        v.fullName.toLowerCase().includes(q) ||
        (v.company && v.company.toLowerCase().includes(q)) ||
        (v.hostName && v.hostName.toLowerCase().includes(q)) ||
        (v.badgeId && v.badgeId.toLowerCase().includes(q)) ||
        (v.id && v.id.toLowerCase().includes(q))
      )
    ).map(v => ({
      type: 'visitor',
      id: `visitor-${v.id}`,
      label: `${v.fullName} (${v.badgeId})`,
      subtitle: `${v.company || 'Guest'} • Host: ${v.hostName}`,
      visitor: v,
      category: 'Visitor Search',
      run: () => {
        setIsCmdKOpen(false);
        openBadgeModal(v);
      }
    }));

    return [...matchingActions, ...matchingVisitors];
  }, [allActions, visitors, query, setIsCmdKOpen, openBadgeModal]);

  // Focus input when opened
  useEffect(() => {
    if (isCmdKOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCmdKOpen]);

  // Handle keyboard navigation inside command palette
  useEffect(() => {
    if (!isCmdKOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].run();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdKOpen, filteredItems, selectedIndex]);

  if (!isCmdKOpen) return null;

  return (
    <div 
      aria-modal="true" 
      role="dialog" 
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-24 p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-sans"
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Bar */}
        <div className="relative p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search visitor..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="w-full bg-transparent text-sm font-bold text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono font-bold text-neutral-400 uppercase">
            ESC
          </span>
        </div>

        {/* Action List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-semibold">
              No matching commands or visitor records found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComp = item.icon || QrCode;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition text-xs font-semibold ${
                    isSelected
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                      : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-950' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold truncate">{item.label}</div>
                      {item.subtitle && (
                        <div className={`text-[10px] truncate ${isSelected ? 'opacity-80' : 'text-neutral-500'}`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-950' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-semibold">
          <span>Navigation: <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">↑</kbd> <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">↓</kbd> to move, <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">↵</kbd> to select</span>
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
};
