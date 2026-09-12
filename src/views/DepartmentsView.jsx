import React, { useState, useMemo } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  Building2, 
  MapPin, 
  UserCheck, 
  Mail, 
  Search, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Plus,
  Layers,
  Sparkles,
  ExternalLink
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

  const totalActiveGuests = useMemo(() => {
    return visitors.filter(v => v.status !== 'Checked-Out').length;
  }, [visitors]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-white shadow-soft-card flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-realty-dark flex items-center space-x-2.5">
            <Building2 className="w-5 h-5 text-realty-dark" />
            <span>Organizational Directory & Host Personnel</span>
          </h2>
          <p className="text-xs text-realty-textMuted font-medium mt-1">
            Department governance, assigned security zones, host personnel directory, and real-time visitor routing across all 6 core divisions (EXEC, ITCS, HR, FIN, LEGAL, PROC).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-full bg-realty-cardSubtle text-realty-dark text-xs font-bold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-tag-rental animate-pulse" />
            <span>{totalActiveGuests} Active Guests Facility-Wide</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="px-4 py-2.5 rounded-full bg-realty-dark hover:bg-realty-darkHover text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-pill-active"
          >
            <Plus className="w-3.5 h-3.5 text-pastel-lime" />
            <span>New Check-In</span>
          </button>
        </div>
      </div>

      {/* Directory Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white shadow-soft-card flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-realty-textMuted" />
          <input
            type="text"
            placeholder="Search departments, host personnel, titles, floors, or codes (e.g. EXEC, ITCS, HR, FIN, LEGAL, PROC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-realty-cardSubtle text-xs text-realty-dark placeholder-realty-textMuted focus:outline-none focus:ring-2 focus:ring-realty-dark/10 font-medium transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs text-realty-textMuted">
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-realty-dark hover:underline font-bold text-xs"
            >
              Clear Filter
            </button>
          )}
          <span className="font-bold">{filteredDepts.length} of {departments.length} departments listed</span>
        </div>
      </div>

      {/* Department Cards Grid (EXEC, ITCS, HR, FIN, LEGAL, PROC) */}
      {filteredDepts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white shadow-soft-card text-center space-y-3">
          <Building2 className="w-8 h-8 mx-auto text-realty-textMuted opacity-60" />
          <h3 className="font-extrabold text-sm text-realty-dark">No Matching Departments Found</h3>
          <p className="text-xs text-realty-textMuted font-medium">Try adjusting your search query to find host officers or department units.</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-full bg-realty-dark text-white font-bold text-xs shadow-pill-active"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map(dept => {
            const deptHosts = hosts.filter(h => h.deptId === dept.id);
            const deptVisitors = visitors.filter(v => v.department === dept.name);
            const activeDeptGuests = deptVisitors.filter(v => v.status !== 'Checked-Out');
            const overdueDeptGuests = deptVisitors.filter(v => v.status === 'Overdue');

            return (
              <div 
                key={dept.id} 
                className="p-6 rounded-3xl bg-white shadow-soft-card flex flex-col justify-between space-y-5 hover:shadow-float-bar hover:-translate-y-0.5 transition-all"
              >
                <div className="space-y-4">
                  {/* Header Row: Code & Active Presence Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-realty-dark text-white shadow-xs">
                        {dept.code}
                      </span>
                      <h3 className="font-extrabold text-sm text-realty-dark mt-2.5 tracking-tight">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-realty-textMuted font-medium flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-realty-textMuted" />
                        <span>{dept.floor}</span>
                      </p>
                    </div>

                    {/* Active Guests Badge */}
                    <div className="px-3.5 py-2 rounded-2xl bg-realty-cardSubtle text-center shrink-0">
                      <div className="text-sm font-extrabold text-realty-dark">
                        {activeDeptGuests.length}
                      </div>
                      <div className="text-[9px] font-bold text-realty-textMuted uppercase tracking-wider">
                        Active Guests
                      </div>
                    </div>
                  </div>

                  {/* Overdue Warning Pill if any */}
                  {overdueDeptGuests.length > 0 && (
                    <div className="p-3 rounded-2xl bg-pastel-pink text-pastel-pinkDark text-[11px] font-bold flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{overdueDeptGuests.length} Overdue Escort Alert</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDeptFilter(dept.name);
                          setActiveView('live');
                        }}
                        className="text-[10px] font-bold underline cursor-pointer hover:opacity-80"
                      >
                        View &rarr;
                      </button>
                    </div>
                  )}

                  {/* Department Head Section */}
                  <div className="p-3.5 rounded-2xl bg-realty-cardSubtle text-xs space-y-1">
                    <div className="text-[10px] text-realty-textMuted uppercase font-bold tracking-wider">
                      Department Executive Head
                    </div>
                    <div className="font-extrabold text-realty-dark flex items-center justify-between">
                      <span>{dept.head}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-realty-dark shadow-xs">
                        EXECUTIVE
                      </span>
                    </div>
                  </div>

                  {/* Host Personnel List with Role Badges & Active Visitor Indicators */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-realty-textMuted uppercase tracking-wider">
                      <span>Host Directory ({deptHosts.length})</span>
                      <span>Presence Status</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {deptHosts.map(h => {
                        const hostActiveVisitors = activeDeptGuests.filter(v => v.hostName === h.name);
                        const isHostingNow = hostActiveVisitors.length > 0;

                        return (
                          <div 
                            key={h.id} 
                            className="p-3 rounded-2xl bg-realty-cardSubtle text-xs space-y-1.5 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <div className="font-extrabold text-realty-dark leading-snug">
                                  {h.name}
                                </div>
                                <div className="text-[10px] text-realty-textMuted font-medium">
                                  {h.title}
                                </div>
                              </div>

                              {/* Host Status / Active Badge */}
                              {isHostingNow ? (
                                <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-tag-rental text-white flex items-center space-x-1 shadow-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  <span>{hostActiveVisitors.length} ACTIVE</span>
                                </span>
                              ) : (
                                <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white text-realty-textMuted shadow-xs">
                                  AVAILABLE
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1 text-[10px] text-realty-textMuted">
                              <span className="flex items-center gap-1 truncate max-w-[160px]">
                                <Mail className="w-3 h-3 text-realty-textMuted shrink-0" />
                                <span className="truncate">{h.email}</span>
                              </span>
                              <span className="font-bold text-realty-dark">
                                HOST
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDeptFilter(dept.name);
                      setActiveView('log');
                    }}
                    className="w-full py-2.5 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-realty-dark text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View All {dept.code} Log Entries ({deptVisitors.length})</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
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
