import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  LogIn,
  Users,
  CheckCircle2,
  TrendingUp,
  Zap,
  Lock,
  Globe,
  Star,
  UserCheck,
} from 'lucide-react';

const DEMO_ENTRIES = [
  {
    id: 1,
    day: 'MON',
    date: '22 SEP',
    visitors: [
      { name: 'Dr. Aisha Sterling', purpose: 'Executive Briefing', time: '9:00 AM – 10:00 AM', duration: '1h', avatar: 'AS' },
    ]
  },
  {
    id: 2,
    day: 'TUE',
    date: '23 SEP',
    visitors: [
      { name: 'Engr. David Nwosu', purpose: 'Contractor Maintenance', time: '10:30 AM – 12:00 PM', duration: '1h 30m', avatar: 'DN' },
      { name: 'Barr. Fatima Bello', purpose: 'Legal Consultation', time: '2:00 PM – 2:45 PM', duration: '45m', avatar: 'FB' },
    ]
  },
  {
    id: 3,
    day: 'WED',
    date: '24 SEP',
    visitors: [
      { name: 'Mr. Emeka Orji', purpose: 'Job Interview', time: '9:30 AM – 10:30 AM', duration: '1h', avatar: 'EO' },
    ]
  },
  {
    id: 4,
    day: 'THU',
    date: '25 SEP',
    visitors: [
      { name: 'Mrs. Clara Adebayo', purpose: 'Official Meeting', time: '11:00 AM – 12:00 PM', duration: '1h', avatar: 'CA' },
      { name: 'Chief Marcus Vance', purpose: 'Vendor Presentation', time: '3:00 PM – 4:00 PM', duration: '1h', avatar: 'MV' },
    ]
  },
];

const TRUST_AVATARS = ['AB', 'CS', 'NK', 'OE'];

const FEATURES = [
  { icon: Zap, label: 'Instant check-in' },
  { icon: Lock, label: 'Role-based access' },
  { icon: Globe, label: 'Multi-tenant' },
  { icon: UserCheck, label: 'Dynamic forms' },
];

const LivePulse = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27520d] opacity-60" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#27520d]" />
  </span>
);

export const LandingPage = () => {
  const { setIsOrgWizardOpen, setIsLoginModalOpen } = useAuthContext();
  const [visibleGroups, setVisibleGroups] = useState(1);

  useEffect(() => {
    const timers = DEMO_ENTRIES.map((_, i) => {
      if (i === 0) return null;
      return setTimeout(() => setVisibleGroups(i + 1), i * 700);
    }).filter(Boolean);
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen font-sans antialiased bg-[linear-gradient(135deg,#f4f8fa_0%,#eef5f7_40%,#e4eff2_100%)] selection:bg-neutral-950 selection:text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1180px] bg-white/70 backdrop-blur-sm border border-white/90 rounded-[28px] shadow-[0_32px_80px_-12px_rgba(17,22,37,0.10)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

        {/* LEFT PANEL */}
        <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-black text-[11px] tracking-widest shadow-md select-none">
              VSMS
            </div>
            <span className="text-sm font-bold text-neutral-700 tracking-tight">Visitor Suite</span>
          </div>

          {/* Hero block */}
          <div className="flex-1 flex flex-col justify-center gap-6">
            {/* Status pill */}
            <div>
              <div className="inline-flex items-center gap-2 border border-[#d7f4b7] bg-[#f2fce8] text-[#27520d] text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                <LivePulse />
                Open for Organizations
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-950 leading-[1.08] tracking-tight">
              Secure{' '}
              <span className="inline-flex items-center gap-2 align-middle">
                <span className="inline-flex w-12 h-12 rounded-2xl bg-neutral-950 text-white items-center justify-center shadow-lg shrink-0 -translate-y-0.5">
                  <ShieldCheck className="w-6 h-6" />
                </span>
              </span>{' '}
              visitor management with every check-in
            </h1>

            {/* Subtext */}
            <p className="text-sm text-neutral-500 leading-relaxed max-w-[380px]">
              From custom check-in forms to printable badge passes, VSMS helps organizations manage and track every visitor with precision and speed.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="landing-setup-org-btn"
                type="button"
                onClick={() => setIsOrgWizardOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-bold transition-all shadow-[0_6px_18px_rgba(17,22,37,0.18)] active:scale-[0.98] cursor-pointer"
              >
                <Building2 className="w-4 h-4 shrink-0" />
                Setup Organization
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="landing-login-btn"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-bold transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                Sign In
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {FEATURES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full"
                >
                  <Icon className="w-3 h-3 text-neutral-500" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center gap-6 pt-10 mt-6 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {TRUST_AVATARS.map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-neutral-700 shadow-sm"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Trusted By</p>
                <p className="text-xs font-bold text-neutral-800">Organizations Worldwide</p>
              </div>
            </div>
            <div className="h-8 w-px bg-neutral-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Rated</p>
                <p className="text-xs font-bold text-neutral-800">Excellent 5 / 5</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Live Visitor Feed Preview */}
        <div className="hidden lg:flex flex-col bg-neutral-50/80 border-l border-neutral-100 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-50/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-16 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          <div className="flex-1 overflow-y-auto px-8 pt-10 pb-4 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {DEMO_ENTRIES.slice(0, visibleGroups).map((group, gi) => (
              <div key={group.id} className="space-y-2.5 animate-fade-in" style={{ animationDelay: `${gi * 40}ms` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-[0.12em]">{group.day}</span>
                  <span className="text-[11px] font-semibold text-neutral-300">{group.date}</span>
                </div>
                {group.visitors.map((v, vi) => (
                  <div
                    key={vi}
                    className="flex items-center gap-3.5 bg-white border border-neutral-100 rounded-2xl px-4 py-3 shadow-[0_2px_8px_rgba(17,22,37,0.04)] hover:shadow-[0_4px_14px_rgba(17,22,37,0.07)] transition-shadow"
                  >
                    <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                      {v.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">{v.name}</p>
                      <p className="text-[11px] text-neutral-400 font-medium">{v.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-[11px] font-bold text-neutral-500">{v.duration}</span>
                      <span className="text-[10px] text-neutral-300 font-medium truncate max-w-[80px]">{v.purpose.split('/')[0].trim()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {visibleGroups >= DEMO_ENTRIES.length && (
              <div className="flex items-center gap-2 pt-1 animate-fade-in pb-4">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.9s' }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-neutral-400 font-medium">Monitoring live arrivals...</span>
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="border-t border-neutral-100 px-8 py-4 bg-white/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[11px] font-bold text-neutral-500">Live activity feed</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] font-bold text-neutral-700">
                  {DEMO_ENTRIES.reduce((a, g) => a + g.visitors.length, 0)} visitors today
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] font-bold text-neutral-500">All checked in</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
