import initSqlJs from 'sql.js';
import { INITIAL_VISITORS, DEPARTMENTS, HOSTS } from '../data/initialData';

// Storage key for persisting SQLite DB binary in LocalStorage
const SQLITE_STORAGE_KEY = 'vsms_sqlite_db_bin';

// Default seed users for Auth system
export const SEED_USERS = [
  {
    id: 'USR-001',
    email: 'admin@vsms.com',
    password_hash: 'admin123',
    fullName: 'Chief Security Director',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
  {
    id: 'USR-002',
    email: 'guard@vsms.com',
    password_hash: 'guard123',
    fullName: 'Officer James Sterling',
    role: 'security',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
  {
    id: 'USR-003',
    email: 'reception@vsms.com',
    password_hash: 'reception123',
    fullName: 'Front Desk Reception',
    role: 'reception',
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

      // Clear legacy storage cache containing dummy records if not sanitized
      if (typeof window !== 'undefined' && !localStorage.getItem('vsms_v3_clean')) {
        localStorage.removeItem(SQLITE_STORAGE_KEY);
        localStorage.removeItem('vsms_visitors');
        localStorage.setItem('vsms_theme', 'light');
        localStorage.setItem('vsms_v3_clean', 'true');
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

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        fullName TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT,
        created_at TEXT,
        last_login TEXT
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY,
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
        avatar TEXT
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        head TEXT,
        floor TEXT
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS hosts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        deptId TEXT,
        email TEXT
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        userId TEXT,
        userName TEXT,
        action TEXT NOT NULL,
        details TEXT
      );
    `);
  }

  seedInitialData() {
    if (!this.db) return;

    // Seed users if empty
    const userCount = this.db.exec("SELECT COUNT(*) FROM users;")[0]?.values[0][0] || 0;
    if (userCount === 0) {
      const stmt = this.db.prepare(`
        INSERT INTO users (id, email, password_hash, fullName, role, avatar, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      SEED_USERS.forEach(u => {
        stmt.run([u.id, u.email, u.password_hash, u.fullName, u.role, u.avatar, u.created_at, u.last_login]);
      });
      stmt.free();
    }

    // Purge any legacy dummy visitor records
    try {
      this.db.run(`
        DELETE FROM visitors 
        WHERE id IN ('VIS-1001', 'VIS-1002', 'VIS-1003', 'VIS-1004', 'VIS-1005', 'VIS-1006')
           OR fullName IN (
             'Chief Marcus Vance', 'Dr. Aisha Sterling', 'Engr. David Okeke', 
             'Hon. Fatima Bello', 'Captain Emeka Nwosu', 'Barr. Chinedu Orji'
           );
      `);
    } catch (e) {
      console.warn('Error purging legacy dummy records:', e);
    }

    // Seed visitors if empty
    const visitorCount = this.db.exec("SELECT COUNT(*) FROM visitors;")[0]?.values[0][0] || 0;
    if (visitorCount === 0) {
      const stmt = this.db.prepare(`
        INSERT INTO visitors (id, fullName, phone, email, company, idType, idNumber, hostName, department, purpose, checkInTime, checkOutTime, status, badgeId, expectedDurationMinutes, vehiclePlate, notes, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      INITIAL_VISITORS.forEach(v => {
        stmt.run([
          v.id, v.fullName, v.phone, v.email, v.company, v.idType, v.idNumber,
          v.hostName, v.department, v.purpose, v.checkInTime, v.checkOutTime,
          v.status, v.badgeId, v.expectedDurationMinutes, v.vehiclePlate, v.notes, v.avatar
        ]);
      });
      stmt.free();
    }

    // Seed departments if empty
    const deptCount = this.db.exec("SELECT COUNT(*) FROM departments;")[0]?.values[0][0] || 0;
    if (deptCount === 0) {
      const stmt = this.db.prepare(`
        INSERT INTO departments (id, name, code, head, floor) VALUES (?, ?, ?, ?, ?)
      `);
      DEPARTMENTS.forEach(d => {
        stmt.run([d.id, d.name, d.code, d.head, d.floor]);
      });
      stmt.free();
    }

    // Seed hosts if empty
    const hostCount = this.db.exec("SELECT COUNT(*) FROM hosts;")[0]?.values[0][0] || 0;
    if (hostCount === 0) {
      const stmt = this.db.prepare(`
        INSERT INTO hosts (id, name, title, deptId, email) VALUES (?, ?, ?, ?, ?)
      `);
      HOSTS.forEach(h => {
        stmt.run([h.id, h.name, h.title, h.deptId, h.email]);
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

  // SQL Execution APIs
  getAllVisitors() {
    if (!this.db) return INITIAL_VISITORS;
    try {
      const res = this.db.exec("SELECT * FROM visitors ORDER BY checkInTime DESC;");
      if (!res.length) return [];
      const columns = res[0].columns;
      return res[0].values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    } catch (e) {
      console.error('SQLite getAllVisitors error:', e);
      return INITIAL_VISITORS;
    }
  }

  insertVisitor(visitor) {
    if (!this.db) return visitor;
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO visitors (id, fullName, phone, email, company, idType, idNumber, hostName, department, purpose, checkInTime, checkOutTime, status, badgeId, expectedDurationMinutes, vehiclePlate, notes, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        visitor.id, visitor.fullName, visitor.phone, visitor.email, visitor.company,
        visitor.idType, visitor.idNumber, visitor.hostName, visitor.department,
        visitor.purpose, visitor.checkInTime, visitor.checkOutTime, visitor.status,
        visitor.badgeId, visitor.expectedDurationMinutes, visitor.vehiclePlate,
        visitor.notes, visitor.avatar
      ]);
      stmt.free();
      this.saveToStorage();
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
    } catch (e) {
      console.error('SQLite updateVisitorStatus error:', e);
    }
  }

  getAllUsers() {
    if (!this.db) return SEED_USERS;
    try {
      const res = this.db.exec("SELECT * FROM users ORDER BY created_at ASC;");
      if (!res.length) return SEED_USERS;
      const columns = res[0].columns;
      return res[0].values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
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
        INSERT INTO users (id, email, password_hash, fullName, role, avatar, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        user.id, user.email, user.password_hash, user.fullName,
        user.role, user.avatar, user.created_at, user.last_login
      ]);
      stmt.free();
      this.saveToStorage();
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
    } catch (e) {
      console.error('SQLite updateUserPassword error:', e);
    }
  }

  logAction(userId, userName, action, details) {
    if (!this.db) return;
    try {
      const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const stmt = this.db.prepare(`
        INSERT INTO audit_logs (id, timestamp, userId, userName, action, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run([logId, new Date().toISOString(), userId, userName, action, details]);
      stmt.free();
      this.saveToStorage();
    } catch (e) {
      console.error('SQLite logAction error:', e);
    }
  }

  getAuditLogs() {
    if (!this.db) return [];
    try {
      const res = this.db.exec("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100;");
      if (!res.length) return [];
      const columns = res[0].columns;
      return res[0].values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    } catch (e) {
      console.error('SQLite getAuditLogs error:', e);
      return [];
    }
  }

  getTableRowCounts() {
    if (!this.db) return { users: 0, visitors: 0, departments: 0, hosts: 0, audit_logs: 0 };
    const getCount = table => {
      try {
        return this.db.exec(`SELECT COUNT(*) FROM ${table};`)[0]?.values[0][0] || 0;
      } catch {
        return 0;
      }
    };
    return {
      users: getCount('users'),
      visitors: getCount('visitors'),
      departments: getCount('departments'),
      hosts: getCount('hosts'),
      audit_logs: getCount('audit_logs')
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
}

export const sqliteService = new SQLiteService();
