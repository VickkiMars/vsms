import React, { useState, useEffect } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  UserCheck, 
  Clock, 
  UserPlus, 
  LogOut, 
  QrCode, 
  Building, 
  User, 
  Phone,
  Mail,
  MapPin,
  Upload,
  PenTool,
  RotateCw,
  ExternalLink,
  ChevronDown,
  Maximize2,
  CheckCircle2,
  ShieldAlert,
  Search,
  X,
  ShieldCheck
} from 'lucide-react';

export const LiveTrackerView = () => {
  const { 
    visitors, 
    checkOutVisitor, 
    openBadgeModal, 
    setIsCheckInOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    selectedDeptFilter,
    setSelectedDeptFilter,
    departments,
    exportToCSV
  } = useVisitorContext();

  const [now, setNow] = useState(() => Date.now());
  const [toastMessage, setToastMessage] = useState(null);
  const [summaryTimeframe, setSummaryTimeframe] = useState('This Month');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearInterval(timeout);
  }, [toastMessage]);

  const calculateDuration = (checkInTime) => {
    const start = new Date(checkInTime).getTime();
    if (isNaN(start)) return '0m';
    const diffMs = Math.max(0, now - start);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const activeVisitors = visitors.filter(v => {
    if (v.status === 'Checked-Out') return false;

    const query = (globalSearchQuery || '').toLowerCase().trim();
    const matchesSearch = !query || 
      (v.fullName && v.fullName.toLowerCase().includes(query)) ||
      (v.company && v.company.toLowerCase().includes(query)) ||
      (v.hostName && v.hostName.toLowerCase().includes(query)) ||
      (v.badgeId && v.badgeId.toLowerCase().includes(query)) ||
      (v.id && v.id.toLowerCase().includes(query));

    const matchesDept = selectedDeptFilter === 'All' || 
      v.department === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

  const allActiveCount = visitors.filter(v => v.status !== 'Checked-Out').length;
  const overdueCount = visitors.filter(v => v.status === 'Overdue').length;
  const onTimeActiveCount = Math.max(0, allActiveCount - overdueCount);
  const checkedOutCountToday = visitors.filter(v => v.status === 'Checked-Out').length;

  const handleCheckOut = (visitor) => {
    checkOutVisitor(visitor.id);
    setToastMessage({
      id: Date.now(),
      title: 'Visitor Checked Out',
      name: visitor.fullName,
      badge: visitor.badgeId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  return (
    <div className="space-y-6 font-sans select-none relative">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 p-4 rounded-2xl bg-realty-dark text-white shadow-float-bar animate-fade-in max-w-md"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-pastel-lime" aria-hidden="true" />
          <div className="flex-1 text-xs">
            <p className="font-extrabold">{toastMessage.title}</p>
            <p className="text-white/80 font-medium">
              <span className="font-bold">{toastMessage.name}</span> ({toastMessage.badge}) checked out at {toastMessage.time}.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-white/60 hover:text-white rounded-full transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Security Desk Officer Hero Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft-card border border-white/80 transition-card space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Duty Officer Info Block */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img 
                src="/044e7aaa9cfc87c60630dd7120c3a756.jpg" 
                alt="Duty Officer Babatunde Johnson" 
                className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-white"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-realty-dark tracking-tight">Officer Babatunde Johnson</h2>
                  <span className="px-2 py-0.5 rounded-full bg-pastel-mint text-pastel-mintDark text-[10px] font-bold">
                    Duty Officer
                  </span>
                </div>
                <p className="text-xs text-realty-textMuted font-medium">
                  Lead Security Officer • <span className="font-semibold text-realty-dark">286 active duty days</span>
                </p>
              </div>

              {/* Contact & Unit Pills Grid */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-realty-textSecondary">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-realty-cardSubtle border border-gray-100 font-medium shadow-xs">
                  <Phone className="w-3 h-3 text-realty-textMuted" />
                  +234 803 555 0167
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-realty-cardSubtle border border-gray-100 font-medium shadow-xs">
                  <Mail className="w-3 h-3 text-realty-textMuted" />
                  babatunde.johnson@security.gov.ng
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-realty-cardSubtle border border-gray-100 font-medium shadow-xs">
                  <MapPin className="w-3 h-3 text-realty-textMuted" />
                  Victoria Island, Lagos, Nigeria
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-realty-cardSubtle border border-gray-100 font-medium shadow-xs">
                  <Building className="w-3 h-3 text-realty-textMuted" />
                  Federal Security Directorate
                </span>
              </div>
            </div>
          </div>

          {/* Quick Card Actions */}
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={exportToCSV}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-realty-dark flex items-center justify-center text-xs transition shadow-xs"
              title="Export Master Log CSV"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => setIsCheckInOpen(true)}
              className="w-9 h-9 rounded-full bg-realty-dark hover:bg-realty-darkHover text-white flex items-center justify-center text-xs transition shadow-pill-active"
              title="Register New Guest Check-In"
            >
              <UserPlus className="w-4 h-4 text-pastel-lime" />
            </button>
          </div>
        </div>

        {/* Metric Statistics Bar */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-3 gap-4 text-left">
            <div>
              <span className="text-xs text-realty-textMuted font-medium block">Total Registered</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-realty-dark tracking-tight">{visitors.length}</span>
            </div>
            <div>
              <span className="text-xs text-realty-textMuted font-medium block">Active Inside</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-realty-dark tracking-tight">{allActiveCount}</span>
            </div>
            <div>
              <span className="text-xs text-realty-textMuted font-medium block">Checked-Out</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-realty-dark tracking-tight">{checkedOutCountToday}</span>
            </div>
          </div>

          {/* Signature Rainbow Gradient Line Divider */}
          <div className="h-1.5 w-full rounded-full gradient-bar-hero"></div>
        </div>
      </div>

      {/* Pastel Metric Summary Section ("Facility Security Summary") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-realty-dark tracking-tight">Facility Security Summary</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select 
                value={summaryTimeframe}
                onChange={(e) => setSummaryTimeframe(e.target.value)}
                className="appearance-none bg-white border border-white/80 rounded-full px-3.5 py-1 pr-7 text-xs font-bold text-realty-dark shadow-xs focus:outline-none cursor-pointer"
              >
                <option value="This Month">This Month</option>
                <option value="Last Quarter">Last Quarter</option>
                <option value="Year 2026">Year 2026</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2.5 top-2.5 text-realty-textMuted pointer-events-none" />
            </div>
            <button 
              type="button"
              className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 text-realty-textSecondary flex items-center justify-center text-xs shadow-xs transition"
              title="Refresh Summary Metrics"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Pastel Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Lime Green Pastel */}
          <div className="bg-pastel-lime rounded-3xl p-5 flex flex-col justify-between min-h-[140px] shadow-xs relative overflow-hidden transition-card">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-sm font-bold text-pastel-limeDark block leading-tight">
                  Inside Facility<br />Active Guests
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsCheckInOpen(true)}
                className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 text-pastel-limeDark flex items-center justify-center text-xs transition"
                title="Register Guest"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div className="text-[11px] text-pastel-limeDark/80 font-medium leading-snug">
                Status:<br />
                <span className="font-bold">Live Active Count</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-pastel-limeBadge text-pastel-limeDark font-extrabold text-sm flex items-center justify-center shadow-inner">
                {allActiveCount}
              </div>
            </div>
          </div>

          {/* Card 2: Mint Turquoise Pastel */}
          <div className="bg-pastel-mint rounded-3xl p-5 flex flex-col justify-between min-h-[140px] shadow-xs relative overflow-hidden transition-card">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-sm font-bold text-pastel-mintDark block leading-tight">
                  On-Time Guests<br />Within Duration
                </span>
              </div>
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 text-pastel-mintDark flex items-center justify-center text-xs transition"
                title="View On-Time Guests"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div className="text-[11px] text-pastel-mintDark/80 font-medium leading-snug">
                Status:<br />
                <span className="font-bold">Within Stay Limit</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-pastel-mintBadge text-pastel-mintDark font-extrabold text-sm flex items-center justify-center shadow-inner">
                {onTimeActiveCount}
              </div>
            </div>
          </div>

          {/* Card 3: Soft Coral Pink Pastel */}
          <div className="bg-pastel-pink rounded-3xl p-5 flex flex-col justify-between min-h-[140px] shadow-xs relative overflow-hidden transition-card">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-sm font-bold text-pastel-pinkDark block leading-tight">
                  Overdue Alerts<br />Exceeded Stay
                </span>
              </div>
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 text-pastel-pinkDark flex items-center justify-center text-xs transition"
                title="View Overdue Alerts"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div className="text-[11px] text-pastel-pinkDark/80 font-medium leading-snug">
                Status:<br />
                <span className="font-bold">Exceeded Stay Limit</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-pastel-pinkBadge text-pastel-pinkDark font-extrabold text-sm flex items-center justify-center shadow-inner">
                {overdueCount}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Live Presence Entries & Showcase */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-realty-dark tracking-tight">
            Live Presence Entries <span className="text-realty-textMuted font-medium text-sm">({activeVisitors.length + 2})</span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select className="appearance-none bg-white border border-white/80 rounded-full px-3.5 py-1 pr-7 text-xs font-bold text-realty-dark shadow-xs focus:outline-none cursor-pointer">
                <option>Active Guests</option>
                <option>All Entries</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2.5 top-2.5 text-realty-textMuted pointer-events-none" />
            </div>
            <button 
              type="button"
              className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 text-realty-textSecondary flex items-center justify-center text-xs shadow-xs transition"
              title="Refresh Showcase"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Facility Gate Feature Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Facility Showcase 1 */}
          <div className="relative rounded-3xl overflow-hidden shadow-soft-card group border border-white/80 h-52">
            <img src="/villa.jpg" alt="Executive HQ Tower" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-tag-rental text-white text-xs font-bold shadow-xs">
                  Verified Gate Access
                </span>
                <button 
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center text-xs hover:bg-white/50 transition"
                  title="Expand View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-white space-y-1">
                <div className="font-extrabold text-base leading-tight">Eko Atlantic Headquarters Gate</div>
                <div className="text-xs text-white/80 font-medium">Plot 1412 Victoria Island, Lagos, Nigeria</div>
              </div>
            </div>
          </div>

          {/* Facility Showcase 2 */}
          <div className="relative rounded-3xl overflow-hidden shadow-soft-card group border border-white/80 h-52">
            <img src="/timber.jpg" alt="Security Zone B" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-tag-sale text-white text-xs font-bold shadow-xs">
                  Security Zone B
                </span>
                <button 
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center text-xs hover:bg-white/50 transition"
                  title="Expand View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-white space-y-1">
                <div className="font-extrabold text-base leading-tight">Maitama Executive Complex</div>
                <div className="text-xs text-white/80 font-medium">22 Shehu Shagari Way, Maitama, Abuja, Nigeria</div>
              </div>
            </div>
          </div>

        </div>

        {/* Active Visitors Live Grid */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-realty-dark uppercase tracking-wider">
              Active Visitor Cards ({activeVisitors.length})
            </h4>
          </div>

          {activeVisitors.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white shadow-soft-card text-center space-y-3">
              <UserCheck className="w-8 h-8 mx-auto text-realty-textMuted" />
              <p className="font-bold text-realty-dark text-xs">No active guests currently inside the facility.</p>
              <button
                type="button"
                onClick={() => setIsCheckInOpen(true)}
                className="px-4 py-2 rounded-full bg-realty-dark text-white text-xs font-bold shadow-pill-active"
              >
                + Register First Guest
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeVisitors.map(v => {
                const duration = calculateDuration(v.checkInTime);
                const isOverdue = v.status === 'Overdue';

                return (
                  <div 
                    key={v.id} 
                    className="p-5 rounded-3xl bg-white shadow-soft-card space-y-4 transition-card relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={v.avatar} 
                          alt={v.fullName} 
                          className="w-11 h-11 rounded-2xl object-cover shadow-xs" 
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.fullName)}&backgroundColor=111625&textColor=ffffff`;
                          }}
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-realty-dark leading-snug">
                            {v.fullName}
                          </h4>
                          <p className="text-[11px] text-realty-textMuted font-medium">
                            {v.company || 'Private Guest'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openBadgeModal(v)}
                        className="p-1.5 rounded-full bg-realty-cardSubtle text-realty-dark hover:bg-gray-200 transition-colors shadow-xs"
                        title="View Digital Badge Pass"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-realty-cardSubtle space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-realty-textMuted">
                        <span className="font-medium">Host Officer:</span>
                        <strong className="text-realty-dark font-bold">{v.hostName}</strong>
                      </div>
                      <div className="flex items-center justify-between text-realty-textMuted">
                        <span className="font-medium">Department:</span>
                        <strong className="text-realty-dark font-bold">{v.department}</strong>
                      </div>
                      <div className="flex items-center justify-between text-realty-textMuted">
                        <span className="font-medium">Duration Inside:</span>
                        <strong className="text-realty-dark font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-tag-rental" />
                          {duration}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOverdue ? 'bg-tag-sale text-white' : 'bg-tag-rental text-white'
                      }`}>
                        {v.badgeId} • {v.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCheckOut(v)}
                        className="px-3 py-1.5 rounded-full bg-realty-dark hover:bg-realty-darkHover text-white text-xs font-bold shadow-pill-active flex items-center space-x-1.5 transition-all active:scale-95"
                      >
                        <LogOut className="w-3.5 h-3.5 text-pastel-lime" />
                        <span>Check Out</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
