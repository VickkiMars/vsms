import React, { useState, useEffect } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { useAuthContext } from '../context/AuthContext';
import { sqliteService } from '../db/sqliteDb';
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Key, 
  Moon, 
  Sun, 
  Check, 
  Sliders, 
  Download,
  X,
  User,
  Shield,
  Activity,
  UserPlus,
  FileSpreadsheet,
  Building2,
  SlidersHorizontal,
  Eye,
  QrCode,
  Trash2,
  Plus,
  Copy,
  Lock
} from 'lucide-react';

const AVAILABLE_FIELD_TYPES = [
  { value: 'text', label: 'Single-line Text' },
  { value: 'number', label: 'Numeric Value' },
  { value: 'email', label: 'Email Address' },
  { value: 'select', label: 'Dropdown Selector' },
  { value: 'checkbox', label: 'Boolean Checkbox' },
  { value: 'textarea', label: 'Multi-line Notes' },
  { value: 'date', label: 'Date / Time' },
  { value: 'photo', label: 'Photo / Snapshot' },
  { value: 'host_picker', label: 'Host Directory Picker' }
];

export const SettingsView = () => {
  const { 
    userRole, 
    setUserRole, 
    resetToDemoData, 
    visitors, 
    orgFields,
    updateOrgFields,
    theme, 
    toggleTheme,
    exportToCSV 
  } = useVisitorContext();

  const { 
    users, 
    currentUser, 
    currentOrg,
    provisionReceptionist,
    createNewUser, 
    switchUserRole 
  } = useAuthContext();

  const isReceptionist = currentUser?.role === 'reception';

  // Active tab state in Settings
  const [activeTab, setActiveTab] = useState('formBuilder'); // 'formBuilder' | 'receptionists' | 'orgProfile' | 'sqlite' | 'policies' | 'theme'

  // Receptionist provisioning form state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('reception123');
  const [staffLocation, setStaffLocation] = useState('Main Reception Desk');
  const [copiedStaffIdx, setCopiedStaffIdx] = useState(null);

  // SQLite stats & audit logs state
  const [dbCounts, setDbCounts] = useState({ users: 0, visitors: 0, departments: 0, hosts: 0, audit_logs: 0 });
  const [auditLogs, setAuditLogs] = useState([]);

  // Policy state
  const [autoCheckoutMinutes, setAutoCheckoutMinutes] = useState('480');
  const [dataRetentionDays, setDataRetentionDays] = useState('30');
  
  // Custom field draft state
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldDraft, setNewFieldDraft] = useState({
    field_name: '',
    field_type: 'text',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    optionsInput: 'General, Technical, Inspection',
    placeholder: ''
  });

  // UI states
  const [saveMessage, setSaveMessage] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    refreshSqliteStats();
  }, [visitors, users, currentOrg]);

  const refreshSqliteStats = () => {
    sqliteService.initPromise.then(() => {
      setDbCounts(sqliteService.getTableRowCounts(currentOrg?.id));
      setAuditLogs(sqliteService.getAuditLogs(currentOrg?.id));
    });
  };

  // Form Builder Handlers
  const currentTableSlotCount = (orgFields || []).filter(f => Number(f.show_in_table) === 1).length;

  const handleToggleTableSlot = (fieldId) => {
    try {
      const updated = orgFields.map(f => {
        if (f.id === fieldId) {
          const willBeActive = !f.show_in_table;
          return { ...f, show_in_table: willBeActive ? 1 : 0 };
        }
        return f;
      });
      updateOrgFields(updated);
      setSaveMessage('Table column slot configuration updated.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage(err.message || 'Cannot exceed 5 summary table display slots.');
      setTimeout(() => setSaveMessage(''), 3500);
    }
  };

  const handleToggleBadge = (fieldId) => {
    const updated = orgFields.map(f => {
      if (f.id === fieldId) {
        return { ...f, show_on_badge: f.show_on_badge ? 0 : 1 };
      }
      return f;
    });
    updateOrgFields(updated);
    setSaveMessage('Visitor pass badge configuration updated.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleToggleRequired = (fieldId) => {
    const updated = orgFields.map(f => {
      if (f.id === fieldId) {
        if (f.is_baseline) return f;
        return { ...f, is_required: f.is_required ? 0 : 1 };
      }
      return f;
    });
    updateOrgFields(updated);
    setSaveMessage('Field validation rule updated.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteField = (fieldId) => {
    const updated = orgFields.filter(f => f.id !== fieldId);
    updateOrgFields(updated);
    setSaveMessage('Custom field removed from active registration schema.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleCreateCustomField = () => {
    if (!newFieldDraft.field_name.trim()) return;
    const cleanKey = newFieldDraft.field_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    let parsedOptions = [];
    if (newFieldDraft.field_type === 'select') {
      parsedOptions = newFieldDraft.optionsInput.split(',').map(s => s.trim()).filter(Boolean);
      if (!parsedOptions.length) parsedOptions = ['Standard', 'Other'];
    }

    const canShowInTable = newFieldDraft.show_in_table && currentTableSlotCount < 5;

    const newFieldObj = {
      id: `FLD-${Date.now()}`,
      org_id: currentOrg?.id || 'ORG-DEMO-01',
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

    try {
      const updated = [...orgFields, newFieldObj];
      updateOrgFields(updated);
      setIsAddingField(false);
      setNewFieldDraft({
        field_name: '',
        field_type: 'text',
        is_required: 0,
        show_in_table: 0,
        show_on_badge: 0,
        optionsInput: 'General, Technical, Inspection',
        placeholder: ''
      });
      setSaveMessage(`New custom field "${newFieldObj.field_name}" added to visitor check-in form.`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage(err.message);
      setTimeout(() => setSaveMessage(''), 3500);
    }
  };

  // Staff Handlers
  const handleProvisionStaff = (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;
    provisionReceptionist({
      fullName: staffName,
      email: staffEmail,
      password: staffPassword,
      deskLocation: staffLocation
    });
    setSaveMessage(`Receptionist account for ${staffName} (${staffEmail}) provisioned successfully.`);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('reception123');
    setTimeout(() => setSaveMessage(''), 3500);
  };

  const copyStaffCredentials = (staff, idx) => {
    const text = `VSMS Staff Account:\nOrganization: ${currentOrg?.name}\nName: ${staff.fullName}\nEmail: ${staff.email}\nPassword: ${staff.password_hash || 'reception123'}\nDesk: ${staff.desk_location || 'Main Reception'}`;
    navigator.clipboard.writeText(text);
    setCopiedStaffIdx(idx);
    setTimeout(() => setCopiedStaffIdx(null), 2000);
  };

  const handleExportSqliteDb = () => {
    const bin = sqliteService.exportDatabaseBinary();
    if (!bin) return;
    const blob = new Blob([bin], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentOrg?.slug || 'vsms'}_database_backup_${new Date().toISOString().slice(0, 10)}.sqlite`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSaveMessage('System database backup exported successfully.');
    setTimeout(() => setSaveMessage(''), 3500);
  };

  const handleConfirmReset = () => {
    resetToDemoData();
    refreshSqliteStats();
    setSaveMessage('Database restored to initial demo state.');
    setIsResetModalOpen(false);
    setTimeout(() => setSaveMessage(''), 3500);
  };

  // If logged in as Receptionist, show friendly permissions gate
  if (isReceptionist) {
    return (
      <div className="p-8 max-w-2xl mx-auto rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-900 dark:text-white">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Administrator Console Restricted
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          You are currently signed in as a Front Desk Receptionist for <strong className="text-neutral-900 dark:text-white">{currentOrg?.name}</strong>. Dynamic Form Builder, Staff Provisioning, and Security Backups require Administrator authorization.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => switchUserRole('admin')}
            className="px-5 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs shadow-md transition hover:opacity-90 cursor-pointer"
          >
            Switch to Administrator Role
          </button>
        </div>
      </div>
    );
  }

  const orgUsers = (users || []).filter(u => !u.org_id || u.org_id === currentOrg?.id);

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      
      {/* Header Navigation Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span>Organization Management & Form Builder</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Workspace: <strong className="text-neutral-900 dark:text-white">{currentOrg?.name}</strong> • Configure dynamic visitor registration fields & provision front-desk staff.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-x-auto flex-nowrap max-w-full shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('formBuilder')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'formBuilder' 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Visitor Form Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receptionists')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'receptionists' 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Staff & Receptionists
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orgProfile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'orgProfile' 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Org Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sqlite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'sqlite' 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            System Data
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'policies' 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Policies
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'theme' 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Theme
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="p-4 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />
            <span>{saveMessage}</span>
          </div>
          <button 
            type="button"
            onClick={() => setSaveMessage('')}
            className="p-1 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: DYNAMIC VISITOR FORM BUILDER */}
      {activeTab === 'formBuilder' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Visitor Registration Form Schema</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Full Name and Phone Number are core baseline. Custom fields can be toggled for summary tables (up to 5 slots) and printed visitor passes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Table Slots: {currentTableSlotCount} / 5</span>
                </span>
              </div>
            </div>

            {/* Fields Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Field Label</th>
                    <th className="py-2.5 px-3">Input Type</th>
                    <th className="py-2.5 px-3 text-center">Required</th>
                    <th className="py-2.5 px-3 text-center">Table Display (Max 5)</th>
                    <th className="py-2.5 px-3 text-center">On Badge</th>
                    <th className="py-2.5 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {(orgFields || []).map((field) => (
                    <tr key={field.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                      <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <span>{field.field_name}</span>
                        {field.is_baseline ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-neutral-700">
                            Baseline
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                          {field.field_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={field.is_baseline}
                          onClick={() => handleToggleRequired(field.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                            field.is_required 
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950' 
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
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                            field.show_in_table 
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950' 
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBadge(field.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                            field.show_on_badge 
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950' 
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-700'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!field.is_baseline ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
                            title="Delete custom field"
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

            {/* Add Custom Field Inline Box */}
            {!isAddingField ? (
              <button
                type="button"
                onClick={() => setIsAddingField(true)}
                className="w-full py-3 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Custom Field to Registration Schema</span>
              </button>
            ) : (
              <div className="border border-neutral-300 dark:border-neutral-700 rounded-2xl p-4 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    New Field Specification
                  </h5>
                  <button onClick={() => setIsAddingField(false)} className="text-neutral-400 hover:text-neutral-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Field Label *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Laptop Serial Number"
                      value={newFieldDraft.field_name}
                      onChange={(e) => setNewFieldDraft(prev => ({ ...prev, field_name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Input Data Type *</label>
                    <select 
                      value={newFieldDraft.field_type}
                      onChange={(e) => setNewFieldDraft(prev => ({ ...prev, field_type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      {AVAILABLE_FIELD_TYPES.map(ft => (
                        <option key={ft.value} value={ft.value}>{ft.label} ({ft.value})</option>
                      ))}
                    </select>
                  </div>

                  {newFieldDraft.field_type === 'select' && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Dropdown Options (Comma separated)</label>
                      <input 
                        type="text"
                        placeholder="Option 1, Option 2, Option 3"
                        value={newFieldDraft.optionsInput}
                        onChange={(e) => setNewFieldDraft(prev => ({ ...prev, optionsInput: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2 flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input 
                        type="checkbox"
                        checked={!!newFieldDraft.is_required}
                        onChange={(e) => setNewFieldDraft(prev => ({ ...prev, is_required: e.target.checked ? 1 : 0 }))}
                      />
                      Required
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input 
                        type="checkbox"
                        checked={!!newFieldDraft.show_in_table}
                        disabled={currentTableSlotCount >= 5 && !newFieldDraft.show_in_table}
                        onChange={(e) => setNewFieldDraft(prev => ({ ...prev, show_in_table: e.target.checked ? 1 : 0 }))}
                      />
                      Show in Table
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input 
                        type="checkbox"
                        checked={!!newFieldDraft.show_on_badge}
                        onChange={(e) => setNewFieldDraft(prev => ({ ...prev, show_on_badge: e.target.checked ? 1 : 0 }))}
                      />
                      Print on Badge
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCustomField}
                    className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold"
                  >
                    Save Field
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECEPTIONISTS & STAFF PROVISIONING */}
      {activeTab === 'receptionists' && (
        <div className="space-y-6">
          <form onSubmit={handleProvisionStaff} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Provision Receptionist Account</span>
              </h3>
              <span className="text-[11px] font-bold text-neutral-400">
                Front-Desk Operator Role
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Officer Jane Doe"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="reception@org.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="text"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  Desk Terminal Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="North Lobby - Terminal 1"
                  value={staffLocation}
                  onChange={(e) => setStaffLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Provision Staff Member</span>
              </button>
            </div>
          </form>

          {/* Provisioned Users Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Active Organization Accounts</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Terminal Location</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {orgUsers.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                      <td className="py-3 px-3 font-mono text-[11px] font-bold text-neutral-500">{u.id}</td>
                      <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <img src={u.avatar} alt={u.fullName} className="w-6 h-6 rounded-full object-cover" />
                        <span>{u.fullName}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-neutral-600 dark:text-neutral-300">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                        {u.desk_location || 'Central Desk'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyStaffCredentials(u, idx)}
                            className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[10px] font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedStaffIdx === idx ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => switchUserRole(u.role)}
                            className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[10px] font-bold hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition cursor-pointer"
                          >
                            Switch
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATION PROFILE */}
      {activeTab === 'orgProfile' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <Building2 className="w-6 h-6 text-neutral-900 dark:text-white" />
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
                Organization Profile & Workspace Identity
              </h3>
              <p className="text-xs text-neutral-500">
                Primary settings for this tenant workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Legal Entity Name
              </span>
              <p className="text-sm font-black text-neutral-900 dark:text-white">{currentOrg?.name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Industry / Sector
              </span>
              <p className="text-sm font-black text-neutral-900 dark:text-white">{currentOrg?.industry || 'Enterprise'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Workspace Domain Slug
              </span>
              <p className="text-sm font-mono font-bold text-neutral-900 dark:text-white">{currentOrg?.slug}</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Official Security Contact
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">{currentOrg?.contact_email}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SQLITE DATABASE INSPECTOR & BACKUP */}
      {activeTab === 'sqlite' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">visitors</span>
              <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{dbCounts.visitors}</p>
              <p className="text-[10px] text-neutral-500">Records</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">users</span>
              <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{dbCounts.users}</p>
              <p className="text-[10px] text-neutral-500">Records</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">departments</span>
              <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{dbCounts.departments}</p>
              <p className="text-[10px] text-neutral-500">Records</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">hosts</span>
              <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{dbCounts.hosts}</p>
              <p className="text-[10px] text-neutral-500">Records</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">audit_logs</span>
              <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{dbCounts.audit_logs}</p>
              <p className="text-[10px] text-neutral-500">Records</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Data Backup & System Reset</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Export Database Backup</div>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Download complete system database backup file containing all user accounts, settings, and visitor logs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportSqliteDb}
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup File</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Export CSV Visitor Log</div>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Export RFC-4180 compliant CSV spreadsheet of visitor log records for external audit software.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV File</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Reset to Demo Data</div>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Restore system state and visitor records to default initial dataset.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: POLICIES */}
      {activeTab === 'policies' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
            Facility Security Policies & Retention
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold block text-neutral-700 dark:text-neutral-300">
                Automatic Visitor Departure Timeout (Minutes)
              </label>
              <input 
                type="number"
                value={autoCheckoutMinutes}
                onChange={(e) => setAutoCheckoutMinutes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold block text-neutral-700 dark:text-neutral-300">
                Data Retention Window (Days)
              </label>
              <input 
                type="number"
                value={dataRetentionDays}
                onChange={(e) => setDataRetentionDays(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-semibold"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: THEME & BUILD INFO */}
      {activeTab === 'theme' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
                Theme & Interface Appearance
              </h3>
              <p className="text-xs text-neutral-500">
                v2.0.0 Monochrome Edition • Build Timestamp: 2026-09-27
              </p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 text-xs space-y-2">
            <span className="font-extrabold uppercase text-[10px] text-neutral-400">
              Storage Usage & Metrics
            </span>
            <p className="text-neutral-600 dark:text-neutral-300">
              Local Storage SQLite Wasm active cache size: ~400 KB allocated.
            </p>
          </div>
        </div>
      )}

      {/* Accessible Confirmation Dialog Modal */}
      {isResetModalOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
        >
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Reset to Demo Data?
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              This will restore the database to the clean initial demo organization and sample visitor roster.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
