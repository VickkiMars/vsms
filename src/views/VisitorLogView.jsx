import React, { useState, useEffect } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  Table, 
  Download, 
  QrCode, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  CheckCircle2, 
  LogOut, 
  ArrowUpDown,
  UserCheck,
  ChevronDown
} from 'lucide-react';

export const VisitorLogView = () => {
  const { 
    visitors, 
    exportToCSV, 
    openBadgeModal, 
    checkOutVisitor,
    globalSearchQuery,
    setGlobalSearchQuery,
    selectedDeptFilter,
    setSelectedDeptFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    departments
  } = useVisitorContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [sortField, setSortField] = useState('checkInTime');
  const [sortAsc, setSortAsc] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const itemsPerPage = 8;

  // Live timer for active visitor durations in table
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearInterval(timeout);
  }, [toastMessage]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearchQuery, selectedDeptFilter, selectedStatusFilter]);

  // Helper to calculate stay duration string
  const calculateStayDuration = (checkInTime, checkOutTime) => {
    const start = new Date(checkInTime).getTime();
    if (isNaN(start)) return '0m';
    const end = checkOutTime ? new Date(checkOutTime).getTime() : now;
    const diffMs = Math.max(0, end - start);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Filter visitors
  const filtered = visitors.filter(v => {
    const query = (globalSearchQuery || '').toLowerCase().trim();
    const matchesQuery = !query || 
      (v.fullName && v.fullName.toLowerCase().includes(query)) ||
      (v.company && v.company.toLowerCase().includes(query)) ||
      (v.hostName && v.hostName.toLowerCase().includes(query)) ||
      (v.id && v.id.toLowerCase().includes(query)) ||
      (v.badgeId && v.badgeId.toLowerCase().includes(query)) ||
      (v.idNumber && v.idNumber.toLowerCase().includes(query)) ||
      (v.phone && v.phone.toLowerCase().includes(query)) ||
      (v.email && v.email.toLowerCase().includes(query)) ||
      (v.purpose && v.purpose.toLowerCase().includes(query));

    const matchesDept = selectedDeptFilter === 'All' || 
      v.department === selectedDeptFilter ||
      (departments && departments.some(d => (d.code === selectedDeptFilter || d.name === selectedDeptFilter) && (v.department === d.name || v.department === d.code)));

    const matchesStatus = selectedStatusFilter === 'All' || v.status === selectedStatusFilter;

    return matchesQuery && matchesDept && matchesStatus;
  });

  // Sort visitors
  const sortedVisitors = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'checkInTime' || sortField === 'checkOutTime') {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    } else if (sortField === 'duration') {
      const endA = a.checkOutTime ? new Date(a.checkOutTime).getTime() : now;
      const endB = b.checkOutTime ? new Date(b.checkOutTime).getTime() : now;
      valA = Math.max(0, endA - new Date(a.checkInTime).getTime());
      valB = Math.max(0, endB - new Date(b.checkInTime).getTime());
    } else {
      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedVisitors.length / itemsPerPage) || 1;
  const clampedPage = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (clampedPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedVisitors.length);
  const paginatedVisitors = sortedVisitors.slice(startIndex, endIndex);

  // Status counts across all visitor records
  const totalCount = visitors.length;
  const insideCount = visitors.filter(v => v.status === 'Checked-In').length;
  const overdueCount = visitors.filter(v => v.status === 'Overdue').length;
  const checkedOutCount = visitors.filter(v => v.status === 'Checked-Out').length;

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

  const handleClearFilters = () => {
    setGlobalSearchQuery('');
    setSelectedDeptFilter('All');
    setSelectedStatusFilter('All');
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(prev => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Helper to render pagination buttons
  const renderPaginationButtons = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => setCurrentPage(i)}
          aria-label={`Go to page ${i}`}
          aria-current={clampedPage === i ? 'page' : undefined}
          className={`min-w-[32px] h-8 px-2.5 rounded-full text-xs font-extrabold transition ${
            clampedPage === i
              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const hasActiveFilters = Boolean(globalSearchQuery) || selectedDeptFilter !== 'All' || selectedStatusFilter !== 'All';

  return (
    <div className="space-y-6 font-sans select-none relative">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 p-4 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-2xl animate-fadeIn max-w-md"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 dark:text-emerald-600" aria-hidden="true" />
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

      {/* Hero Header & Quick Stats Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-bold text-sm shadow-sm">
                <Table className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Master Visitor Log
              </h2>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
              Real-time audit log of all registered guests loaded directly from central security records.
            </p>
          </div>

          <button
            type="button"
            onClick={exportToCSV}
            className="px-5 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-extrabold shadow-md flex items-center space-x-2 transition active:scale-95 whitespace-nowrap"
            aria-label="Export visitor logs to CSV"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-bold block uppercase">Total Logged</span>
              <span className="text-lg font-black text-neutral-900 dark:text-white">{totalCount}</span>
            </div>
            <span className="w-8 h-8 rounded-full bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
              {totalCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-bold block uppercase">Active Inside</span>
              <span className="text-lg font-black text-neutral-900 dark:text-white">{insideCount}</span>
            </div>
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-extrabold border border-emerald-300 dark:border-emerald-800">
              {insideCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-bold block uppercase">Overdue Alerts</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">{overdueCount}</span>
            </div>
            <span className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center justify-center text-xs font-extrabold border border-rose-300 dark:border-rose-800">
              {overdueCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-bold block uppercase">Checked-Out</span>
              <span className="text-lg font-black text-neutral-900 dark:text-white">{checkedOutCount}</span>
            </div>
            <span className="w-8 h-8 rounded-full bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
              {checkedOutCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1" role="region" aria-label="Status Filters">
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('All')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition flex items-center gap-2 ${
                selectedStatusFilter === 'All'
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                  : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <span>All Statuses</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatusFilter('Checked-In')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition flex items-center gap-2 ${
                selectedStatusFilter === 'Checked-In'
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                  : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <span>Inside</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white">
                {insideCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatusFilter('Overdue')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition flex items-center gap-2 ${
                selectedStatusFilter === 'Overdue'
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                  : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <span>Overdue</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {overdueCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatusFilter('Checked-Out')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition flex items-center gap-2 ${
                selectedStatusFilter === 'Checked-Out'
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                  : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <span>Checked-Out</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white">
                {checkedOutCount}
              </span>
            </button>
          </div>

          {/* Department Filter & Search Pill */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-neutral-400 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search name, NIN, host, badge..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-full text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white transition font-semibold"
                aria-label="Search master log"
              />
              {globalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-2.5 top-2.5 p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full"
                  aria-label="Clear log search input"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="relative shrink-0">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 rounded-full text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none font-bold border border-neutral-200 dark:border-neutral-700"
              >
                <option value="All">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-3 top-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>

        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs text-neutral-600 dark:text-neutral-300 font-bold">
              Found <span className="text-neutral-900 dark:text-white font-extrabold">{filtered.length}</span> matching visitor records
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs font-sans border-collapse">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-5 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                  </div>
                </th>
                <th className="py-4 px-5 cursor-pointer select-none" onClick={() => toggleSort('badgeId')}>
                  <div className="flex items-center gap-1.5">
                    <span>Badge ID</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                  </div>
                </th>
                <th className="py-4 px-5 cursor-pointer select-none" onClick={() => toggleSort('fullName')}>
                  <div className="flex items-center gap-1.5">
                    <span>Visitor & Company</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                  </div>
                </th>
                <th className="py-4 px-5">Contact & ID</th>
                <th className="py-4 px-5">Host Officer & Dept</th>
                <th className="py-4 px-5">Visit Purpose</th>
                <th className="py-4 px-5 cursor-pointer select-none" onClick={() => toggleSort('checkInTime')}>
                  <div className="flex items-center gap-1.5">
                    <span>Check-In</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                  </div>
                </th>
                <th className="py-4 px-5 cursor-pointer select-none" onClick={() => toggleSort('checkOutTime')}>
                  <div className="flex items-center gap-1.5">
                    <span>Check-Out</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                  </div>
                </th>
                <th className="py-4 px-5 cursor-pointer select-none" onClick={() => toggleSort('duration')}>
                  <div className="flex items-center gap-1.5">
                    <span>Duration</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                  </div>
                </th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-900 dark:text-white font-sans">
              {paginatedVisitors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-neutral-500 font-medium">
                    <div className="space-y-3">
                      <UserCheck className="w-10 h-10 mx-auto text-neutral-400" aria-hidden="true" />
                      <p className="font-bold text-neutral-900 dark:text-white text-sm">No visitor records match the current filter criteria.</p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="mt-2 px-5 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedVisitors.map((v, index) => {
                  const checkInFormatted = new Date(v.checkInTime).toLocaleString([], {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  });
                  const checkOutFormatted = v.checkOutTime 
                    ? new Date(v.checkOutTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—';

                  const durationFormatted = calculateStayDuration(v.checkInTime, v.checkOutTime);

                  return (
                    <tr 
                      key={v.id} 
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                    >
                      {/* Status Tag Badge */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {v.status === 'Checked-Out' ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 uppercase tracking-wider border border-neutral-200 dark:border-neutral-700">
                            Checked-Out
                          </span>
                        ) : v.status === 'Overdue' ? (
                          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-rose-500 text-white shadow-xs">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 uppercase tracking-wider shadow-xs">
                            Inside
                          </span>
                        )}
                      </td>

                      {/* Badge ID */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="text-xs font-black text-neutral-900 dark:text-white px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                          {v.badgeId}
                        </span>
                      </td>

                      {/* Visitor Name & Company */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={v.avatar} 
                            alt={v.fullName} 
                            className="w-9 h-9 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-700 shadow-xs" 
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.fullName)}`;
                            }}
                          />
                          <div>
                            <div className="font-extrabold text-neutral-900 dark:text-white text-sm leading-snug">
                              {v.fullName}
                            </div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
                              {v.company || 'Private Guest'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Document */}
                      <td className="py-4 px-5">
                        <div className="text-xs text-neutral-900 dark:text-white font-bold">
                          {v.phone}
                        </div>
                        <div className="text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold truncate max-w-[160px]">
                          {v.idType ? `${v.idType}: ` : ''}{v.idNumber}
                        </div>
                      </td>

                      {/* Host & Department */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-neutral-900 dark:text-white">{v.hostName}</div>
                        <div className="text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold">{v.department}</div>
                      </td>

                      {/* Purpose Pill */}
                      <td className="py-4 px-5">
                        <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-[11px] font-bold inline-block max-w-[160px] truncate border border-neutral-200 dark:border-neutral-700">
                          {v.purpose}
                        </span>
                      </td>

                      {/* Check In */}
                      <td className="py-4 px-5 text-[11px] font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                        {checkInFormatted}
                      </td>

                      {/* Check Out */}
                      <td className="py-4 px-5 text-[11px] font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                        {checkOutFormatted}
                      </td>

                      {/* Stay Duration */}
                      <td className="py-4 px-5 text-[11px] font-black text-neutral-900 dark:text-white whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                          {durationFormatted}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openBadgeModal(v)}
                            className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 transition"
                            title="View Digital Badge Pass"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {v.status !== 'Checked-Out' && (
                            <button
                              type="button"
                              onClick={() => handleCheckOut(v)}
                              className="px-3.5 py-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-[10px] shadow-sm active:scale-95 flex items-center gap-1"
                              title="Process Visitor Check-Out"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Check-Out</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
          <div>
            {sortedVisitors.length > 0 ? (
              <span>
                Showing <span className="font-extrabold text-neutral-900 dark:text-white">{startIndex + 1}</span> to <span className="font-extrabold text-neutral-900 dark:text-white">{endIndex}</span> of <span className="font-extrabold text-neutral-900 dark:text-white">{sortedVisitors.length}</span> visitor records
              </span>
            ) : (
              <span>0 records found</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={clampedPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="p-2 rounded-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {renderPaginationButtons()}
            </div>

            <button
              type="button"
              disabled={clampedPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="p-2 rounded-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
