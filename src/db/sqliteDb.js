import initSqlJs from 'sql.js';
import { INITIAL_VISITORS, DEPARTMENTS, HOSTS } from '../data/initialData';
import { supabase } from './supabaseClient';

// Storage key for persisting SQLite DB binary in LocalStorage
const SQLITE_STORAGE_KEY = 'vsms_sqlite_db_bin_v4';

// Seed Organizations (Empty by default: organizations onboard via Setup Wizard)
export const SEED_ORGS = [];

// Baseline & Dynamic Field Definitions for Seed Org
export const DEFAULT_ORG_FIELDS = [
  {
    id: 'FLD-01',
    org_id: '',
    field_key: 'fullName',
    field_name: 'Full Legal Name',
    field_type: 'text',
    is_required: 1,
    show_in_table: 1,
    show_on_badge: 1,
    options_json: null,
    placeholder: 'e.g. Dr. Samuel Adeleke',
    display_order: 1,
    is_baseline: 1
  },
  {
    id: 'FLD-02',
    org_id: '',
    field_key: 'phone',
    field_name: 'Phone / Mobile',
    field_type: 'text',
    is_required: 1,
    show_in_table: 1,
    show_on_badge: 1,
    options_json: null,
    placeholder: '+234 803 000 0000',
    display_order: 2,
    is_baseline: 1
  },
  {
    id: 'FLD-03',
    org_id: '',
    field_key: 'company',
    field_name: 'Company / Organization',
    field_type: 'text',
    is_required: 0,
    show_in_table: 1,
    show_on_badge: 1,
    options_json: null,
    placeholder: 'e.g. Acme Corp / Self-Employed',
    display_order: 3,
    is_baseline: 0
  },
  {
    id: 'FLD-04',
    org_id: '',
    field_key: 'host',
    field_name: 'Visiting Host / Staff',
    field_type: 'host_picker',
    is_required: 1,
    show_in_table: 1,
    show_on_badge: 1,
    options_json: null,
    placeholder: 'Select staff member to visit',
    display_order: 4,
    is_baseline: 0
  },
  {
    id: 'FLD-05',
    org_id: '',
    field_key: 'purpose',
    field_name: 'Purpose of Visit',
    field_type: 'select',
    is_required: 1,
    show_in_table: 1,
    show_on_badge: 0,
    options_json: JSON.stringify([
      'Official Meeting',
      'Job Interview',
      'Contractor / Technical Maintenance',
      'Document Delivery / Courier',
      'Regulatory Inspection / NDPR Audit',
      'Vendor Presentation'
    ]),
    placeholder: 'Select purpose',
    display_order: 5,
    is_baseline: 0
  },
  {
    id: 'FLD-06',
    org_id: '',
    field_key: 'expectedDurationMinutes',
    field_name: 'Expected Stay (Minutes)',
    field_type: 'number',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: null,
    placeholder: '60',
    display_order: 6,
    is_baseline: 0
  },
  {
    id: 'FLD-07',
    org_id: '',
    field_key: 'idType',
    field_name: 'Government ID Type',
    field_type: 'select',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: JSON.stringify([
      'National Identity Card (NIN)',
      'Driver’s License',
      'International Passport',
      'Work Permit',
      'Corporate Staff ID',
      'Other'
    ]),
    placeholder: 'Select ID type',
    display_order: 7,
    is_baseline: 0
  },
  {
    id: 'FLD-08',
    org_id: '',
    field_key: 'idNumber',
    field_name: 'ID / Document Number',
    field_type: 'text',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: null,
    placeholder: 'e.g. NIN-123456789',
    display_order: 8,
    is_baseline: 0
  },
  {
    id: 'FLD-09',
    org_id: '',
    field_key: 'vehiclePlate',
    field_name: 'Vehicle Plate Number',
    field_type: 'text',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: null,
    placeholder: 'e.g. KJA-104-AB',
    display_order: 9,
    is_baseline: 0
  },
  {
    id: 'FLD-10',
    org_id: '',
    field_key: 'notes',
    field_name: 'Security Notes / Remarks',
    field_type: 'textarea',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: null,
    placeholder: 'Any special remarks or security clearances',
    display_order: 10,
    is_baseline: 0
  }
];

// Default seed users for Auth system
export const SEED_USERS = [
  {
    id: 'USR-001',
    org_id: '',
    email: 'admin@vsms.com',
    password_hash: 'admin123',
    fullName: 'Chief Security Director',
    role: 'admin',
    desk_location: 'Executive HQ - Security Suite',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
  {
    id: 'USR-002',
    org_id: '',
    email: 'guard@vsms.com',
    password_hash: 'guard123',
    fullName: 'Officer James Sterling',
    role: 'security',
    desk_location: 'Gatehouse Alpha - North Gate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
  {
    id: 'USR-003',
    org_id: '',
    email: 'reception@vsms.com',
    password_hash: 'reception123',
    fullName: 'Front Desk Reception',
    role: 'reception',
    desk_location: 'Main Tower - Lobby Desk 1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  }
];

class SQLiteService {
  constructor() {
    this.db = null;
    this.SQL = null;
    this.initialized = false;
    this.initPromise = this.init();
  }

  async init() {
    try {
      this.SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      // Clear legacy storage cache if migration needed
      if (typeof window !== 'undefined' && !localStorage.getItem('vsms_v4_clean')) {
        localStorage.removeItem('vsms_sqlite_db_bin');
        localStorage.removeItem(SQLITE_STORAGE_KEY);
        localStorage.removeItem('vsms_visitors');
        localStorage.setItem('vsms_theme', 'light');
        localStorage.setItem('vsms_v4_clean', 'true');
      }

      // Try loading existing DB binary from LocalStorage
      const savedData = typeof window !== 'undefined' ? localStorage.getItem(SQLITE_STORAGE_KEY) : null;
      if (savedData) {
        try {
          const uInt8Array = new Uint8Array(JSON.parse(savedData));
          this.db = new this.SQL.Database(uInt8Array);
        } catch (err) {
          console.warn('Failed to parse saved SQLite DB binary, reinitializing schema:', err);
          this.db = new this.SQL.Database();
        }
      } else {
        this.db = new this.SQL.Database();
      }

      this.createTables();
      this.seedInitialData();
      if (supabase) {
        await this.syncFromSupabase();
      }
      this.saveToStorage();
      this.initialized = true;
      return true;
    } catch (e) {
      console.error('SQLite initialization failed, creating fallback DB instance:', e);
      if (this.SQL) {
        this.db = new this.SQL.Database();
        this.createTables();
        this.seedInitialData();
      }
      this.initialized = true;
      return false;
    }
  }

  createTables() {
    if (!this.db) return;

    // 1. Organizations
    this.db.run(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        industry TEXT,
        contact_email TEXT NOT NULL,
        logo_url TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // 2. Organization Dynamic Fields (Form Builder)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS organization_fields (
        id TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        field_key TEXT NOT NULL,
        field_name TEXT NOT NULL,
        field_type TEXT NOT NULL,
        is_required INTEGER NOT NULL DEFAULT 0,
        show_in_table INTEGER NOT NULL DEFAULT 0,
        show_on_badge INTEGER NOT NULL DEFAULT 0,
        options_json TEXT,
        placeholder TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_baseline INTEGER NOT NULL DEFAULT 0
      );
    `);

    // 3. Users (with multi-tenant org_id and desk_location)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        fullName TEXT NOT NULL,
        role TEXT NOT NULL,
        desk_location TEXT,
        avatar TEXT,
        created_at TEXT,
        last_login TEXT
      );
    `);

    // 4. Visitors (with org_id and custom_data_json for resilient dynamic values)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        fullName TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        company TEXT,
        idType TEXT,
        idNumber TEXT,
        hostName TEXT,
        department TEXT,
        purpose TEXT,
        checkInTime TEXT NOT NULL,
        checkOutTime TEXT,
        status TEXT NOT NULL,
        badgeId TEXT,
        expectedDurationMinutes INTEGER,
        vehiclePlate TEXT,
        notes TEXT,
        avatar TEXT,
        custom_data_json TEXT
      );
    `);

    // 5. Departments
    this.db.run(`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        head TEXT,
        floor TEXT
      );
    `);

    // 6. Hosts
    this.db.run(`
      CREATE TABLE IF NOT EXISTS hosts (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        name TEXT NOT NULL,
        title TEXT,
        deptId TEXT,
        email TEXT
      );
    `);

    // 7. Audit Logs
    this.db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        timestamp TEXT NOT NULL,
        userId TEXT,
        userName TEXT,
        action TEXT NOT NULL,
        details TEXT
      );
    `);

    // Safe column migrations for existing tables
    const safeAddColumn = (table, colDef) => {
      try {
        this.db.run(`ALTER TABLE ${table} ADD COLUMN ${colDef};`);
      } catch (err) {
        // Ignored: column exists
      }
    };
    safeAddColumn('users', 'org_id TEXT');
    safeAddColumn('users', 'desk_location TEXT');
    safeAddColumn('visitors', 'org_id TEXT');
    safeAddColumn('visitors', 'custom_data_json TEXT');
    safeAddColumn('departments', 'org_id TEXT');
    safeAddColumn('hosts', 'org_id TEXT');
    safeAddColumn('audit_logs', 'org_id TEXT');
  }

  seedInitialData() {
    if (!this.db) return;

    // Proactively purge any legacy dummy demo organization from older storage
    try {
      this.db.run("DELETE FROM organizations WHERE id = 'ORG-DEMO-01' OR slug = 'apex-global';");
      this.db.run("DELETE FROM organization_fields WHERE org_id = 'ORG-DEMO-01';");
      this.db.run("UPDATE users SET org_id = '' WHERE org_id = 'ORG-DEMO-01';");
      this.db.run("UPDATE visitors SET org_id = '' WHERE org_id = 'ORG-DEMO-01';");
      this.db.run("UPDATE departments SET org_id = '' WHERE org_id = 'ORG-DEMO-01';");
      this.db.run("UPDATE hosts SET org_id = '' WHERE org_id = 'ORG-DEMO-01';");
    } catch (e) {
      // Ignored
    }

    // Seed organizations (only if SEED_ORGS defined)
    const orgCount = this.db.exec("SELECT COUNT(*) FROM organizations;")[0]?.values[0][0] || 0;
    if (orgCount === 0 && SEED_ORGS.length > 0) {
      const stmt = this.db.prepare(`
        INSERT INTO organizations (id, name, slug, industry, contact_email, logo_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      SEED_ORGS.forEach(o => {
        stmt.run([o.id, o.name, o.slug, o.industry, o.contact_email, o.logo_url, o.created_at]);
      });
      stmt.free();
    }

    // Seed organization fields (template defaults only if orgs exist)
    const fieldCount = this.db.exec("SELECT COUNT(*) FROM organization_fields;")[0]?.values[0][0] || 0;
    if (fieldCount === 0 && SEED_ORGS.length > 0) {
      const stmt = this.db.prepare(`
        INSERT INTO organization_fields (id, org_id, field_key, field_name, field_type, is_required, show_in_table, show_on_badge, options_json, placeholder, display_order, is_baseline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      DEFAULT_ORG_FIELDS.forEach(f => {
        stmt.run([
          f.id, f.org_id, f.field_key, f.field_name, f.field_type,
          f.is_required, f.show_in_table, f.show_on_badge,
          f.options_json, f.placeholder, f.display_order, f.is_baseline
        ]);
      });
      stmt.free();
    }

    // Seed users if empty
    const userCount = this.db.exec("SELECT COUNT(*) FROM users;")[0]?.values[0][0] || 0;
    if (userCount === 0) {
      const stmt = this.db.prepare(`
        INSERT INTO users (id, org_id, email, password_hash, fullName, role, desk_location, avatar, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      SEED_USERS.forEach(u => {
        stmt.run([
          u.id, u.org_id || '', u.email, u.password_hash,
          u.fullName, u.role, u.desk_location || 'Main Reception',
          u.avatar, u.created_at, u.last_login
        ]);
      });
      stmt.free();
    }

    // Seed visitors if empty
    const visitorCount = this.db.exec("SELECT COUNT(*) FROM visitors;")[0]?.values[0][0] || 0;
    if (visitorCount === 0) {
      const stmt = this.db.prepare(`
        INSERT INTO visitors (id, org_id, fullName, phone, email, company, idType, idNumber, hostName, department, purpose, checkInTime, checkOutTime, status, badgeId, expectedDurationMinutes, vehiclePlate, notes, avatar, custom_data_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      INITIAL_VISITORS.forEach(v => {
        const customData = {
          company: v.company || '',
          host: v.hostName || '',
          department: v.department || '',
          purpose: v.purpose || '',
          expectedDurationMinutes: v.expectedDurationMinutes || 60,
          idType: v.idType || '',
          idNumber: v.idNumber || '',
          vehiclePlate: v.vehiclePlate || '',
          notes: v.notes || ''
        };
        stmt.run([
          v.id, '', v.fullName, v.phone, v.email, v.company,
          v.idType, v.idNumber, v.hostName, v.department, v.purpose,
          v.checkInTime, v.checkOutTime, v.status, v.badgeId,
          v.expectedDurationMinutes, v.vehiclePlate, v.notes, v.avatar,
          JSON.stringify(customData)
        ]);
      });
      stmt.free();
    }

    // Seed departments if empty
    const deptCount = this.db.exec("SELECT COUNT(*) FROM departments;")[0]?.values[0][0] || 0;
    if (deptCount === 0) {
      const stmt = this.db.prepare(`
        INSERT INTO departments (id, org_id, name, code, head, floor) VALUES (?, ?, ?, ?, ?, ?)
      `);
      DEPARTMENTS.forEach(d => {
        stmt.run([d.id, '', d.name, d.code, d.head, d.floor]);
      });
      stmt.free();
    }

    // Seed hosts if empty
    const hostCount = this.db.exec("SELECT COUNT(*) FROM hosts;")[0]?.values[0][0] || 0;
    if (hostCount === 0) {
      const stmt = this.db.prepare(`
        INSERT INTO hosts (id, org_id, name, title, deptId, email) VALUES (?, ?, ?, ?, ?, ?)
      `);
      HOSTS.forEach(h => {
        stmt.run([h.id, '', h.name, h.title, h.deptId, h.email]);
      });
      stmt.free();
    }
  }

  saveToStorage() {
    if (!this.db || typeof window === 'undefined') return;
    try {
      const data = this.db.export();
      const array = Array.from(data);
      localStorage.setItem(SQLITE_STORAGE_KEY, JSON.stringify(array));
    } catch (e) {
      console.warn('Failed to serialize SQLite database to LocalStorage:', e);
    }
  }

  // Helper row parser
  parseRows(res) {
    if (!res || !res.length) return [];
    const columns = res[0].columns;
    return res[0].values.map(row => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }

  // --- Multi-Tenant Organization APIs ---
  getAllOrganizations() {
    if (!this.db) return [];
    try {
      const res = this.db.exec("SELECT * FROM organizations ORDER BY created_at DESC;");
      return this.parseRows(res);
    } catch (e) {
      console.error('getAllOrganizations error:', e);
      return [];
    }
  }

  getOrganization(orgId) {
    if (!this.db || !orgId) return null;
    try {
      const stmt = this.db.prepare("SELECT * FROM organizations WHERE id = ? OR slug = ? LIMIT 1;");
      stmt.bind([orgId, orgId]);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    } catch (e) {
      console.error('getOrganization error:', e);
      return null;
    }
  }

  insertOrganization(org) {
    if (!this.db) return org;
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO organizations (id, name, slug, industry, contact_email, logo_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        org.id, org.name, org.slug, org.industry || 'General',
        org.contact_email, org.logo_url || '', org.created_at || new Date().toISOString()
      ]);
      stmt.free();
      this.saveToStorage();

      if (supabase) {
        supabase.from('organizations').upsert({
          id: org.id,
          name: org.name,
          slug: org.slug,
          industry: org.industry || 'General',
          contact_email: org.contact_email,
          logo_url: org.logo_url || '',
          created_at: org.created_at || new Date().toISOString()
        }).catch(err => console.warn('Supabase insertOrganization error:', err?.message || err));
      }
    } catch (e) {
      console.error('insertOrganization error:', e);
    }
    return org;
  }

  // --- Dynamic Form Schema APIs ---
  getOrganizationFields(orgId) {
    if (!this.db || !orgId) return DEFAULT_ORG_FIELDS;
    try {
      const stmt = this.db.prepare("SELECT * FROM organization_fields WHERE org_id = ? ORDER BY display_order ASC;");
      stmt.bind([orgId]);
      const fields = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        if (row.options_json) {
          try {
            row.options = JSON.parse(row.options_json);
          } catch {
            row.options = [];
          }
        } else {
          row.options = [];
        }
        fields.push(row);
      }
      stmt.free();

      // If this org has no fields yet, copy defaults
      if (!fields.length) {
        return this.initializeOrgFields(orgId, DEFAULT_ORG_FIELDS);
      }
      return fields;
    } catch (e) {
      console.error('getOrganizationFields error:', e);
      return DEFAULT_ORG_FIELDS;
    }
  }

  initializeOrgFields(orgId, fieldTemplates) {
    if (!this.db) return fieldTemplates;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO organization_fields (id, org_id, field_key, field_name, field_type, is_required, show_in_table, show_on_badge, options_json, placeholder, display_order, is_baseline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const createdFields = [];
      fieldTemplates.forEach((f, idx) => {
        const fieldId = `FLD-${Math.random().toString(36).substring(2, 9)}`;
        const optionsJson = Array.isArray(f.options) ? JSON.stringify(f.options) : (f.options_json || null);
        stmt.run([
          fieldId, orgId, f.field_key, f.field_name, f.field_type,
          f.is_required ? 1 : 0, f.show_in_table ? 1 : 0, f.show_on_badge ? 1 : 0,
          optionsJson, f.placeholder || '', idx + 1, f.is_baseline ? 1 : 0
        ]);
        createdFields.push({
          ...f,
          id: fieldId,
          org_id: orgId,
          display_order: idx + 1,
          options: Array.isArray(f.options) ? f.options : (optionsJson ? JSON.parse(optionsJson) : [])
        });
      });
      stmt.free();
      this.saveToStorage();

      if (supabase) {
        const payload = createdFields.map(f => ({
          id: f.id,
          org_id: orgId,
          field_key: f.field_key,
          field_name: f.field_name,
          field_type: f.field_type,
          is_required: f.is_required ? 1 : 0,
          show_in_table: f.show_in_table ? 1 : 0,
          show_on_badge: f.show_on_badge ? 1 : 0,
          options_json: Array.isArray(f.options) ? JSON.stringify(f.options) : (f.options_json || null),
          placeholder: f.placeholder || '',
          display_order: f.display_order,
          is_baseline: f.is_baseline ? 1 : 0
        }));
        supabase.from('organization_fields').upsert(payload)
          .catch(err => console.warn('Supabase initializeOrgFields error:', err?.message || err));
      }

      return createdFields;
    } catch (e) {
      console.error('initializeOrgFields error:', e);
      return fieldTemplates;
    }
  }

  saveOrganizationFields(orgId, fields) {
    if (!this.db) return fields;
    try {
      // Clear existing fields for this org and replace
      const delStmt = this.db.prepare("DELETE FROM organization_fields WHERE org_id = ?;");
      delStmt.run([orgId]);
      delStmt.free();

      const insStmt = this.db.prepare(`
        INSERT INTO organization_fields (id, org_id, field_key, field_name, field_type, is_required, show_in_table, show_on_badge, options_json, placeholder, display_order, is_baseline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      fields.forEach((f, idx) => {
        const fieldId = f.id || `FLD-${Math.random().toString(36).substring(2, 9)}`;
        const optionsJson = Array.isArray(f.options) ? JSON.stringify(f.options) : (f.options_json || null);
        insStmt.run([
          fieldId, orgId, f.field_key, f.field_name, f.field_type,
          f.is_required ? 1 : 0, f.show_in_table ? 1 : 0, f.show_on_badge ? 1 : 0,
          optionsJson, f.placeholder || '', idx + 1, f.is_baseline ? 1 : 0
        ]);
      });
      insStmt.free();
      this.saveToStorage();

      if (supabase) {
        const payload = fields.map((f, idx) => ({
          id: f.id || `FLD-${Math.random().toString(36).substring(2, 9)}`,
          org_id: orgId,
          field_key: f.field_key,
          field_name: f.field_name,
          field_type: f.field_type,
          is_required: f.is_required ? 1 : 0,
          show_in_table: f.show_in_table ? 1 : 0,
          show_on_badge: f.show_on_badge ? 1 : 0,
          options_json: Array.isArray(f.options) ? JSON.stringify(f.options) : (f.options_json || null),
          placeholder: f.placeholder || '',
          display_order: idx + 1,
          is_baseline: f.is_baseline ? 1 : 0
        }));
        supabase.from('organization_fields').delete().eq('org_id', orgId).then(() => {
          supabase.from('organization_fields').upsert(payload)
            .catch(err => console.warn('Supabase saveOrganizationFields upsert error:', err?.message || err));
        }).catch(err => console.warn('Supabase saveOrganizationFields delete error:', err?.message || err));
      }
    } catch (e) {
      console.error('saveOrganizationFields error:', e);
    }
    return fields;
  }

  // --- Visitor Management APIs (Multi-Tenant) ---
  getAllVisitors(orgId = null) {
    if (!this.db) return INITIAL_VISITORS;
    try {
      let query = "SELECT * FROM visitors";
      const params = [];
      if (orgId) {
        query += " WHERE org_id = ?";
        params.push(orgId);
      }
      query += " ORDER BY checkInTime DESC;";
      
      const stmt = this.db.prepare(query);
      if (params.length) stmt.bind(params);
      const visitors = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        // Parse custom_data_json if present
        if (row.custom_data_json) {
          try {
            row.custom_data = JSON.parse(row.custom_data_json);
          } catch {
            row.custom_data = {};
          }
        } else {
          row.custom_data = {
            company: row.company || '',
            host: row.hostName || '',
            department: row.department || '',
            purpose: row.purpose || '',
            idType: row.idType || '',
            idNumber: row.idNumber || '',
            expectedDurationMinutes: row.expectedDurationMinutes || 60,
            vehiclePlate: row.vehiclePlate || '',
            notes: row.notes || ''
          };
        }
        visitors.push(row);
      }
      stmt.free();
      return visitors;
    } catch (e) {
      console.error('SQLite getAllVisitors error:', e);
      return INITIAL_VISITORS;
    }
  }

  insertVisitor(visitor) {
    if (!this.db) return visitor;
    try {
      const customDataJson = visitor.custom_data_json || 
        JSON.stringify(visitor.custom_data || {
          company: visitor.company || '',
          host: visitor.hostName || visitor.host || '',
          department: visitor.department || '',
          purpose: visitor.purpose || '',
          idType: visitor.idType || '',
          idNumber: visitor.idNumber || '',
          expectedDurationMinutes: visitor.expectedDurationMinutes || 60,
          vehiclePlate: visitor.vehiclePlate || '',
          notes: visitor.notes || ''
        });

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO visitors (
          id, org_id, fullName, phone, email, company, idType, idNumber,
          hostName, department, purpose, checkInTime, checkOutTime, status,
          badgeId, expectedDurationMinutes, vehiclePlate, notes, avatar, custom_data_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        visitor.id,
        visitor.org_id || '',
        visitor.fullName,
        visitor.phone,
        visitor.email || '',
        visitor.company || '',
        visitor.idType || '',
        visitor.idNumber || '',
        visitor.hostName || visitor.host || '',
        visitor.department || '',
        visitor.purpose || '',
        visitor.checkInTime,
        visitor.checkOutTime || null,
        visitor.status || 'Checked-In',
        visitor.badgeId,
        visitor.expectedDurationMinutes || 60,
        visitor.vehiclePlate || '',
        visitor.notes || '',
        visitor.avatar || '',
        customDataJson
      ]);
      stmt.free();
      this.saveToStorage();

      if (supabase) {
        let customDataObj = null;
        try {
          customDataObj = typeof customDataJson === 'string' ? JSON.parse(customDataJson) : customDataJson;
        } catch {
          customDataObj = {};
        }
        supabase.from('visitors').upsert({
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
          custom_data_json: customDataObj
        }).catch(err => console.warn('Supabase insertVisitor error:', err?.message || err));
      }
    } catch (e) {
      console.error('SQLite insertVisitor error:', e);
    }
    return visitor;
  }

  updateVisitorStatus(id, status, checkOutTime = null) {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare(`
        UPDATE visitors SET status = ?, checkOutTime = ? WHERE id = ?
      `);
      stmt.run([status, checkOutTime, id]);
      stmt.free();
      this.saveToStorage();

      if (supabase) {
        supabase.from('visitors').update({ status, checkOutTime }).eq('id', id)
          .catch(err => console.warn('Supabase updateVisitorStatus error:', err?.message || err));
      }
    } catch (e) {
      console.error('SQLite updateVisitorStatus error:', e);
    }
  }

  // --- User & Staff Provisioning APIs ---
  getAllUsers(orgId = null) {
    if (!this.db) return SEED_USERS;
    try {
      let query = "SELECT * FROM users";
      const params = [];
      if (orgId) {
        query += " WHERE org_id = ?";
        params.push(orgId);
      }
      query += " ORDER BY created_at ASC;";
      
      const stmt = this.db.prepare(query);
      if (params.length) stmt.bind(params);
      const users = [];
      while (stmt.step()) {
        users.push(stmt.getAsObject());
      }
      stmt.free();
      return users.length ? users : SEED_USERS;
    } catch (e) {
      console.error('SQLite getAllUsers error:', e);
      return SEED_USERS;
    }
  }

  findUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  insertUser(user) {
    if (!this.db) return user;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (id, org_id, email, password_hash, fullName, role, desk_location, avatar, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        user.id,
        user.org_id || '',
        user.email,
        user.password_hash,
        user.fullName,
        user.role,
        user.desk_location || 'Main Desk',
        user.avatar || '',
        user.created_at || new Date().toISOString(),
        user.last_login || null
      ]);
      stmt.free();
      this.saveToStorage();

      if (supabase) {
        supabase.from('users').upsert({
          id: user.id,
          org_id: user.org_id || '',
          email: user.email,
          password_hash: user.password_hash,
          fullName: user.fullName,
          role: user.role,
          desk_location: user.desk_location || 'Main Desk',
          avatar: user.avatar || '',
          created_at: user.created_at || new Date().toISOString(),
          last_login: user.last_login || null
        }).catch(err => console.warn('Supabase insertUser error:', err?.message || err));
      }
    } catch (e) {
      console.error('SQLite insertUser error:', e);
    }
    return user;
  }

  updateUserPassword(userId, newPasswordHash) {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare("UPDATE users SET password_hash = ? WHERE id = ?;");
      stmt.run([newPasswordHash, userId]);
      stmt.free();
      this.saveToStorage();

      if (supabase) {
        supabase.from('users').update({ password_hash: newPasswordHash }).eq('id', userId)
          .catch(err => console.warn('Supabase updateUserPassword error:', err?.message || err));
      }
    } catch (e) {
      console.error('SQLite updateUserPassword error:', e);
    }
  }

  // --- Departments & Hosts ---
  getDepartments(orgId = null) {
    if (!this.db) return DEPARTMENTS;
    try {
      let query = "SELECT * FROM departments";
      const params = [];
      if (orgId) {
        query += " WHERE org_id = ?";
        params.push(orgId);
      }
      const stmt = this.db.prepare(query);
      if (params.length) stmt.bind(params);
      const list = [];
      while (stmt.step()) {
        list.push(stmt.getAsObject());
      }
      stmt.free();
      return list.length ? list : DEPARTMENTS;
    } catch (e) {
      return DEPARTMENTS;
    }
  }

  getHosts(orgId = null) {
    if (!this.db) return HOSTS;
    try {
      let query = "SELECT * FROM hosts";
      const params = [];
      if (orgId) {
        query += " WHERE org_id = ?";
        params.push(orgId);
      }
      const stmt = this.db.prepare(query);
      if (params.length) stmt.bind(params);
      const list = [];
      while (stmt.step()) {
        list.push(stmt.getAsObject());
      }
      stmt.free();
      return list.length ? list : HOSTS;
    } catch (e) {
      return HOSTS;
    }
  }

  logAction(userId, userName, action, details, orgId = '') {
    if (!this.db) return;
    try {
      const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const stmt = this.db.prepare(`
        INSERT INTO audit_logs (id, org_id, timestamp, userId, userName, action, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([logId, orgId, new Date().toISOString(), userId, userName, action, details]);
      stmt.free();
      this.saveToStorage();

      if (supabase) {
        supabase.from('audit_logs').insert([{
          id: logId,
          org_id: orgId || '',
          timestamp: new Date().toISOString(),
          userId,
          userName,
          action,
          details
        }]).catch(err => console.warn('Supabase logAction error:', err?.message || err));
      }
    } catch (e) {
      console.error('SQLite logAction error:', e);
    }
  }

  getAuditLogs(orgId = null) {
    if (!this.db) return [];
    try {
      let query = "SELECT * FROM audit_logs";
      const params = [];
      if (orgId) {
        query += " WHERE org_id = ?";
        params.push(orgId);
      }
      query += " ORDER BY timestamp DESC LIMIT 100;";
      const stmt = this.db.prepare(query);
      if (params.length) stmt.bind(params);
      const list = [];
      while (stmt.step()) {
        list.push(stmt.getAsObject());
      }
      stmt.free();
      return list;
    } catch (e) {
      console.error('SQLite getAuditLogs error:', e);
      return [];
    }
  }

  getTableRowCounts(orgId = null) {
    if (!this.db) return { users: 0, visitors: 0, departments: 0, hosts: 0, audit_logs: 0, organizations: 0 };
    const getCount = (table) => {
      try {
        let sql = `SELECT COUNT(*) FROM ${table}`;
        if (orgId && table !== 'organizations') {
          sql += ` WHERE org_id = '${orgId}'`;
        }
        return this.db.exec(sql)[0]?.values[0][0] || 0;
      } catch {
        return 0;
      }
    };
    return {
      users: getCount('users'),
      visitors: getCount('visitors'),
      departments: getCount('departments'),
      hosts: getCount('hosts'),
      audit_logs: getCount('audit_logs'),
      organizations: getCount('organizations')
    };
  }

  exportDatabaseBinary() {
    if (!this.db) return null;
    return this.db.export();
  }

  resetDatabase() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SQLITE_STORAGE_KEY);
    }
    if (this.SQL) {
      this.db = new this.SQL.Database();
      this.createTables();
      this.seedInitialData();
      this.saveToStorage();
    }
  }

  async syncFromSupabase() {
    if (!supabase || !this.db) return;
    try {
      const [orgs, fields, users, visitors, depts, hosts] = await Promise.all([
        supabase.from('organizations').select('*'),
        supabase.from('organization_fields').select('*'),
        supabase.from('users').select('*'),
        supabase.from('visitors').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('hosts').select('*'),
      ]);

      if (orgs.data?.length) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO organizations (id, name, slug, industry, contact_email, logo_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        orgs.data.forEach(o => {
          stmt.run([o.id, o.name, o.slug, o.industry || 'General', o.contact_email, o.logo_url || '', o.created_at]);
        });
        stmt.free();
      }

      if (fields.data?.length) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO organization_fields (id, org_id, field_key, field_name, field_type, is_required, show_in_table, show_on_badge, options_json, placeholder, display_order, is_baseline)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        fields.data.forEach(f => {
          stmt.run([f.id, f.org_id, f.field_key, f.field_name, f.field_type, f.is_required ? 1 : 0, f.show_in_table ? 1 : 0, f.show_on_badge ? 1 : 0, f.options_json, f.placeholder, f.display_order, f.is_baseline ? 1 : 0]);
        });
        stmt.free();
      }

      if (users.data?.length) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO users (id, org_id, email, password_hash, fullName, role, desk_location, avatar, created_at, last_login)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        users.data.forEach(u => {
          stmt.run([u.id, u.org_id, u.email, u.password_hash, u.fullName, u.role, u.desk_location || 'Main Desk', u.avatar || '', u.created_at, u.last_login]);
        });
        stmt.free();
      }

      if (visitors.data?.length) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO visitors (id, org_id, fullName, phone, email, company, idType, idNumber, hostName, department, purpose, checkInTime, checkOutTime, status, badgeId, expectedDurationMinutes, vehiclePlate, notes, avatar, custom_data_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        visitors.data.forEach(v => {
          const customDataStr = typeof v.custom_data_json === 'object' ? JSON.stringify(v.custom_data_json) : (v.custom_data_json || '{}');
          stmt.run([v.id, v.org_id || '', v.fullName, v.phone, v.email || '', v.company || '', v.idType || '', v.idNumber || '', v.hostName || '', v.department || '', v.purpose || '', v.checkInTime, v.checkOutTime || null, v.status || 'Checked-In', v.badgeId, v.expectedDurationMinutes || 60, v.vehiclePlate || '', v.notes || '', v.avatar || '', customDataStr]);
        });
        stmt.free();
      }

      if (depts.data?.length) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO departments (id, org_id, name, code, head, floor)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        depts.data.forEach(d => {
          stmt.run([d.id, d.org_id || '', d.name, d.code, d.head, d.floor]);
        });
        stmt.free();
      }

      if (hosts.data?.length) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO hosts (id, org_id, name, title, deptId, email)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        hosts.data.forEach(h => {
          stmt.run([h.id, h.org_id || '', h.name, h.title, h.deptId, h.email]);
        });
        stmt.free();
      }

      this.saveToStorage();
    } catch (err) {
      console.warn('Supabase sync warning:', err?.message || err);
    }
  }
}

export const sqliteService = new SQLiteService();
