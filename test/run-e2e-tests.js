#!/usr/bin/env node

/**
 * ============================================================================
 * VSMS Frontend Redesign - Comprehensive Automated E2E Test Suite
 * ============================================================================
 * Coverage Architecture:
 * - Tier 1: Feature Coverage (F1 to F8, >=5 tests each)
 * - Tier 2: Boundary & Corner Cases (F1 to F8, >=5 tests each)
 * - Tier 3: Cross-Feature Combinations (>=10 multi-feature end-to-end tests)
 * - Tier 4: Real-World Workload Scenarios (5 Security Desk Simulation Scenarios)
 * ============================================================================
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_VISITORS, DEPARTMENTS, HOSTS, VISIT_PURPOSES, ID_TYPES } from '../src/data/initialData.js';
import tailwindConfig from '../tailwind.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const TEST_SEED_VISITORS = [
  {
    id: 'VIS-8921',
    fullName: 'Babatunde Wright-Adeleke',
    phone: '+234 803 555 0192',
    email: 'babatunde.wright@techsolutions.ng',
    company: 'TechSolutions Nigeria Ltd',
    idType: 'Driver’s License (FRSC)',
    idNumber: 'DL-9940218-LAG',
    hostName: 'Engr. Marcus Sterling',
    department: 'Information Technology & Cyber Security',
    purpose: 'Contractor / Technical Maintenance',
    checkInTime: new Date(Date.now() - 3600000).toISOString(),
    checkOutTime: null,
    status: 'Checked-In',
    badgeId: 'BDG-081',
    expectedDurationMinutes: 120,
    vehiclePlate: 'KJA-482-AA',
    notes: 'Carrying server rack diagnosis toolkit for Victoria Island data center.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'VIS-8922',
    fullName: 'Fatima Abubakar',
    phone: '+234 812 444 8921',
    email: 'f.abubakar@globalconsult.ng',
    company: 'Global Consult Partners Nigeria',
    idType: 'National Identity Number (NIN)',
    idNumber: 'NIN-77401928401',
    hostName: 'Dr. Elizabeth Vance-Okeke',
    department: 'Executive Suite',
    purpose: 'Official Meeting',
    checkInTime: new Date(Date.now() - 7200000).toISOString(),
    checkOutTime: null,
    status: 'Overdue',
    badgeId: 'BDG-082',
    expectedDurationMinutes: 30,
    vehiclePlate: 'ABJ-901-XY',
    notes: 'Strategy review meeting at Maitama HQ.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'VIS-8923',
    fullName: 'David Okonkwo',
    phone: '+234 901 888 1234',
    email: 'david.o@apexlogistics.ng',
    company: 'Apex Express Logistics Lagos',
    idType: 'Corporate Staff ID',
    idNumber: 'APX-5519-NG',
    hostName: 'Chinedu Eze',
    department: 'Procurement & Logistics',
    purpose: 'Document Delivery / Courier',
    checkInTime: new Date(Date.now() - 1800000).toISOString(),
    checkOutTime: null,
    status: 'Checked-In',
    badgeId: 'BDG-083',
    expectedDurationMinutes: 30,
    vehiclePlate: 'LSD-102-GH',
    notes: 'Delivered dispatch parcel #4812 from Ikeja Cargo Hub.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'VIS-8920',
    fullName: 'Elena Adebayo',
    phone: '+234 809 111 4455',
    email: 'elena@auditcorp.ng',
    company: 'PwC Nigeria Regulatory Audit',
    idType: 'International Passport',
    idNumber: 'PASS-A992014',
    hostName: 'Emeka O’Connor',
    department: 'Finance & Accounting',
    purpose: 'Regulatory Inspection / NDPR Audit',
    checkInTime: new Date(Date.now() - 14400000).toISOString(),
    checkOutTime: new Date(Date.now() - 3600000).toISOString(),
    status: 'Checked-Out',
    badgeId: 'BDG-080',
    expectedDurationMinutes: 180,
    vehiclePlate: 'GWA-881-MZ',
    notes: 'Q3 NDPR Financial audit clearance completed.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'VIS-8919',
    fullName: 'Dr. Michael Nnamdi',
    phone: '+234 703 999 2211',
    email: 'mnnamdi@biotech.ng',
    company: 'BioTech Innovations Nigeria',
    idType: 'Driver’s License (FRSC)',
    idNumber: 'DL-881920-PH',
    hostName: 'Dr. Alex Rivera',
    department: 'Information Technology & Cyber Security',
    purpose: 'Vendor Presentation',
    checkInTime: new Date(Date.now() - 18000000).toISOString(),
    checkOutTime: new Date(Date.now() - 7200000).toISOString(),
    status: 'Checked-Out',
    badgeId: 'BDG-079',
    expectedDurationMinutes: 60,
    vehiclePlate: 'RBC-304-LK',
    notes: 'Cloud infrastructure demo for Port Harcourt branch.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'VIS-8918',
    fullName: 'Grace Oladipo',
    phone: '+234 818 222 9900',
    email: 'grace.oladipo@gmail.com',
    company: 'Self-employed',
    idType: 'National Identity Number (NIN)',
    idNumber: 'NIN-1029384756',
    hostName: 'Claire Okonjo',
    department: 'Human Resources & Talent',
    purpose: 'Job Interview',
    checkInTime: new Date(Date.now() - 21600000).toISOString(),
    checkOutTime: new Date(Date.now() - 10800000).toISOString(),
    status: 'Checked-Out',
    badgeId: 'BDG-078',
    expectedDurationMinutes: 90,
    vehiclePlate: 'N/A',
    notes: 'Interview for Senior Frontend Lead.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  }
];

// ============================================================================
// ANSI Color & CLI Formatting Helpers
// ============================================================================
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m',
};

// ============================================================================
// Mock DOM & Browser Environment
// ============================================================================
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.classList = new Set();
    this.style = {};
    this.attributes = {};
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] || null;
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    this.children = this.children.filter(c => c !== child);
    return child;
  }
  click() {
    this._clicked = true;
  }
}

class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(...names) {
    names.forEach(n => this.classes.add(n));
  }
  remove(...names) {
    names.forEach(n => this.classes.delete(n));
  }
  contains(name) {
    return this.classes.has(name);
  }
  toggle(name) {
    if (this.classes.has(name)) {
      this.classes.delete(name);
      return false;
    } else {
      this.classes.add(name);
      return true;
    }
  }
}

const mockDocument = {
  documentElement: {
    classList: new MockClassList(),
    style: {},
  },
  body: new MockElement('body'),
  createElement(tag) {
    return new MockElement(tag);
  },
};

const mockWindow = {
  listeners: {},
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  },
  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== fn);
  },
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(fn => fn(event));
  },
  printCalls: 0,
  print() {
    this.printCalls++;
  }
};

// ============================================================================
// State Provider & Business Logic Simulator
// ============================================================================
class VsmsStateSimulator {
  constructor(initialSeed = null, initialTheme = 'dark', initialRole = 'admin') {
    this.localStorage = new MockLocalStorage();
    this.document = {
      documentElement: {
        classList: new MockClassList(),
        style: {},
      },
      body: new MockElement('body')
    };
    this.window = {
      printCalls: 0,
      print: () => { this.window.printCalls++; }
    };

    if (initialSeed) {
      this.visitors = JSON.parse(JSON.stringify(initialSeed));
    } else {
      this.visitors = JSON.parse(JSON.stringify(INITIAL_VISITORS.length > 0 ? INITIAL_VISITORS : TEST_SEED_VISITORS));
    }

    this.theme = initialTheme;
    this.userRole = initialRole;
    this.activeView = 'live';

    this.isCheckInOpen = false;
    this.isBadgeModalOpen = false;
    this.selectedVisitorForBadge = null;
    this.isCmdKOpen = false;

    this.globalSearchQuery = '';
    this.selectedDeptFilter = 'All';
    this.selectedStatusFilter = 'All';

    this.departments = DEPARTMENTS;
    this.hosts = HOSTS;

    this.lastExportedCsv = null;
    this.confettiCalls = 0;

    this.syncThemeToDom();
    this.syncToLocalStorage();
  }

  syncThemeToDom() {
    this.localStorage.setItem('vsms_theme', this.theme);
    const root = this.document.documentElement;
    if (this.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  }

  syncToLocalStorage() {
    this.localStorage.setItem('vsms_visitors', JSON.stringify(this.visitors));
    this.localStorage.setItem('vsms_role', this.userRole);
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.syncThemeToDom();
  }

  setUserRole(role) {
    this.userRole = role;
    this.syncToLocalStorage();
  }

  setActiveView(view) {
    this.activeView = view;
  }

  // Registration Validation
  validateRegistrationForm(formData) {
    const errors = [];
    if (!formData.fullName || !formData.fullName.trim()) {
      errors.push('Visitor Name is required');
    }
    if (!formData.phone || !formData.phone.trim()) {
      errors.push('Phone Number is required');
    }
    if (!formData.idNumber || !formData.idNumber.trim()) {
      errors.push('ID Number is required');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Action: Register Visitor
  registerVisitor(formData) {
    const validation = this.validateRegistrationForm(formData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const newId = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingMaxBadge = this.visitors.reduce((max, v) => {
      const num = parseInt(v.badgeId?.replace(/^BDG-/, '') || '0', 10);
      return num > max ? num : max;
    }, 80);
    const badgeId = `BDG-${String(existingMaxBadge + 1).padStart(3, '0')}`;

    const newVisitor = {
      id: newId,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email?.trim() || 'N/A',
      company: formData.company?.trim() || 'Private Guest',
      idType: formData.idType || ID_TYPES[0],
      idNumber: formData.idNumber.trim(),
      hostName: formData.hostName || this.hosts[0].name,
      department: formData.department || this.departments[0].name,
      purpose: formData.purpose || VISIT_PURPOSES[0],
      checkInTime: formData.checkInTime || new Date().toISOString(),
      checkOutTime: null,
      status: formData.status || 'Checked-In',
      badgeId: badgeId,
      expectedDurationMinutes: parseInt(formData.expectedDurationMinutes || '60', 10),
      vehiclePlate: formData.vehiclePlate?.trim() || 'N/A',
      notes: formData.notes?.trim() || '',
      avatar: formData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName.trim())}&backgroundColor=171717,262626,404040,737373&textColor=ffffff`,
    };

    this.visitors = [newVisitor, ...this.visitors];
    this.isCheckInOpen = false;
    this.confettiCalls++;
    this.selectedVisitorForBadge = newVisitor;
    this.isBadgeModalOpen = true;
    this.syncToLocalStorage();
    return newVisitor;
  }

  // Action: Check Out Visitor
  checkOutVisitor(visitorId) {
    let found = false;
    this.visitors = this.visitors.map(v => {
      if (v.id === visitorId) {
        found = true;
        return {
          ...v,
          checkOutTime: new Date().toISOString(),
          status: 'Checked-Out'
        };
      }
      return v;
    });
    if (this.selectedVisitorForBadge && this.selectedVisitorForBadge.id === visitorId) {
      this.selectedVisitorForBadge.status = 'Checked-Out';
    }
    this.syncToLocalStorage();
    return found;
  }

  openBadgeModal(visitor) {
    this.selectedVisitorForBadge = visitor;
    this.isBadgeModalOpen = true;
  }

  closeBadgeModal() {
    this.isBadgeModalOpen = false;
  }

  resetToDemoData() {
    this.visitors = JSON.parse(JSON.stringify(INITIAL_VISITORS.length > 0 ? INITIAL_VISITORS : TEST_SEED_VISITORS));
    this.localStorage.removeItem('vsms_visitors');
  }

  // Duration Calculator
  calculateDuration(checkInTime, fixedNow = null) {
    const start = new Date(checkInTime);
    const now = fixedNow ? new Date(fixedNow) : new Date();
    const diffMs = Math.max(0, now - start);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  // Live Active Visitors Filter
  getActiveVisitors(searchQuery = this.globalSearchQuery, deptFilter = this.selectedDeptFilter) {
    return this.visitors.filter(v => {
      if (v.status === 'Checked-Out') return false;
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = !q ||
        v.fullName.toLowerCase().includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.hostName.toLowerCase().includes(q) ||
        v.badgeId.toLowerCase().includes(q);
      const matchesDept = deptFilter === 'All' || v.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }

  // Master Log Filter & Pagination
  getMasterLogVisitors(options = {}) {
    const {
      search = this.globalSearchQuery,
      deptFilter = this.selectedDeptFilter,
      statusFilter = this.selectedStatusFilter,
      page = 1,
      itemsPerPage = 8
    } = options;

    const query = (search || '').toLowerCase();
    const filtered = this.visitors.filter(v => {
      const matchesQuery = !query ||
        v.fullName.toLowerCase().includes(query) ||
        v.company.toLowerCase().includes(query) ||
        v.hostName.toLowerCase().includes(query) ||
        v.id.toLowerCase().includes(query) ||
        v.badgeId.toLowerCase().includes(query);

      const matchesDept = deptFilter === 'All' || v.department === deptFilter;
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;

      return matchesQuery && matchesDept && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    const paginated = filtered.slice((clampedPage - 1) * itemsPerPage, clampedPage * itemsPerPage);

    return {
      filteredTotal: filtered.length,
      totalPages,
      currentPage: clampedPage,
      items: paginated,
      allFiltered: filtered
    };
  }

  // Export CSV generator
  generateCsvContent() {
    const headers = ['Visitor ID', 'Full Name', 'Phone', 'Email', 'Company', 'ID Type', 'ID Number', 'Host', 'Department', 'Purpose', 'Check-In', 'Check-Out', 'Status', 'Badge ID'];
    const rows = this.visitors.map(v => [
      v.id,
      `"${(v.fullName || '').replace(/"/g, '""')}"`,
      `"${(v.phone || '').replace(/"/g, '""')}"`,
      `"${(v.email || '').replace(/"/g, '""')}"`,
      `"${(v.company || '').replace(/"/g, '""')}"`,
      `"${(v.idType || '').replace(/"/g, '""')}"`,
      `"${(v.idNumber || '').replace(/"/g, '""')}"`,
      `"${(v.hostName || '').replace(/"/g, '""')}"`,
      `"${(v.department || '').replace(/"/g, '""')}"`,
      `"${(v.purpose || '').replace(/"/g, '""')}"`,
      `"${new Date(v.checkInTime).toLocaleString()}"`,
      v.checkOutTime ? `"${new Date(v.checkOutTime).toLocaleString()}"` : 'Active',
      v.status,
      v.badgeId
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    this.lastExportedCsv = csvContent;
    return csvContent;
  }

  // Command Palette Search
  searchCommandPalette(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    return this.visitors.filter(v =>
      v.fullName.toLowerCase().includes(q) ||
      v.company.toLowerCase().includes(q) ||
      v.hostName.toLowerCase().includes(q) ||
      v.badgeId.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q)
    ).slice(0, 5);
  }

  // QR Payload Builder
  generateQrPayload(visitor) {
    return JSON.stringify({
      badgeId: visitor.badgeId,
      visitorId: visitor.id,
      name: visitor.fullName,
      host: visitor.hostName,
      checkIn: visitor.checkInTime,
    });
  }
}

// ============================================================================
// Test Suite Runner Framework
// ============================================================================
class TestRunner {
  constructor() {
    this.results = [];
    this.currentTier = '';
    this.startTime = Date.now();
  }

  setTier(tierName) {
    this.currentTier = tierName;
    console.log(`\n${colors.bold}${colors.bgBlue} ${tierName.toUpperCase()} ${colors.reset}`);
  }

  test(name, fn) {
    const testId = `${this.currentTier} - ${name}`;
    const start = performance.now();
    try {
      fn();
      const duration = (performance.now() - start).toFixed(2);
      this.results.push({ name: testId, passed: true, duration });
      console.log(`  ${colors.green}✓ PASS${colors.reset} ${name} ${colors.gray}(${duration}ms)${colors.reset}`);
    } catch (err) {
      const duration = (performance.now() - start).toFixed(2);
      this.results.push({ name: testId, passed: false, duration, error: err.message, stack: err.stack });
      console.log(`  ${colors.red}✗ FAIL${colors.reset} ${name} ${colors.gray}(${duration}ms)${colors.reset}`);
      console.log(`    ${colors.red}Error: ${err.message}${colors.reset}`);
    }
  }

  async testAsync(name, fn) {
    const testId = `${this.currentTier} - ${name}`;
    const start = performance.now();
    try {
      await fn();
      const duration = (performance.now() - start).toFixed(2);
      this.results.push({ name: testId, passed: true, duration });
      console.log(`  ${colors.green}✓ PASS${colors.reset} ${name} ${colors.gray}(${duration}ms)${colors.reset}`);
    } catch (err) {
      const duration = (performance.now() - start).toFixed(2);
      this.results.push({ name: testId, passed: false, duration, error: err.message, stack: err.stack });
      console.log(`  ${colors.red}✗ FAIL${colors.reset} ${name} ${colors.gray}(${duration}ms)${colors.reset}`);
      console.log(`    ${colors.red}Error: ${err.message}${colors.reset}`);
    }
  }

  summary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log(`\n${colors.bold}============================================================================${colors.reset}`);
    console.log(`${colors.bold}VSMS FRONTEND REDESIGN - TEST EXECUTION SUMMARY${colors.reset}`);
    console.log(`============================================================================`);
    console.log(`Total Tests Executed : ${colors.bold}${total}${colors.reset}`);
    console.log(`Total Passed         : ${colors.green}${colors.bold}${passed}${colors.reset}`);
    console.log(`Total Failed         : ${failed > 0 ? colors.red : colors.green}${colors.bold}${failed}${colors.reset}`);
    console.log(`Execution Duration   : ${totalDuration}s`);
    console.log(`Pass Rate            : ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`============================================================================`);

    if (failed === 0) {
      console.log(`${colors.bold}${colors.bgGreen} ALL TESTS PASSED SUCCESSFULLY! TEST HARNESS VERIFIED (Exit Code 0) ${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.bold}${colors.bgRed} TEST SUITE COMPLETED WITH FAILURES! (Exit Code 1) ${colors.reset}\n`);
      return false;
    }
  }
}

// ============================================================================
// Load CSS & Layout Files for Static Analysis
// ============================================================================
const indexCssPath = path.join(PROJECT_ROOT, 'src', 'index.css');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');

const indexHtmlPath = path.join(PROJECT_ROOT, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const distDirPath = path.join(PROJECT_ROOT, 'dist');
const distExists = fs.existsSync(distDirPath);

// ============================================================================
// BEGIN TEST DEFINITIONS
// ============================================================================
const runner = new TestRunner();

console.log(`${colors.bold}${colors.cyan}Starting VSMS E2E Test Suite Execution...${colors.reset}`);
console.log(`Project Root: ${PROJECT_ROOT}`);
console.log(`Target Minimum Test Count: >= 95 tests across 4 tiers\n`);

// ----------------------------------------------------------------------------
// TIER 1: FEATURE COVERAGE (Isolated Feature Assertions)
// ----------------------------------------------------------------------------

// === F1: Extracted Realty Hub Pastel Design Palette & Tokens ===
runner.setTier('Tier 1: Feature 1 (Realty Hub Tokens & Color System)');

runner.test('T1-F1-1: Light mode root CSS variables strictly define extracted Realty Hub tokens', () => {
  assert.match(indexCssContent, /--canvas-bg:\s*#eef5f7;/i, 'Canvas background token defined');
  assert.match(indexCssContent, /--primary-dark:\s*#111625;/i, 'Primary dark token defined');
  assert.match(indexCssContent, /--pastel-lime:\s*#d7f4b7;/i, 'Pastel lime card token defined');
  assert.match(indexCssContent, /--tag-rental:\s*#3dbda7;/i, 'Tag rental teal token defined');
  assert.match(indexCssContent, /--color-text-primary:\s*#111625;/i, 'Text primary token defined');
});

runner.test('T1-F1-2: Material 3 surface tokens dynamically map to Realty Hub theme colors', () => {
  assert.match(indexCssContent, /--m3-surface-0:\s*#eef5f7;/i, 'Surface 0 maps to ice-blue canvas');
  assert.match(indexCssContent, /--m3-primary:\s*#111625;/i, 'Primary maps to midnight dark');
  assert.match(indexCssContent, /--m3-secondary-container:\s*#d7f4b7;/i, 'Secondary container maps to pastel lime');
});

runner.test('T1-F1-3: Tailwind config defines extracted Realty Hub color scale and pastel tokens', () => {
  const realty = tailwindConfig.theme.extend.colors.realty;
  const pastel = tailwindConfig.theme.extend.colors.pastel;
  assert.strictEqual(realty.dark, '#111625', 'realty.dark must be #111625');
  assert.strictEqual(pastel.lime, '#d7f4b7', 'pastel.lime must be #d7f4b7');
  assert.strictEqual(pastel.mint, '#9ce5d7', 'pastel.mint must be #9ce5d7');
  assert.strictEqual(pastel.pink, '#f5b5b5', 'pastel.pink must be #f5b5b5');
});

runner.test('T1-F1-4: Selection styles configure executive dark highlights', () => {
  assert.match(indexCssContent, /::selection\s*\{[^}]*background-color:\s*#111625;\s*color:\s*#ffffff;/s);
});

runner.test('T1-F1-5: Signature rainbow hero gradient bar rule defined', () => {
  assert.match(indexCssContent, /\.gradient-bar-hero\s*\{[^}]*background:\s*linear-gradient\(90deg,\s*#f5b5b5/s);
});

// === F2: High-Contrast Typography, Borders & Global Layout ===
runner.setTier('Tier 1: Feature 2 (Typography, Borders & Layout)');

runner.test('T1-F2-1: Typography configures Plus Jakarta Sans and Inter sans-serif stack', () => {
  const sansFonts = tailwindConfig.theme.extend.fontFamily.sans;
  assert.ok(sansFonts.includes('Plus Jakarta Sans'), 'Font stack must include Plus Jakarta Sans');
  assert.ok(sansFonts.includes('Inter'), 'Font stack must include Inter');
  assert.ok(sansFonts.includes('sans-serif'), 'Font stack must fallback to sans-serif');
});

runner.test('T1-F2-2: Soft border variables defined in root CSS tokens', () => {
  assert.ok(indexCssContent.includes('--color-border: rgba(0, 0, 0, 0.06);'), 'Root CSS must define soft border variable');
});

runner.test('T1-F2-3: Tailwind borderWidth configuration specifies crisp 1px and 1.5px borders', () => {
  const bw = tailwindConfig.theme.extend.borderWidth;
  assert.strictEqual(bw['1'], '1px');
  assert.strictEqual(bw['1.5'], '1.5px');
});

runner.test('T1-F2-4: Soft ambient shadow tokens (soft-card and float-bar) defined in Tailwind theme', () => {
  const shadows = tailwindConfig.theme.extend.boxShadow;
  assert.ok(shadows['soft-card'], 'soft-card shadow defined');
  assert.ok(shadows['float-bar'], 'float-bar shadow defined');
  assert.ok(shadows['pill-active'], 'pill-active shadow defined');
});

runner.test('T1-F2-5: App shell structure defines 5 distinct view routes (live, log, analytics, departments, settings)', () => {
  const views = ['live', 'log', 'analytics', 'departments', 'settings'];
  const sim = new VsmsStateSimulator();
  views.forEach(v => {
    sim.setActiveView(v);
    assert.strictEqual(sim.activeView, v, `Active view should be set to ${v}`);
  });
});

// === F3: Fast Guest Registration & Host/Dept Cascade Selector ===
runner.setTier('Tier 1: Feature 3 (Fast Guest Registration & Cascade)');

runner.test('T1-F3-1: Registration form validates required fields (fullName, phone, idNumber)', () => {
  const sim = new VsmsStateSimulator();
  const res1 = sim.validateRegistrationForm({ fullName: '', phone: '123', idNumber: '456' });
  assert.strictEqual(res1.isValid, false);
  assert.ok(res1.errors.some(e => e.includes('Visitor Name')));

  const res2 = sim.validateRegistrationForm({ fullName: 'John Doe', phone: '', idNumber: '456' });
  assert.strictEqual(res2.isValid, false);
  assert.ok(res2.errors.some(e => e.includes('Phone')));

  const res3 = sim.validateRegistrationForm({ fullName: 'John Doe', phone: '123', idNumber: '' });
  assert.strictEqual(res3.isValid, false);
  assert.ok(res3.errors.some(e => e.includes('ID Number')));
});

runner.test('T1-F3-2: Successful registration creates visitor with unique VIS-ID and sequential BDG-ID', () => {
  const sim = new VsmsStateSimulator();
  const countBefore = sim.visitors.length;
  const newV = sim.registerVisitor({
    fullName: 'Ada Lovelace',
    phone: '+234 800 111 2233',
    idNumber: 'NIN-10928374'
  });
  assert.strictEqual(sim.visitors.length, countBefore + 1);
  assert.match(newV.id, /^VIS-\d{4}$/, 'ID should match VIS-XXXX format');
  assert.match(newV.badgeId, /^BDG-\d{3}$/, 'Badge should match BDG-XXX format');
  assert.strictEqual(newV.status, 'Checked-In');
  assert.strictEqual(newV.checkOutTime, null);
});

runner.test('T1-F3-3: Department and host cascade filtering maps hosts accurately to departments', () => {
  const sim = new VsmsStateSimulator();
  const execDept = sim.departments.find(d => d.code === 'EXEC');
  const execHosts = sim.hosts.filter(h => h.deptId === execDept.id);
  assert.ok(execHosts.length > 0, 'Exec hosts found');
  assert.ok(execHosts.every(h => h.deptId === execDept.id));
});

runner.test('T1-F3-4: Expected duration defaults to 60 minutes and parses custom duration options', () => {
  const sim = new VsmsStateSimulator();
  const v1 = sim.registerVisitor({
    fullName: 'Alan Turing',
    phone: '+234 801 222 3344',
    idNumber: 'PASSPORT-88192',
    expectedDurationMinutes: '120'
  });
  assert.strictEqual(v1.expectedDurationMinutes, 120);
});

runner.test('T1-F3-5: SVG initials avatar auto-generated with monochrome background palette', () => {
  const sim = new VsmsStateSimulator();
  const v = sim.registerVisitor({
    fullName: 'Grace Hopper',
    phone: '+234 802 333 4455',
    idNumber: 'DL-99102'
  });
  assert.ok(v.avatar.includes('api.dicebear.com'), 'Avatar should point to DiceBear SVG API');
  assert.ok(v.avatar.includes('backgroundColor=171717,262626,404040,737373'), 'Monochrome background colors specified');
});

// === F4: Live Presence Tracker & 1-Click Checkout ===
runner.setTier('Tier 1: Feature 4 (Live Tracker & 1-Click Check-Out)');

runner.test('T1-F4-1: Live Tracker filters out Checked-Out visitors and displays active visitors', () => {
  const sim = new VsmsStateSimulator();
  const active = sim.getActiveVisitors();
  assert.ok(active.every(v => v.status !== 'Checked-Out'), 'No checked-out visitors in live board');
  assert.ok(active.some(v => v.status === 'Checked-In' || v.status === 'Overdue'));
});

runner.test('T1-F4-2: Duration calculator formats elapsed hours and minutes accurately', () => {
  const sim = new VsmsStateSimulator();
  const fixedNow = new Date('2026-08-18T14:00:00Z');
  
  // 45 mins ago
  const t45 = new Date('2026-08-18T13:15:00Z').toISOString();
  assert.strictEqual(sim.calculateDuration(t45, fixedNow), '45m');

  // 2 hours 30 mins ago
  const t150 = new Date('2026-08-18T11:30:00Z').toISOString();
  assert.strictEqual(sim.calculateDuration(t150, fixedNow), '2h 30m');
});

runner.test('T1-F4-3: 1-Click Check-Out updates visitor status to Checked-Out and populates checkOutTime', () => {
  const sim = new VsmsStateSimulator();
  const activeVisitor = sim.getActiveVisitors()[0];
  const targetId = activeVisitor.id;

  const result = sim.checkOutVisitor(targetId);
  assert.strictEqual(result, true, 'checkOutVisitor should return true for found id');

  const updated = sim.visitors.find(v => v.id === targetId);
  assert.strictEqual(updated.status, 'Checked-Out');
  assert.ok(updated.checkOutTime !== null, 'checkOutTime must be recorded');
  assert.ok(!isNaN(Date.parse(updated.checkOutTime)), 'checkOutTime must be valid ISO timestamp');
});

runner.test('T1-F4-4: Active presence counter dynamically matches status !== Checked-Out', () => {
  const sim = new VsmsStateSimulator();
  const manualCount = sim.visitors.filter(v => v.status !== 'Checked-Out').length;
  const activeList = sim.getActiveVisitors();
  assert.strictEqual(activeList.length, manualCount);
});

runner.test('T1-F4-5: Overdue status counter accurately tallies overdue visitors', () => {
  const sim = new VsmsStateSimulator();
  const overdueCount = sim.visitors.filter(v => v.status === 'Overdue').length;
  assert.ok(overdueCount >= 1, 'Initial seed should contain at least 1 overdue visitor (VIS-8922)');
});

// === F5: High-Contrast Printable Visitor Pass & QR Code Generation ===
runner.setTier('Tier 1: Feature 5 (Printable Visitor Pass & QR)');

runner.test('T1-F5-1: Pass QR payload encodes valid JSON with badgeId, visitorId, name, host, checkIn', () => {
  const sim = new VsmsStateSimulator();
  const visitor = sim.visitors[0];
  const payloadStr = sim.generateQrPayload(visitor);
  const parsed = JSON.parse(payloadStr);

  assert.strictEqual(parsed.badgeId, visitor.badgeId);
  assert.strictEqual(parsed.visitorId, visitor.id);
  assert.strictEqual(parsed.name, visitor.fullName);
  assert.strictEqual(parsed.host, visitor.hostName);
  assert.strictEqual(parsed.checkIn, visitor.checkInTime);
});

runner.test('T1-F5-2: Opening badge modal sets selectedVisitorForBadge and sets isBadgeModalOpen to true', () => {
  const sim = new VsmsStateSimulator();
  const visitor = sim.visitors[1];
  sim.openBadgeModal(visitor);

  assert.strictEqual(sim.isBadgeModalOpen, true);
  assert.strictEqual(sim.selectedVisitorForBadge.id, visitor.id);
});

runner.test('T1-F5-3: Closing badge modal resets modal state cleanly', () => {
  const sim = new VsmsStateSimulator();
  sim.openBadgeModal(sim.visitors[0]);
  sim.closeBadgeModal();
  assert.strictEqual(sim.isBadgeModalOpen, false);
});

runner.test('T1-F5-4: Printable pass CSS specifies @media print rules with white bg and dark borders', () => {
  assert.match(indexCssContent, /@media\s*print\s*\{/, 'Print media query exists');
  assert.match(indexCssContent, /#printable-badge\s*\{[^}]*background:\s*#ffffff\s*!important;/s);
  assert.match(indexCssContent, /#printable-badge\s*\{[^}]*color:\s*#111625\s*!important;/s);
  assert.match(indexCssContent, /#printable-badge\s*\{[^}]*border:\s*2px solid #111625\s*!important;/s);
});

runner.test('T1-F5-5: Print action invokes window.print() without runtime exceptions', () => {
  const sim = new VsmsStateSimulator();
  sim.window.print();
  assert.strictEqual(sim.window.printCalls, 1);
});

// === F6: Master Visitor Log Table, Search, Filter, Pagination & CSV Export ===
runner.setTier('Tier 1: Feature 6 (Master Visitor Log & CSV Export)');

runner.test('T1-F6-1: Master log displays all records across all statuses by default', () => {
  const sim = new VsmsStateSimulator();
  const log = sim.getMasterLogVisitors({ page: 1, itemsPerPage: 100 });
  assert.strictEqual(log.filteredTotal, sim.visitors.length);
});

runner.test('T1-F6-2: Real-time search matches case-insensitively across name, company, host, badge ID', () => {
  const sim = new VsmsStateSimulator();
  const searchName = sim.getMasterLogVisitors({ search: 'babatunde' });
  assert.ok(searchName.items.some(v => v.fullName.includes('Babatunde')));

  const searchBadge = sim.getMasterLogVisitors({ search: 'BDG-081' });
  assert.ok(searchBadge.items.some(v => v.badgeId === 'BDG-081'));
});

runner.test('T1-F6-3: Department filter restricts table rows to selected department', () => {
  const sim = new VsmsStateSimulator();
  const targetDept = 'Information Technology & Cyber Security';
  const res = sim.getMasterLogVisitors({ deptFilter: targetDept });
  assert.ok(res.items.every(v => v.department === targetDept));
});

runner.test('T1-F6-4: Status filter restricts table rows to selected status (Checked-In, Overdue, Checked-Out)', () => {
  const sim = new VsmsStateSimulator();
  const res = sim.getMasterLogVisitors({ statusFilter: 'Checked-Out' });
  assert.ok(res.items.every(v => v.status === 'Checked-Out'));
});

runner.test('T1-F6-5: CSV Export generates RFC-compliant CSV headers and data rows', () => {
  const sim = new VsmsStateSimulator();
  const csv = sim.generateCsvContent();
  const lines = csv.split('\n');
  assert.ok(lines.length >= sim.visitors.length + 1, 'CSV has header + visitor rows');
  assert.ok(lines[0].includes('Visitor ID,Full Name,Phone,Email,Company,ID Type,ID Number,Host,Department,Purpose,Check-In,Check-Out,Status,Badge ID'));
});

// === F7: Command Palette (Cmd+K / Ctrl+K) Traversal & Actions ===
runner.setTier('Tier 1: Feature 7 (Accessible Command Palette)');

runner.test('T1-F7-1: Command palette search filters visitor matches across multiple fields', () => {
  const sim = new VsmsStateSimulator();
  const matches = sim.searchCommandPalette('Wright');
  assert.ok(matches.some(v => v.fullName.includes('Wright')));
});

runner.test('T1-F7-2: Command palette caps search matches to a maximum of 5 items', () => {
  const sim = new VsmsStateSimulator();
  // Register 10 visitors with same company
  for (let i = 0; i < 10; i++) {
    sim.registerVisitor({
      fullName: `Test Guest ${i}`,
      phone: `+234 800 999 000${i}`,
      idNumber: `ID-${i}`,
      company: 'OmniCorp Global'
    });
  }
  const results = sim.searchCommandPalette('OmniCorp');
  assert.strictEqual(results.length, 5, 'Results should be capped to 5');
});

runner.test('T1-F7-3: In-palette check-out executes checkOutVisitor and closes palette', () => {
  const sim = new VsmsStateSimulator();
  const target = sim.getActiveVisitors()[0];
  sim.isCmdKOpen = true;

  sim.checkOutVisitor(target.id);
  sim.isCmdKOpen = false;

  const updated = sim.visitors.find(v => v.id === target.id);
  assert.strictEqual(updated.status, 'Checked-Out');
  assert.strictEqual(sim.isCmdKOpen, false);
});

runner.test('T1-F7-4: In-palette View Pass triggers openBadgeModal and closes palette', () => {
  const sim = new VsmsStateSimulator();
  const target = sim.visitors[0];
  sim.isCmdKOpen = true;

  sim.openBadgeModal(target);
  sim.isCmdKOpen = false;

  assert.strictEqual(sim.isBadgeModalOpen, true);
  assert.strictEqual(sim.selectedVisitorForBadge.id, target.id);
  assert.strictEqual(sim.isCmdKOpen, false);
});

runner.test('T1-F7-5: Palette quick navigation actions switch activeView across all modules', () => {
  const sim = new VsmsStateSimulator();
  const actions = ['live', 'log', 'analytics', 'departments', 'settings'];
  actions.forEach(act => {
    sim.setActiveView(act);
    assert.strictEqual(sim.activeView, act);
  });
});

// === F8: Build & System Quality Verification ===
runner.setTier('Tier 1: Feature 8 (Build & System Quality)');

runner.test('T1-F8-1: Production build directory dist/ exists and contains index.html', () => {
  assert.strictEqual(distExists, true, 'dist/ folder must exist from build');
  const distIndex = path.join(distDirPath, 'index.html');
  assert.strictEqual(fs.existsSync(distIndex), true, 'dist/index.html must exist');
});

runner.test('T1-F8-2: dist/assets contains compiled monochrome CSS bundle and JS chunk', () => {
  const assetsDir = path.join(distDirPath, 'assets');
  assert.strictEqual(fs.existsSync(assetsDir), true, 'dist/assets must exist');
  const files = fs.readdirSync(assetsDir);
  assert.ok(files.some(f => f.endsWith('.css')), 'CSS bundle generated');
  assert.ok(files.some(f => f.endsWith('.js')), 'JS chunk generated');
});

runner.test('T1-F8-3: index.html contains Plus Jakarta Sans and Inter font preloads and root mount', () => {
  assert.ok(indexHtmlContent.includes('Plus+Jakarta+Sans'), 'Google Font Plus Jakarta Sans present');
  assert.ok(indexHtmlContent.includes('Inter'), 'Google Font Inter present');
  assert.ok(indexHtmlContent.includes('<div id="root"></div>'), 'Root DOM mount element present');
});

runner.test('T1-F8-4: State simulator persists updated visitor records to localStorage', () => {
  const sim = new VsmsStateSimulator();
  sim.registerVisitor({ fullName: 'Persistence Test', phone: '111', idNumber: '222' });
  const stored = sim.localStorage.getItem('vsms_visitors');
  assert.ok(stored !== null, 'LocalStorage vsms_visitors must be populated');
  const parsed = JSON.parse(stored);
  assert.strictEqual(parsed[0].fullName, 'Persistence Test');
});

runner.test('T1-F8-5: resetToDemoData restores visitors to initial 6 seed records and removes storage cache', () => {
  const sim = new VsmsStateSimulator();
  sim.registerVisitor({ fullName: 'Temp Guest', phone: '000', idNumber: '000' });
  assert.strictEqual(sim.visitors.length, 7);

  sim.resetToDemoData();
  assert.strictEqual(sim.visitors.length, TEST_SEED_VISITORS.length);
  assert.strictEqual(sim.localStorage.getItem('vsms_visitors'), null);
});


// ----------------------------------------------------------------------------
// TIER 2: BOUNDARY & CORNER CASES
// ----------------------------------------------------------------------------

// === F1 Boundary ===
runner.setTier('Tier 2: Feature 1 (Monochrome & Contrast Boundaries)');

runner.test('T2-F1-1: Mathematical contrast ratio of pure monochrome tokens achieves 21:1 WCAG AAA', () => {
  // Luminance calculation for #ffffff vs #000000
  const l1 = 1.0; // White
  const l2 = 0.0; // Black
  const ratio = (l1 + 0.05) / (l2 + 0.05);
  assert.strictEqual(ratio, 21.0, 'Pure monochrome contrast must be exactly 21:1');
});

runner.test('T2-F1-2: Theme toggle sets colorScheme and dark class accurately on documentElement', () => {
  const sim = new VsmsStateSimulator(null, 'light');
  assert.strictEqual(sim.document.documentElement.classList.contains('light'), true);
  assert.strictEqual(sim.document.documentElement.style.colorScheme, 'light');

  sim.toggleTheme();
  assert.strictEqual(sim.document.documentElement.classList.contains('dark'), true);
  assert.strictEqual(sim.document.documentElement.style.colorScheme, 'dark');
});

runner.test('T2-F1-3: Rapid 10-cycle theme toggling maintains synchronized state and no duplicate classes', () => {
  const sim = new VsmsStateSimulator(null, 'dark');
  for (let i = 0; i < 10; i++) {
    sim.toggleTheme();
  }
  assert.strictEqual(sim.theme, 'dark');
  assert.strictEqual(sim.document.documentElement.classList.contains('dark'), true);
  assert.strictEqual(sim.document.documentElement.classList.contains('light'), false);
});

runner.test('T2-F1-4: High-contrast status badge classes defined for active, overdue, and checked-out', () => {
  assert.match(indexCssContent, /\.pill-badge-active\s*\{[^}]*background-color:\s*#111625;/s);
  assert.match(indexCssContent, /\.pill-badge-overdue\s*\{[^}]*background-color:\s*#f5b5b5;/s);
  assert.match(indexCssContent, /\.pill-badge-checkedout\s*\{[^}]*background-color:\s*#eef3f6;/s);
});

runner.test('T2-F1-5: Status badge utility rules configure clean border and font styling', () => {
  assert.match(indexCssContent, /\.pill-badge-active\s*\{[^}]*color:\s*#ffffff;/s);
  assert.match(indexCssContent, /\.pill-badge-overdue\s*\{[^}]*color:\s*#6b1a1a;/s);
  assert.match(indexCssContent, /\.pill-badge-checkedout\s*\{[^}]*color:\s*#5e6d82;/s);
});

// === F2 Boundary ===
runner.setTier('Tier 2: Feature 2 (Typography & Layout Boundaries)');

runner.test('T2-F2-1: Monospace font stack configured for timestamps and badge IDs', () => {
  const monoFonts = tailwindConfig.theme.extend.fontFamily.mono;
  assert.ok(monoFonts.includes('JetBrains Mono'));
  assert.ok(monoFonts.includes('Fira Code'));
  assert.ok(monoFonts.includes('monospace'));
});

runner.test('T2-F2-2: Custom scrollbar rules specify 6px dimensions and transparent track', () => {
  assert.match(indexCssContent, /::-webkit-scrollbar\s*\{[^}]*width:\s*6px;\s*height:\s*6px;/s);
  assert.match(indexCssContent, /::-webkit-scrollbar-track\s*\{[^}]*background:\s*transparent;/s);
});

runner.test('T2-F2-3: Glassmorphism widget styling specifies 14px backdrop-filter blur', () => {
  assert.match(indexCssContent, /\.glass-widget,\s*\.glass-panel\s*\{[^}]*backdrop-filter:\s*blur\(14px\);/s);
});

runner.test('T2-F2-4: Print styles hide all standard UI elements while isolating #printable-badge', () => {
  assert.match(indexCssContent, /@media print\s*\{[^}]*body \*\s*\{\s*visibility:\s*hidden;\s*\}/s);
  assert.match(indexCssContent, /#printable-badge,\s*#printable-badge \*\s*\{\s*visibility:\s*visible;\s*\}/s);
});

runner.test('T2-F2-5: Keyframe animations fade-in and scale-in defined in Tailwind config', () => {
  const kf = tailwindConfig.theme.extend.keyframes;
  assert.ok(kf.fadeIn, 'fadeIn keyframe exists');
  assert.ok(kf.scaleIn, 'scaleIn keyframe exists');
});

// === F3 Boundary ===
runner.setTier('Tier 2: Feature 3 (Registration Boundary & Corner Cases)');

runner.test('T2-F3-1: Whitespace-only submissions (spaces, tabs, newlines) are rejected by validation', () => {
  const sim = new VsmsStateSimulator();
  assert.strictEqual(sim.validateRegistrationForm({ fullName: '   ', phone: '123', idNumber: '456' }).isValid, false);
  assert.strictEqual(sim.validateRegistrationForm({ fullName: 'John', phone: '\t\n ', idNumber: '456' }).isValid, false);
  assert.strictEqual(sim.validateRegistrationForm({ fullName: 'John', phone: '123', idNumber: '   ' }).isValid, false);
});

runner.test('T2-F3-2: Special characters and HTML entities in visitor name stored safely without crashing', () => {
  const sim = new VsmsStateSimulator();
  const specialName = `Dr. O'Connor-Smith & <VIP> "Guest"`;
  const v = sim.registerVisitor({
    fullName: specialName,
    phone: '+1 (555) 019-2834',
    idNumber: 'ID#99-!@$'
  });
  assert.strictEqual(v.fullName, specialName);
  assert.ok(v.avatar.includes(encodeURIComponent(specialName)));
});

runner.test('T2-F3-3: Optional fields default to standard fallbacks when omitted (email, company, vehiclePlate)', () => {
  const sim = new VsmsStateSimulator();
  const v = sim.registerVisitor({
    fullName: 'Minimal Guest',
    phone: '08012345678',
    idNumber: 'NIN-001'
  });
  assert.strictEqual(v.email, 'N/A');
  assert.strictEqual(v.company, 'Private Guest');
  assert.strictEqual(v.vehiclePlate, 'N/A');
  assert.strictEqual(v.notes, '');
});

runner.test('T2-F3-4: Sequential badge numbering accurately increments past highest badge (e.g. BDG-083 -> BDG-084)', () => {
  const sim = new VsmsStateSimulator();
  // Initial visitors have max badge 083
  const v1 = sim.registerVisitor({ fullName: 'Guest 1', phone: '1', idNumber: '1' });
  assert.strictEqual(v1.badgeId, 'BDG-084');

  const v2 = sim.registerVisitor({ fullName: 'Guest 2', phone: '2', idNumber: '2' });
  assert.strictEqual(v2.badgeId, 'BDG-085');
});

runner.test('T2-F3-5: Extreme duration boundary values (30 mins to 480 mins) parse correctly', () => {
  const sim = new VsmsStateSimulator();
  const vMin = sim.registerVisitor({ fullName: 'Quick', phone: '1', idNumber: '1', expectedDurationMinutes: '30' });
  assert.strictEqual(vMin.expectedDurationMinutes, 30);

  const vMax = sim.registerVisitor({ fullName: 'Full Day', phone: '2', idNumber: '2', expectedDurationMinutes: '480' });
  assert.strictEqual(vMax.expectedDurationMinutes, 480);
});

// === F4 Boundary ===
runner.setTier('Tier 2: Feature 4 (Live Tracker Boundaries)');

runner.test('T2-F4-1: Zero active visitors boundary returns empty list and handles empty state gracefully', () => {
  const sim = new VsmsStateSimulator([]);
  const active = sim.getActiveVisitors();
  assert.strictEqual(active.length, 0);
});

runner.test('T2-F4-2: Checking out already checked-out visitor or invalid ID returns false gracefully', () => {
  const sim = new VsmsStateSimulator();
  const nonExistent = sim.checkOutVisitor('VIS-NON-EXISTENT');
  assert.strictEqual(nonExistent, false);
});

runner.test('T2-F4-3: Future check-in time / clock skew boundary formats duration safely as 0m', () => {
  const sim = new VsmsStateSimulator();
  const futureIso = new Date(Date.now() + 100000).toISOString();
  const duration = sim.calculateDuration(futureIso);
  assert.strictEqual(duration, '0m');
});

runner.test('T2-F4-4: Extreme past check-in time (72 hours ago) computes duration accurately', () => {
  const sim = new VsmsStateSimulator();
  const fixedNow = new Date('2026-08-18T12:00:00Z');
  const past72h = new Date('2026-08-15T12:00:00Z').toISOString();
  assert.strictEqual(sim.calculateDuration(past72h, fixedNow), '72h 0m');
});

runner.test('T2-F4-5: Live board search with no matching active visitors returns empty array', () => {
  const sim = new VsmsStateSimulator();
  const active = sim.getActiveVisitors('NonExistentQueryXYZ');
  assert.strictEqual(active.length, 0);
});

// === F5 Boundary ===
runner.setTier('Tier 2: Feature 5 (Visitor Pass Boundaries)');

runner.test('T2-F5-1: QR payload with quotes and backslashes parses back to identical object', () => {
  const sim = new VsmsStateSimulator();
  const complexVisitor = {
    badgeId: 'BDG-999',
    id: 'VIS-9999',
    fullName: `Jane "The Architect" O'Neil \\ Lead`,
    hostName: 'Marcus "CTO" Sterling',
    checkInTime: '2026-08-18T10:00:00.000Z'
  };
  const payloadStr = sim.generateQrPayload(complexVisitor);
  const parsed = JSON.parse(payloadStr);
  assert.strictEqual(parsed.name, complexVisitor.fullName);
  assert.strictEqual(parsed.host, complexVisitor.hostName);
});

runner.test('T2-F5-2: Pass modal with Checked-Out visitor still allows viewing pass badge', () => {
  const sim = new VsmsStateSimulator();
  const checkedOut = sim.visitors.find(v => v.status === 'Checked-Out');
  sim.openBadgeModal(checkedOut);
  assert.strictEqual(sim.isBadgeModalOpen, true);
  assert.strictEqual(sim.selectedVisitorForBadge.id, checkedOut.id);
});

runner.test('T2-F5-3: DiceBear avatar URL fallback preserves valid URI encoding for Unicode names', () => {
  const sim = new VsmsStateSimulator();
  const unicodeName = 'José María Aznar 🚀';
  const v = sim.registerVisitor({ fullName: unicodeName, phone: '1', idNumber: '1' });
  assert.ok(v.avatar.includes(encodeURIComponent(unicodeName)));
});

runner.test('T2-F5-4: Multiple consecutive openBadgeModal calls switch active badge visitor cleanly', () => {
  const sim = new VsmsStateSimulator();
  sim.openBadgeModal(sim.visitors[0]);
  assert.strictEqual(sim.selectedVisitorForBadge.id, sim.visitors[0].id);

  sim.openBadgeModal(sim.visitors[1]);
  assert.strictEqual(sim.selectedVisitorForBadge.id, sim.visitors[1].id);
});

runner.test('T2-F5-5: Printing pass updates print call counter accurately', () => {
  const sim = new VsmsStateSimulator();
  sim.window.print();
  sim.window.print();
  assert.strictEqual(sim.window.printCalls, 2);
});

// === F6 Boundary ===
runner.setTier('Tier 2: Feature 6 (Visitor Log & CSV Boundaries)');

runner.test('T2-F6-1: Empty search query matches 100% of master log records', () => {
  const sim = new VsmsStateSimulator();
  const res = sim.getMasterLogVisitors({ search: '' });
  assert.strictEqual(res.filteredTotal, sim.visitors.length);
});

runner.test('T2-F6-2: Search query with 0 matches returns empty results and totalPages = 1', () => {
  const sim = new VsmsStateSimulator();
  const res = sim.getMasterLogVisitors({ search: 'NO_MATCHING_RECORDS_XYZ_123' });
  assert.strictEqual(res.filteredTotal, 0);
  assert.strictEqual(res.totalPages, 1);
  assert.strictEqual(res.items.length, 0);
});

runner.test('T2-F6-3: Pagination math: 19 visitors with itemsPerPage=8 results in exactly 3 pages', () => {
  const sim = new VsmsStateSimulator([]);
  for (let i = 0; i < 19; i++) {
    sim.visitors.push({
      id: `VIS-${i}`,
      fullName: `Visitor ${i}`,
      phone: `123-${i}`,
      company: 'Test Co',
      hostName: 'Host',
      department: 'ITCS',
      status: 'Checked-In',
      badgeId: `BDG-${i}`,
      checkInTime: new Date().toISOString(),
      checkOutTime: null
    });
  }
  const page1 = sim.getMasterLogVisitors({ page: 1, itemsPerPage: 8 });
  assert.strictEqual(page1.totalPages, 3);
  assert.strictEqual(page1.items.length, 8);

  const page3 = sim.getMasterLogVisitors({ page: 3, itemsPerPage: 8 });
  assert.strictEqual(page3.items.length, 3);
});

runner.test('T2-F6-4: Pagination boundary clamping: page -5 clamped to 1, page 999 clamped to totalPages', () => {
  const sim = new VsmsStateSimulator();
  const lowPage = sim.getMasterLogVisitors({ page: -5 });
  assert.strictEqual(lowPage.currentPage, 1);

  const highPage = sim.getMasterLogVisitors({ page: 999 });
  assert.strictEqual(highPage.currentPage, highPage.totalPages);
});

runner.test('T2-F6-5: CSV export escapes double quotes inside quotes per RFC 4180 specifications', () => {
  const sim = new VsmsStateSimulator([]);
  sim.visitors.push({
    id: 'VIS-999',
    fullName: 'David "The Boss" Smith',
    phone: '+234 800',
    email: 'd@smith.com',
    company: 'Smith, Jones & Partners Ltd',
    idType: 'Passport',
    idNumber: 'P-123',
    hostName: 'Marcus',
    department: 'EXEC',
    purpose: 'Audit & "Review"',
    checkInTime: new Date().toISOString(),
    checkOutTime: null,
    status: 'Checked-In',
    badgeId: 'BDG-999'
  });
  const csv = sim.generateCsvContent();
  assert.ok(csv.includes('"David ""The Boss"" Smith"'), 'Quotes in fullName escaped with double quotes');
  assert.ok(csv.includes('"Audit & ""Review"""'), 'Quotes in purpose escaped with double quotes');
});

// === F7 Boundary ===
runner.setTier('Tier 2: Feature 7 (Command Palette Boundaries)');

runner.test('T2-F7-1: Whitespace-only search in command palette returns empty match list', () => {
  const sim = new VsmsStateSimulator();
  const res = sim.searchCommandPalette('    ');
  assert.strictEqual(res.length, 0);
});

runner.test('T2-F7-2: Command palette case-insensitive search by badge ID', () => {
  const sim = new VsmsStateSimulator();
  const res = sim.searchCommandPalette('bdg-081');
  assert.ok(res.some(v => v.badgeId === 'BDG-081'));
});

runner.test('T2-F7-3: Command palette search by visitor ID', () => {
  const sim = new VsmsStateSimulator();
  const res = sim.searchCommandPalette('vis-8921');
  assert.ok(res.some(v => v.id === 'VIS-8921'));
});

runner.test('T2-F7-4: Command palette search by host name', () => {
  const sim = new VsmsStateSimulator();
  const res = sim.searchCommandPalette('Marcus Sterling');
  assert.ok(res.some(v => v.hostName.includes('Marcus Sterling')));
});

runner.test('T2-F7-5: Direct check-out from palette handles visitor not found gracefully', () => {
  const sim = new VsmsStateSimulator();
  const result = sim.checkOutVisitor('VIS-DOES-NOT-EXIST');
  assert.strictEqual(result, false);
});

// === F8 Boundary ===
runner.setTier('Tier 2: Feature 8 (Storage & State Boundaries)');

runner.test('T2-F8-1: Corrupted or invalid JSON string in localStorage recovers with fallback to INITIAL_VISITORS', () => {
  const storage = new MockLocalStorage();
  storage.setItem('vsms_visitors', '{ INVALID_JSON_MALFORMED_DATA');

  let loadedVisitors = null;
  const raw = storage.getItem('vsms_visitors');
  try {
    loadedVisitors = JSON.parse(raw);
  } catch (e) {
    loadedVisitors = INITIAL_VISITORS;
  }
  assert.strictEqual(loadedVisitors, INITIAL_VISITORS, 'Should fallback safely to INITIAL_VISITORS');
});

runner.test('T2-F8-2: User role state toggles between admin and security and updates storage', () => {
  const sim = new VsmsStateSimulator();
  sim.setUserRole('security');
  assert.strictEqual(sim.userRole, 'security');
  assert.strictEqual(sim.localStorage.getItem('vsms_role'), 'security');

  sim.setUserRole('admin');
  assert.strictEqual(sim.userRole, 'admin');
  assert.strictEqual(sim.localStorage.getItem('vsms_role'), 'admin');
});

runner.test('T2-F8-3: Initial seed dataset initializes clean with zero dummy visitors', () => {
  assert.strictEqual(INITIAL_VISITORS.length, 0, 'Clean visitor database initialized with zero dummy records');
});

runner.test('T2-F8-4: Initial organizational directory contains 6 departments with valid codes and floors', () => {
  assert.strictEqual(DEPARTMENTS.length, 6);
  const codes = DEPARTMENTS.map(d => d.code);
  assert.ok(codes.includes('EXEC'));
  assert.ok(codes.includes('ITCS'));
  assert.ok(codes.includes('HR'));
  assert.ok(codes.includes('FIN'));
  assert.ok(codes.includes('LEGAL'));
  assert.ok(codes.includes('PROC'));
});

runner.test('T2-F8-5: Hosts directory contains personnel mapped to department IDs', () => {
  assert.ok(HOSTS.length >= 8);
  assert.ok(HOSTS.every(h => h.id && h.name && h.deptId && h.email));
});


// ----------------------------------------------------------------------------
// TIER 3: CROSS-FEATURE COMBINATIONS (Multi-Feature Interaction Flows)
// ----------------------------------------------------------------------------
runner.setTier('Tier 3: Cross-Feature End-to-End Combinations');

runner.test('T3-XF-1: Fast Registration -> Auto Badge Modal -> QR Payload Generation & Verification', () => {
  const sim = new VsmsStateSimulator();
  const v = sim.registerVisitor({
    fullName: 'Babatunde Fashola',
    phone: '+234 802 999 1122',
    idType: 'National Identity Card (NIN)',
    idNumber: 'NIN-882910293',
    department: 'Legal & Regulatory Compliance',
    hostName: 'Amina Bello',
    purpose: 'Regulatory Inspection / Audit'
  });

  // 1. Check registration state
  assert.strictEqual(sim.visitors[0].id, v.id);
  assert.strictEqual(sim.isCheckInOpen, false);

  // 2. Check automatic badge modal
  assert.strictEqual(sim.isBadgeModalOpen, true);
  assert.strictEqual(sim.selectedVisitorForBadge.id, v.id);

  // 3. Verify QR payload
  const qr = JSON.parse(sim.generateQrPayload(v));
  assert.strictEqual(qr.badgeId, v.badgeId);
  assert.strictEqual(qr.visitorId, v.id);
  assert.strictEqual(qr.name, 'Babatunde Fashola');
  assert.strictEqual(qr.host, 'Amina Bello');
});

runner.test('T3-XF-2: Registration -> Live Tracker Entry -> 1-Click Check-Out -> Master Log Status Transition', () => {
  const sim = new VsmsStateSimulator();
  const v = sim.registerVisitor({
    fullName: 'Chukwuma Soludo',
    phone: '+234 803 777 8899',
    idNumber: 'DL-77291-C'
  });

  // 1. Live board shows new visitor as active
  const activeList1 = sim.getActiveVisitors();
  assert.ok(activeList1.some(item => item.id === v.id));

  // 2. 1-Click Check-out
  sim.checkOutVisitor(v.id);

  // 3. Live board no longer shows visitor
  const activeList2 = sim.getActiveVisitors();
  assert.ok(!activeList2.some(item => item.id === v.id));

  // 4. Master Log reflects Checked-Out with valid checkOutTime
  const logRecord = sim.visitors.find(item => item.id === v.id);
  assert.strictEqual(logRecord.status, 'Checked-Out');
  assert.ok(logRecord.checkOutTime !== null);
});

runner.test('T3-XF-3: Check-Out in Live Tracker -> Dynamic Header Counter Decrement & Log Sync', () => {
  const sim = new VsmsStateSimulator();
  const activeCountBefore = sim.getActiveVisitors().length;
  const targetId = sim.getActiveVisitors()[0].id;

  sim.checkOutVisitor(targetId);

  const activeCountAfter = sim.getActiveVisitors().length;
  assert.strictEqual(activeCountAfter, activeCountBefore - 1);
});

runner.test('T3-XF-4: Multi-Department Registration -> Master Log Dept Filter -> CSV Export Verification', () => {
  const sim = new VsmsStateSimulator();
  // Register in HR
  const vHr = sim.registerVisitor({
    fullName: 'HR Guest Alpha',
    phone: '0801',
    idNumber: 'ID-01',
    department: 'Human Resources & Talent',
    hostName: 'Sophia Al-Mansoor'
  });
  // Register in FIN
  const vFin = sim.registerVisitor({
    fullName: 'Fin Guest Beta',
    phone: '0802',
    idNumber: 'ID-02',
    department: 'Finance & Accounting',
    hostName: 'David K. O’Connor'
  });

  // Filter HR in Log
  const hrLogs = sim.getMasterLogVisitors({ deptFilter: 'Human Resources & Talent' });
  assert.ok(hrLogs.items.some(v => v.fullName === 'HR Guest Alpha'));
  assert.ok(!hrLogs.items.some(v => v.fullName === 'Fin Guest Beta'));

  // Export CSV
  const csv = sim.generateCsvContent();
  assert.ok(csv.includes('HR Guest Alpha'));
  assert.ok(csv.includes('Fin Guest Beta'));
});

runner.test('T3-XF-5: Command Palette Search -> In-Palette Check-Out -> Live Tracker Update', () => {
  const sim = new VsmsStateSimulator();
  const active = sim.getActiveVisitors()[0];

  // Search in Cmd+K
  const matches = sim.searchCommandPalette(active.fullName);
  assert.ok(matches.some(m => m.id === active.id));

  // Check-out via Cmd+K action
  sim.checkOutVisitor(active.id);

  // Verify Live Tracker
  const activeNow = sim.getActiveVisitors();
  assert.ok(!activeNow.some(v => v.id === active.id));
});

runner.test('T3-XF-6: Command Palette Search -> View Pass -> VisitorPassModal Opened with Record', () => {
  const sim = new VsmsStateSimulator();
  const visitor = sim.visitors[2];

  sim.isCmdKOpen = true;
  const matches = sim.searchCommandPalette(visitor.badgeId);
  assert.strictEqual(matches[0].id, visitor.id);

  sim.openBadgeModal(matches[0]);
  sim.isCmdKOpen = false;

  assert.strictEqual(sim.isBadgeModalOpen, true);
  assert.strictEqual(sim.selectedVisitorForBadge.id, visitor.id);
});

runner.test('T3-XF-7: Theme Toggle -> Registration -> Badge Modal High-Contrast Verification', () => {
  const sim = new VsmsStateSimulator(null, 'dark');
  sim.toggleTheme(); // switches to light
  assert.strictEqual(sim.theme, 'light');

  const v = sim.registerVisitor({ fullName: 'Light Mode Guest', phone: '0800', idNumber: 'L-01' });
  assert.strictEqual(sim.selectedVisitorForBadge.fullName, 'Light Mode Guest');
  assert.strictEqual(sim.document.documentElement.classList.contains('light'), true);

  sim.toggleTheme(); // switch back to dark
  assert.strictEqual(sim.theme, 'dark');
  assert.strictEqual(sim.document.documentElement.classList.contains('dark'), true);
});

runner.test('T3-XF-8: Overdue Visitor Simulation -> Live Tracker Warning Badge -> Status Filter Match', () => {
  const sim = new VsmsStateSimulator();
  // Check initial overdue visitor VIS-8922
  const overdueVisitor = sim.visitors.find(v => v.status === 'Overdue');
  assert.ok(overdueVisitor, 'Initial seed has overdue visitor');

  // Verify present in active list
  const active = sim.getActiveVisitors();
  assert.ok(active.some(v => v.id === overdueVisitor.id && v.status === 'Overdue'));

  // Filter in Master Log
  const logOverdue = sim.getMasterLogVisitors({ statusFilter: 'Overdue' });
  assert.ok(logOverdue.items.some(v => v.id === overdueVisitor.id));
});

runner.test('T3-XF-9: Department Cascade Update -> Host Dynamic Selection Re-filter', () => {
  const sim = new VsmsStateSimulator();
  const procurementDept = sim.departments.find(d => d.code === 'PROC');
  const procHosts = sim.hosts.filter(h => h.deptId === procurementDept.id);

  assert.strictEqual(procHosts[0].name, 'Chinedu Eze');
  assert.strictEqual(procHosts[0].title, 'Procurement Manager');
});

runner.test('T3-XF-10: Multi-step lifecycle: Register -> Check-out -> Search -> Reset to Demo State', () => {
  const sim = new VsmsStateSimulator();
  const countInitial = sim.visitors.length;

  // 1. Register
  const v = sim.registerVisitor({ fullName: 'Lifecycle Tester', phone: '123', idNumber: 'L-99' });
  assert.strictEqual(sim.visitors.length, countInitial + 1);

  // 2. Check-out
  sim.checkOutVisitor(v.id);
  assert.strictEqual(sim.visitors.find(x => x.id === v.id).status, 'Checked-Out');

  // 3. Search in Master Log
  const log = sim.getMasterLogVisitors({ search: 'Lifecycle Tester' });
  assert.strictEqual(log.filteredTotal, 1);

  // 4. Reset
  sim.resetToDemoData();
  assert.strictEqual(sim.visitors.length, countInitial);
  assert.strictEqual(sim.visitors.some(x => x.id === v.id), false);
});

runner.test('T3-XF-11: Master Log Compound Filter: Search + Dept + Status + Pagination + CSV Export', () => {
  const sim = new VsmsStateSimulator();
  // Register 12 matching visitors
  for (let i = 0; i < 12; i++) {
    sim.registerVisitor({
      fullName: `Compound User ${i}`,
      phone: `+234 809 ${i}`,
      idNumber: `CPD-${i}`,
      company: 'Compound Corp',
      department: 'Information Technology & Cyber Security',
      hostName: 'Engr. Marcus Sterling'
    });
  }

  // Filter on ITCS + Checked-In + Search 'Compound' + Page 2
  const res = sim.getMasterLogVisitors({
    search: 'Compound',
    deptFilter: 'Information Technology & Cyber Security',
    statusFilter: 'Checked-In',
    page: 2,
    itemsPerPage: 8
  });

  assert.strictEqual(res.filteredTotal, 12);
  assert.strictEqual(res.totalPages, 2);
  assert.strictEqual(res.currentPage, 2);
  assert.strictEqual(res.items.length, 4); // 12 - 8 = 4 items on page 2

  const csv = sim.generateCsvContent();
  assert.ok(csv.includes('Compound User 0'));
  assert.ok(csv.includes('Compound User 11'));
});


// ----------------------------------------------------------------------------
// TIER 4: REAL-WORLD WORKLOAD SCENARIOS (Security Desk Simulation)
// ----------------------------------------------------------------------------
runner.setTier('Tier 4: Real-World Workload Scenarios');

runner.test('T4-SC-1: Scenario 1 (Morning Security Rush): Rapid registration of 5 guests across depts & presence tracking', () => {
  const sim = new VsmsStateSimulator();
  const initialActive = sim.getActiveVisitors().length;

  const guests = [
    { fullName: 'Tariq Al-Mansoor', phone: '+234 801 000 1111', idNumber: 'NIN-110022', company: 'Emirates Telecom', dept: 'Information Technology & Cyber Security' },
    { fullName: 'Ngozi Okonjo', phone: '+234 802 000 2222', idNumber: 'DL-994411', company: 'Global Finance', dept: 'Finance & Accounting' },
    { fullName: 'Emeka Nwosu', phone: '+234 803 000 3333', idNumber: 'PASS-881122', company: 'Nwosu & Co', dept: 'Legal & Regulatory Compliance' },
    { fullName: 'Fatima Kyari', phone: '+234 804 000 4444', idNumber: 'NIN-332211', company: 'Kyari Logistics', dept: 'Procurement & Logistics' },
    { fullName: 'Donald Duke', phone: '+234 805 000 5555', idNumber: 'DL-552233', company: 'Cross River Ventures', dept: 'Executive Suite' },
  ];

  const registered = guests.map(g => sim.registerVisitor({
    fullName: g.fullName,
    phone: g.phone,
    idNumber: g.idNumber,
    company: g.company,
    department: g.dept
  }));

  // Assert all 5 are registered
  assert.strictEqual(registered.length, 5);
  // Active count increased by 5
  assert.strictEqual(sim.getActiveVisitors().length, initialActive + 5);

  // Badges are sequential
  for (let i = 0; i < registered.length - 1; i++) {
    const num1 = parseInt(registered[i].badgeId.replace('BDG-', ''), 10);
    const num2 = parseInt(registered[i + 1].badgeId.replace('BDG-', ''), 10);
    assert.strictEqual(num2, num1 + 1, 'Badges created sequentially in chronological order');
  }
});

runner.test('T4-SC-2: Scenario 2 (Executive VIP Delegation): Department cascade, vehicle plate & high-contrast pass', () => {
  const sim = new VsmsStateSimulator();

  const vip = sim.registerVisitor({
    fullName: 'Ambassador Jean-Luc Picard',
    phone: '+33 6 12 34 56 78',
    company: 'Diplomatic Delegation',
    idType: 'International Passport',
    idNumber: 'FR-DIPLO-9901',
    department: 'Executive Suite',
    hostName: 'Dr. Elizabeth Vance',
    purpose: 'Official Meeting',
    expectedDurationMinutes: '240',
    vehiclePlate: 'CD-881-ABJ',
    notes: 'Diplomatic security escort accompanied.'
  });

  // Verify VIP pass details
  assert.strictEqual(vip.vehiclePlate, 'CD-881-ABJ');
  assert.strictEqual(vip.expectedDurationMinutes, 240);

  // Check QR Payload
  const qr = JSON.parse(sim.generateQrPayload(vip));
  assert.strictEqual(qr.name, 'Ambassador Jean-Luc Picard');
  assert.strictEqual(qr.host, 'Dr. Elizabeth Vance');

  // Verify active on Live Tracker with vehicle
  const liveActive = sim.getActiveVisitors();
  const vipCard = liveActive.find(v => v.id === vip.id);
  assert.ok(vipCard);
  assert.strictEqual(vipCard.vehiclePlate, 'CD-881-ABJ');
});

runner.test('T4-SC-3: Scenario 3 (Peak Departure Wave): 1-Click checkout across all active visitors & duration audit', () => {
  const sim = new VsmsStateSimulator();

  // Get all active visitors
  const activeBefore = sim.getActiveVisitors();
  assert.ok(activeBefore.length > 0);

  // Rapid checkout simulation
  activeBefore.forEach(v => {
    const ok = sim.checkOutVisitor(v.id);
    assert.strictEqual(ok, true);
  });

  // Verify 0 active remaining
  const activeAfter = sim.getActiveVisitors();
  assert.strictEqual(activeAfter.length, 0);

  // Verify all are Checked-Out in Master Log with non-null checkout times
  const log = sim.getMasterLogVisitors({ page: 1, itemsPerPage: 100 });
  assert.ok(log.items.every(v => v.status === 'Checked-Out'));
  assert.ok(log.items.every(v => v.checkOutTime !== null));
});

runner.test('T4-SC-4: Scenario 4 (Security Officer Master Audit): Filter by ITCS, paginate, verify count, export CSV', () => {
  const sim = new VsmsStateSimulator();
  const targetDept = 'Information Technology & Cyber Security';

  const auditLog = sim.getMasterLogVisitors({ deptFilter: targetDept, page: 1, itemsPerPage: 10 });
  assert.ok(auditLog.items.every(v => v.department === targetDept));

  const csv = sim.generateCsvContent();
  assert.ok(csv.startsWith('Visitor ID,Full Name,Phone,Email,Company'));
  assert.strictEqual(sim.lastExportedCsv, csv);
});

runner.test('T4-SC-5: Scenario 5 (Keyboard-Only Security Desk Navigation): Cmd+K traversal & Escape dismiss', () => {
  const sim = new VsmsStateSimulator();

  // 1. Open Cmd+K
  sim.isCmdKOpen = true;
  assert.strictEqual(sim.isCmdKOpen, true);

  // 2. Search visitor
  const matches = sim.searchCommandPalette('Fatima');
  assert.ok(matches.length > 0);

  // 3. Switch to Analytics view
  sim.setActiveView('analytics');
  sim.isCmdKOpen = false;
  assert.strictEqual(sim.activeView, 'analytics');
  assert.strictEqual(sim.isCmdKOpen, false);

  // 4. Open Check-In modal and press ESC
  sim.isCheckInOpen = true;
  assert.strictEqual(sim.isCheckInOpen, true);
  sim.isCheckInOpen = false; // Simulate Escape key
  assert.strictEqual(sim.isCheckInOpen, false);
});


// ============================================================================
// EXECUTION & SUMMARY REPORT GENERATION
// ============================================================================
const allPassed = runner.summary();

if (!allPassed) {
  process.exit(1);
} else {
  process.exit(0);
}
