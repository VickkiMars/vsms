/**
 * supabaseService.js
 * ──────────────────
 * Robust database service with automatic browser storage fallback and offline sync.
 * All reads and writes target Supabase first. Whenever a Supabase write fails
 * (network drop, offline mode, rate-limits, unconfigured credentials, or service errors),
 * data is immediately and safely persisted into browser storage (localStorage) and
 * enqueued in an opportunistic background sync queue.
 *
 * The API surface is 100% backward-compatible with all existing callers
 * (AuthContext, VisitorContext, SettingsView, tests).
 */

import { supabase } from './supabaseClient.js';
import { DEPARTMENTS, HOSTS } from '../data/initialData.js';
import { browserStorageFallback } from './browserStorageFallback.js';

// ─── Field helpers ────────────────────────────────────────────────────────────

/** Parse options_json → options array on every field row from Supabase. */
function hydrateField(row) {
  if (!row) return row;
  let options = [];
  if (row.options_json) {
    try { options = JSON.parse(row.options_json); } catch { options = []; }
  } else if (Array.isArray(row.options)) {
    options = row.options;
  }
  return { ...row, options };
}

// ─── Nano-ID helpers ──────────────────────────────────────────────────────────

const uid = (prefix = 'ID') =>
  `${prefix}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

// ─── Service class ────────────────────────────────────────────────────────────

class SupabaseService {
  constructor() {
    this.initPromise = Promise.resolve();
    this._isSyncing = false;

    // Listen for reconnection to replay pending writes automatically
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncPendingWrites().catch(() => {});
      });
    }
  }

  /**
   * Debounced trigger to attempt background replay of pending writes.
   */
  triggerSync() {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.syncPendingWrites().catch(() => {});
      }, 500);
    }
  }

  /**
   * Replay and flush queued writes to Supabase.
   */
  async syncPendingWrites() {
    if (!supabase || this._isSyncing) return;
    this._isSyncing = true;
    try {
      const pending = browserStorageFallback.getPendingWrites();
      if (!pending || pending.length === 0) return;

      for (const op of pending) {
        try {
          let error = null;
          if (op.type === 'insertOrganization') {
            const res = await supabase.from('organizations').upsert(op.payload);
            error = res.error;
          } else if (op.type === 'saveOrganizationFields') {
            await supabase.from('organization_fields').delete().eq('org_id', op.orgId);
            if (op.payload?.length) {
              const res = await supabase.from('organization_fields').insert(op.payload);
              error = res.error;
            }
          } else if (op.type === 'insertVisitor') {
            const res = await supabase.from('visitors').upsert(op.payload);
            error = res.error;
          } else if (op.type === 'updateVisitorStatus') {
            const res = await supabase.from('visitors').update({
              status: op.status,
              checkOutTime: op.checkOutTime
            }).eq('id', op.id);
            error = res.error;
          } else if (op.type === 'insertUser') {
            const res = await supabase.from('users').upsert(op.payload);
            error = res.error;
          } else if (op.type === 'updateUserPassword') {
            const res = await supabase.from('users').update({
              password_hash: op.newPasswordHash
            }).eq('id', op.userId);
            error = res.error;
          } else if (op.type === 'logAction') {
            const res = await supabase.from('audit_logs').insert([op.payload]);
            error = res.error;
          }

          if (!error) {
            browserStorageFallback.removePendingWrite(op.id);
          } else {
            // Stop loop on first persistent error (e.g. still offline)
            break;
          }
        } catch (opErr) {
          console.warn('[SyncQueue] Pending write replay deferred:', opErr.message);
          break;
        }
      }
    } finally {
      this._isSyncing = false;
    }
  }

  // ── Organizations ────────────────────────────────────────────────────────────

  async getAllOrganizations() {
    let remoteOrgs = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && Array.isArray(data)) {
          remoteOrgs = data;
        } else if (error) {
          console.warn('getAllOrganizations: Supabase read failed, relying on browser storage:', error.message);
        }
      } catch (err) {
        console.warn('getAllOrganizations: Network error, relying on browser storage:', err.message);
      }
    }

    const localOrgs = browserStorageFallback.getOrganizationsFallback();
    if (remoteOrgs.length === 0) return localOrgs;

    // Merge: remote takes precedence, append any local-only orgs
    const remoteIds = new Set(remoteOrgs.map(o => o.id));
    const merged = [...remoteOrgs];
    for (const local of localOrgs) {
      if (!remoteIds.has(local.id)) {
        merged.push(local);
      }
    }
    return merged;
  }

  async getOrganization(orgId) {
    if (!orgId) return null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('getOrganization: Supabase read failed:', err.message);
      }
    }
    return browserStorageFallback.getOrganizationFallback(orgId);
  }

  async insertOrganization(org) {
    if (!org) return org;
    let writeSucceeded = false;
    const payload = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      industry: org.industry || 'General',
      contact_email: org.contact_email,
      logo_url: org.logo_url || '',
      created_at: org.created_at || new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('organizations').upsert(payload);
        if (!error) {
          writeSucceeded = true;
          this.triggerSync();
        } else {
          console.warn('insertOrganization: Supabase write failed, engaging browser storage fallback:', error.message);
        }
      } catch (err) {
        console.warn('insertOrganization: Network error, engaging browser storage fallback:', err.message);
      }
    }

    // Always mirror to browser storage if remote write did not succeed
    if (!writeSucceeded) {
      browserStorageFallback.saveOrganizationFallback(org);
      browserStorageFallback.enqueuePendingWrite({
        type: 'insertOrganization',
        payload,
      });
    }

    return org;
  }

  // ── Organization Fields ──────────────────────────────────────────────────────

  async getOrganizationFields(orgId) {
    if (!orgId) return [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('organization_fields')
          .select('*')
          .eq('org_id', orgId)
          .order('display_order', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(hydrateField);
        }
      } catch (err) {
        console.warn('getOrganizationFields: Supabase read failed:', err.message);
      }
    }

    const localFields = browserStorageFallback.getFieldsFallback(orgId);
    return localFields && localFields.length > 0 ? localFields.map(hydrateField) : [];
  }

  async saveOrganizationFields(orgId, fields) {
    if (!orgId) return fields;
    let writeSucceeded = false;
    const payload = (fields || []).map((f, idx) => ({
      id: f.id || uid('FLD'),
      org_id: orgId,
      field_key: f.field_key,
      field_name: f.field_name,
      field_type: f.field_type,
      is_required: f.is_required ? 1 : 0,
      show_in_table: f.show_in_table ? 1 : 0,
      show_on_badge: f.show_on_badge ? 1 : 0,
      options_json: Array.isArray(f.options)
        ? JSON.stringify(f.options)
        : (f.options_json || null),
      placeholder: f.placeholder || '',
      display_order: idx + 1,
      is_baseline: f.is_baseline ? 1 : 0,
    }));

    if (supabase) {
      try {
        await supabase.from('organization_fields').delete().eq('org_id', orgId);
        if (payload.length > 0) {
          const { error } = await supabase.from('organization_fields').insert(payload);
          if (!error) {
            writeSucceeded = true;
            this.triggerSync();
          } else {
            console.warn('saveOrganizationFields: Supabase write failed, engaging browser storage fallback:', error.message);
          }
        } else {
          writeSucceeded = true;
        }
      } catch (err) {
        console.warn('saveOrganizationFields: Network error, engaging browser storage fallback:', err.message);
      }
    }

    if (!writeSucceeded) {
      browserStorageFallback.saveFieldsFallback(orgId, fields);
      browserStorageFallback.enqueuePendingWrite({
        type: 'saveOrganizationFields',
        orgId,
        payload,
      });
    }

    return fields;
  }

  /** Alias used by AuthContext when no custom fields provided during onboarding. */
  async initializeOrgFields(orgId, fieldTemplates) {
    return this.saveOrganizationFields(orgId, fieldTemplates);
  }

  // ── Visitors ─────────────────────────────────────────────────────────────────

  async getAllVisitors(orgId = null) {
    let remoteVisitors = [];
    if (supabase) {
      try {
        let query = supabase.from('visitors').select('*').order('checkInTime', { ascending: false });
        if (orgId) query = query.eq('org_id', orgId);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          remoteVisitors = data.map(v => ({
            ...v,
            custom_data: typeof v.custom_data_json === 'object' && v.custom_data_json !== null
              ? v.custom_data_json
              : (() => { try { return JSON.parse(v.custom_data_json || '{}'); } catch { return {}; } })(),
          }));
        } else if (error) {
          console.warn('getAllVisitors: Supabase read failed, relying on browser storage:', error.message);
        }
      } catch (err) {
        console.warn('getAllVisitors: Network error, relying on browser storage:', err.message);
      }
    }

    const localVisitors = browserStorageFallback.getVisitorsFallback(orgId);
    if (remoteVisitors.length === 0) return localVisitors;

    // Merge: remote takes precedence, merge local visitors not yet in remote
    const remoteMap = new Map(remoteVisitors.map(v => [v.id, v]));
    for (const local of localVisitors) {
      if (!remoteMap.has(local.id)) {
        remoteVisitors.push(local);
      } else {
        // If local contains newer check-out or overdue transition, merge forward
        const remote = remoteMap.get(local.id);
        if (local.checkOutTime && !remote.checkOutTime) {
          remote.checkOutTime = local.checkOutTime;
          remote.status = local.status;
        }
      }
    }

    return remoteVisitors;
  }

  async insertVisitor(visitor) {
    if (!visitor) return visitor;
    let writeSucceeded = false;
    let customDataObj = visitor.custom_data_json;
    if (typeof customDataObj === 'string') {
      try { customDataObj = JSON.parse(customDataObj); } catch { customDataObj = {}; }
    } else if (visitor.custom_data && typeof visitor.custom_data === 'object') {
      customDataObj = visitor.custom_data;
    }

    const payload = {
      id: visitor.id,
      org_id: visitor.org_id || '',
      fullName: visitor.fullName,
      phone: visitor.phone,
      email: visitor.email || '',
      company: visitor.company || '',
      idType: visitor.idType || '',
      idNumber: visitor.idNumber || '',
      hostName: visitor.hostName || visitor.host || '',
      department: visitor.department || '',
      purpose: visitor.purpose || '',
      checkInTime: visitor.checkInTime,
      checkOutTime: visitor.checkOutTime || null,
      status: visitor.status || 'Checked-In',
      badgeId: visitor.badgeId,
      expectedDurationMinutes: visitor.expectedDurationMinutes || 60,
      vehiclePlate: visitor.vehiclePlate || '',
      notes: visitor.notes || '',
      avatar: visitor.avatar || '',
      custom_data_json: customDataObj || {},
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('visitors').upsert(payload);
        if (!error) {
          writeSucceeded = true;
          this.triggerSync();
        } else {
          console.warn('insertVisitor: Supabase write failed, engaging browser storage fallback:', error.message);
        }
      } catch (err) {
        console.warn('insertVisitor: Network error, engaging browser storage fallback:', err.message);
      }
    }

    if (!writeSucceeded) {
      browserStorageFallback.saveVisitorFallback({
        ...visitor,
        custom_data_json: customDataObj,
        custom_data: customDataObj,
      });
      browserStorageFallback.enqueuePendingWrite({
        type: 'insertVisitor',
        payload,
      });
    }

    return visitor;
  }

  async updateVisitorStatus(id, status, checkOutTime = null) {
    if (!id) return;
    let writeSucceeded = false;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('visitors')
          .update({ status, checkOutTime })
          .eq('id', id);
        if (!error) {
          writeSucceeded = true;
          this.triggerSync();
        } else {
          console.warn('updateVisitorStatus: Supabase write failed, engaging browser storage fallback:', error.message);
        }
      } catch (err) {
        console.warn('updateVisitorStatus: Network error, engaging browser storage fallback:', err.message);
      }
    }

    if (!writeSucceeded) {
      browserStorageFallback.updateVisitorStatusFallback(id, status, checkOutTime);
      browserStorageFallback.enqueuePendingWrite({
        type: 'updateVisitorStatus',
        id,
        status,
        checkOutTime,
      });
    }
  }

  // ── Users ────────────────────────────────────────────────────────────────────

  async getAllUsers(orgId = null) {
    let remoteUsers = [];
    if (supabase) {
      try {
        let query = supabase.from('users').select('*').order('created_at', { ascending: true });
        if (orgId) query = query.eq('org_id', orgId);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          remoteUsers = data;
        } else if (error) {
          console.warn('getAllUsers: Supabase read failed, relying on browser storage:', error.message);
        }
      } catch (err) {
        console.warn('getAllUsers: Network error, relying on browser storage:', err.message);
      }
    }

    const localUsers = browserStorageFallback.getUsersFallback(orgId);
    if (remoteUsers.length === 0) return localUsers;

    const remoteIds = new Set(remoteUsers.map(u => u.id));
    const merged = [...remoteUsers];
    for (const local of localUsers) {
      if (!remoteIds.has(local.id)) {
        merged.push(local);
      }
    }
    return merged;
  }

  async insertUser(user) {
    if (!user) return user;
    let writeSucceeded = false;
    const payload = {
      id: user.id,
      org_id: user.org_id || '',
      email: user.email,
      password_hash: user.password_hash,
      fullName: user.fullName,
      role: user.role,
      desk_location: user.desk_location || 'Main Desk',
      avatar: user.avatar || '',
      created_at: user.created_at || new Date().toISOString(),
      last_login: user.last_login || null,
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('users').upsert(payload);
        if (!error) {
          writeSucceeded = true;
          this.triggerSync();
        } else {
          console.warn('insertUser: Supabase write failed, engaging browser storage fallback:', error.message);
        }
      } catch (err) {
        console.warn('insertUser: Network error, engaging browser storage fallback:', err.message);
      }
    }

    if (!writeSucceeded) {
      browserStorageFallback.saveUserFallback(user);
      browserStorageFallback.enqueuePendingWrite({
        type: 'insertUser',
        payload,
      });
    }

    return user;
  }

  async updateUserPassword(userId, newPasswordHash) {
    if (!userId) return;
    let writeSucceeded = false;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ password_hash: newPasswordHash })
          .eq('id', userId);
        if (!error) {
          writeSucceeded = true;
          this.triggerSync();
        } else {
          console.warn('updateUserPassword: Supabase write failed, engaging browser storage fallback:', error.message);
        }
      } catch (err) {
        console.warn('updateUserPassword: Network error, engaging browser storage fallback:', err.message);
      }
    }

    if (!writeSucceeded) {
      browserStorageFallback.updateUserPasswordFallback(userId, newPasswordHash);
      browserStorageFallback.enqueuePendingWrite({
        type: 'updateUserPassword',
        userId,
        newPasswordHash,
      });
    }
  }

  // ── Departments & Hosts ──────────────────────────────────────────────────────

  async getDepartments(orgId = null) {
    if (supabase) {
      try {
        let query = supabase.from('departments').select('*');
        if (orgId) query = query.eq('org_id', orgId);
        const { data, error } = await query;
        if (!error && data?.length) return data;
      } catch (err) {
        console.warn('getDepartments: Supabase read failed:', err.message);
      }
    }
    return DEPARTMENTS;
  }

  async getHosts(orgId = null) {
    if (supabase) {
      try {
        let query = supabase.from('hosts').select('*');
        if (orgId) query = query.eq('org_id', orgId);
        const { data, error } = await query;
        if (!error && data?.length) return data;
      } catch (err) {
        console.warn('getHosts: Supabase read failed:', err.message);
      }
    }
    return HOSTS;
  }

  // ── Audit Logs ───────────────────────────────────────────────────────────────

  async logAction(userId, userName, action, details, orgId = '') {
    const logEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: orgId || '',
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      details,
    };

    let writeSucceeded = false;
    if (supabase) {
      try {
        const { error } = await supabase.from('audit_logs').insert([logEntry]);
        if (!error) {
          writeSucceeded = true;
        } else {
          console.warn('logAction: Supabase write failed, engaging browser storage fallback:', error.message);
        }
      } catch (err) {
        console.warn('logAction: Network error, engaging browser storage fallback:', err.message);
      }
    }

    if (!writeSucceeded) {
      browserStorageFallback.saveAuditLogFallback(logEntry);
      browserStorageFallback.enqueuePendingWrite({
        type: 'logAction',
        payload: logEntry,
      });
    }
  }

  async getAuditLogs(orgId = null) {
    let remoteLogs = [];
    if (supabase) {
      try {
        let query = supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);
        if (orgId) query = query.eq('org_id', orgId);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          remoteLogs = data;
        }
      } catch (err) {
        console.warn('getAuditLogs: Supabase read failed:', err.message);
      }
    }

    const localLogs = browserStorageFallback.getAuditLogsFallback(orgId);
    if (remoteLogs.length === 0) return localLogs;

    const remoteIds = new Set(remoteLogs.map(l => l.id));
    const merged = [...remoteLogs];
    for (const local of localLogs) {
      if (!remoteIds.has(local.id)) {
        merged.push(local);
      }
    }
    return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);
  }

  // ── Stats (for SettingsView) ─────────────────────────────────────────────────

  async getTableRowCounts(orgId = null) {
    if (supabase) {
      try {
        const count = async (table, scoped = true) => {
          let q = supabase.from(table).select('id', { count: 'exact', head: true });
          if (scoped && orgId) q = q.eq('org_id', orgId);
          const { count: c, error } = await q;
          if (error) return null;
          return c || 0;
        };

        const [users, visitors, departments, hosts, audit_logs, organizations] = await Promise.all([
          count('users'),
          count('visitors'),
          count('departments'),
          count('hosts'),
          count('audit_logs'),
          count('organizations', false),
        ]);

        if (users !== null && visitors !== null) {
          return {
            users,
            visitors,
            departments: departments || DEPARTMENTS.length,
            hosts: hosts || HOSTS.length,
            audit_logs: audit_logs || 0,
            organizations: organizations || 0,
          };
        }
      } catch (err) {
        console.warn('getTableRowCounts: Supabase read failed:', err.message);
      }
    }

    return browserStorageFallback.getCountsFallback(orgId);
  }

  // ── No-ops kept for API compatibility ────────────────────────────────────────

  /** SQLite binary export no longer applicable. Returns null gracefully. */
  exportDatabaseBinary() { return null; }

  /** Reset: delete all rows for the current org from Supabase and clear browser storage fallback. */
  async resetDatabase(orgId) {
    if (supabase && orgId) {
      try {
        await Promise.all([
          supabase.from('visitors').delete().eq('org_id', orgId),
          supabase.from('organization_fields').delete().eq('org_id', orgId),
          supabase.from('audit_logs').delete().eq('org_id', orgId),
        ]);
      } catch (e) {
        console.warn('resetDatabase: Supabase cleanup error:', e.message);
      }
    }

    if (orgId) {
      browserStorageFallback.clearOrgFallback(orgId);
    }
  }
}

export const supabaseService = new SupabaseService();

// ── Re-export constants and fallback utilities ────────────────────────────────
export { DEFAULT_ORG_FIELDS } from '../data/initialData.js';
export { browserStorageFallback } from './browserStorageFallback.js';
