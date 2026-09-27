import React, { useState, useEffect } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { useAuthContext } from '../context/AuthContext';
import { 
  UserCheck, 
  Clock, 
  UserPlus, 
  LogOut, 
  QrCode, 
  Building, 
  Phone,
  Mail,
  Upload,
  CheckCircle2, 
  X, 
  ShieldCheck, 
  ShieldAlert,
  Eye
} from 'lucide-react';

export const LiveTrackerView = () => {
  const { 
    visitors, 
    tableDisplayFields,
    checkOutVisitor, 
    openBadgeModal, 
    openDetailsDrawer,
    setIsCheckInOpen,
    globalSearchQuery,
    selectedDeptFilter,
    exportToCSV
  } = useVisitorContext();

  const { currentUser, currentOrg, setIsOrgWizardOpen } = useAuthContext();

  const [now, setNow] = useState(() => Date.now());
  const [toastMessage, setToastMessage] = useState(null);

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
    const customDataStr = v.custom_data_json || JSON.stringify(v.custom_data || {});

    const matchesSearch = !query || 
      (v.fullName && v.fullName.toLowerCase().includes(query)) ||
      (v.company && v.company.toLowerCase().includes(query)) ||
      (v.hostName && v.hostName.toLowerCase().includes(query)) ||
      (v.badgeId && v.badgeId.toLowerCase().includes(query)) ||
      (v.id && v.id.toLowerCase().includes(query)) ||
      (customDataStr.toLowerCase().includes(query));

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
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 p-4 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-2xl animate-fade-in max-w-md"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white dark:text-neutral-900" aria-hidden="true" />
          <div className="flex-1 text-xs">
            <p className="font-extrabold">{toastMessage.title}</p>
            <p className="font-medium text-neutral-300 dark:text-neutral-700">
              <span className="font-bold">{toastMessage.name}</span> ({toastMessage.badge}) checked out at {toastMessage.time}.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-neutral-400 hover:text-white dark:hover:text-neutral-950 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Organization Setup Banner if no active organization */}
      {!currentOrg && (
        <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Organization Setup Required</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Onboard your organization profile, configure visitor fields, and provision front-desk staff.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOrgWizardOpen(true)}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold shrink-0 shadow-sm transition cursor-pointer"
          >
            + Start Organization Setup
          </button>
        </div>
      )}

      {/* Main Profile & Presence Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <img 
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
              alt="Active Officer Profile" 
              className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-sm"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.fullName || 'User')}`;
              }}
            />
            <div className="space-y-1.5">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                    {currentUser?.fullName || "Facility Officer"}
                  </h2>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                    {currentUser?.role || "admin"}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold mt-0.5">
                  {currentUser?.desk_location || "Central Security Desk"} • <span className="font-bold text-neutral-900 dark:text-white">{currentUser?.email || "admin@vsms.com"}</span>
                </p>
              </div>

              {/* Contact & Unit Pills Grid */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 font-semibold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  System Online
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 font-semibold shadow-xs">
                  <Building className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  {currentOrg?.name || "No Organization Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Card Actions */}
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={exportToCSV}
              className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs transition shadow-xs cursor-pointer"
              title="Export Master Log CSV"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => setIsCheckInOpen(true)}
              className="w-10 h-10 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 flex items-center justify-center text-xs transition shadow-md active:scale-95 cursor-pointer"
              title="Register New Guest Check-In"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Statistics Bar */}
        <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
            <div>
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold block uppercase tracking-wider">Total Registered</span>
              <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{visitors.length}</span>
            </div>
            <div>
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold block uppercase tracking-wider">Inside Facility</span>
              <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{allActiveCount}</span>
            </div>
            <div>
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold block uppercase tracking-wider">Checked-Out</span>
              <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{checkedOutCountToday}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Summary Cards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">Facility Security Summary</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl p-5 flex flex-col justify-between min-h-[140px] shadow-sm border border-neutral-200 dark:border-neutral-800">
            <span className="text-sm font-extrabold block leading-tight text-neutral-900 dark:text-white">
              Inside Facility<br />On-Premises Guests
            </span>
            <div className="flex items-end justify-between mt-4">
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Status: <span className="font-extrabold text-neutral-900 dark:text-white">Live Count</span>
              </div>
              <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {allActiveCount}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl p-5 flex flex-col justify-between min-h-[140px] shadow-sm border border-neutral-200 dark:border-neutral-800">
            <span className="text-sm font-extrabold block leading-tight text-neutral-900 dark:text-white">
              On-Time Guests<br />Within Limit
            </span>
            <div className="flex items-end justify-between mt-4">
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Status: <span className="font-extrabold text-neutral-900 dark:text-white">Within Limit</span>
              </div>
              <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {onTimeActiveCount}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl p-5 flex flex-col justify-between min-h-[140px] shadow-sm border border-neutral-200 dark:border-neutral-800">
            <span className="text-sm font-extrabold block leading-tight text-neutral-900 dark:text-white">
              Overdue Alerts<br />Exceeded Stay
            </span>
            <div className="flex items-end justify-between mt-4">
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Status: <span className="font-extrabold text-rose-600 dark:text-rose-400">Exceeded Limit</span>
              </div>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {overdueCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Visitors Live Grid */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
            On-Premises Visitor Cards ({activeVisitors.length})
          </h4>
        </div>

        {activeVisitors.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center space-y-3">
            <UserCheck className="w-8 h-8 mx-auto text-neutral-400" />
            <p className="font-extrabold text-neutral-900 dark:text-white text-xs">No guests currently inside the facility.</p>
            <button
              type="button"
              onClick={() => setIsCheckInOpen(true)}
              className="px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md cursor-pointer"
            >
              + Register First Guest
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeVisitors.map(v => {
              const duration = calculateDuration(v.checkInTime);
              const isOverdue = v.status === 'Overdue';
              const customData = v.custom_data || {};

              return (
                <div 
                  key={v.id} 
                  className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={v.avatar} 
                          alt={v.fullName} 
                          className="w-11 h-11 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-xs" 
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.fullName)}`;
                          }}
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white leading-snug">
                            {v.fullName}
                          </h4>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold">
                            {v.company || customData.company || 'Private Guest'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Details Drawer Button */}
                        <button
                          type="button"
                          onClick={() => openDetailsDrawer(v)}
                          className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer"
                          title="View Full Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Print Badge Button */}
                        <button
                          type="button"
                          onClick={() => openBadgeModal(v)}
                          className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer"
                          title="View Digital Badge Pass"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Attributes */}
                    <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 space-y-1.5 text-xs border border-neutral-100 dark:border-neutral-700/60">
                      <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                        <span className="font-semibold">Visiting Host:</span>
                        <strong className="text-neutral-900 dark:text-white font-extrabold">{v.hostName || customData.host || '—'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                        <span className="font-semibold">Department:</span>
                        <strong className="text-neutral-900 dark:text-white font-extrabold">{v.department || '—'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                        <span className="font-semibold">Duration Inside:</span>
                        <strong className="text-neutral-900 dark:text-white font-extrabold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                          {duration}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isOverdue 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    }`}>
                      {v.badgeId} • {v.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCheckOut(v)}
                      className="px-3.5 py-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer hover:opacity-90"
                    >
                      <LogOut className="w-3.5 h-3.5" />
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
  );
};
