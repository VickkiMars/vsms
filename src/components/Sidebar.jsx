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
    <div className="flex flex-col justify-between h-full p-5 bg-white/95 dark:bg-neutral-900/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none select-none font-sans overflow-y-auto">
      <div className="space-y-7">
        
        {/* Logo & Quick Check-In Collapse Button */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('live')}>
            <div className="w-8 h-8 rounded-xl bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-bold text-lg shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white">VSMS PRO</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => { setIsCheckInOpen(true); setIsMobileMenuOpen(false); }}
              className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-neutral-900 dark:text-white flex items-center justify-center text-xs transition shadow-xs" 
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

        {/* Navigation Sections */}
        <nav className="space-y-6" aria-label="Application Sections">
          
          {/* Visitor Management Category */}
          <div className="space-y-1.5">
            <div className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">Visitor Desk</div>
            
            {/* Live Presence Board */}
            <button
              type="button"
              onClick={() => handleNavClick('live')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'live'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md scale-[1.02]'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
              }`}
            >
              <div className="flex items-center gap-3 whitespace-nowrap">
                <PieChart className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Live Tracker</span>
              </div>
              {currentlyCheckedInCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs shrink-0 whitespace-nowrap">
                  {currentlyCheckedInCount}
                </span>
              )}
            </button>
            
            {/* Master Visitor Log */}
            <button
              type="button"
              onClick={() => handleNavClick('log')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'log'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md scale-[1.02]'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
              }`}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Visitor Log</span>
            </button>
            
            {/* Analytics & Reports */}
            <button
              type="button"
              onClick={() => handleNavClick('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'analytics'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md scale-[1.02]'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Analytics & Reports</span>
            </button>
          </div>

          {/* Directory & Governance Category */}
          <div className="space-y-1.5">
            <div className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2 flex items-center justify-between whitespace-nowrap">
              <span>Organization</span>
              <ChevronUp className="w-3 h-3 text-slate-500 shrink-0" />
            </div>
            
            {/* Departments & Hosts Roster */}
            <button
              type="button"
              onClick={() => handleNavClick('departments')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'departments'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md scale-[1.02]'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Departments & Hosts</span>
            </button>

            {/* Security Settings & System Administration */}
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-150 whitespace-nowrap shrink-0 ${
                activeView === 'settings'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md scale-[1.02]'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Settings & System Admin</span>
            </button>
          </div>

          {/* Pass Badges & Alerts Category */}
          <div className="space-y-1.5">
            <div className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2 flex items-center justify-between whitespace-nowrap">
              <span>Passes & Comms</span>
              <ChevronUp className="w-3 h-3 text-slate-500 shrink-0" />
            </div>
            
            {/* Digital Badge Passes */}
            <button
              type="button"
              onClick={() => {
                if (visitors[0]) openBadgeModal(visitors[0]);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80 font-bold text-sm transition whitespace-nowrap shrink-0"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Digital Badge Pass</span>
            </button>

            {/* Security Alerts */}
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-full text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80 font-bold text-sm transition whitespace-nowrap shrink-0"
            >
              <div className="flex items-center gap-3 whitespace-nowrap">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="whitespace-nowrap">Security Alerts</span>
              </div>
              {overdueCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs shrink-0 whitespace-nowrap">
                  {overdueCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Floating Bottom Profile & User Status Widget */}
      <div className="rounded-3xl p-3.5 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-md space-y-3 mt-6">
        
        {/* Media Toolbar */}
        <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-full border border-neutral-200 dark:border-neutral-700">
          <button 
            type="button"
            onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
            className="w-7 h-7 rounded-full bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs transition hover:scale-105"
            title="Switch User / Sign In"
          >
            <LogIn className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => handleNavClick('settings')}
            className="w-7 h-7 rounded-full bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs transition hover:scale-105"
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

        {/* Active Authenticated User Profile */}
        {currentUser && (
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.fullName} 
                  className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700" 
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900"></span>
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
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs p-1 rounded-full transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
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
        className="hidden md:flex w-[260px] flex-shrink-0 flex-col justify-between p-5 bg-transparent select-none z-30 font-sans h-full"
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
            className="relative w-4/5 max-w-xs bg-white dark:bg-neutral-900 h-full shadow-2xl z-10 flex flex-col overflow-hidden"
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
