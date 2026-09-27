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
    className="flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 hover:bg-white/[0.09] transition-colors animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-8 h-8 rounded-xl bg-white/10 text-white/80 text-[10px] font-extrabold flex items-center justify-center shrink-0">
      {v.avatar}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-white truncate">{v.name}</p>
      <p className="text-[11px] text-white/40 font-medium">{v.time}</p>
    </div>
    <div className="shrink-0 text-right">
      <p className="text-[11px] font-bold text-white/60">{v.duration}</p>
      <p className="text-[10px] text-white/30 truncate max-w-[72px]">{v.purpose.split('/')[0].trim()}</p>
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
    <div className="min-h-screen bg-[#0a0c0f] text-white font-sans antialiased selection:bg-white selection:text-[#0a0c0f] overflow-x-hidden">

      {/* ── Ambient top glow ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] rounded-full bg-white/[0.03] blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[300px] rounded-full bg-[#d7f4b7]/[0.04] blur-[100px]" />
      </div>

      {/* ══════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════ */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5 border-b border-white/[0.06]">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-[#0a0c0f] flex items-center justify-center font-black text-[10px] tracking-widest shadow-md select-none">
            VS
          </div>
          <span className="text-sm font-bold text-white/80 tracking-tight">VSMS</span>
        </div>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </div>

        {/* CTA group */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="nav-signin-btn"
            onClick={() => setIsLoginModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-white/70 text-xs font-semibold hover:border-white/30 hover:text-white transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            id="nav-setup-btn"
            onClick={() => setIsOrgWizardOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0a0c0f] text-xs font-bold hover:bg-white/90 transition-all shadow-md cursor-pointer"
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
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.04] tracking-[-0.03em] text-white mb-6 max-w-[560px]">
            Secure{' '}
            <span className="inline-flex items-center align-middle mx-1.5">
              <span className="inline-flex w-12 h-12 xl:w-14 xl:h-14 rounded-2xl bg-white/10 border border-white/15 items-center justify-center shadow-lg -translate-y-0.5">
                <ShieldCheck className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </span>
            </span>{' '}
            visitor management with every check-in
          </h1>

          {/* Body */}
          <p className="text-base text-white/50 leading-relaxed max-w-[420px] mb-10">
            From custom check-in forms to printable badge passes, VSMS gives organizations complete visibility and control over every visitor — in under 10 seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            <button
              id="hero-setup-org-btn"
              type="button"
              onClick={() => setIsOrgWizardOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#0a0c0f] text-sm font-bold hover:bg-white/90 transition-all shadow-[0_8px_24px_rgba(255,255,255,0.12)] active:scale-[0.98] cursor-pointer"
            >
              <Building2 className="w-4 h-4 shrink-0" />
              Setup Organization
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-signin-btn"
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-white/70 text-sm font-semibold hover:border-white/30 hover:text-white transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              Sign In
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center gap-5 pt-6 border-t border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {TRUST_AVATARS.map((init, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#0a0c0f] flex items-center justify-center text-[10px] font-extrabold text-white/60"
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Trusted By</p>
                <p className="text-xs font-bold text-white/70">Organizations Worldwide</p>
              </div>
            </div>

            <div className="h-7 w-px bg-white/[0.08] hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Rated</p>
                <p className="text-xs font-bold text-white/70">Excellent 5 / 5</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Live feed panel ── */}
        <div className="hidden lg:flex flex-col border-l border-white/[0.07] bg-white/[0.02] relative">
          {/* Top gradient fade */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0a0c0f] to-transparent z-10 pointer-events-none" />
          {/* Bottom gradient fade */}
          <div className="absolute inset-x-0 bottom-14 h-24 bg-gradient-to-t from-[#0a0c0f] to-transparent z-10 pointer-events-none" />

          <div
            ref={feedRef}
            className="flex-1 overflow-y-auto px-6 pt-12 pb-4 space-y-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {DEMO_ENTRIES.slice(0, visibleGroups).map((group, gi) => (
              <div key={group.id} className="space-y-2 animate-fade-in" style={{ animationDelay: `${gi * 30}ms` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold text-white/25 uppercase tracking-[0.14em]">{group.day}</span>
                  <span className="text-[10px] font-semibold text-white/20">{group.date}</span>
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
                    className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.9s' }}
                  />
                ))}
                <span className="text-[11px] text-white/30 font-medium">Monitoring live arrivals…</span>
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="shrink-0 border-t border-white/[0.07] px-6 py-4 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[11px] font-bold text-white/30">Live activity feed</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-white/30" />
                <span className="text-[11px] font-bold text-white/50">
                  {DEMO_ENTRIES.reduce((a, g) => a + g.visitors.length, 0)} visitors today
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-white/30" />
                <span className="text-[11px] font-semibold text-white/30">All checked in</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — below the fold
      ══════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 border-t border-white/[0.07] px-6 sm:px-10 lg:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-3xl overflow-hidden border border-white/[0.06]">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <div
                key={i}
                className="bg-[#0a0c0f] px-7 py-8 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white/[0.1] transition-colors">
                  <Icon className="w-4.5 h-4.5 text-white/60" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-bold text-white mb-1">{label}</p>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — 3 steps
      ══════════════════════════════════════════════ */}
      <section id="how" className="relative z-10 px-6 sm:px-10 lg:px-16 py-20 border-t border-white/[0.07]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-12 text-center">
            Up and running in minutes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Setup your organization', body: 'Register your org, configure your custom check-in form fields, and provision receptionist accounts.' },
              { n: '02', title: 'Sign staff in', body: 'Receptionists and security guards log in to their dedicated consoles with role-scoped access.' },
              { n: '03', title: 'Start checking in visitors', body: 'Visitors are registered, badged, and tracked in real time. Reports and exports are always ready.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="relative pl-0">
                <span className="text-[64px] font-extrabold text-white/[0.04] leading-none block mb-4 tracking-tighter select-none">{n}</span>
                <h3 className="text-base font-bold text-white mb-2 -mt-4">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-24 border-t border-white/[0.07]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to secure your lobby?
          </h2>
          <p className="text-base text-white/40 mb-8">
            Set up your organization in under 5 minutes. No credit card required.
          </p>
          <button
            type="button"
            id="footer-setup-org-btn"
            onClick={() => setIsOrgWizardOpen(true)}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-[#0a0c0f] text-sm font-bold hover:bg-white/90 transition-all shadow-[0_12px_40px_rgba(255,255,255,0.12)] active:scale-[0.98] cursor-pointer"
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
      <footer className="relative z-10 border-t border-white/[0.06] px-6 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white text-[#0a0c0f] flex items-center justify-center font-black text-[9px] tracking-widest select-none">
            VS
          </div>
          <span className="text-xs font-bold text-white/30">VSMS · Visitor Management Suite</span>
        </div>
        <p className="text-[11px] text-white/20">
          Enterprise-grade visitor management. Built for security-first organizations.
        </p>
      </footer>

    </div>
  );
};
