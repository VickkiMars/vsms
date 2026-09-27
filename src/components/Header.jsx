import React, { useState } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { useAuthContext } from '../context/AuthContext';
import { 
  Search, 
  X,
  UserPlus, 
  LogOut, 
  LogIn, 
  ChevronDown, 
  Menu, 
  ShieldCheck,
  Building2,
  Plus,
  Sparkles
} from 'lucide-react';

export const Header = () => {
  const { 
    activeView, 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    setSelectedDeptFilter,
    exportToCSV,
    resetToDemoData,
    setUserRole,
    toggleTheme,
    setIsCmdKOpen,
    setIsCheckInOpen, 
    setIsMobileMenuOpen 
  } = useVisitorContext();

  const { 
    currentUser, 
    currentOrg,
    organizations,
    switchOrganization,
    setIsOrgWizardOpen,
    logout, 
    setIsLoginModalOpen 
  } = useAuthContext();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const getViewTitle = () => {
    switch (activeView) {
      case 'log': return 'Master Visitor Log';
      case 'analytics': return 'Analytics & Reports';
      case 'departments': return 'Departments & Hosts';
      case 'settings': return 'Organization & System Settings';
      default: return 'Live Presence Board';
    }
  };

  return (
    <header 
      aria-label="Top Navigation Header"
      className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 px-2 py-2 font-sans select-none"
    >
      {/* Top Mobile Bar + Title & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
        
        {/* Mobile Hamburger & Logo Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition shadow-xs cursor-pointer"
              aria-label="Open mobile navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="md:hidden w-7 h-7 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-bold">
                <ShieldCheck className="w-4 h-4 text-white dark:text-neutral-900" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight truncate">
                {getViewTitle()}
              </h1>
            </div>
          </div>

          {/* Quick Check-In Button for small screens (< sm) */}
          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="sm:hidden px-2.5 py-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer whitespace-nowrap shrink-0"
            title="Register New Guest"
          >
            <UserPlus className="w-3 h-3 shrink-0" />
            <span>Check In</span>
          </button>
        </div>

        {/* Global Search Input Bar */}
        <div className="relative flex-1 max-w-full sm:max-w-xs md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 text-xs">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search visitors, badges, attributes..." 
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 rounded-full bg-white/90 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 shadow-xs transition"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                aria-label="Clear search input"
                className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCmdKOpen(true)}
              className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-[10px] font-bold text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition shadow-xs cursor-pointer"
              title="Open Command Engine (⌘K)"
            >
              ⌘ K
            </button>
          </div>
        </div>

      </div>

      {/* Desktop / Tablet Right Header Controls */}
      <div className="flex items-center gap-2.5 justify-end">
        
        {/* Active Organization Switcher / Onboarding Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsOrgDropdownOpen(!isOrgDropdownOpen);
              setIsProfileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition shadow-xs cursor-pointer"
            title="Switch Organization Workspace"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-[10px]">
              <Building2 className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[120px] sm:max-w-[160px]">
              {currentOrg?.name || '+ Setup Organization'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in font-sans">
              <div className="px-3.5 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  Select Organization:
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto p-1.5 space-y-1">
                {(organizations || []).length === 0 ? (
                  <div className="px-3 py-3 text-center text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    No organizations yet
                  </div>
                ) : (
                  (organizations || []).map(org => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => {
                        switchOrganization(org.id);
                        setIsOrgDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        currentOrg?.id === org.id 
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                        <span className="truncate">{org.name}</span>
                      </div>
                      {currentOrg?.id === org.id && (
                        <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white shrink-0"></span>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsOrgDropdownOpen(false);
                    setIsOrgWizardOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Setup New Organization</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Check-In CTA Button (sm and up) */}
        <button
          type="button"
          onClick={() => setIsCheckInOpen(true)}
          className="hidden sm:flex px-4 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0 cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 shrink-0" />
          <span>+ Check In Guest</span>
        </button>

        {/* Authenticated User Profile Menu */}
        <div className="relative shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsOrgDropdownOpen(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition shadow-xs cursor-pointer"
            >
              <div className="relative">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.fullName} 
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-neutral-900 dark:ring-white"
                />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-neutral-900 dark:bg-white"></span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-neutral-900 dark:text-white leading-none truncate max-w-[100px]">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-0.5">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in font-sans">
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {currentUser.fullName}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                  <span className="text-[10px] text-neutral-500 truncate">
                    {currentUser.desk_location || 'Desk'}
                  </span>
                </div>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => { setIsProfileMenuOpen(false); setIsLoginModalOpen(true); }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Switch Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsProfileMenuOpen(false); logout(); }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
