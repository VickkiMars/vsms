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
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { VISIT_PURPOSES } from '../data/initialData';

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

  const availableHosts = useMemo(() => {
    const selectedDeptObj = departments.find(d => d.name === formData.department || d.code === formData.department);
    if (!selectedDeptObj) return hosts;
    const filtered = hosts.filter(h => h.deptId === selectedDeptObj.id);
    return filtered.length > 0 ? filtered : hosts;
  }, [formData.department, departments, hosts]);

  const handleDepartmentChange = (newDeptName) => {
    const matchedDept = departments.find(d => d.name === newDeptName || d.code === newDeptName);
    const firstHost = hosts.find(h => matchedDept && h.deptId === matchedDept.id)?.name || hosts[0]?.name || 'Dr. Elizabeth Vance';
    
    setFormData(prev => ({
      ...prev,
      department: newDeptName,
      hostName: firstHost
    }));
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName') {
      if (!value.trim()) error = 'Visitor full name is required';
      else if (value.trim().length < 2) error = 'Full name must be at least 2 characters';
    }
    if (name === 'phone') {
      if (!value.trim()) error = 'Contact phone number is required';
      else if (value.trim().length < 7) error = 'Please enter a valid phone number';
    }
    if (name === 'idNumber') {
      if (!value.trim()) error = 'Government ID credential number is required';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      handleDepartmentChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (touched[name]) {
      const err = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      fullName: validateField('fullName', formData.fullName),
      phone: validateField('phone', formData.phone),
      idNumber: validateField('idNumber', formData.idNumber),
    };

    setErrors(newErrors);
    setTouched({ fullName: true, phone: true, idNumber: true });

    if (newErrors.fullName || newErrors.phone || newErrors.idNumber) {
      if (newErrors.fullName) nameInputRef.current?.focus();
      else if (newErrors.phone) phoneInputRef.current?.focus();
      else if (newErrors.idNumber) idNumberInputRef.current?.focus();
      return;
    }

    registerVisitor(formData);
  };

  if (!isCheckInOpen) return null;

  return (
    <div 
      aria-modal="true" 
      role="dialog" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn font-sans"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">
                New Visitor Registration
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
                Direct entry to SQLite database table `visitors`
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckInOpen(false)}
            aria-label="Close dialog"
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* SECTION 1: VISITOR PERSONAL IDENTIFICATION */}
          <div className="space-y-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <UserCheck className="w-3.5 h-3.5" />
              <span>1. Guest Personal Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  name="fullName"
                  placeholder="e.g. Babatunde Adeleke"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition ${
                    errors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                />
                {errors.fullName && (
                  <span className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  name="phone"
                  placeholder="+234 803 000 0000"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition ${
                    errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                />
                {errors.phone && (
                  <span className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="babatunde@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  Organization / Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  placeholder="e.g. TechSolutions Nigeria"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CREDENTIAL VERIFICATION */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. Government ID Credential</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  ID Document Type
                </label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition"
                >
                  {ALL_ID_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  ID Number / NIN <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={idNumberInputRef}
                  type="text"
                  name="idNumber"
                  placeholder="e.g. NIN-77401928401"
                  value={formData.idNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition ${
                    errors.idNumber ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                />
                {errors.idNumber && (
                  <span className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.idNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: HOST & DEPARTMENT DESTINATION */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <Building className="w-3.5 h-3.5" />
              <span>3. Destination & Host Officer</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  Department Division
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  Host Officer / Escort
                </label>
                <select
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition"
                >
                  {availableHosts.map(h => (
                    <option key={h.id} value={h.name}>{h.name} — {h.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                Purpose of Visit
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition"
              >
                {VISIT_PURPOSES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 4: VISIT DURATION & VEHICLE DETAILS */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <Clock className="w-3.5 h-3.5" />
              <span>4. Expected Duration & Vehicle Plate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1.5">
                  Expected Duration
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {DURATION_CHIPS.map(chip => (
                    <button
                      key={chip.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, expectedDurationMinutes: chip.value }))}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition ${
                        formData.expectedDurationMinutes === chip.value
                          ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-sm'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                  Vehicle License Plate
                </label>
                <input
                  type="text"
                  name="vehiclePlate"
                  placeholder="e.g. KJA-482-AA (Optional)"
                  value={formData.vehiclePlate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCheckInOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-900 dark:text-white font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Complete Registration & Generate Badge</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
