import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { useAuthContext } from '../context/AuthContext';
import { DEFAULT_ORG_FIELDS } from '../db/sqliteDb';
import { 
  X, 
  UserPlus, 
  Phone, 
  UserCheck, 
  AlertCircle,
  Building,
  CheckCircle2,
  Calendar,
  Camera,
  Hash,
  FileText
} from 'lucide-react';

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
    orgFields,
    departments, 
    hosts 
  } = useVisitorContext();

  const { currentOrg } = useAuthContext();

  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const idNumberInputRef = useRef(null);

  // Active fields dynamically loaded from active organization's walkthrough configuration
  const activeFields = useMemo(() => {
    return (orgFields && orgFields.length > 0) ? orgFields : DEFAULT_ORG_FIELDS;
  }, [orgFields]);

  // Secondary filter for custom non-baseline fields
  const customFields = useMemo(() => {
    return (activeFields || []).filter(f => f.field_key !== 'fullName' && f.field_key !== 'phone');
  }, [activeFields]);

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCheckInOpen) {
        setIsCheckInOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckInOpen, setIsCheckInOpen]);

  // Compute filtered hosts based on selected department for cascade
  const filteredHosts = useMemo(() => {
    if (!formData.department) return hosts;
    const deptObj = departments.find(d => d.name === formData.department || d.code === formData.department);
    const matching = hosts.filter(h => deptObj && (h.deptId === deptObj.id || h.deptId === deptObj.code));
    return matching.length > 0 ? matching : hosts;
  }, [formData.department, departments, hosts]);

  const handleDepartmentChange = (deptName) => {
    const deptObj = departments.find(d => d.name === deptName || d.code === deptName);
    const matching = hosts.filter(h => deptObj && (h.deptId === deptObj.id || h.deptId === deptObj.code));
    const nextHost = (matching.length > 0 ? matching : hosts)[0]?.name || '';
    setFormData(prev => ({
      ...prev,
      department: deptName,
      hostName: nextHost,
      host: nextHost
    }));
  };

  // Reset form whenever modal opens or activeFields change
  useEffect(() => {
    if (isCheckInOpen) {
      const initial = {
        fullName: '',
        phone: ''
      };

      (activeFields || []).forEach(f => {
        if (f.field_type === 'checkbox') {
          initial[f.field_key] = false;
        } else if (f.field_type === 'select') {
          initial[f.field_key] = (f.options && f.options.length > 0) ? f.options[0] : '';
        } else if (f.field_type === 'host_picker') {
          const defaultHost = hosts?.[0]?.name || '';
          initial[f.field_key] = defaultHost;
          initial.hostName = defaultHost;
          const hostObj = hosts?.[0];
          if (hostObj?.deptId) {
            const deptObj = departments.find(d => d.id === hostObj.deptId || d.code === hostObj.deptId);
            initial.department = deptObj?.name || departments[0]?.name || '';
          }
        } else if (f.field_key === 'expectedDurationMinutes') {
          initial[f.field_key] = f.placeholder || '60';
        } else {
          initial[f.field_key] = '';
        }
      });

      // Backward compatibility defaults if departments/hosts exist
      if (!initial.department && departments?.length) initial.department = departments[0]?.name || '';
      if (!initial.hostName && hosts?.length) initial.hostName = hosts[0]?.name || '';

      setFormData(initial);
      setErrors({});
      setTouched({});

      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isCheckInOpen, activeFields, hosts, departments]);

  const validateField = (key, value) => {
    let error = '';
    const fieldDef = (activeFields || []).find(f => f.field_key === key);
    const isRequired = fieldDef ? Boolean(Number(fieldDef.is_required)) : (key === 'fullName' || key === 'phone');

    if (key === 'fullName') {
      if (isRequired && (!value || !String(value).trim())) {
        error = `${fieldDef?.field_name || 'Visitor full name'} is required`;
      } else if (value && String(value).trim().length < 2) {
        error = `${fieldDef?.field_name || 'Full name'} must be at least 2 characters`;
      }
      return error;
    }

    if (key === 'phone') {
      if (isRequired && (!value || !String(value).trim())) {
        error = `${fieldDef?.field_name || 'Contact phone number'} is required`;
      } else if (value && String(value).trim().length < 7) {
        error = 'Please enter a valid phone number';
      }
      return error;
    }

    if (key === 'idNumber') {
      if (isRequired && (!value || !String(value).trim())) {
        error = `${fieldDef?.field_name || 'ID number'} is required`;
      }
      return error;
    }

    if (isRequired) {
      if (fieldDef?.field_type === 'checkbox') {
        if (!value) error = `${fieldDef.field_name} is required`;
      } else if (!value || !String(value).trim()) {
        error = `${fieldDef?.field_name || 'This field'} is required`;
      }
    }
    return error;
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };

      // If host_picker changes, also resolve department and hostName
      if (key === 'host' || key === 'hostName') {
        updated.hostName = value;
        const hostObj = hosts.find(h => h.name === value || h.id === value);
        if (hostObj?.deptId) {
          const deptObj = departments.find(d => d.id === hostObj.deptId || d.code === hostObj.deptId);
          if (deptObj) updated.department = deptObj.name;
        }
      }

      // If department changes, adjust host
      if (key === 'department') {
        const deptObj = departments.find(d => d.name === value || d.code === value);
        const matching = hosts.filter(h => deptObj && (h.deptId === deptObj.id || h.deptId === deptObj.code));
        const firstHost = (matching.length > 0 ? matching : hosts)[0];
        if (firstHost) {
          updated.hostName = firstHost.name;
          updated.host = firstHost.name;
        }
      }

      return updated;
    });

    if (touched[key]) {
      const err = validateField(key, value);
      setErrors(prev => ({ ...prev, [key]: err }));
    }
  };

  const handleBlur = (key) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    const err = validateField(key, formData[key]);
    setErrors(prev => ({ ...prev, [key]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const newTouched = {};

    activeFields.forEach(f => {
      newTouched[f.field_key] = true;
      const err = validateField(f.field_key, formData[f.field_key]);
      if (err) newErrors[f.field_key] = err;
    });

    // Validate standard baseline if present
    if (!newTouched.fullName && formData.fullName !== undefined) {
      newTouched.fullName = true;
      const err = validateField('fullName', formData.fullName);
      if (err) newErrors.fullName = err;
    }
    if (!newTouched.phone && formData.phone !== undefined) {
      newTouched.phone = true;
      const err = validateField('phone', formData.phone);
      if (err) newErrors.phone = err;
    }

    setErrors(newErrors);
    setTouched(newTouched);

    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  New Visitor Check-In
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-neutral-700">
                  {currentOrg?.name || 'Workspace'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Front-desk visitor registration configured to organization policy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckInOpen(false)}
            aria-label="Close dialog"
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          <div className="space-y-4">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                <span>Visitor Registration Information</span>
              </div>
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                {activeFields.length} configured fields
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeFields.map((field) => {
                const isRequired = Number(field.is_required) === 1;
                const fieldError = errors[field.field_key];

                // 1. Host Picker Type
                if (field.field_type === 'host_picker') {
                  return (
                    <div key={field.id || field.field_key} className="sm:col-span-2 space-y-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                      <label className="block text-neutral-900 dark:text-white font-extrabold text-xs">
                        {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1">Host Staff Member</span>
                          <select
                            name={field.field_key}
                            value={formData[field.field_key] || formData.hostName || ''}
                            onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                            onBlur={() => handleBlur(field.field_key)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                          >
                            {(filteredHosts || hosts).map(h => (
                              <option key={h.id || h.name} value={h.name}>
                                {h.name} {h.title ? `— ${h.title}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1">Assigned Department</span>
                          <select
                            name="department"
                            value={formData.department || (departments[0]?.name || '')}
                            onChange={(e) => handleDepartmentChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
                          >
                            {departments.map(d => (
                              <option key={d.id || d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {fieldError && (
                        <span className="text-[11px] text-neutral-900 dark:text-neutral-100 font-extrabold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldError}
                        </span>
                      )}
                    </div>
                  );
                }

                // 2. Select Dropdown Type
                if (field.field_type === 'select') {
                  return (
                    <div key={field.id || field.field_key} className="space-y-1">
                      <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                        {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                      </label>
                      <select
                        name={field.field_key}
                        value={formData[field.field_key] || ''}
                        onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                        onBlur={() => handleBlur(field.field_key)}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition ${
                          fieldError ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white' : 'border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {fieldError && (
                        <span className="text-[11px] text-neutral-900 dark:text-neutral-100 font-extrabold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldError}
                        </span>
                      )}
                    </div>
                  );
                }

                // 3. Checkbox / Boolean Type
                if (field.field_type === 'checkbox') {
                  return (
                    <div key={field.id || field.field_key} className="sm:col-span-2 pt-1">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/40 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800 transition-colors">
                        <input
                          type="checkbox"
                          name={field.field_key}
                          checked={!!formData[field.field_key]}
                          onChange={(e) => handleFieldChange(field.field_key, e.target.checked)}
                          onBlur={() => handleBlur(field.field_key)}
                          className="w-4 h-4 rounded text-neutral-950 dark:text-white focus:ring-neutral-900"
                        />
                        <div className="flex-1">
                          <span className="font-extrabold text-neutral-900 dark:text-white text-xs block">
                            {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                          </span>
                          {field.placeholder && (
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                              {field.placeholder}
                            </span>
                          )}
                        </div>
                      </label>
                      {fieldError && (
                        <span className="text-[11px] text-neutral-900 dark:text-neutral-100 font-extrabold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldError}
                        </span>
                      )}
                    </div>
                  );
                }

                // 4. Textarea Type
                if (field.field_type === 'textarea') {
                  return (
                    <div key={field.id || field.field_key} className="sm:col-span-2 space-y-1">
                      <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                        {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                      </label>
                      <textarea
                        name={field.field_key}
                        rows={2}
                        placeholder={field.placeholder || 'Enter notes or remarks...'}
                        value={formData[field.field_key] || ''}
                        onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                        onBlur={() => handleBlur(field.field_key)}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-medium text-neutral-900 dark:text-white focus:outline-none transition ${
                          fieldError ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white' : 'border-neutral-200 dark:border-neutral-700'
                        }`}
                      />
                      {fieldError && (
                        <span className="text-[11px] text-neutral-900 dark:text-neutral-100 font-extrabold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldError}
                        </span>
                      )}
                    </div>
                  );
                }

                // 5. Number Type
                if (field.field_type === 'number') {
                  return (
                    <div key={field.id || field.field_key} className="space-y-1">
                      <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                        {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                      </label>
                      <input
                        type="number"
                        name={field.field_key}
                        placeholder={field.placeholder || '60'}
                        value={formData[field.field_key] || ''}
                        onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                        onBlur={() => handleBlur(field.field_key)}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition ${
                          fieldError ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white' : 'border-neutral-200 dark:border-neutral-700'
                        }`}
                      />

                      {field.field_key === 'expectedDurationMinutes' && (
                        <div className="flex gap-1.5 pt-1.5">
                          {DURATION_CHIPS.map(chip => (
                            <button
                              key={chip.value}
                              type="button"
                              onClick={() => handleFieldChange('expectedDurationMinutes', chip.value)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                                formData.expectedDurationMinutes === chip.value
                                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {fieldError && (
                        <span className="text-[11px] text-neutral-900 dark:text-neutral-100 font-extrabold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldError}
                        </span>
                      )}
                    </div>
                  );
                }

                // 6. Phone Type or field_key === 'phone'
                if (field.field_key === 'phone' || field.field_type === 'phone') {
                  return (
                    <div key={field.id || field.field_key} className="space-y-1">
                      <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                        {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          name={field.field_key}
                          placeholder={field.placeholder || '+234 803 000 0000'}
                          value={formData[field.field_key] || ''}
                          onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                          onBlur={() => handleBlur(field.field_key)}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition ${
                            fieldError ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white' : 'border-neutral-200 dark:border-neutral-700'
                          }`}
                        />
                      </div>
                      {errors.phone && touched.phone && (
                        <span className="text-[11px] text-neutral-900 dark:text-neutral-100 font-extrabold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  );
                }

                // 7. Full Name field
                if (field.field_key === 'fullName') {
                  return (
                    <div key={field.id || field.field_key} className="space-y-1">
                      <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                        {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        name="fullName"
                        placeholder={field.placeholder || 'e.g. Dr. Samuel Adeleke'}
                        value={formData.fullName || ''}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        onBlur={() => handleBlur('fullName')}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition ${
                          errors.fullName ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white' : 'border-neutral-200 dark:border-neutral-700'
                        }`}
                      />
                      {errors.fullName && touched.fullName && (
                        <span className="text-[11px] text-neutral-900 dark:text-neutral-100 font-extrabold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.fullName}
                        </span>
                      )}
                    </div>
                  );
                }

                // 8. Photo Snapshot Type
                if (field.field_type === 'photo') {
                  return (
                    <div key={field.id || field.field_key} className="sm:col-span-2 space-y-1">
                      <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                        {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                      </label>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/40">
                        <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-neutral-900 dark:text-white text-xs block">
                            {field.field_name}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                            {field.placeholder || 'Live camera snapshot captured at reception desk'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 9. Generic Text / Email / Date / ID Number
                return (
                  <div key={field.id || field.field_key} className="space-y-1">
                    <label className="block text-neutral-900 dark:text-white font-extrabold text-xs mb-1">
                      {field.field_name} {isRequired && <span className="text-neutral-500 font-bold">*</span>}
                    </label>
                    <input
                      ref={field.field_key === 'idNumber' ? idNumberInputRef : undefined}
                      type={field.field_type === 'email' ? 'email' : field.field_type === 'date' ? 'date' : 'text'}
                      name={field.field_key}
                      placeholder={field.placeholder || `Enter ${field.field_name.toLowerCase()}`}
                      value={formData[field.field_key] || ''}
                      onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                      onBlur={() => handleBlur(field.field_key)}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition ${
                        fieldError ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white' : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    />
                    {fieldError && (
                      <span className="text-[11px] text-neutral-900 dark:text-neutral-100 font-extrabold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldError}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCheckInOpen(false)}
              className="px-4 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-extrabold shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Check-In & Issue Pass</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
