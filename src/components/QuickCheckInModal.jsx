import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  X, 
  UserPlus, 
  Building, 
  Phone, 
  Mail, 
  FileText, 
  UserCheck, 
  Clock, 
  Car, 
  AlertCircle,
  Shield,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { VISIT_PURPOSES, ID_TYPES } from '../data/initialData';

// Extended ID Types list to support all security document classifications
const ALL_ID_TYPES = [
  'National Identity Card (NIN)',
  'Driver’s License',
  'International Passport',
  'Work Permit',
  'Voter’s Card',
  'Corporate Staff ID',
  'Other'
];

const DURATION_CHIPS = [
  { value: '30', label: '30m' },
  { value: '60', label: '1h' },
  { value: '120', label: '2h' },
  { value: '240', label: '4h' },
  { value: '480', label: '8h' },
];

export const QuickCheckInModal = () => {
  const { 
    isCheckInOpen, 
    setIsCheckInOpen, 
    registerVisitor, 
    departments, 
    hosts 
  } = useVisitorContext();

  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const idNumberInputRef = useRef(null);

  const defaultDeptName = departments[0]?.name || 'Executive Suite';
  const defaultDeptObj = departments[0];
  const defaultHostName = hosts.find(h => defaultDeptObj && h.deptId === defaultDeptObj.id)?.name || hosts[0]?.name || 'Dr. Elizabeth Vance';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    idType: ALL_ID_TYPES[0],
    idNumber: '',
    department: defaultDeptName,
    hostName: defaultHostName,
    purpose: VISIT_PURPOSES[0] || 'Official Meeting',
    expectedDurationMinutes: '60',
    vehiclePlate: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset form and auto-focus first input when modal opens
  useEffect(() => {
    if (isCheckInOpen) {
      const initialDept = departments[0]?.name || 'Executive Suite';
      const initialDeptObj = departments[0];
      const initialHost = hosts.find(h => initialDeptObj && h.deptId === initialDeptObj.id)?.name || hosts[0]?.name || 'Dr. Elizabeth Vance';
      
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        company: '',
        idType: ALL_ID_TYPES[0],
        idNumber: '',
        department: initialDept,
        hostName: initialHost,
        purpose: VISIT_PURPOSES[0] || 'Official Meeting',
        expectedDurationMinutes: '60',
        vehiclePlate: '',
        notes: '',
      });
      setErrors({});
      setTouched({});
      
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isCheckInOpen, departments, hosts]);

  // Handle ESC key for modal dismissal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCheckInOpen) {
        setIsCheckInOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckInOpen, setIsCheckInOpen]);

  // Filter hosts dynamically based on selected department
  const filteredHosts = useMemo(() => {
    const selectedDeptObj = departments.find(d => d.name === formData.department || d.code === formData.department);
    if (!selectedDeptObj) return hosts;
    const matching = hosts.filter(h => h.deptId === selectedDeptObj.id);
    return matching.length > 0 ? matching : hosts;
  }, [formData.department, departments, hosts]);

  if (!isCheckInOpen) return null;

  const validateField = (field, value) => {
    if (field === 'fullName') {
      if (!value || !value.trim()) return 'Visitor Full Name is required.';
    }
    if (field === 'phone') {
      if (!value || !value.trim()) return 'Phone Number is required.';
    }
    if (field === 'idNumber') {
      if (!value || !value.trim()) return 'ID / Document Number is required.';
    }
    return '';
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleDepartmentChange = (newDept) => {
    const deptObj = departments.find(dep => dep.name === newDept || dep.code === newDept);
    const matchingHosts = deptObj ? hosts.filter(h => h.deptId === deptObj.id) : hosts;
    const firstHost = matchingHosts[0]?.name || hosts[0]?.name || '';
    
    setFormData(prev => ({
      ...prev,
      department: newDept,
      hostName: firstHost
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nameErr = validateField('fullName', formData.fullName);
    const phoneErr = validateField('phone', formData.phone);
    const idErr = validateField('idNumber', formData.idNumber);

    const newErrors = {
      fullName: nameErr,
      phone: phoneErr,
      idNumber: idErr,
    };

    setErrors(newErrors);
    setTouched({
      fullName: true,
      phone: true,
      idNumber: true,
    });

    if (nameErr || phoneErr || idErr) return;

    registerVisitor(formData);
  };

  if (!isCheckInOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCheckInOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-modal-title"
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-float-bar overflow-hidden animate-scale-in max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-realty-dark text-white flex items-center justify-center font-bold shadow-sm">
              <UserPlus className="w-5 h-5 text-pastel-lime" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="checkin-modal-title" className="font-extrabold text-base text-realty-dark tracking-tight">
                  Fast Guest Registration
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-tag-rental text-white uppercase tracking-wider">
                  LIVE ENTRY
                </span>
              </div>
              <p className="text-xs text-realty-textMuted font-medium">
                Zero-friction registration with instant digital badge generation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckInOpen(false)}
            aria-label="Close registration modal"
            className="p-2 rounded-full text-realty-textMuted hover:text-realty-dark hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-realty-dark font-extrabold text-xs flex items-center space-x-2 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-realty-dark text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Guest Personal Information</span>
              </h3>
              <span className="text-[10px] text-realty-textMuted font-medium">* Required fields</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-realty-dark mb-1 font-semibold">
                  Full Name <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={nameInputRef}
                    type="text"
                    placeholder="e.g. Babatunde Wright-Adeleke"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    aria-required="true"
                    aria-invalid={!!(errors.fullName && touched.fullName)}
                    className={`w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark font-medium placeholder-realty-textMuted transition-all focus:outline-none focus:ring-2 focus:ring-realty-dark/10 ${
                      errors.fullName && touched.fullName
                        ? 'ring-2 ring-red-500/50 bg-red-50/50'
                        : ''
                    }`}
                  />
                </div>
                {errors.fullName && touched.fullName && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-realty-dark mb-1 font-semibold">
                  Phone Number <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={phoneInputRef}
                    type="text"
                    placeholder="e.g. +234 803 555 0192"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    aria-required="true"
                    aria-invalid={!!(errors.phone && touched.phone)}
                    className={`w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark font-medium placeholder-realty-textMuted transition-all focus:outline-none focus:ring-2 focus:ring-realty-dark/10 ${
                      errors.phone && touched.phone
                        ? 'ring-2 ring-red-500/50 bg-red-50/50'
                        : ''
                    }`}
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-realty-dark mb-1 font-semibold">
                  Email Address <span className="text-realty-textMuted font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="babatunde.wright@techsolutions.ng"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark font-medium placeholder-realty-textMuted focus:outline-none focus:ring-2 focus:ring-realty-dark/10"
                />
              </div>

              <div>
                <label className="block text-realty-dark mb-1 font-semibold">
                  Company / Organization <span className="text-realty-textMuted font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Global Logistics"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark font-medium placeholder-realty-textMuted focus:outline-none focus:ring-2 focus:ring-realty-dark/10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-realty-dark font-extrabold text-xs flex items-center space-x-2 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-realty-dark text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Security Credentials & Identity Proof</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-realty-dark mb-1 font-semibold">ID / Credential Document Type</label>
                <select
                  value={formData.idType}
                  onChange={(e) => handleChange('idType', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark focus:outline-none cursor-pointer font-medium shadow-xs"
                >
                  {ALL_ID_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-realty-dark mb-1 font-semibold">
                  ID Document Serial Number <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  ref={idNumberInputRef}
                  type="text"
                  placeholder="e.g. NIN-90182746190"
                  value={formData.idNumber}
                  onChange={(e) => handleChange('idNumber', e.target.value)}
                  onBlur={() => handleBlur('idNumber')}
                  aria-required="true"
                  aria-invalid={!!(errors.idNumber && touched.idNumber)}
                  className={`w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark font-medium placeholder-realty-textMuted transition-all focus:outline-none focus:ring-2 focus:ring-realty-dark/10 ${
                    errors.idNumber && touched.idNumber
                      ? 'ring-2 ring-red-500/50 bg-red-50/50'
                      : ''
                  }`}
                />
                {errors.idNumber && touched.idNumber && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.idNumber}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-realty-dark mb-1 font-semibold">
                  Vehicle License Plate <span className="text-realty-textMuted font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. KJA-891-AB"
                  value={formData.vehiclePlate}
                  onChange={(e) => handleChange('vehiclePlate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark font-medium placeholder-realty-textMuted focus:outline-none focus:ring-2 focus:ring-realty-dark/10 uppercase"
                />
              </div>

              <div>
                <label className="block text-realty-dark mb-1 font-semibold">Estimated Stay Duration</label>
                <div className="flex items-center space-x-1.5 pt-0.5">
                  {DURATION_CHIPS.map(chip => (
                    <button
                      key={chip.value}
                      type="button"
                      onClick={() => handleChange('expectedDurationMinutes', chip.value)}
                      className={`flex-1 py-2 rounded-full font-bold text-xs transition-all ${
                        formData.expectedDurationMinutes === chip.value
                          ? 'bg-realty-dark text-white shadow-pill-active'
                          : 'bg-realty-cardSubtle text-realty-textSecondary hover:text-realty-dark'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-realty-dark font-extrabold text-xs flex items-center space-x-2 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-realty-dark text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Host, Destination & Purpose</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-realty-dark mb-1 font-semibold">Department Being Visited</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark focus:outline-none cursor-pointer font-medium shadow-xs"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.floor})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-realty-dark mb-1 font-semibold">Host / Officer Contact</label>
                <select
                  value={formData.hostName}
                  onChange={(e) => handleChange('hostName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark focus:outline-none cursor-pointer font-medium shadow-xs"
                >
                  {filteredHosts.map(h => (
                    <option key={h.id} value={h.name}>{h.name} — {h.title}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-realty-dark mb-1 font-semibold">Purpose of Visit</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleChange('purpose', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-realty-cardSubtle text-realty-dark focus:outline-none cursor-pointer font-medium shadow-xs"
                >
                  {VISIT_PURPOSES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-realty-dark mb-1 font-semibold">
                  Additional Notes / Belongings <span className="text-realty-textMuted font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Carrying laptop bag, repair toolkit, package delivery #9102"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-realty-cardSubtle text-realty-dark font-medium placeholder-realty-textMuted focus:outline-none focus:ring-2 focus:ring-realty-dark/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCheckInOpen(false)}
              className="px-5 py-2.5 rounded-full bg-gray-100 text-realty-dark hover:bg-gray-200 font-bold transition-colors text-xs shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-realty-dark hover:bg-realty-darkHover text-white font-extrabold shadow-pill-active flex items-center space-x-2 transition-all active:scale-95 text-xs"
            >
              <UserPlus className="w-4 h-4 text-pastel-lime" aria-hidden="true" />
              <span>Complete Check-In & Issue Pass</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
