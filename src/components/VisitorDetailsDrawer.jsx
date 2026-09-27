import React from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  X, 
  QrCode, 
  LogOut, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const VisitorDetailsDrawer = () => {
  const { 
    isDetailsDrawerOpen, 
    setIsDetailsDrawerOpen, 
    selectedVisitorForDetails, 
    orgFields, 
    openBadgeModal, 
    checkOutVisitor 
  } = useVisitorContext();

  if (!isDetailsDrawerOpen || !selectedVisitorForDetails) return null;

  const v = selectedVisitorForDetails;
  const customData = v.custom_data || {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md sm:max-w-lg bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left font-sans"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={v.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.fullName)}`}
              alt={v.fullName}
              className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-sm"
            />
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
                {v.fullName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold">
                  {v.badgeId || v.id}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  v.status === 'Checked-In' 
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : v.status === 'Overdue'
                    ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}>
                  {v.status}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsDetailsDrawerOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Visit Timing Banner */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
                Check-In Timestamp
              </span>
              <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>{new Date(v.checkInTime).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
                Departure Status
              </span>
              <div className="font-bold text-neutral-900 dark:text-neutral-100">
                {v.checkOutTime ? (
                  <span className="text-neutral-600 dark:text-neutral-300">
                    {new Date(v.checkOutTime).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Currently On-Premises
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* All Organization Fields (Baseline & Custom) */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Visitor Record Attributes</span>
            </h4>

            <div className="space-y-3">
              {orgFields.map((field) => {
                let value = v[field.field_key];
                if (value === undefined || value === null || value === '') {
                  value = customData[field.field_key];
                }

                // Handle host special case
                if (field.field_key === 'host') {
                  value = v.hostName || value || '—';
                }

                return (
                  <div 
                    key={field.id}
                    className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300 text-xs">
                          {field.field_name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 font-mono">
                          {field.field_type}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {field.field_type === 'checkbox' ? (
                          value ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px]">
                              Yes / Acknowledged
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-[11px]">
                              No / Not Applicable
                            </span>
                          )
                        ) : (
                          <span>{value ? String(value) : '—'}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-[10px] text-neutral-400">
                      {Number(field.show_in_table) === 1 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Table Slot</span>
                      )}
                      {Number(field.show_on_badge) === 1 && (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">On Badge</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              openBadgeModal(v);
              setIsDetailsDrawerOpen(false);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Print Pass</span>
          </button>

          {v.status !== 'Checked-Out' && (
            <button
              type="button"
              onClick={() => {
                checkOutVisitor(v.id);
                setIsDetailsDrawerOpen(false);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold flex items-center justify-center gap-2 transition hover:opacity-90 shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Check Out</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
