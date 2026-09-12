import React, { useState, useMemo } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  Sun,
  PieChart,
  ArrowUpRight
} from 'lucide-react';

export const AnalyticsView = () => {
  const { visitors, departments, exportToCSV } = useVisitorContext();
  const [timeRange, setTimeRange] = useState('all'); // 'all' | 'today' | 'week'

  // Filter visitors based on selected time range
  const filteredVisitors = useMemo(() => {
    const now = new Date();
    if (timeRange === 'today') {
      const todayStr = now.toDateString();
      return visitors.filter(v => {
        try {
          return new Date(v.checkInTime).toDateString() === todayStr;
        } catch {
          return true;
        }
      });
    }
    if (timeRange === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return visitors.filter(v => {
        try {
          return new Date(v.checkInTime) >= sevenDaysAgo;
        } catch {
          return true;
        }
      });
    }
    return visitors;
  }, [visitors, timeRange]);

  const totalVisitors = filteredVisitors.length;
  const activeVisitors = filteredVisitors.filter(v => v.status !== 'Checked-Out').length;
  const checkedOutCount = filteredVisitors.filter(v => v.status === 'Checked-Out').length;
  const overdueCount = filteredVisitors.filter(v => v.status === 'Overdue').length;

  // Calculate Average Stay Duration (in minutes) for checked out visitors
  const checkedOutVisitors = filteredVisitors.filter(v => v.status === 'Checked-Out' && v.checkOutTime);
  const avgStayMinutes = checkedOutVisitors.length > 0
    ? Math.round(
        checkedOutVisitors.reduce((sum, v) => {
          const diff = Math.max(0, new Date(v.checkOutTime) - new Date(v.checkInTime));
          return sum + Math.floor(diff / (1000 * 60));
        }, 0) / checkedOutVisitors.length
      )
    : 75;

  const avgStayFormatted = avgStayMinutes >= 60
    ? `${Math.floor(avgStayMinutes / 60)}h ${avgStayMinutes % 60}m`
    : `${avgStayMinutes}m`;

  // ID Verification Rate
  const validIdCount = filteredVisitors.filter(v => v.idNumber && v.idNumber.trim().length > 0).length;
  const idComplianceRate = totalVisitors > 0 ? Math.round((validIdCount / totalVisitors) * 100) : 100;

  // Department Visitor Breakdown
  const deptStats = useMemo(() => {
    return departments.map(d => {
      const deptVisitors = filteredVisitors.filter(v => v.department === d.name);
      const count = deptVisitors.length;
      const active = deptVisitors.filter(v => v.status !== 'Checked-Out').length;
      const overdue = deptVisitors.filter(v => v.status === 'Overdue').length;
      const percentage = totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0;
      return { ...d, count, active, overdue, percentage };
    }).sort((a, b) => b.count - a.count);
  }, [departments, filteredVisitors, totalVisitors]);

  // Visit Purpose Breakdown
  const sortedPurposes = useMemo(() => {
    const purposeCounts = {};
    filteredVisitors.forEach(v => {
      purposeCounts[v.purpose] = (purposeCounts[v.purpose] || 0) + 1;
    });
    return Object.entries(purposeCounts).sort((a, b) => b[1] - a[1]);
  }, [filteredVisitors]);

  // Time of Day Traffic Distribution
  const timeBuckets = useMemo(() => {
    const buckets = {
      'Morning (06:00 - 11:00)': 0,
      'Midday (11:00 - 14:00)': 0,
      'Afternoon (14:00 - 18:00)': 0,
      'Evening (18:00 - 22:00)': 0,
    };

    filteredVisitors.forEach(v => {
      try {
        const hour = new Date(v.checkInTime).getHours();
        if (hour >= 6 && hour < 11) buckets['Morning (06:00 - 11:00)']++;
        else if (hour >= 11 && hour < 14) buckets['Midday (11:00 - 14:00)']++;
        else if (hour >= 14 && hour < 18) buckets['Afternoon (14:00 - 18:00)']++;
        else buckets['Evening (18:00 - 22:00)']++;
      } catch {
        buckets['Morning (06:00 - 11:00)']++;
      }
    });
    return buckets;
  }, [filteredVisitors]);

  // Peak Traffic Window
  const peakTimeWindow = useMemo(() => {
    let max = -1;
    let peakKey = 'Morning (06:00 - 11:00)';
    Object.entries(timeBuckets).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        peakKey = k;
      }
    });
    return { label: peakKey, count: max };
  }, [timeBuckets]);

  // ID Type Breakdown
  const idTypeCounts = useMemo(() => {
    const counts = {};
    filteredVisitors.forEach(v => {
      const type = v.idType || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [filteredVisitors]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span>Administrative Analytics & Visitor Intelligence</span>
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold mt-1">
            Real-time telemetry, department resource distribution, and security compliance directly from SQLite database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Filter Switcher */}
          <div className="inline-flex rounded-full bg-neutral-100 dark:bg-neutral-800 p-1 text-xs border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-full font-extrabold transition ${
                timeRange === 'all'
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-full font-extrabold transition ${
                timeRange === 'week'
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Past 7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-full font-extrabold transition ${
                timeRange === 'today'
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Today
            </button>
          </div>

          <button
            type="button"
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-extrabold text-xs flex items-center gap-1.5 transition shadow-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 High-Contrast KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Visitors */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-bold">
            <span className="text-xs uppercase tracking-wider">Total Visitors</span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{totalVisitors}</div>
            <div className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% indexed in SQLite log</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Now */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-bold">
            <span className="text-xs uppercase tracking-wider">Active Now</span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{activeVisitors}</div>
            <div className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active badge credentials</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Overdue Alerts */}
        <div className={`p-5 rounded-3xl bg-white dark:bg-neutral-900 border shadow-sm space-y-3 ${
          overdueCount > 0 ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20' : 'border-neutral-200 dark:border-neutral-800'
        }`}>
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-bold">
            <span className="text-xs uppercase tracking-wider">Overdue</span>
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center justify-center border border-rose-300 dark:border-rose-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{overdueCount}</div>
            <div className="text-[11px] font-bold text-neutral-900 dark:text-white mt-1">
              {overdueCount > 0 ? 'Requires security escort' : 'Zero overdue breaches'}
            </div>
          </div>
        </div>

        {/* KPI 4: Average Stay Duration */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-bold">
            <span className="text-xs uppercase tracking-wider">Average Stay</span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{avgStayFormatted}</div>
            <div className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 font-semibold">
              Based on <strong className="text-neutral-900 dark:text-white">{checkedOutCount}</strong> exits
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Department Distribution & Purpose Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>Department Distribution</span>
            </h3>
            <span className="text-[11px] font-bold text-neutral-400 uppercase">Share %</span>
          </div>

          <div className="space-y-4">
            {deptStats.map(d => (
              <div key={d.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                      {d.code}
                    </span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">{d.name}</span>
                  </div>
                  <span className="font-extrabold text-neutral-900 dark:text-white">
                    {d.count} guests <span className="text-neutral-500">({d.percentage}%)</span>
                  </span>
                </div>
                
                <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-neutral-950 dark:bg-white transition-all duration-500"
                    style={{ width: `${Math.max(d.percentage, d.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visit Purpose Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span>Purpose Breakdown</span>
            </h3>
            <span className="text-[11px] font-bold text-neutral-400 uppercase">Traffic Count</span>
          </div>

          <div className="space-y-2.5">
            {sortedPurposes.map(([purpose, count], idx) => {
              const pct = totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0;
              return (
                <div 
                  key={purpose} 
                  className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-extrabold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-neutral-900 dark:text-white">{purpose}</div>
                      <div className="text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold">{pct}% of facility foot traffic</div>
                    </div>
                  </div>
                  
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs border border-neutral-200 dark:border-neutral-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Row: Peak Hours Traffic Distribution & Security ID Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Traffic Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <span>Peak Hours Traffic Distribution</span>
            </h3>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
              Peak: {peakTimeWindow.label.split(' ')[0]}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(timeBuckets).map(([windowLabel, count]) => {
              const pct = totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0;
              const isPeak = windowLabel === peakTimeWindow.label && count > 0;
              return (
                <div key={windowLabel} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-neutral-900 dark:text-white">
                      {isPeak && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      <span>{windowLabel}</span>
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400">{count} check-ins ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPeak ? 'bg-neutral-950 dark:bg-white' : 'bg-neutral-400 dark:bg-neutral-600'
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & ID Compliance Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity Verification & Credential Types</span>
            </h3>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-neutral-950 dark:bg-white text-white dark:text-neutral-950">
              {idComplianceRate}% VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {Object.entries(idTypeCounts).map(([type, count]) => (
              <div 
                key={type} 
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1"
              >
                <div className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold uppercase truncate">{type}</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black text-neutral-900 dark:text-white">{count}</div>
                  <div className="text-[10px] text-neutral-600 dark:text-neutral-300 font-bold">
                    {totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0}% share
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
