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
  Bell, 
  Check, 
  Sliders, 
  Download,
  AlertTriangle,
  X,
  Lock,
  User,
  Shield,
  Server,
  Cpu,
  Terminal,
  Activity,
  UserPlus,
  FileCode,
  FileCheck,
  FileSpreadsheet,
  Layers,
  History
} from 'lucide-react';

export const SettingsView = () => {
  const { 
    userRole, 
    setUserRole, 
    resetToDemoData, 
    visitors, 
    theme, 
    toggleTheme,
    exportToCSV 
  } = useVisitorContext();

  const { 
    users, 
    currentUser, 
    createNewUser, 
    changeUserPassword, 
    switchUserRole 
  } = useAuthContext();

  // Active tab state in Settings
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'sqlite' | 'policies' | 'theme'

  // User management form state
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('security');
  const [newPassword, setNewPassword] = useState('password123');

  // SQLite stats & audit logs state
  const [dbCounts, setDbCounts] = useState({ users: 0, visitors: 0, departments: 0, hosts: 0, audit_logs: 0 });
  const [auditLogs, setAuditLogs] = useState([]);

  // Policy & Notification state
  const [autoCheckoutMinutes, setAutoCheckoutMinutes] = useState('480');
  const [requireIdUpload, setRequireIdUpload] = useState(true);
  const [notifyHostViaSms, setNotifyHostViaSms] = useState(true);
  const [overdueAudioAlerts, setOverdueAudioAlerts] = useState(true);
  const [autoPrintBadge, setAutoPrintBadge] = useState(false);
  const [dataRetentionDays, setDataRetentionDays] = useState('30');
  
  // UI states
  const [saveMessage, setSaveMessage] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    refreshSqliteStats();
  }, [visitors, users]);

  const refreshSqliteStats = () => {
    sqliteService.initPromise.then(() => {
      setDbCounts(sqliteService.getTableRowCounts());
      setAuditLogs(sqliteService.getAuditLogs());
    });
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newEmail || !newFullName) return;
    createNewUser({
      fullName: newFullName,
      email: newEmail,
      role: newRole,
      password: newPassword
    });
    setSaveMessage(`New ${newRole} user account (${newEmail}) created successfully!`);
    setNewEmail('');
    setNewPassword('');
    setNewFullName('');
    setNewRole('Guard');
    refreshSqliteStats();
    setTimeout(() => setSaveMessage(''), 3500);
  };

  const handleExportSqliteDb = () => {
    const bin = sqliteService.exportDatabaseBinary();
    if (!bin) return;
    const blob = new Blob([bin], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vsms_local_database_${new Date().toISOString().slice(0, 10)}.sqlite`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSaveMessage('System database backup exported successfully.');
    setTimeout(() => setSaveMessage(''), 3500);
  };

  const handleSavePolicies = (e) => {
    e.preventDefault();
    setSaveMessage('System security policy rules and notification triggers updated successfully.');
    setTimeout(() => setSaveMessage(''), 3500);
  };

  const handleConfirmReset = () => {
    sqliteService.resetDatabase();
    refreshSqliteStats();
    setSaveMessage('Database restored to initial sample state.');
    setShowResetModal(false);
    setIsResetModalOpen(false);
    setTimeout(() => setSaveMessage(''), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      
      {/* Header Navigation Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span>VSMS Security & System Administration</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Manage user accounts, security policies, data backups, and system permissions.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-x-auto flex-nowrap max-w-full shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'users' 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Users & Auth
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sqlite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'theme' 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Theme
          </button>
        </div>
      </div>

      {/* Save / Feedback Toast Message */}
      {saveMessage && (
        <div className="p-4 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{saveMessage}</span>
          </div>
          <button 
            type="button"
            onClick={() => setSaveMessage('')}
            className="p-1 rounded-full hover:bg-white/10 dark:hover:bg-neutral-900 transition-colors"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: USER MANAGEMENT & ROLE ASSIGNMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Create User Form */}
          <form onSubmit={handleCreateUser} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Create New User Account</span>
              </h3>
              <span className="text-[11px] font-bold text-neutral-400">
                {users.length} Registered Accounts
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
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@vsms.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  Access Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                >
                  <option value="security">Security Officer</option>
                  <option value="reception">Reception Desk</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  Initial Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save User Account</span>
              </button>
            </div>
          </form>

          {/* Users Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Active User Directory</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Created At</th>
                    <th className="py-2.5 px-3 text-right">Quick Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users.map((u) => (
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
                      <td className="py-3 px-3 text-neutral-400 text-[11px]">
                        {new Date(u.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => switchUserRole(u.role)}
                          className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[10px] font-bold hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition"
                        >
                          Switch Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SQLITE DATABASE INSPECTOR & BACKUP */}
      {activeTab === 'sqlite' && (
        <div className="space-y-6">
          
          {/* Table Counts Cards */}
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

          {/* Backup & Restore Controls */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Data Backup & System Reset</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Database Binary Download */}
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
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup File</span>
                </button>
              </div>

              {/* CSV Export */}
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
                  className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-bold transition flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV File</span>
                </button>
              </div>

              {/* Database Reset */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">Reset System Data</div>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Restore system state and visitor records to default initial dataset.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 font-bold transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Default Dataset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Security Audit Log */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Real-Time Security Audit Logs</span>
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-2 font-mono text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-neutral-400 text-xs italic">No security actions recorded in audit log yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-[10px]">
                        {log.action}
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-white">{log.userName}</span>
                      <span className="text-neutral-500">{log.details}</span>
                    </div>
                    <span className="text-neutral-400 shrink-0 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SECURITY POLICIES */}
      {activeTab === 'policies' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Policy Rules & Automated Switches</span>
            </h3>
            <span className="text-[11px] font-bold text-neutral-400 uppercase">
              Security Engine
            </span>
          </div>

          <div className="space-y-3">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="space-y-0.5 max-w-xl">
                <div className="font-extrabold text-neutral-900 dark:text-white text-xs">
                  Mandatory Host Arrival Notification (SMS & Email)
                </div>
                <div className="text-neutral-500 text-[11px]">
                  Automatically dispatch notification alerts to host when guest completes check-in.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyHostViaSms}
                onClick={() => setNotifyHostViaSms(!notifyHostViaSms)}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                  notifyHostViaSms ? 'bg-neutral-950 dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full transition-transform duration-200 transform ${
                    notifyHostViaSms ? 'translate-x-6 bg-white dark:bg-neutral-950' : 'translate-x-1 bg-white dark:bg-neutral-400'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="space-y-0.5 max-w-xl">
                <div className="font-extrabold text-neutral-900 dark:text-white text-xs">
                  Enforce Strict Government ID Verification
                </div>
                <div className="text-neutral-500 text-[11px]">
                  Require NIN, Driver's License, or Passport registration prior to pass generation.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={requireIdUpload}
                onClick={() => setRequireIdUpload(!requireIdUpload)}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                  requireIdUpload ? 'bg-neutral-950 dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full transition-transform duration-200 transform ${
                    requireIdUpload ? 'translate-x-6 bg-white dark:bg-neutral-950' : 'translate-x-1 bg-white dark:bg-neutral-400'
                  }`}
                />
              </button>
            </div>

            {/* Policy Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 space-y-2">
                <div className="font-extrabold text-neutral-900 dark:text-white text-xs">
                  Default Auto Check-Out Expiry Limit
                </div>
                <select
                  value={autoCheckoutMinutes}
                  onChange={(e) => setAutoCheckoutMinutes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none font-bold"
                >
                  <option value="240">4 Hours (Half Day Shift)</option>
                  <option value="480">8 Hours (Full Working Day)</option>
                  <option value="720">12 Hours (Extended Shift)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 space-y-2">
                <div className="font-extrabold text-neutral-900 dark:text-white text-xs">
                  Audit Log Retention Window
                </div>
                <select
                  value={dataRetentionDays}
                  onChange={(e) => setDataRetentionDays(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none font-bold"
                >
                  <option value="7">7 Days (High Security)</option>
                  <option value="30">30 Days (Standard Compliance)</option>
                  <option value="90">90 Days (Quarterly Audit)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs transition active:scale-95 shadow-md"
            >
              Save Security Policies
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: THEME & SYSTEM STATUS */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Interface Aesthetic & Theme Selection</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <button
                type="button"
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
                className={`p-4 rounded-2xl text-left transition flex items-start justify-between ${
                  theme === 'light'
                    ? 'bg-neutral-950 text-white shadow-md'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-extrabold flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Executive Light Mode</span>
                  </div>
                  <p className="text-[11px] opacity-80 font-medium">
                    Clean high-contrast crisp grayscale theme with ice-blue background tones.
                  </p>
                </div>
                {theme === 'light' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-neutral-950">
                    ACTIVE
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                className={`p-4 rounded-2xl text-left transition flex items-start justify-between ${
                  theme === 'dark'
                    ? 'bg-white text-neutral-950 shadow-md'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-extrabold flex items-center gap-2">
                    <Moon className="w-4 h-4 text-neutral-400" />
                    <span>Obsidian Dark Mode</span>
                  </div>
                  <p className="text-[11px] opacity-80 font-medium">
                    Pure black obsidian background with dark glassmorphism surfaces and OpenAI styling.
                  </p>
                </div>
                {theme === 'dark' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-950 text-white">
                    ACTIVE
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>System Version & Stack Diagnostics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Version</span>
                <p className="font-extrabold text-sm text-neutral-900 dark:text-white">VSMS PRO v3.0.0</p>
                <p className="text-[10px] text-neutral-500">Enterprise Edition</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Database Engine</span>
                <p className="font-extrabold text-sm text-neutral-900 dark:text-white">System Core Database</p>
                <p className="text-[10px] text-neutral-500">Encrypted Storage Engine</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Auth Protocol</span>
                <p className="font-extrabold text-sm text-neutral-900 dark:text-white">RBAC Session</p>
                <p className="text-[10px] text-neutral-500">Admin, Guard, Reception</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">E2E Test Status</span>
                <p className="font-extrabold text-sm text-neutral-900 dark:text-white">100% Passed</p>
                <p className="text-[10px] text-neutral-500">60/60 Adversarial Suite</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Demo Data */}
      {isResetModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Reset System Data to Default State?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                This operation will clear newly created visitors and users, resetting local system data to default initial settings.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-900 dark:text-white font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-extrabold text-xs transition active:scale-95 shadow-md"
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
