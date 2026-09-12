import React from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { useAuthContext } from '../context/AuthContext';
import { 
  PieChart, 
  BarChart2, 
  LayoutGrid, 
  Users, 
  UserCheck, 
  FileSpreadsheet, 
  Headphones, 
  Mic, 
  Sliders, 
  Settings, 
  ChevronUp, 
  MoreVertical,
  ShieldCheck,
  UserPlus,
  QrCode,
  ShieldAlert,
  Database,
  LogIn,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    activeView, 
    setActiveView, 
    setIsCheckInOpen, 
    visitors, 
    resetToDemoData,
    openBadgeModal,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useVisitorContext();

  const { 
    currentUser, 
    logout, 
    setIsLoginModalOpen 
  } = useAuthContext();

  const currentlyCheckedInCount = visitors.filter(v => v.status !== 'Checked-Out').length;
  const overdueCount = visitors.filter(v => v.status === 'Overdue').length;

  const handleNavClick = (viewName) => {
    setActiveView(viewName);
    setIsMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full p-4 lg:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm select-none font-sans overflow-hidden">
      <div className="flex flex-col min-h-0 flex-1 space-y-6">
        
        {/* Logo & Quick Check-In Header */}
        <div className="flex items-center justify-between px-1 shrink-0">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('live')}>
            <div className="w-8 h-8 rounded-xl bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-bold text-lg shadow-sm shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">VSMS PRO</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              type="button"
              onClick={() => { setIsCheckInOpen(true); setIsMobileMenuOpen(false); }}
              className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs transition shadow-xs" 
              title="Register New Guest Check-In"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center text-xs transition"
              title="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Sections (Scrollable if height constrained) */}
        <nav className="flex-1 space-y-5 overflow-y-auto pr-1" aria-label="Application Sections">
          
          {/* Visitor Management Category */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
              Visitor Desk
            </div>
            
            {/* Live Presence Board */}
            <button
              type="button"
              onClick={() => handleNavClick('live')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'live'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5 whitespace-nowrap min-w-0">
                <PieChart className="w-4 h-4 shrink-0" />
                <span className="truncate">Live Tracker</span>
              </div>
              {currentlyCheckedInCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs shrink-0 ml-1">
                  {currentlyCheckedInCount}
                </span>
              )}
            </button>
            
            {/* Master Visitor Log */}
            <button
              type="button"
              onClick={() => handleNavClick('log')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'log'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
              }`}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Visitor Log</span>
            </button>
            
            {/* Analytics & Reports */}
            <button
              type="button"
              onClick={() => handleNavClick('analytics')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'analytics'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span className="truncate">Analytics & Reports</span>
            </button>
          </div>

          {/* Directory & Governance Category */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5 flex items-center justify-between">
              <span>Organization</span>
            </div>
            
            {/* Departments & Hosts Roster */}
            <button
              type="button"
              onClick={() => handleNavClick('departments')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'departments'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Departments & Hosts</span>
            </button>

            {/* Security Settings & System Administration */}
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'settings'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span className="truncate">Settings & System Admin</span>
            </button>
          </div>

          {/* Pass Badges & Alerts Category */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5 flex items-center justify-between">
              <span>Passes & Comms</span>
            </div>
            
            {/* Digital Badge Passes */}
            <button
              type="button"
              onClick={() => {
                if (visitors[0]) openBadgeModal(visitors[0]);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70 font-bold text-xs transition whitespace-nowrap shrink-0"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span className="truncate">Digital Badge Pass</span>
            </button>

            {/* Security Alerts */}
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70 font-bold text-xs transition whitespace-nowrap shrink-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">Security Alerts</span>
              </div>
              {overdueCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs shrink-0 ml-1">
                  {overdueCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Profile & User Status Widget (Anchored shrink-0) */}
      <div className="rounded-2xl p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2.5 shrink-0 mt-4">
        
        {/* Media Toolbar */}
        <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-1 rounded-full border border-neutral-200 dark:border-neutral-700">
          <button 
            type="button"
            onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
            className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs transition hover:scale-105"
            title="Switch User / Sign In"
          >
            <LogIn className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => handleNavClick('settings')}
            className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs transition hover:scale-105"
            title="System Settings & Administration"
          >
            <Database className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => handleNavClick('settings')}
            className="w-7 h-7 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center text-xs transition shadow-xs hover:scale-105"
            title={`Role: ${currentUser?.role || 'admin'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Authenticated User Profile */}
        {currentUser && (
          <div className="flex items-center justify-between px-1 pt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.fullName} 
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700" 
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900"></span>
              </div>
              <div className="text-left min-w-0">
                <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider truncate">
                  Role: {currentUser.role}
                </div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs p-1 rounded-full transition shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Persistent Desktop Sidebar (md and up) */}
      <aside 
        aria-label="Main Navigation"
        className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col md:sticky md:top-6 md:h-[calc(100vh-3rem)] z-30 select-none font-sans"
      >
        {navContent}
      </aside>

      {/* Mobile Slide-Over Navigation Drawer (< md) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside 
            aria-label="Mobile Navigation Drawer"
            className="relative w-4/5 max-w-xs bg-white dark:bg-neutral-900 h-full shadow-2xl z-10 flex flex-col overflow-hidden p-2"
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
