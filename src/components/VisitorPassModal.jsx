import React, { useEffect } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
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
  Car,
  FileText,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const VisitorPassModal = () => {
  const { 
    isBadgeModalOpen, 
    setIsBadgeModalOpen, 
    selectedVisitorForBadge 
  } = useVisitorContext();

  // Keyboard Escape listener for modal dismissal
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
  
  // Clean JSON payload for QR scanner verification
  const qrPayload = JSON.stringify({
    badgeId: visitor.badgeId,
    visitorId: visitor.id,
    name: visitor.fullName,
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsBadgeModalOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor-pass-modal-title"
    >
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-float-bar overflow-hidden animate-scale-in flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-realty-dark" aria-hidden="true" />
            <span id="visitor-pass-modal-title" className="font-extrabold text-xs text-realty-dark uppercase tracking-wider">
              Printable Visitor Pass
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsBadgeModalOpen(false)}
            aria-label="Close visitor pass modal"
            className="p-1.5 rounded-full text-realty-textMuted hover:text-realty-dark hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Printable Pass Container */}
        <div id="printable-badge" className="p-6 bg-white space-y-4">
          
          {/* Security Badge Card Frame */}
          <div className="rounded-3xl p-5 bg-realty-cardSubtle text-center relative overflow-hidden shadow-xs">
            
            {/* Header / Badge ID */}
            <div className="flex items-center justify-between mb-3 pb-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-realty-dark text-white tracking-wider shadow-xs">
                {visitor.badgeId}
              </span>
              <div className="text-right">
                <span className="text-[10px] text-realty-dark font-extrabold uppercase tracking-widest block">
                  NIGERIA SECURITY CLEARANCE
                </span>
                <span className="text-[9px] text-realty-textMuted font-bold block">
                  PASS #{visitor.id} • NDPR VERIFIED
                </span>
              </div>
            </div>

            {/* Visitor Avatar & Name */}
            <div className="my-2 flex flex-col items-center">
              <div className="relative mb-2.5">
                <img
                  src={visitor.avatar}
                  alt={visitor.fullName}
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(visitor.fullName)}&backgroundColor=111625&textColor=ffffff`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-tag-rental text-white flex items-center justify-center shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </div>

              <h3 className="font-extrabold text-lg text-realty-dark tracking-tight leading-snug">
                {visitor.fullName}
              </h3>
              
              <div className="mt-2 flex items-center justify-center flex-wrap gap-1.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-realty-dark shadow-xs">
                  {visitor.company || 'Private Guest'}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-realty-dark text-white shadow-xs">
                  {visitor.department}
                </span>
                {visitor.status === 'Checked-Out' && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-200 text-realty-textMuted uppercase">
                    CHECKED-OUT
                  </span>
                )}
                {visitor.status === 'Overdue' && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-tag-sale text-white uppercase shadow-xs">
                    OVERDUE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-2 text-xs bg-realty-cardSubtle p-4 rounded-2xl font-sans">
            <div className="flex justify-between items-center py-1">
              <span className="text-realty-textMuted font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-realty-dark" aria-hidden="true" /> Host Officer:
              </span>
              <span className="font-bold text-realty-dark">{visitor.hostName}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-realty-textMuted font-medium flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-realty-dark" aria-hidden="true" /> Purpose:
              </span>
              <span className="font-semibold text-realty-dark text-right max-w-[200px] truncate">
                {visitor.purpose}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-realty-textMuted font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-realty-dark" aria-hidden="true" /> Date & Check-In:
              </span>
              <span className="font-bold text-realty-dark">
                {formattedCheckInDate} • {formattedCheckInTime}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-realty-textMuted font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-realty-dark" aria-hidden="true" /> Expected Expiry:
              </span>
              <span className="font-bold text-realty-dark">
                {formattedExpiryTime} ({visitor.expectedDurationMinutes || 60}m)
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-realty-textMuted font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-realty-dark" aria-hidden="true" /> Phone:
              </span>
              <span className="font-semibold text-realty-dark">{visitor.phone}</span>
            </div>

            {visitor.idNumber && (
              <div className="flex justify-between items-center py-1">
                <span className="text-realty-textMuted font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-realty-dark" aria-hidden="true" /> ID Document:
                </span>
                <span className="font-bold text-realty-dark text-right max-w-[200px] truncate">
                  {visitor.idType ? `${visitor.idType}: ` : ''}{visitor.idNumber}
                </span>
              </div>
            )}

            {visitor.vehiclePlate && visitor.vehiclePlate !== 'N/A' && (
              <div className="flex justify-between items-center py-1">
                <span className="text-realty-textMuted font-medium flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-realty-dark" aria-hidden="true" /> Vehicle Plate:
                </span>
                <span className="font-bold text-realty-dark">{visitor.vehiclePlate}</span>
              </div>
            )}
          </div>

          {/* QR Code Verification Section */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white text-realty-dark shadow-soft-card">
            <div className="pr-3">
              <p className="text-xs font-extrabold text-realty-dark uppercase tracking-wider mb-0.5">Check-Out QR Scanner</p>
              <p className="text-[10px] text-realty-textMuted leading-tight font-medium">Present this badge to security officer or automated gate scanner at departure.</p>
              <div className="mt-2.5 flex items-center space-x-2">
                <span className="text-[10px] font-bold text-realty-dark bg-realty-cardSubtle px-2.5 py-0.5 rounded-full">
                  {visitor.id}
                </span>
                <span className="text-[9px] text-tag-rental font-extrabold uppercase">
                  VALID TODAY
                </span>
              </div>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-xs flex-shrink-0">
              <QRCodeSVG 
                value={qrPayload} 
                size={84} 
                level="H" 
                fgColor="#111625" 
                bgColor="#ffffff"
                includeMargin={true}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => setIsBadgeModalOpen(false)}
            className="px-5 py-2.5 rounded-full bg-gray-100 text-realty-dark hover:bg-gray-200 font-bold text-xs transition-colors shadow-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-full bg-realty-dark hover:bg-realty-darkHover text-white font-extrabold text-xs flex items-center space-x-2 shadow-pill-active transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-pastel-lime" aria-hidden="true" />
            <span>Print Visitor Badge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
