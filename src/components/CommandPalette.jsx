import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
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
  ShieldCheck,
  QrCode,
  LogOut,
  AlertTriangle,
  UserCheck
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
    resetToDemoData,
    userRole,
    setUserRole
  } = useVisitorContext();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);

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
      keywords: 'settings configuration preferences system options',
      run: () => { setIsCmdKOpen(false); setActiveView('settings'); } 
    },
    { 
      type: 'action',
      id: 'action-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`, 
      category: 'Utility',
      icon: theme === 'dark' ? Sun : Moon, 
      keywords: 'theme dark light mode toggle contrast style switch',
      run: () => { setIsCmdKOpen(false); toggleTheme(); } 
    },
    { 
      type: 'action',
      id: 'action-export-csv',
      label: 'Export Master Log to CSV', 
      category: 'Utility',
      icon: Download, 
      keywords: 'export csv download spreadsheet excel backup file data',
      run: () => { setIsCmdKOpen(false); exportToCSV(); } 
    },
    { 
      type: 'action',
      id: 'action-reset-data',
      label: 'Reset to Initial Demo Data', 
      category: 'Utility',
      icon: RefreshCw, 
      keywords: 'reset restore demo initial data clear storage reload seed',
      run: () => { setIsCmdKOpen(false); resetToDemoData(); } 
    },
    { 
      type: 'action',
      id: 'action-toggle-role',
      label: `Switch Role (Current: ${userRole.toUpperCase()})`, 
      category: 'Utility',
      icon: ShieldCheck, 
      keywords: 'role switch admin security permission toggle user account',
      run: () => { 
        setIsCmdKOpen(false); 
        setUserRole(userRole === 'admin' ? 'security' : 'admin'); 
      } 
    },
  ], [setActiveView, setIsCheckInOpen, setIsCmdKOpen, theme, toggleTheme, exportToCSV, resetToDemoData, userRole, setUserRole]);

  // Filter visitors based on query (capped to max 5 instant results)
  const filteredVisitors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return visitors.filter(v => 
      v.fullName.toLowerCase().includes(q) ||
      v.company.toLowerCase().includes(q) ||
      v.hostName.toLowerCase().includes(q) ||
      v.badgeId.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      (v.phone && v.phone.toLowerCase().includes(q)) ||
      (v.department && v.department.toLowerCase().includes(q))
    ).slice(0, 5).map(v => ({
      type: 'visitor',
      id: `visitor-${v.id}`,
      data: v,
      run: () => {
        setIsCmdKOpen(false);
        openBadgeModal(v);
      }
    }));
  }, [query, visitors, setIsCmdKOpen, openBadgeModal]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allActions;
    return allActions.filter(act => 
      act.label.toLowerCase().includes(q) ||
      act.category.toLowerCase().includes(q) ||
      (act.keywords && act.keywords.toLowerCase().includes(q))
    );
  }, [query, allActions]);

  // Combined flat list for keyboard arrow navigation
  const flatItems = useMemo(() => {
    return [...filteredVisitors, ...filteredActions];
  }, [filteredVisitors, filteredActions]);

  // Reset selectedIndex when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus search input when opened
  useEffect(() => {
    if (isCmdKOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isCmdKOpen]);

  // Keep selected item visible in list
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation handler inside the palette
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsCmdKOpen(false);
      return;
    }

    if (flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentItem = flatItems[selectedIndex];
      if (currentItem && currentItem.run) {
        currentItem.run();
      }
    }
  };

  if (!isCmdKOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/40 backdrop-blur-xs animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCmdKOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-float-bar overflow-hidden animate-scale-in flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="px-5 py-4 flex items-center space-x-3 bg-white">
          <Search className="w-5 h-5 text-realty-textMuted flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type visitor name, badge ID, host, or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Command palette search input"
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            className="w-full bg-transparent text-sm font-bold text-realty-dark placeholder-realty-textMuted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="p-1 rounded-full text-realty-textMuted hover:text-realty-dark"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCmdKOpen(false)}
            aria-label="Close command palette"
            className="px-2.5 py-1 rounded-full bg-realty-cardSubtle text-[10px] font-bold text-realty-textMuted hover:text-realty-dark"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div 
          id="command-palette-results"
          role="listbox"
          aria-label="Command suggestions"
          className="p-4 max-h-[390px] overflow-y-auto space-y-4 text-xs"
        >
          {/* Visitor Matches Section */}
          {query.trim() !== '' && (
            <div>
              <div className="px-3 py-1 text-[10px] font-extrabold text-realty-textMuted uppercase tracking-wider">
                Matching Guests ({filteredVisitors.length})
              </div>
              {filteredVisitors.length === 0 ? (
                <div className="px-3 py-3 text-realty-textMuted text-center font-medium">
                  No guests found matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="space-y-1.5 mt-1">
                  {filteredVisitors.map((item, idx) => {
                    const v = item.data;
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={item.id}
                        ref={(el) => { itemRefs.current[idx] = el; }}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => item.run()}
                        className={`px-4 py-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-realty-dark text-white shadow-pill-active'
                            : 'bg-realty-cardSubtle text-realty-dark hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                          <img 
                            src={v.avatar} 
                            alt={v.fullName} 
                            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.fullName)}&backgroundColor=111625&textColor=ffffff`;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold flex items-center space-x-2 truncate">
                              <span className="truncate">{v.fullName}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-white text-realty-dark shadow-xs'
                              }`}>
                                {v.badgeId}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0 ${
                                v.status === 'Checked-In'
                                  ? 'bg-tag-rental text-white'
                                  : v.status === 'Overdue'
                                  ? 'bg-tag-sale text-white'
                                  : 'bg-gray-200 text-realty-textMuted'
                              }`}>
                                {v.status}
                              </span>
                            </div>
                            <div className={`text-[10px] font-medium truncate ${isSelected ? 'text-white/80' : 'text-realty-textMuted'}`}>
                              {v.company} • Host: {v.hostName} ({v.department})
                            </div>
                          </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center space-x-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {v.status !== 'Checked-Out' && (
                            <button
                              type="button"
                              onClick={() => {
                                checkOutVisitor(v.id);
                                setIsCmdKOpen(false);
                              }}
                              title="1-Click Check Out"
                              aria-label={`Check out ${v.fullName}`}
                              className="px-3 py-1 rounded-full bg-tag-sale text-white font-extrabold text-[10px] shadow-xs active:scale-95"
                            >
                              Check-Out
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCmdKOpen(false);
                              openBadgeModal(v);
                            }}
                            title="View Security Pass Badge"
                            aria-label={`View pass badge for ${v.fullName}`}
                            className={`px-3 py-1 rounded-full font-extrabold text-[10px] transition-all active:scale-95 ${
                              isSelected ? 'bg-white text-realty-dark' : 'bg-realty-dark text-white'
                            }`}
                          >
                            View Pass
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions & Navigation Section */}
          <div>
            <div className="px-3 py-1 text-[10px] font-extrabold text-realty-textMuted uppercase tracking-wider">
              System Commands & Navigation
            </div>
            {filteredActions.length === 0 ? (
              <div className="px-3 py-2 text-realty-textMuted text-center font-medium">No actions found</div>
            ) : (
              <div className="space-y-1.5 mt-1">
                {filteredActions.map((act, i) => {
                  const Icon = act.icon;
                  const itemIndex = filteredVisitors.length + i;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={act.id}
                      ref={(el) => { itemRefs.current[itemIndex] = el; }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      onClick={act.run}
                      className={`w-full px-4 py-3 rounded-2xl text-left flex items-center justify-between font-bold transition-all ${
                        isSelected
                          ? 'bg-realty-dark text-white shadow-pill-active'
                          : 'text-realty-dark bg-realty-cardSubtle hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-pastel-lime' : 'text-realty-dark'}`} aria-hidden="true" />
                        <span className="text-xs">{act.label}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] font-bold opacity-80 uppercase tracking-wider">
                        <span>{act.category}</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-5 py-3 bg-realty-cardSubtle text-[10px] text-realty-textMuted font-bold flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded-full bg-white text-realty-dark shadow-xs font-bold text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded-full bg-white text-realty-dark shadow-xs font-bold text-[9px]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-0.5 rounded-full bg-white text-realty-dark shadow-xs font-bold text-[9px]">↵</kbd>
              <span>Execute</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-0.5 rounded-full bg-white text-realty-dark shadow-xs font-bold text-[9px]">ESC</kbd>
              <span>Close</span>
            </span>
          </div>
          <span className="hidden sm:inline font-bold uppercase text-[10px] text-realty-dark">VSMS Command Engine</span>
        </div>
      </div>
    </div>
  );
};
