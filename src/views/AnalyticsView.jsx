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
  Calendar,
  Layers,
  Activity,
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
      <div className="p-6 rounded-3xl bg-white shadow-soft-card flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-realty-dark flex items-center space-x-2.5">
            <BarChart3 className="w-5 h-5 text-realty-dark" />
            <span>Administrative Analytics & Visitor Intelligence</span>
          </h2>
          <p className="text-xs text-realty-textMuted font-medium mt-1">
            Real-time traffic telemetry, department resource distribution, stay duration metrics, and facility security compliance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Filter Switcher */}
          <div className="inline-flex rounded-full bg-realty-cardSubtle p-1 text-xs">
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                timeRange === 'all'
                  ? 'bg-realty-dark text-white shadow-pill-active'
                  : 'text-realty-textSecondary hover:text-realty-dark'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                timeRange === 'week'
                  ? 'bg-realty-dark text-white shadow-pill-active'
                  : 'text-realty-textSecondary hover:text-realty-dark'
              }`}
            >
              Past 7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                timeRange === 'today'
                  ? 'bg-realty-dark text-white shadow-pill-active'
                  : 'text-realty-textSecondary hover:text-realty-dark'
              }`}
            >
              Today
            </button>
          </div>

          <button
            type="button"
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-full bg-realty-dark hover:bg-realty-darkHover text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-pill-active"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-pastel-lime" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 High-Contrast KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Visitors */}
        <div className="p-5 rounded-3xl bg-white shadow-soft-card space-y-3">
          <div className="flex items-center justify-between text-realty-textMuted font-semibold">
            <span className="text-xs font-bold uppercase tracking-wider">Total Visitors</span>
            <div className="w-8 h-8 rounded-full bg-pastel-lime/60 text-pastel-limeDark flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-realty-dark tracking-tight">{totalVisitors}</div>
            <div className="text-[11px] font-bold text-realty-textMuted flex items-center space-x-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-tag-rental" />
              <span>100% indexed in master log</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Now */}
        <div className="p-5 rounded-3xl bg-white shadow-soft-card space-y-3">
          <div className="flex items-center justify-between text-realty-textMuted font-semibold">
            <span className="text-xs font-bold uppercase tracking-wider">Active Now</span>
            <div className="w-8 h-8 rounded-full bg-pastel-mint/60 text-pastel-mintDark flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-realty-dark tracking-tight">{activeVisitors}</div>
            <div className="text-[11px] font-bold text-realty-textMuted flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-tag-rental animate-pulse" />
              <span>Active badge credentials</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Overdue Alerts */}
        <div className={`p-5 rounded-3xl bg-white shadow-soft-card space-y-3 ${
          overdueCount > 0 ? 'ring-2 ring-tag-sale/40 bg-pastel-pink/20' : ''
        }`}>
          <div className="flex items-center justify-between text-realty-textMuted font-semibold">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue</span>
            <div className="w-8 h-8 rounded-full bg-pastel-pink/60 text-pastel-pinkDark flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-realty-dark tracking-tight">{overdueCount}</div>
            <div className="text-[11px] font-bold text-realty-dark mt-1">
              {overdueCount > 0 ? 'Requires security escort' : 'Zero overdue breaches'}
            </div>
          </div>
        </div>

        {/* KPI 4: Average Stay Duration */}
        <div className="p-5 rounded-3xl bg-white shadow-soft-card space-y-3">
          <div className="flex items-center justify-between text-realty-textMuted font-semibold">
            <span className="text-xs font-bold uppercase tracking-wider">Average Stay</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 text-realty-dark flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-realty-dark tracking-tight">{avgStayFormatted}</div>
            <div className="text-[11px] text-realty-textMuted mt-1 font-medium">
              Based on <strong className="text-realty-dark">{checkedOutCount}</strong> exits
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Department Distribution & Purpose Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="p-6 rounded-3xl bg-white shadow-soft-card space-y-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-extrabold text-realty-dark uppercase tracking-wider flex items-center space-x-2">
              <Building className="w-4 h-4 text-realty-dark" />
              <span>Department Distribution</span>
            </h3>
            <span className="text-[11px] font-bold text-realty-textMuted uppercase">Share %</span>
          </div>

          <div className="space-y-4">
            {deptStats.map(d => (
              <div key={d.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-realty-cardSubtle text-realty-dark">
                      {d.code}
                    </span>
                    <span className="font-extrabold text-realty-dark">{d.name}</span>
                  </div>
                  <span className="font-bold text-realty-dark">
                    {d.count} guests <span className="text-realty-textMuted">({d.percentage}%)</span>
                  </span>
                </div>
                
                {/* Soft Pastel Progress Bar */}
                <div className="w-full h-3 rounded-full bg-realty-cardSubtle overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-realty-dark transition-all duration-500"
                    style={{ width: `${Math.max(d.percentage, d.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visit Purpose Breakdown */}
        <div className="p-6 rounded-3xl bg-white shadow-soft-card space-y-5">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-extrabold text-realty-dark uppercase tracking-wider flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-realty-dark" />
              <span>Purpose Breakdown</span>
            </h3>
            <span className="text-[11px] font-bold text-realty-textMuted uppercase">Traffic Count</span>
          </div>

          <div className="space-y-2.5">
            {sortedPurposes.map(([purpose, count], idx) => {
              const pct = totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0;
              return (
                <div 
                  key={purpose} 
                  className="p-3.5 rounded-2xl bg-realty-cardSubtle flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-realty-dark text-white flex items-center justify-center font-extrabold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-realty-dark">{purpose}</div>
                      <div className="text-[10px] text-realty-textMuted font-medium">{pct}% of facility foot traffic</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-realty-dark shadow-xs">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Row: Peak Hours Traffic Distribution & Security ID Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Traffic Distribution */}
        <div className="p-6 rounded-3xl bg-white shadow-soft-card space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-extrabold text-realty-dark uppercase tracking-wider flex items-center space-x-2">
              <Sun className="w-4 h-4 text-realty-dark" />
              <span>Peak Hours Traffic Distribution</span>
            </h3>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-pastel-lime text-pastel-limeDark">
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
                    <span className={`flex items-center gap-1.5 ${isPeak ? 'text-realty-dark font-extrabold' : 'text-realty-textSecondary'}`}>
                      {isPeak && <ArrowUpRight className="w-3.5 h-3.5 text-tag-rental" />}
                      <span>{windowLabel}</span>
                    </span>
                    <span className="text-realty-textMuted">{count} check-ins ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-realty-cardSubtle overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPeak ? 'bg-realty-dark' : 'bg-realty-dark/40'
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
        <div className="p-6 rounded-3xl bg-white shadow-soft-card space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-extrabold text-realty-dark uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-realty-dark" />
              <span>Identity Verification & Credential Types</span>
            </h3>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-tag-rental text-white">
              {idComplianceRate}% VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {Object.entries(idTypeCounts).map(([type, count]) => (
              <div 
                key={type} 
                className="p-3.5 rounded-2xl bg-realty-cardSubtle space-y-1 transition-colors"
              >
                <div className="text-[10px] text-realty-textMuted font-bold uppercase tracking-wider truncate">{type}</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-extrabold text-realty-dark">{count}</div>
                  <div className="text-[10px] text-realty-textMuted font-bold">
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
