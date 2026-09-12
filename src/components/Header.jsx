import React, { useState } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { useAuthContext } from '../context/AuthContext';
import { 
  Search, 
  Mic, 
  X,
  UserPlus,
  Shield,
  LogOut,
  LogIn,
  ChevronDown,
  UserCheck,
  Database
} from 'lucide-react';

export const Header = () => {
  const { 
    activeView,
    globalSearchQuery, 
    setGlobalSearchQuery, 
    setIsCmdKOpen,
    visitors,
    setIsCheckInOpen
  } = useVisitorContext();

  const { 
    currentUser, 
    logout, 
    setIsLoginModalOpen, 
    switchUserRole 
  } = useAuthContext();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const getViewTitle = () => {
    switch (activeView) {
      case 'log': return 'Master Visitor Log';
      case 'analytics': return 'Analytics & Reports';
      case 'departments': return 'Departments & Hosts';
      case 'settings': return 'Security System Settings';
      default: return 'Live Presence Board';
    }
  };

  const activeCount = visitors.filter(v => v.status !== 'Checked-Out').length;

  return (
    <header 
      aria-label="Top Navigation Header"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2 font-sans select-none"
    >
      {/* Title & Search Bar */}
      <div className="flex flex-wrap items-center gap-6 w-full sm:w-auto">
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {getViewTitle()}
        </h1>
        
        {/* Search Pill Input */}
        <div className="relative flex-1 sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 text-xs">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search visitors, badges, hosts..." 
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
                className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCmdKOpen(true)}
              className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-[10px] font-bold text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition shadow-xs"
              title="Open Command Engine (⌘K)"
            >
              ⌘ K
            </button>
          </div>
        </div>
      </div>

      {/* Right Header Controls & Auth User Menu */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        
        {/* Quick Check-In CTA Button */}
        <button
          type="button"
          onClick={() => setIsCheckInOpen(true)}
          className="px-4 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
        >
          <UserPlus className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700" />
          <span>+ Check In Guest</span>
        </button>

        {/* Authenticated User Menu */}
        <div className="relative">
          {currentUser ? (
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition shadow-xs"
            >
              <div className="relative">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.fullName} 
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-neutral-900 dark:ring-white"
                />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-neutral-900 dark:text-white leading-none">
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
              className="px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn font-sans">
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {currentUser.fullName}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {currentUser.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Role: {currentUser.role}
                </span>
              </div>

              <div className="px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <p className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Switch Active Role:
                </p>
                <button
                  type="button"
                  onClick={() => { switchUserRole('admin'); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-2 py-1 rounded-lg text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-between"
                >
                  <span>👑 Admin</span>
                  {currentUser.role === 'admin' && <UserCheck className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => { switchUserRole('security'); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-2 py-1 rounded-lg text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-between"
                >
                  <span>🛡️ Security Guard</span>
                  {currentUser.role === 'security' && <UserCheck className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => { switchUserRole('reception'); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-2 py-1 rounded-lg text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-between"
                >
                  <span>📋 Reception Desk</span>
                  {currentUser.role === 'reception' && <UserCheck className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />}
                </button>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => { setIsProfileMenuOpen(false); setIsLoginModalOpen(true); }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Switch Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsProfileMenuOpen(false); logout(); }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
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

