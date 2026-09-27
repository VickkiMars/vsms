import React, { useState, useEffect, useRef } from 'react';
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
  UserCheck,
  Star,
  ChevronRight,
} from 'lucide-react';

/* ─── Demo feed data ─────────────────────────────────────── */
const DEMO_ENTRIES = [
  {
    id: 1, day: 'MON', date: '22 SEP',
    visitors: [
      { name: 'Dr. Aisha Sterling', purpose: 'Executive Briefing', time: '9:00 – 10:00 AM', duration: '1h', avatar: 'AS' },
    ]
  },
  {
    id: 2, day: 'TUE', date: '23 SEP',
    visitors: [
      { name: 'Engr. David Nwosu', purpose: 'Contractor Maintenance', time: '10:30 AM – 12:00 PM', duration: '1h 30m', avatar: 'DN' },
      { name: 'Barr. Fatima Bello', purpose: 'Legal Consultation', time: '2:00 – 2:45 PM', duration: '45m', avatar: 'FB' },
    ]
  },
  {
    id: 3, day: 'WED', date: '24 SEP',
    visitors: [
      { name: 'Mr. Emeka Orji', purpose: 'Job Interview', time: '9:30 – 10:30 AM', duration: '1h', avatar: 'EO' },
    ]
  },
  {
    id: 4, day: 'THU', date: '25 SEP',
    visitors: [
      { name: 'Mrs. Clara Adebayo', purpose: 'Official Meeting', time: '11:00 AM – 12:00 PM', duration: '1h', avatar: 'CA' },
      { name: 'Chief Marcus Vance', purpose: 'Vendor Presentation', time: '3:00 – 4:00 PM', duration: '1h', avatar: 'MV' },
    ]
  },
];

const FEATURES = [
  { icon: Zap, label: 'Instant check-in', desc: 'Under 10 seconds, zero paper' },
  { icon: Lock, label: 'Role-based access', desc: 'Admin, Receptionist & Security' },
  { icon: Globe, label: 'Multi-tenant', desc: 'Isolated per organization' },
  { icon: UserCheck, label: 'Dynamic forms', desc: 'Custom fields per org' },
];

const TRUST_AVATARS = ['AB', 'CS', 'NK', 'OE'];


/* ─── Visitor card ───────────────────────────────────────── */
const VisitorCard = ({ v, delay }) => (
  <div
    className="flex items-center gap-3.5 bg-white border border-neutral-100 rounded-2xl px-4 py-3 shadow-[0_2px_8px_rgba(17,22,37,0.04)] hover:shadow-[0_4px_14px_rgba(17,22,37,0.07)] transition-all animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
      {v.avatar}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-neutral-900 truncate">{v.name}</p>
      <p className="text-[11px] text-neutral-400 font-medium">{v.time}</p>
    </div>
    <div className="shrink-0 text-right">
      <p className="text-[11px] font-bold text-neutral-600">{v.duration}</p>
      <p className="text-[10px] text-neutral-400 truncate max-w-[72px]">{v.purpose.split('/')[0].trim()}</p>
    </div>
  </div>
);

/* ─── Main component ─────────────────────────────────────── */
export const LandingPage = () => {
  const { setIsOrgWizardOpen, setIsLoginModalOpen } = useAuthContext();
  const [visibleGroups, setVisibleGroups] = useState(1);
  const feedRef = useRef(null);

  useEffect(() => {
    const timers = DEMO_ENTRIES.map((_, i) => {
      if (i === 0) return null;
      return setTimeout(() => setVisibleGroups(i + 1), i * 600);
    }).filter(Boolean);
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [visibleGroups]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-neutral-950 selection:text-white overflow-x-hidden">

      {/* ── Ambient top glow ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] rounded-full bg-neutral-100/80 blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[300px] rounded-full bg-[#d7f4b7]/25 blur-[100px]" />
      </div>

      {/* ══════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════ */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5 border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-black text-[10px] tracking-widest shadow-sm select-none">
            VS
          </div>
          <span className="text-sm font-bold text-neutral-900 tracking-tight">VSMS</span>
        </div>

        {/* CTA group */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="nav-signin-btn"
            onClick={() => setIsLoginModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            id="nav-setup-btn"
            onClick={() => setIsOrgWizardOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-all shadow-sm cursor-pointer"
          >
            Get Started
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO — split layout, full viewport
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-[calc(100vh-73px)] grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">

        {/* ── Left: Copy ── */}
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-16 lg:py-24">

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.04] tracking-[-0.03em] text-neutral-950 mb-6 max-w-[560px]">
            Secure{' '}
            <span className="inline-flex items-center align-middle mx-1.5">
              <span className="inline-flex w-12 h-12 xl:w-14 xl:h-14 rounded-2xl bg-neutral-950 text-white items-center justify-center shadow-lg -translate-y-0.5">
                <ShieldCheck className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </span>
            </span>{' '}
            visitor management with every check-in
          </h1>

          {/* Body */}
          <p className="text-base text-neutral-500 leading-relaxed max-w-[420px] mb-10">
            From custom check-in forms to printable badge passes, VSMS gives organizations complete visibility and control over every visitor — in under 10 seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            <button
              id="hero-setup-org-btn"
              type="button"
              onClick={() => setIsOrgWizardOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-neutral-950 text-white text-sm font-bold hover:bg-neutral-800 transition-all shadow-[0_6px_20px_rgba(17,22,37,0.14)] active:scale-[0.98] cursor-pointer"
            >
              <Building2 className="w-4 h-4 shrink-0" />
              Setup Organization
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-signin-btn"
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-neutral-200 bg-white text-neutral-800 text-sm font-semibold hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              Sign In
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center gap-5 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {TRUST_AVATARS.map((init, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-neutral-700 shadow-sm"
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Trusted By</p>
                <p className="text-xs font-bold text-neutral-800">Organizations Worldwide</p>
              </div>
            </div>

            <div className="h-7 w-px bg-neutral-200 hidden sm:block" />

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

        {/* ── Right: Live feed panel ── */}
        <div className="hidden lg:flex flex-col border-l border-neutral-100 bg-[#f8fafc]/70 relative">
          {/* Top gradient fade */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#f8fafc] to-transparent z-10 pointer-events-none" />
          {/* Bottom gradient fade */}
          <div className="absolute inset-x-0 bottom-14 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent z-10 pointer-events-none" />

          <div
            ref={feedRef}
            className="flex-1 overflow-y-auto px-6 pt-12 pb-4 space-y-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {DEMO_ENTRIES.slice(0, visibleGroups).map((group, gi) => (
              <div key={group.id} className="space-y-2 animate-fade-in" style={{ animationDelay: `${gi * 30}ms` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-[0.14em]">{group.day}</span>
                  <span className="text-[10px] font-semibold text-neutral-400">{group.date}</span>
                </div>
                {group.visitors.map((v, vi) => (
                  <VisitorCard key={vi} v={v} delay={gi * 40 + vi * 80} />
                ))}
              </div>
            ))}

            {visibleGroups >= DEMO_ENTRIES.length && (
              <div className="flex items-center gap-2 pt-1 pb-4 animate-fade-in">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.9s' }}
                  />
                ))}
                <span className="text-[11px] text-neutral-400 font-medium">Monitoring live arrivals…</span>
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="shrink-0 border-t border-neutral-100 px-6 py-4 flex items-center justify-between bg-white/80">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[11px] font-bold text-neutral-500">Live activity feed</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-neutral-400" />
                <span className="text-[11px] font-bold text-neutral-700">
                  {DEMO_ENTRIES.reduce((a, g) => a + g.visitors.length, 0)} visitors today
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[11px] font-semibold text-neutral-500">All checked in</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — below the fold
      ══════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 border-t border-neutral-100 bg-[#f8fafc]/50 px-6 sm:px-10 lg:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-[0_2px_8px_rgba(17,22,37,0.03)] hover:shadow-[0_6px_20px_rgba(17,22,37,0.06)] hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center mb-5 group-hover:bg-neutral-950 group-hover:text-white transition-colors text-neutral-700">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-bold text-neutral-900 mb-1">{label}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — 3 steps
      ══════════════════════════════════════════════ */}
      <section id="how" className="relative z-10 px-6 sm:px-10 lg:px-16 py-20 border-t border-neutral-100 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mb-12 text-center">
            Up and running in minutes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Setup your organization', body: 'Register your org, configure your custom check-in form fields, and provision receptionist accounts.' },
              { n: '02', title: 'Sign staff in', body: 'Receptionists and security guards log in to their dedicated consoles with role-scoped access.' },
              { n: '03', title: 'Start checking in visitors', body: 'Visitors are registered, badged, and tracked in real time. Reports and exports are always ready.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="relative pl-0">
                <span className="text-[64px] font-extrabold text-neutral-100 leading-none block mb-4 tracking-tighter select-none">{n}</span>
                <h3 className="text-base font-bold text-neutral-900 mb-2 -mt-4">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-24 border-t border-neutral-100 bg-[#f8fafc]/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight mb-4">
            Ready to secure your lobby?
          </h2>
          <p className="text-base text-neutral-500 mb-8">
            Set up your organization in under 5 minutes. No credit card required.
          </p>
          <button
            type="button"
            id="footer-setup-org-btn"
            onClick={() => setIsOrgWizardOpen(true)}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-neutral-950 text-white text-sm font-bold hover:bg-neutral-800 transition-all shadow-[0_8px_30px_rgba(17,22,37,0.15)] active:scale-[0.98] cursor-pointer"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            Setup Your Organization
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-neutral-100 bg-white px-6 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-black text-[9px] tracking-widest select-none">
            VS
          </div>
          <span className="text-xs font-bold text-neutral-400">VSMS · Visitor Management Suite</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Enterprise-grade visitor management. Built for security-first organizations.
        </p>
      </footer>

    </div>
  );
};

