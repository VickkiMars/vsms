/**
 * browserStorageFallback.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Resilient browser storage fallback layer for VSMS database operations.
 * When Supabase writes fail (offline, network error, authentication failure,
 * or unconfigured client), writes are safely intercepted and persisted into
 * browser storage (localStorage) alongside an opportunistic sync queue.
 *
 * Ensures zero data loss for front-desk guest registration, organization
 * setup, officer logs, and security surveillance status transitions.
 */

import { DEPARTMENTS, HOSTS } from '../data/initialData.js';

// Storage keys
export const STORAGE_KEYS = {
  ORGANIZATIONS: 'vsms_fallback_organizations',
  FIELDS_PREFIX: 'vsms_fallback_fields_',
  VISITORS: 'vsms_fallback_visitors',
  USERS: 'vsms_fallback_users',
  AUDIT_LOGS: 'vsms_fallback_audit_logs',
  PENDING_SYNC: 'vsms_pending_writes_queue',
};

/**
 * Safe accessor for localStorage across browser and test environments.
 */
function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

/**
 * Safely parse JSON from storage with default fallback.
 */
function readStorageJson(key, defaultValue = []) {
  const storage = getStorage();
  if (!storage) return defaultValue;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.warn(`[BrowserStorageFallback] Failed to parse key ${key}:`, err.message);
    return defaultValue;
  }
}

/**
 * Safely serialize and write JSON to storage.
 */
function writeStorageJson(key, data) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.warn(`[BrowserStorageFallback] Failed to write key ${key}:`, err.message);
    return false;
  }
}

export const browserStorageFallback = {
  // ── Organizations ──────────────────────────────────────────────────────────

  saveOrganizationFallback(org) {
    if (!org || !org.id) return org;
    const orgs = readStorageJson(STORAGE_KEYS.ORGANIZATIONS, []);
    const idx = orgs.findIndex(o => o.id === org.id);
    if (idx >= 0) {
      orgs[idx] = { ...orgs[idx], ...org };
    } else {
      orgs.push(org);
    }
    writeStorageJson(STORAGE_KEYS.ORGANIZATIONS, orgs);
    return org;
  },

  getOrganizationsFallback() {
    return readStorageJson(STORAGE_KEYS.ORGANIZATIONS, []);
  },

  getOrganizationFallback(orgId) {
    if (!orgId) return null;
    const orgs = readStorageJson(STORAGE_KEYS.ORGANIZATIONS, []);
    return orgs.find(o => o.id === orgId) || null;
  },

  // ── Organization Fields ────────────────────────────────────────────────────

  saveFieldsFallback(orgId, fields) {
    if (!orgId || !Array.isArray(fields)) return fields;
    const key = `${STORAGE_KEYS.FIELDS_PREFIX}${orgId}`;
    writeStorageJson(key, fields);
    return fields;
  },

  getFieldsFallback(orgId) {
    if (!orgId) return [];
    const key = `${STORAGE_KEYS.FIELDS_PREFIX}${orgId}`;
    return readStorageJson(key, []);
  },

  // ── Visitors ───────────────────────────────────────────────────────────────

  saveVisitorFallback(visitor) {
    if (!visitor || !visitor.id) return visitor;
    const visitors = readStorageJson(STORAGE_KEYS.VISITORS, []);
    const idx = visitors.findIndex(v => v.id === visitor.id);
    
    // Normalize custom_data
    let customDataObj = visitor.custom_data || visitor.custom_data_json || {};
    if (typeof customDataObj === 'string') {
      try { customDataObj = JSON.parse(customDataObj); } catch { customDataObj = {}; }
    }

    const normalized = {
      ...visitor,
      custom_data: customDataObj,
      custom_data_json: customDataObj,
    };

    if (idx >= 0) {
      visitors[idx] = { ...visitors[idx], ...normalized };
    } else {
      visitors.unshift(normalized);
    }
    writeStorageJson(STORAGE_KEYS.VISITORS, visitors);
    return normalized;
  },

  updateVisitorStatusFallback(id, status, checkOutTime = null) {
    if (!id) return;
    const visitors = readStorageJson(STORAGE_KEYS.VISITORS, []);
    const visitor = visitors.find(v => v.id === id);
    if (visitor) {
      visitor.status = status;
      if (checkOutTime !== undefined) {
        visitor.checkOutTime = checkOutTime;
      }
      writeStorageJson(STORAGE_KEYS.VISITORS, visitors);
    }
  },

  getVisitorsFallback(orgId = null) {
    const visitors = readStorageJson(STORAGE_KEYS.VISITORS, []);
    if (!orgId) return visitors;
    return visitors.filter(v => !v.org_id || v.org_id === orgId);
  },

  // ── Users ──────────────────────────────────────────────────────────────────

  saveUserFallback(user) {
    if (!user || !user.id) return user;
    const users = readStorageJson(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === user.id || (u.email && u.email === user.email));
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    writeStorageJson(STORAGE_KEYS.USERS, users);
    return user;
  },

  updateUserPasswordFallback(userId, newPasswordHash) {
    if (!userId) return;
    const users = readStorageJson(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.id === userId);
    if (user) {
      user.password_hash = newPasswordHash;
      writeStorageJson(STORAGE_KEYS.USERS, users);
    }
  },

  getUsersFallback(orgId = null) {
    const users = readStorageJson(STORAGE_KEYS.USERS, []);
    if (!orgId) return users;
    return users.filter(u => !u.org_id || u.org_id === orgId);
  },

  // ── Audit Logs ─────────────────────────────────────────────────────────────

  saveAuditLogFallback(logEntry) {
    if (!logEntry) return;
    const logs = readStorageJson(STORAGE_KEYS.AUDIT_LOGS, []);
    logs.unshift(logEntry);
    // Keep last 150 logs in browser storage
    if (logs.length > 150) logs.length = 150;
    writeStorageJson(STORAGE_KEYS.AUDIT_LOGS, logs);
    return logEntry;
  },

  getAuditLogsFallback(orgId = null) {
    const logs = readStorageJson(STORAGE_KEYS.AUDIT_LOGS, []);
    if (!orgId) return logs;
    return logs.filter(l => !l.org_id || l.org_id === orgId);
  },

  // ── Table Counts ───────────────────────────────────────────────────────────

  getCountsFallback(orgId = null) {
    const users = this.getUsersFallback(orgId).length;
    const visitors = this.getVisitorsFallback(orgId).length;
    const auditLogs = this.getAuditLogsFallback(orgId).length;
    const orgs = this.getOrganizationsFallback().length;
    return {
      users,
      visitors,
      departments: DEPARTMENTS.length,
      hosts: HOSTS.length,
      audit_logs: auditLogs,
      organizations: orgs,
    };
  },

  // ── Pending Sync Queue ─────────────────────────────────────────────────────

  enqueuePendingWrite(op) {
    if (!op || !op.type) return;
    const queue = readStorageJson(STORAGE_KEYS.PENDING_SYNC, []);
    const opEntry = {
      id: `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      retryCount: 0,
      ...op,
    };
    queue.push(opEntry);
    writeStorageJson(STORAGE_KEYS.PENDING_SYNC, queue);
    return opEntry;
  },

  getPendingWrites() {
    return readStorageJson(STORAGE_KEYS.PENDING_SYNC, []);
  },

  removePendingWrite(opId) {
    if (!opId) return;
    const queue = readStorageJson(STORAGE_KEYS.PENDING_SYNC, []);
    const filtered = queue.filter(op => op.id !== opId);
    writeStorageJson(STORAGE_KEYS.PENDING_SYNC, filtered);
  },

  clearPendingWrites() {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    }
  },

  // ── Reset / Cleanup ────────────────────────────────────────────────────────

  clearOrgFallback(orgId) {
    if (!orgId) return;
    const storage = getStorage();
    if (storage) {
      storage.removeItem(`${STORAGE_KEYS.FIELDS_PREFIX}${orgId}`);
    }

    // Filter out visitors belonging to this org
    const visitors = readStorageJson(STORAGE_KEYS.VISITORS, []);
    const keptVisitors = visitors.filter(v => v.org_id && v.org_id !== orgId);
    writeStorageJson(STORAGE_KEYS.VISITORS, keptVisitors);

    // Filter out audit logs belonging to this org
    const logs = readStorageJson(STORAGE_KEYS.AUDIT_LOGS, []);
    const keptLogs = logs.filter(l => l.org_id && l.org_id !== orgId);
    writeStorageJson(STORAGE_KEYS.AUDIT_LOGS, keptLogs);
  },
};
