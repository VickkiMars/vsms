import React, { useState, useMemo } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Search, 
  Users, 
  ShieldAlert, 
  ArrowRight,
  Plus
} from 'lucide-react';

export const DepartmentsView = () => {
  const { 
    departments, 
    hosts, 
    visitors, 
    setSelectedDeptFilter, 
    setActiveView,
    setIsCheckInOpen 
  } = useVisitorContext();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter departments based on search query
  const filteredDepts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return departments;
    return departments.filter(dept => {
      const deptHosts = hosts.filter(h => h.deptId === dept.id);
      const hostMatches = deptHosts.some(h => 
        h.name.toLowerCase().includes(q) || 
        h.title.toLowerCase().includes(q) || 
        h.email.toLowerCase().includes(q)
      );
      return (
        dept.name.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q) ||
        dept.head.toLowerCase().includes(q) ||
        dept.floor.toLowerCase().includes(q) ||
        hostMatches
      );
    });
  }, [departments, hosts, searchQuery]);

  const totalGuestsOnPremises = useMemo(() => {
    return visitors.filter(v => v.status !== 'Checked-Out').length;
  }, [visitors]);

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <span>Organizational Directory & Host Roster</span>
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-1">
            Department governance, security zones, and host personnel directory.
          </p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
          <div className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="whitespace-nowrap">{totalGuestsOnPremises} Guests On-Premises</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-extrabold text-xs flex items-center gap-1.5 transition shadow-md active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">New Check-In</span>
          </button>
        </div>
      </div>

      {/* Directory Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search departments, host personnel, titles, floors, or codes (EXEC, ITCS, HR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white border border-neutral-200 dark:border-neutral-700 font-semibold transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 font-bold">
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-neutral-900 dark:text-white hover:underline font-extrabold text-xs cursor-pointer"
            >
              Clear Filter
            </button>
          )}
          <span>{filteredDepts.length} of {departments.length} departments listed</span>
        </div>
      </div>

      {/* Department Cards Grid */}
      {filteredDepts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center space-y-3">
          <Building2 className="w-8 h-8 mx-auto text-neutral-400" />
          <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">No Matching Departments Found</h3>
          <p className="text-xs text-neutral-500 font-semibold">Try adjusting your search query to find host officers or department units.</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs shadow-md"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map(dept => {
            const deptHosts = hosts.filter(h => h.deptId === dept.id);
            const deptVisitors = visitors.filter(v => v.department === dept.name);
            const onPremisesDeptGuests = deptVisitors.filter(v => v.status !== 'Checked-Out');
            const overdueDeptGuests = deptVisitors.filter(v => v.status === 'Overdue');

            return (
              <div 
                key={dept.id} 
                className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition"
              >
                <div className="space-y-4">
                  {/* Top Row: Code Badge & On-Premises Counter */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs shrink-0">
                          {dept.code}
                        </span>
                        {onPremisesDeptGuests.length > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{onPremisesDeptGuests.length} On-Premises</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 shrink-0">
                            0 On-Premises
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white mt-2.5 leading-snug">
                        {dept.name}
                      </h3>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-start gap-1.5 mt-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span>{dept.floor}</span>
                      </p>
                    </div>
                  </div>

                  {/* Overdue Warning Pill if any */}
                  {overdueDeptGuests.length > 0 && (
                    <div className="p-3 rounded-2xl bg-rose-100/70 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>{overdueDeptGuests.length} Overdue Escort Alert</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDeptFilter(dept.name);
                          setActiveView('live');
                        }}
                        className="text-[11px] font-black underline cursor-pointer hover:opacity-80 shrink-0"
                      >
                        View &rarr;
                      </button>
                    </div>
                  )}

                  {/* Department Head Section (Clean hairline divider layout, NO nested card) */}
                  <div className="pt-3.5 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-extrabold tracking-wider">
                      Department Executive Head
                    </div>
                    <div className="text-xs font-extrabold text-neutral-900 dark:text-white flex items-center justify-between">
                      <span>{dept.head}</span>
                    </div>
                  </div>

                  {/* Host Personnel Roster (Clean list with dividers, NO nested cards) */}
                  <div className="pt-3.5 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      <span>Host Directory ({deptHosts.length})</span>
                      <span>Status</span>
                    </div>

                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                      {deptHosts.map(h => {
                        const hostActiveVisitors = onPremisesDeptGuests.filter(v => v.hostName === h.name);
                        const isHostingNow = hostActiveVisitors.length > 0;

                        return (
                          <div 
                            key={h.id} 
                            className="py-2.5 px-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition flex items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800/50 last:border-0"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-extrabold text-xs text-neutral-900 dark:text-white truncate">
                                {h.name}
                              </div>
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold truncate flex items-center gap-1.5 mt-0.5">
                                <span>{h.title}</span>
                              </div>
                              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium truncate flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span className="truncate">{h.email}</span>
                              </div>
                            </div>

                            {/* Host Status Indicator */}
                            {isHostingNow ? (
                              <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{hostActiveVisitors.length} Checked-In</span>
                              </span>
                            ) : (
                              <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                Available
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDeptFilter(dept.name);
                      setActiveView('log');
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-bold flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-neutral-500" />
                      <span>View {dept.code} Log Entries ({deptVisitors.length})</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

