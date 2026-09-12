import React from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  RotateCw, 
  Flag, 
  Circle, 
  Maximize2, 
  Search,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const RightSidebar = () => {
  const { visitors, openBadgeModal, setIsCheckInOpen } = useVisitorContext();

  const activeVisitors = visitors.filter(v => v.status !== 'Checked-Out');
  const recentFeedVisitors = visitors.slice(0, 3);

  return (
    <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4 py-2 font-sans select-none">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-5 h-full flex flex-col justify-between">
        <div className="space-y-5">
          {/* Feed Header */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Security Live Feed</span>
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-800 dark:text-neutral-200">
              {activeVisitors.length} On-Premises
            </span>
          </div>

          {/* Dynamic Feed from Database */}
          {recentFeedVisitors.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <UserCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">No Visitors Registered</p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                All security live feed events will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeedVisitors.map((visitor, idx) => (
                <div key={visitor.id} className="space-y-2 relative pl-6 border-l-2 border-dashed border-neutral-300 dark:border-neutral-700">
                  {/* Timeline Pin */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-neutral-950 dark:bg-white flex items-center justify-center text-[8px] text-white dark:text-neutral-950">
                    <Flag className="w-2.5 h-2.5 text-emerald-400 dark:text-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <span className="text-neutral-900 dark:text-white truncate max-w-[150px]">{visitor.purpose || 'Visitor Entry'}</span>
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
                      {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Activity Card */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={visitor.avatar} 
                          alt={visitor.fullName} 
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-neutral-300 dark:ring-neutral-600" 
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">{visitor.fullName}</div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium truncate">{visitor.company}</div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => openBadgeModal(visitor)}
                        className="w-7 h-7 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs shadow-xs hover:bg-neutral-100 dark:hover:bg-neutral-600 transition shrink-0"
                        title="View Badge"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-200" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60 text-[10px]">
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 truncate max-w-[140px]">
                        Host: {visitor.hostName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        visitor.status === 'Checked-In'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : visitor.status === 'Overdue'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                      }`}>
                        {visitor.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Quick Action */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold transition shadow-sm active:scale-98"
          >
            + Register New Guest Check-In
          </button>
        </div>

      </div>
    </aside>
  );
};
