import React, { useEffect } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { useAuthContext } from '../context/AuthContext';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Building, 
  User, 
  Phone, 
  CheckCircle2,
  Calendar,
  Briefcase
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const VisitorPassModal = () => {
  const { 
    isBadgeModalOpen, 
    setIsBadgeModalOpen, 
    selectedVisitorForBadge,
    badgeDisplayFields 
  } = useVisitorContext();

  const { currentOrg } = useAuthContext();

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isBadgeModalOpen) {
        setIsBadgeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBadgeModalOpen, setIsBadgeModalOpen]);

  if (!isBadgeModalOpen || !selectedVisitorForBadge) return null;

  const visitor = selectedVisitorForBadge;
  const customData = visitor.custom_data || {};

  // Clean JSON payload for QR scanner verification
  const qrPayload = JSON.stringify({
    org: currentOrg?.slug || 'vsms',
    badgeId: visitor.badgeId,
    visitorId: visitor.id,
    name: visitor.fullName,
    phone: visitor.phone,
    host: visitor.hostName,
    checkIn: visitor.checkInTime,
  });

  const handlePrint = () => {
    window.print();
  };

  // Calculate expected departure / expiry time
  const checkInDate = new Date(visitor.checkInTime);
  const durationMs = (visitor.expectedDurationMinutes || 60) * 60 * 1000;
  const expiryDate = new Date(checkInDate.getTime() + durationMs);

  const formattedCheckInDate = isNaN(checkInDate.getTime()) 
    ? 'Today' 
    : checkInDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedCheckInTime = isNaN(checkInDate.getTime()) 
    ? 'Now' 
    : checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedExpiryTime = isNaN(expiryDate.getTime())
    ? 'Standard Visit'
    : expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Custom attributes to show on badge based on organization configuration
  const customBadgeFields = (badgeDisplayFields || []).filter(
    f => f.field_key !== 'fullName' && f.field_key !== 'phone'
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-xs animate-fade-in select-none font-sans overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsBadgeModalOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor-pass-modal-title"
    >
      <div 
        className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] md:max-h-[calc(100dvh-3rem)] bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col font-sans border border-neutral-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between bg-white border-b border-neutral-100">
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 shrink-0" aria-hidden="true" />
            <span id="visitor-pass-modal-title" className="font-extrabold text-[11px] sm:text-xs text-neutral-900 uppercase tracking-wider truncate">
              Official Security Visitor Pass
            </span>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print visitor pass"
              title="Print visitor pass"
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-950 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" />
              <span className="hidden xs:inline sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBadgeModalOpen(false)}
              aria-label="Close visitor pass modal"
              title="Close modal"
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Printable Pass Container */}
        <div 
          id="printable-badge" 
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 md:p-6 bg-white space-y-3 sm:space-y-3.5"
        >
          
          {/* Security Badge Card Frame */}
          <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 bg-neutral-50 text-center relative overflow-hidden border border-neutral-200/80 shadow-xs">
            
            {/* Header / Badge ID & Org Name */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-neutral-200/70">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold bg-neutral-950 text-white tracking-wider shadow-xs">
                {visitor.badgeId || visitor.id}
              </span>
              <div className="text-right">
                <span className="text-[10px] text-neutral-900 font-extrabold uppercase tracking-widest block truncate max-w-[170px] sm:max-w-[200px]">
                  {currentOrg?.name || 'VISITOR SECURITY PASS'}
                </span>
                <span className="text-[9px] text-neutral-500 font-bold block">
                  PASS #{visitor.id} • AUTHENTICATED
                </span>
              </div>
            </div>

            {/* Visitor Avatar & Name */}
            <div className="my-1.5 sm:my-2 flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={visitor.avatar}
                  alt={visitor.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm border border-neutral-200 avatar-mono"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(visitor.fullName)}&backgroundColor=111625&textColor=ffffff`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </div>

              <h3 className="font-extrabold text-base sm:text-lg text-neutral-950 tracking-tight leading-snug">
                {visitor.fullName}
              </h3>
              
              <div className="mt-1.5 sm:mt-2 flex items-center justify-center flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-neutral-900 border border-neutral-200 shadow-xs">
                  {visitor.company || customData.company || 'Private Guest'}
                </span>
                {visitor.department && (
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-neutral-900 text-white shadow-xs">
                    {visitor.department}
                  </span>
                )}
                {visitor.status === 'Checked-Out' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-600 uppercase">
                    CHECKED-OUT
                  </span>
                )}
                {visitor.status === 'Overdue' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white uppercase shadow-xs">
                    OVERDUE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid (Configured dynamic fields) */}
          <div className="space-y-1.5 sm:space-y-2 text-xs bg-neutral-50 p-3 sm:p-3.5 rounded-2xl font-sans border border-neutral-200/70">
            {visitor.hostName && (
              <div className="flex justify-between items-center py-0.5 sm:py-1 border-b border-neutral-200/40">
                <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" /> Host Officer:
                </span>
                <span className="font-bold text-neutral-900 text-right truncate max-w-[180px]">{visitor.hostName}</span>
              </div>
            )}

            {visitor.purpose && (
              <div className="flex justify-between items-center py-0.5 sm:py-1 border-b border-neutral-200/40">
                <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" /> Purpose:
                </span>
                <span className="font-semibold text-neutral-900 text-right max-w-[180px] sm:max-w-[200px] truncate">
                  {visitor.purpose}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-0.5 sm:py-1 border-b border-neutral-200/40">
              <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" /> Date & Check-In:
              </span>
              <span className="font-bold text-neutral-900 text-right">
                {formattedCheckInDate} • {formattedCheckInTime}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 sm:py-1 border-b border-neutral-200/40">
              <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" /> Expected Expiry:
              </span>
              <span className="font-bold text-neutral-900 text-right">
                {formattedExpiryTime} ({visitor.expectedDurationMinutes || 60}m)
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 sm:py-1">
              <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" /> Phone Contact:
              </span>
              <span className="font-semibold text-neutral-900">{visitor.phone}</span>
            </div>

            {/* Other Configured Badge Fields */}
            {customBadgeFields.map(f => {
              if (f.field_key === 'host' || f.field_key === 'purpose' || f.field_key === 'company') return null;
              const val = visitor[f.field_key] || customData[f.field_key];
              if (!val) return null;
              return (
                <div key={f.id} className="flex justify-between items-center py-0.5 sm:py-1 border-t border-neutral-200/40">
                  <span className="text-neutral-500 font-medium">{f.field_name}:</span>
                  <span className="font-bold text-neutral-900 text-right truncate max-w-[180px]">
                    {String(val)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* QR Code Verification Section */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white text-neutral-900 border border-neutral-200 shadow-xs">
            <div className="pr-2 sm:pr-3 min-w-0">
              <p className="text-[11px] sm:text-xs font-extrabold text-neutral-900 uppercase tracking-wider mb-0.5">Departure QR Scanner</p>
              <p className="text-[9px] sm:text-[10px] text-neutral-500 leading-tight font-medium">Present badge to front-desk receptionist or automated terminal for instantaneous check-out.</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-full font-mono">
                  {visitor.badgeId || visitor.id}
                </span>
                <span className="text-[8px] sm:text-[9px] text-neutral-900 font-extrabold uppercase">
                  ACTIVE CLEARANCE
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 bg-white rounded-xl shadow-xs shrink-0 border border-neutral-100">
              <QRCodeSVG 
                value={qrPayload} 
                size={74} 
                level="H" 
                fgColor="#000000" 
                bgColor="#ffffff"
                includeMargin={true}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="shrink-0 p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 bg-neutral-50 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => setIsBadgeModalOpen(false)}
            className="px-4 sm:px-5 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" aria-hidden="true" />
            <span>Print Visitor Badge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
