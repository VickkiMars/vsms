import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  AlertCircle,
  Eye,
  Sliders,
  QrCode,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_INDUSTRY_OPTIONS = [
  'Enterprise Software & Technology',
  'Healthcare & Medical Centers',
  'Banking & Financial Services',
  'Government & Public Sector',
  'Education & University Campuses',
  'Manufacturing & Logistics',
  'Corporate Real Estate & Co-Working',
  'Law & Professional Services',
  'Other'
];

const AVAILABLE_FIELD_TYPES = [
  { value: 'text', label: 'Single-line Text', desc: 'Short text such as company, title, or vehicle model' },
  { value: 'number', label: 'Numeric Value', desc: 'Numbers such as duration, quantity, or pass counter' },
  { value: 'email', label: 'Email Address', desc: 'Valid email format with automatic validation' },
  { value: 'select', label: 'Dropdown Selector', desc: 'Predefined options for visit purpose, category, etc.' },
  { value: 'checkbox', label: 'Boolean Toggle / Checkbox', desc: 'Yes/No consent, NDA agreement, or escort needed' },
  { value: 'textarea', label: 'Multi-line Notes', desc: 'Special security remarks or instructions' },
  { value: 'date', label: 'Date / Time', desc: 'Scheduled appointment or clearance expiry' },
  { value: 'photo', label: 'Photo / ID Snapshot', desc: 'Capture visitor face or ID card image' },
  { value: 'host_picker', label: 'Host Directory Picker', desc: 'Live employee typeahead linked to staff directory' }
];

export const OrgSetupWizardModal = () => {
  const { 
    isOrgWizardOpen, 
    setIsOrgWizardOpen, 
    createOrganizationWithAdmin 
  } = useAuthContext();

  const [step, setStep] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Industry dropdown options & custom entry
  const [industryOptions, setIndustryOptions] = useState(DEFAULT_INDUSTRY_OPTIONS);
  const [customIndustry, setCustomIndustry] = useState('');

  // Step 1: Org Details & Admin Account
  const [orgData, setOrgData] = useState({
    orgName: '',
    industry: DEFAULT_INDUSTRY_OPTIONS[0],
    slug: '',
    contactEmail: '',
    adminFullName: '',
    adminEmail: '',
    adminPassword: '',
    confirmAdminPassword: '',
    deskLocation: ''
  });

  // Step 2: Dynamic Visitor Schema Builder
  const [fields, setFields] = useState([
    {
      id: 'FLD-BASE-1',
      field_key: 'fullName',
      field_name: 'Full Legal Name',
      field_type: 'text',
      is_required: 1,
      show_in_table: 1,
      show_on_badge: 1,
      is_baseline: 1,
      placeholder: 'e.g. Dr. Samuel Adeleke'
    },
    {
      id: 'FLD-BASE-2',
      field_key: 'phone',
      field_name: 'Phone / Mobile',
      field_type: 'text',
      is_required: 1,
      show_in_table: 1,
      show_on_badge: 1,
      is_baseline: 1,
      placeholder: '+234 803 000 0000'
    },
    {
      id: 'FLD-CUSTOM-1',
      field_key: 'company',
      field_name: 'Company / Organization',
      field_type: 'text',
      is_required: 0,
      show_in_table: 1,
      show_on_badge: 1,
      is_baseline: 0,
      placeholder: 'e.g. Acme Corp'
    },
    {
      id: 'FLD-CUSTOM-2',
      field_key: 'host',
      field_name: 'Visiting Host / Staff',
      field_type: 'host_picker',
      is_required: 1,
      show_in_table: 1,
      show_on_badge: 1,
      is_baseline: 0,
      placeholder: 'Select staff member'
    },
    {
      id: 'FLD-CUSTOM-3',
      field_key: 'purpose',
      field_name: 'Purpose of Visit',
      field_type: 'select',
      options: ['Official Meeting', 'Contractor Maintenance', 'Job Interview', 'Delivery', 'Executive Briefing'],
      is_required: 1,
      show_in_table: 1,
      show_on_badge: 0,
      is_baseline: 0,
      placeholder: 'Select purpose'
    },
    {
      id: 'FLD-CUSTOM-4',
      field_key: 'expectedDurationMinutes',
      field_name: 'Expected Stay (Minutes)',
      field_type: 'number',
      is_required: 0,
      show_in_table: 0,
      show_on_badge: 0,
      is_baseline: 0,
      placeholder: '60'
    }
  ]);

  // New field draft state
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldDraft, setNewFieldDraft] = useState({
    field_name: '',
    field_type: 'text',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    optionsInput: 'Option A, Option B, Option C',
    placeholder: ''
  });

  // Step 3: Receptionist Accounts Provisioning
  const [receptionists, setReceptionists] = useState([]);

  const [newReceptionist, setNewReceptionist] = useState({
    fullName: '',
    email: '',
    password: '',
    deskLocation: ''
  });

  // Errors state
  const [stepErrors, setStepErrors] = useState('');

  if (!isOrgWizardOpen) return null;

  // Handle Org Name change with auto slug (emails remain placeholder only)
  const handleOrgNameChange = (val) => {
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    setOrgData(prev => ({
      ...prev,
      orgName: val,
      slug: generatedSlug
    }));
  };

  const handleIndustryChange = (e) => {
    const val = e.target.value;
    setOrgData(prev => ({ ...prev, industry: val }));
    if (val === 'Other') {
      setCustomIndustry('');
    }
  };

  const handleAddCustomIndustry = () => {
    const trimmed = customIndustry.trim();
    if (!trimmed) {
      setStepErrors('Please enter an industry/sector name.');
      return;
    }
    if (trimmed.toLowerCase() === 'other') {
      setStepErrors('Please specify a distinct industry/sector name.');
      return;
    }
    if (!industryOptions.includes(trimmed)) {
      const otherIdx = industryOptions.indexOf('Other');
      const updatedList = otherIdx !== -1
        ? [...industryOptions.slice(0, otherIdx), trimmed, 'Other']
        : [...industryOptions, trimmed];
      setIndustryOptions(updatedList);
    }
    setOrgData(prev => ({ ...prev, industry: trimmed }));
    setCustomIndustry('');
    setStepErrors('');
  };

  // Field Table Slot Counter (Max 5)
  const currentTableSlotCount = fields.filter(f => Number(f.show_in_table) === 1).length;

  const handleToggleTableSlot = (fieldId) => {
    setFields(prev => prev.map(f => {
      if (f.id === fieldId) {
        const willBeActive = !f.show_in_table;
        if (willBeActive && currentTableSlotCount >= 5) {
          setStepErrors('Table Display Limit Reached: Maximum of 5 fields can be shown in summary tables.');
          return f;
        }
        setStepErrors('');
        return { ...f, show_in_table: willBeActive ? 1 : 0 };
      }
      return f;
    }));
  };

  const handleToggleBadge = (fieldId) => {
    setFields(prev => prev.map(f => {
      if (f.id === fieldId) {
        return { ...f, show_on_badge: f.show_on_badge ? 0 : 1 };
      }
      return f;
    }));
  };

  const handleToggleRequired = (fieldId) => {
    setFields(prev => prev.map(f => {
      if (f.id === fieldId) {
        if (f.is_baseline) return f; // baseline name & phone are always required
        return { ...f, is_required: f.is_required ? 0 : 1 };
      }
      return f;
    }));
  };

  const handleDeleteField = (fieldId) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleCreateField = () => {
    if (!newFieldDraft.field_name.trim()) {
      setStepErrors('Field Label is required');
      return;
    }
    const cleanKey = newFieldDraft.field_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    let parsedOptions = [];
    if (newFieldDraft.field_type === 'select') {
      parsedOptions = newFieldDraft.optionsInput
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      if (parsedOptions.length === 0) parsedOptions = ['Standard', 'Other'];
    }

    const canShowInTable = newFieldDraft.show_in_table && currentTableSlotCount < 5;

    const newFieldObj = {
      id: `FLD-${Date.now()}`,
      field_key: cleanKey,
      field_name: newFieldDraft.field_name.trim(),
      field_type: newFieldDraft.field_type,
      is_required: newFieldDraft.is_required ? 1 : 0,
      show_in_table: canShowInTable ? 1 : 0,
      show_on_badge: newFieldDraft.show_on_badge ? 1 : 0,
      options: parsedOptions,
      placeholder: newFieldDraft.placeholder || `Enter ${newFieldDraft.field_name.toLowerCase()}`,
      is_baseline: 0
    };

    setFields(prev => [...prev, newFieldObj]);
    setIsAddingField(false);
    setNewFieldDraft({
      field_name: '',
      field_type: 'text',
      is_required: 0,
      show_in_table: 0,
      show_on_badge: 0,
      optionsInput: 'Option A, Option B, Option C',
      placeholder: ''
    });
    setStepErrors('');
  };

  // Add Receptionist handler
  const handleAddReceptionist = () => {
    if (!newReceptionist.fullName.trim() || !newReceptionist.email.trim()) {
      setStepErrors('Receptionist Full Name and Email are required');
      return;
    }
    setReceptionists(prev => [...prev, { ...newReceptionist }]);
    setNewReceptionist({
      fullName: '',
      email: '',
      password: 'reception123',
      deskLocation: `Reception Desk ${receptionists.length + 2}`
    });
    setStepErrors('');
  };

  const handleRemoveReceptionist = (idx) => {
    setReceptionists(prev => prev.filter((_, i) => i !== idx));
  };

  const copyCredentials = (rec, idx) => {
    const text = `VSMS Front Desk Credentials:\nOrganization: ${orgData.orgName || 'Workspace'}\nName: ${rec.fullName}\nEmail: ${rec.email}\nPassword: ${rec.password}\nLocation: ${rec.deskLocation}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Step Validation & Progression
  const goToNextStep = () => {
    setStepErrors('');
    if (step === 1) {
      if (!orgData.orgName.trim()) {
        setStepErrors('Organization Name is required.');
        return;
      }

      // Handle custom industry when "Other" is selected
      if (orgData.industry === 'Other') {
        const trimmedCustom = customIndustry.trim();
        if (trimmedCustom && trimmedCustom.toLowerCase() !== 'other') {
          if (!industryOptions.includes(trimmedCustom)) {
            const otherIdx = industryOptions.indexOf('Other');
            const updatedList = otherIdx !== -1
              ? [...industryOptions.slice(0, otherIdx), trimmedCustom, 'Other']
              : [...industryOptions, trimmedCustom];
            setIndustryOptions(updatedList);
          }
          orgData.industry = trimmedCustom;
          setOrgData(prev => ({ ...prev, industry: trimmedCustom }));
          setCustomIndustry('');
        } else {
          setStepErrors('Please enter your custom industry/sector or select an option from the list.');
          return;
        }
      }

      if (!orgData.contactEmail.trim() || !orgData.contactEmail.includes('@')) {
        setStepErrors('Valid Official Security Contact Email is required.');
        return;
      }
      if (!orgData.adminFullName.trim()) {
        setStepErrors('Admin Full Name is required.');
        return;
      }
      if (!orgData.adminEmail.trim() || !orgData.adminEmail.includes('@')) {
        setStepErrors('Valid Admin Email is required.');
        return;
      }
      if (!orgData.adminPassword) {
        setStepErrors('Admin Password is required.');
        return;
      }
      if (orgData.adminPassword.length < 6) {
        setStepErrors('Admin Password must be at least 6 characters long.');
        return;
      }
      if (!orgData.confirmAdminPassword) {
        setStepErrors('Please confirm your Admin Password.');
        return;
      }
      if (orgData.adminPassword !== orgData.confirmAdminPassword) {
        setStepErrors('Admin passwords do not match. Please verify and confirm.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (fields.length < 2) {
        setStepErrors('At least baseline fields must exist.');
        return;
      }
      setStep(3);
    }
  };

  // Final Submit: Launch Organization Workspace
  const handleFinishOnboarding = () => {
    try {
      const createdOrg = createOrganizationWithAdmin({
        orgName: orgData.orgName,
        slug: orgData.slug,
        industry: orgData.industry,
        contactEmail: orgData.contactEmail,
        adminFullName: orgData.adminFullName,
        adminEmail: orgData.adminEmail,
        adminPassword: orgData.adminPassword || 'admin123',
        deskLocation: orgData.deskLocation || 'Executive Security Desk',
        fields: fields,
        receptionists: receptionists
      });

      // Celebration Confetti (Monochrome)
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#000000', '#ffffff', '#737373', '#d4d4d4', '#262626']
        });
      } catch (err) {
        // Ignored
      }

      setIsOrgWizardOpen(false);
    } catch (err) {
      setStepErrors(err.message || 'Failed to complete organization onboarding');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center shadow-md font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
                Onboard New Organization
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold border border-neutral-200 dark:border-neutral-700">
                  Enterprise VMS
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Setup your facility workspace, customize check-in schema & provision receptionist roles
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsOrgWizardOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Indicator Bar */}
        <div className="px-6 py-3.5 bg-neutral-100/50 dark:bg-neutral-950/40 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-neutral-900 dark:text-neutral-100 font-bold' : 'text-neutral-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold' : step > 1 ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span>1. Organization & Admin Profile</span>
          </div>

          <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-neutral-900 dark:text-neutral-100 font-bold' : 'text-neutral-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold' : step > 2 ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span>2. Dynamic Visitor Form Builder</span>
          </div>

          <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-neutral-900 dark:text-neutral-100 font-bold' : 'text-neutral-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
              3
            </span>
            <span>3. Receptionist Staff Provisioning</span>
          </div>
        </div>

        {/* Error Banner */}
        {stepErrors && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center gap-3 text-neutral-900 dark:text-neutral-100 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{stepErrors}</span>
          </div>
        )}

        {/* Step Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Organization Details & Admin Profile */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 bg-neutral-50/50 dark:bg-neutral-900/40">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  Facility / Organization Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Organization Legal Name *
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Nexus Health System, Zenith Tower"
                      value={orgData.orgName}
                      onChange={(e) => handleOrgNameChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Industry / Sector
                    </label>
                    <select 
                      value={orgData.industry}
                      onChange={handleIndustryChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                    >
                      {industryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    {orgData.industry === 'Other' && (
                      <div className="mt-2 flex items-center gap-2 animate-fade-in">
                        <input 
                          type="text"
                          placeholder="Enter custom industry / sector..."
                          value={customIndustry}
                          onChange={(e) => setCustomIndustry(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomIndustry();
                            }
                          }}
                          className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomIndustry}
                          className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 shrink-0 cursor-pointer transition shadow-xs"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Workspace Identifier / Slug
                    </label>
                    <input 
                      type="text"
                      placeholder="nexus-health"
                      value={orgData.slug}
                      onChange={(e) => setOrgData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Official Security Contact Email *
                    </label>
                    <input 
                      type="email"
                      placeholder={orgData.slug ? `security@${orgData.slug}.com` : "security@organization.com"}
                      value={orgData.contactEmail}
                      onChange={(e) => setOrgData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Account Credentials */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 bg-neutral-50/50 dark:bg-neutral-900/40">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-900 dark:text-white" />
                  Primary Organization Administrator Account
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Administrator Full Name *
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Chief Security Officer Williams"
                      value={orgData.adminFullName}
                      onChange={(e) => setOrgData(prev => ({ ...prev, adminFullName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Admin Login Email *
                    </label>
                    <input 
                      type="email"
                      placeholder={orgData.slug ? `admin@${orgData.slug}.com` : "admin@organization.com"}
                      value={orgData.adminEmail}
                      onChange={(e) => setOrgData(prev => ({ ...prev, adminEmail: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Admin Password *
                    </label>
                    <input 
                      type="password"
                      placeholder="Enter admin password (min 6 characters)"
                      value={orgData.adminPassword}
                      onChange={(e) => setOrgData(prev => ({ ...prev, adminPassword: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Confirm Admin Password *
                    </label>
                    <input 
                      type="password"
                      placeholder="Re-enter admin password"
                      value={orgData.confirmAdminPassword}
                      onChange={(e) => setOrgData(prev => ({ ...prev, confirmAdminPassword: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Office / Desk Location
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Executive Security Directorate / Main Desk"
                      value={orgData.deskLocation}
                      onChange={(e) => setOrgData(prev => ({ ...prev, deskLocation: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Dynamic Visitor Form Schema Builder */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-100/70 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    Visitor Registration Schema Configuration
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Full Name & Phone are standard baseline. Configure all other fields, data types, and display slots.
                  </p>
                </div>

                {/* Table Slot Allocation Counter */}
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    currentTableSlotCount >= 5 
                      ? 'bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100' 
                      : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200'
                  }`}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Table Display Slots: {currentTableSlotCount} / 5</span>
                  </div>
                </div>
              </div>

              {/* Fields Table */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Field Name / Label</th>
                        <th className="py-3 px-3">Data Type</th>
                        <th className="py-3 px-3 text-center">Required</th>
                        <th className="py-3 px-3 text-center">Show in Table (Max 5)</th>
                        <th className="py-3 px-3 text-center">Show on Badge</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                      {fields.map((field) => (
                        <tr key={field.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <span>{field.field_name}</span>
                            {field.is_baseline ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-neutral-700">
                                Core Baseline
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[11px] border border-neutral-200 dark:border-neutral-700">
                              {field.field_type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              disabled={field.is_baseline}
                              onClick={() => handleToggleRequired(field.id)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-colors ${
                                field.is_required 
                                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs' 
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                              } ${field.is_baseline ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleTableSlot(field.id)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                                field.show_in_table 
                                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs' 
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                              }`}
                              title={field.show_in_table ? "Visible in summary table" : "Hidden from table summary"}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleBadge(field.id)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                                field.show_on_badge 
                                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs' 
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                              }`}
                              title={field.show_on_badge ? "Printed on visitor pass" : "Omitted from printed pass"}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {!field.is_baseline ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteField(field.id)}
                                className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                title="Delete Custom Field"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-neutral-300 dark:text-neutral-700 text-xs px-2">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Custom Field Inline Box */}
              {!isAddingField ? (
                <button
                  type="button"
                  onClick={() => setIsAddingField(true)}
                  className="w-full py-3.5 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Arbitrary Custom Field (Text, Select, Checkbox, Date, Photo, Host)</span>
                </button>
              ) : (
                <div className="border border-neutral-300 dark:border-neutral-700 rounded-2xl p-5 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                      New Custom Field Configuration
                    </h5>
                    <button 
                      onClick={() => setIsAddingField(false)}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Field Label / Name *
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Laptop Serial Number, NDA Signed"
                        value={newFieldDraft.field_name}
                        onChange={(e) => setNewFieldDraft(prev => ({ ...prev, field_name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Input Data Type *
                      </label>
                      <select 
                        value={newFieldDraft.field_type}
                        onChange={(e) => setNewFieldDraft(prev => ({ ...prev, field_type: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      >
                        {AVAILABLE_FIELD_TYPES.map(ft => (
                          <option key={ft.value} value={ft.value}>
                            {ft.label} ({ft.value})
                          </option>
                        ))}
                      </select>
                    </div>

                    {newFieldDraft.field_type === 'select' && (
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Dropdown Options (Comma separated)
                        </label>
                        <input 
                          type="text"
                          placeholder="Client, Contractor, Vendor, Auditor, VIP"
                          value={newFieldDraft.optionsInput}
                          onChange={(e) => setNewFieldDraft(prev => ({ ...prev, optionsInput: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Placeholder / Hint Text
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Scan barcode or enter text"
                        value={newFieldDraft.placeholder}
                        onChange={(e) => setNewFieldDraft(prev => ({ ...prev, placeholder: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
                        <input 
                          type="checkbox"
                          checked={!!newFieldDraft.is_required}
                          onChange={(e) => setNewFieldDraft(prev => ({ ...prev, is_required: e.target.checked ? 1 : 0 }))}
                          className="rounded text-neutral-900 focus:ring-neutral-900"
                        />
                        Required Field
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
                        <input 
                          type="checkbox"
                          checked={!!newFieldDraft.show_in_table}
                          disabled={currentTableSlotCount >= 5 && !newFieldDraft.show_in_table}
                          onChange={(e) => setNewFieldDraft(prev => ({ ...prev, show_in_table: e.target.checked ? 1 : 0 }))}
                          className="rounded text-neutral-900 focus:ring-neutral-900"
                        />
                        Show in Table
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
                        <input 
                          type="checkbox"
                          checked={!!newFieldDraft.show_on_badge}
                          onChange={(e) => setNewFieldDraft(prev => ({ ...prev, show_on_badge: e.target.checked ? 1 : 0 }))}
                          className="rounded text-neutral-900 focus:ring-neutral-900"
                        />
                        Print on Badge
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                      type="button"
                      onClick={() => setIsAddingField(false)}
                      className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateField}
                      className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold shadow-xs hover:opacity-95"
                    >
                      Save Custom Field
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Receptionist Staff Provisioning */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-neutral-900 dark:text-white" />
                      Provision Front Desk Receptionists
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Create receptionist accounts with designated desk terminals. Receptionists perform day-to-day visitor operations.
                    </p>
                  </div>
                </div>

                {/* Existing Provisioned Receptionists List */}
                <div className="space-y-3">
                  {receptionists.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-xs text-neutral-500 dark:text-neutral-400">
                      No front desk receptionists added yet. You can provision staff below or proceed to launch.
                    </div>
                  ) : (
                    receptionists.map((rec, idx) => (
                      <div 
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                            {rec.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                              <span>{rec.fullName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 font-medium">
                                {rec.deskLocation || 'Front Desk'}
                              </span>
                            </div>
                            <div className="text-neutral-500 dark:text-neutral-400 text-[11px] font-mono">
                              {rec.email} • Password: ••••••••
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => copyCredentials(rec, idx)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-1.5 text-[11px] font-semibold"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                                <span className="text-neutral-900 dark:text-white font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Credentials</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveReceptionist(idx)}
                            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Another Receptionist Box */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-3">
                    + Add Another Receptionist
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <input 
                      type="text"
                      placeholder="Full Name"
                      value={newReceptionist.fullName}
                      onChange={(e) => setNewReceptionist(prev => ({ ...prev, fullName: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                    <input 
                      type="email"
                      placeholder="reception@org.com"
                      value={newReceptionist.email}
                      onChange={(e) => setNewReceptionist(prev => ({ ...prev, email: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                    <input 
                      type="password"
                      placeholder="Password"
                      value={newReceptionist.password}
                      onChange={(e) => setNewReceptionist(prev => ({ ...prev, password: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                    />
                    <input 
                      type="text"
                      placeholder="e.g. Front Desk A / Terminal 1"
                      value={newReceptionist.deskLocation}
                      onChange={(e) => setNewReceptionist(prev => ({ ...prev, deskLocation: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddReceptionist}
                      className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Provision Staff Member</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ready to Launch Summary Box */}
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neutral-900 dark:text-white" />
                  Ready to Activate Organization Workspace
                </div>
                <p>
                  Finishing setup will configure your organization database, apply your dynamic custom fields to the Visitor Registration modal, and sign you in as the Administrator.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOrgWizardOpen(false)}
                className="px-4 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs font-semibold"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold shadow-md hover:opacity-95 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Step {step + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Organization Workspace</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
