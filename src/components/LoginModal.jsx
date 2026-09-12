import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  X, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginModal = () => {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    login, 
    authError, 
    setAuthError,
    currentUser,
    switchUserRole
  } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const success = login(email, password);
      setIsSubmitting(false);
      if (success) {
        setEmail('');
        setPassword('');
      }
    }, 200);
  };

  const handleQuickLogin = (presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
    setAuthError('');
    setIsSubmitting(true);
    setTimeout(() => {
      login(presetEmail, presetPassword);
      setIsSubmitting(false);
    }, 150);
  };

  return (
    <div 
      aria-modal="true" 
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-black text-sm tracking-widest shadow-md">
              VSMS
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Authentication Portal
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Local Authentication & Access Control
              </p>
            </div>
          </div>
          {currentUser && (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="Close login dialog"
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Demo Accounts Bar */}
        <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-950/50 border-b border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
            Instant Demo Account Login:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@vsms.com', 'admin123')}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[11px] font-bold hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition flex items-center justify-center gap-1 shadow-xs"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('guard@vsms.com', 'guard123')}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[11px] font-bold hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition flex items-center justify-center gap-1 shadow-xs"
            >
              🛡️ Guard
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('reception@vsms.com', 'reception123')}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[11px] font-bold hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition flex items-center justify-center gap-1 shadow-xs"
            >
              📋 Desk
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {authError && (
            <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-neutral-900 dark:text-white shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="admin@vsms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white text-xs font-medium text-neutral-900 dark:text-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white text-xs font-medium text-neutral-900 dark:text-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to VSMS</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2 text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-neutral-500" />
            <span>System Security Engine • Local Encryption Active</span>
          </div>

        </form>
      </div>
    </div>
  );
};
