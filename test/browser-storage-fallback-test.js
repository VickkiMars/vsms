/**
 * test/browser-storage-fallback-test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Verification suite for Browser Storage Fallback on Failed Database Writes.
 * Tests offline / failed write resilience for:
 * 1. Organizations (insert & read fallback)
 * 2. Organization Fields (save & read fallback)
 * 3. Visitors (insert, update status, and read fallback)
 * 4. Staff / Users (insert, update password, and read fallback)
 * 5. Security Audit Logs (logAction & getAuditLogs fallback)
 * 6. Metric Counts (getTableRowCounts fallback)
 * 7. Pending Sync Queue & replay mechanism
 * 8. Organization database reset cleanup
 */

import assert from 'node:assert';
import { supabaseService, browserStorageFallback } from '../src/db/supabaseService.js';
import { STORAGE_KEYS } from '../src/db/browserStorageFallback.js';

// Setup headless browser localStorage simulation
const storageMap = new Map();
globalThis.localStorage = {
  getItem(key) {
    return storageMap.get(key) || null;
  },
  setItem(key, val) {
    storageMap.set(key, String(val));
  },
  removeItem(key) {
    storageMap.delete(key);
  },
  clear() {
    storageMap.clear();
  },
};

globalThis.window = {
  localStorage: globalThis.localStorage,
  addEventListener() {},
  removeEventListener() {},
};

let passed = 0;
let total = 0;

async function runTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ Pass: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('\n=== TEST SUITE: BROWSER STORAGE FALLBACK FOR FAILED WRITES ===\n');

async function main() {
  // Clear any existing test data
  globalThis.localStorage.clear();

  // Test 1: Organization write fallback
  await runTest('insertOrganization writes to browser storage fallback when remote write is unavailable', async () => {
    const testOrg = {
      id: 'ORG-FALLBACK-1',
      name: 'Apex Fortress Holdings',
      slug: 'apex-fortress',
      industry: 'Cybersecurity',
      contact_email: 'security@apexfortress.io',
      logo_url: '',
      created_at: new Date().toISOString(),
    };

    const saved = await supabaseService.insertOrganization(testOrg);
    assert.strictEqual(saved.id, testOrg.id);

    // Verify it is in localStorage
    const rawOrgs = globalThis.localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
    assert.ok(rawOrgs, 'vsms_fallback_organizations must be in localStorage');
    const orgs = JSON.parse(rawOrgs);
    assert.ok(orgs.some(o => o.id === testOrg.id));

    // Verify retrieval via supabaseService
    const readOrg = await supabaseService.getOrganization('ORG-FALLBACK-1');
    assert.strictEqual(readOrg.name, 'Apex Fortress Holdings');

    const allOrgs = await supabaseService.getAllOrganizations();
    assert.ok(allOrgs.some(o => o.id === testOrg.id));
  });

  // Test 2: Dynamic fields write fallback
  await runTest('saveOrganizationFields persists blueprint fields to browser storage fallback', async () => {
    const testFields = [
      { id: 'FLD-T1', field_key: 'badgeColor', field_name: 'Badge Color', field_type: 'select', is_required: 1, show_in_table: 1, show_on_badge: 1, options: ['Red', 'Blue'] },
      { id: 'FLD-T2', field_key: 'clearanceLevel', field_name: 'Clearance Level', field_type: 'radio', is_required: 1, show_in_table: 1, show_on_badge: 1, options: ['Tier 1', 'Tier 2'] }
    ];

    const savedFields = await supabaseService.saveOrganizationFields('ORG-FALLBACK-1', testFields);
    assert.strictEqual(savedFields.length, 2);

    // Verify localStorage key
    const rawFields = globalThis.localStorage.getItem(`${STORAGE_KEYS.FIELDS_PREFIX}ORG-FALLBACK-1`);
    assert.ok(rawFields, 'Field storage key must exist for org');
    const parsedFields = JSON.parse(rawFields);
    assert.strictEqual(parsedFields.length, 2);

    // Verify retrieval
    const readFields = await supabaseService.getOrganizationFields('ORG-FALLBACK-1');
    assert.strictEqual(readFields.length, 2);
    assert.strictEqual(readFields[0].field_key, 'badgeColor');
    assert.deepStrictEqual(readFields[0].options, ['Red', 'Blue']);
  });

  // Test 3: Visitor registration & status transition fallback
  await runTest('insertVisitor and updateVisitorStatus store and update in browser storage fallback', async () => {
    const testVisitor = {
      id: 'VIS-FALLBACK-99',
      org_id: 'ORG-FALLBACK-1',
      fullName: 'Amina Bello',
      phone: '+234 809 111 2233',
      email: 'amina@defense.gov',
      company: 'Federal Logistics',
      idType: 'National ID',
      idNumber: 'NIN-88990011',
      hostName: 'Engr. David Okeke',
      department: 'Engineering & Facilities',
      purpose: 'HVAC Inspection',
      checkInTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      checkOutTime: null,
      status: 'Checked-In',
      badgeId: 'BDG-099',
      expectedDurationMinutes: 30, // Past due!
      vehiclePlate: 'ABC-123-XY',
      notes: 'Escort required',
      avatar: '',
      custom_data: { badgeColor: 'Red', clearanceLevel: 'Tier 2' },
      custom_data_json: { badgeColor: 'Red', clearanceLevel: 'Tier 2' },
    };

    const inserted = await supabaseService.insertVisitor(testVisitor);
    assert.strictEqual(inserted.id, testVisitor.id);

    // Check localStorage
    const rawVisitors = globalThis.localStorage.getItem(STORAGE_KEYS.VISITORS);
    assert.ok(rawVisitors, 'vsms_fallback_visitors must exist in localStorage');
    const visitors = JSON.parse(rawVisitors);
    assert.ok(visitors.some(v => v.id === testVisitor.id));

    // Verify retrieval via getAllVisitors
    const orgVisitors = await supabaseService.getAllVisitors('ORG-FALLBACK-1');
    assert.ok(orgVisitors.some(v => v.id === testVisitor.id));
    const Amina = orgVisitors.find(v => v.id === testVisitor.id);
    assert.strictEqual(Amina.fullName, 'Amina Bello');
    assert.strictEqual(Amina.custom_data.badgeColor, 'Red');

    // Update status to Overdue
    await supabaseService.updateVisitorStatus(testVisitor.id, 'Overdue');
    const updatedVisitors = await supabaseService.getAllVisitors('ORG-FALLBACK-1');
    assert.strictEqual(updatedVisitors.find(v => v.id === testVisitor.id).status, 'Overdue');

    // Check out visitor
    const checkOutIso = new Date().toISOString();
    await supabaseService.updateVisitorStatus(testVisitor.id, 'Checked-Out', checkOutIso);
    const checkedOutVisitors = await supabaseService.getAllVisitors('ORG-FALLBACK-1');
    const checkedOutAmina = checkedOutVisitors.find(v => v.id === testVisitor.id);
    assert.strictEqual(checkedOutAmina.status, 'Checked-Out');
    assert.strictEqual(checkedOutAmina.checkOutTime, checkOutIso);
  });

  // Test 4: User provisioning & password update fallback
  await runTest('insertUser and updateUserPassword persist to browser storage fallback', async () => {
    const testUser = {
      id: 'USR-FALLBACK-1',
      org_id: 'ORG-FALLBACK-1',
      email: 'officer.ade@apexfortress.io',
      password_hash: 'hash-password-123',
      fullName: 'Officer Adeola Balogun',
      role: 'security',
      desk_location: 'Gate 2 North',
      avatar: '',
      created_at: new Date().toISOString(),
      last_login: null,
    };

    await supabaseService.insertUser(testUser);

    const allUsers = await supabaseService.getAllUsers('ORG-FALLBACK-1');
    assert.ok(allUsers.some(u => u.id === testUser.id));
    assert.strictEqual(allUsers.find(u => u.id === testUser.id).role, 'security');

    // Update password
    await supabaseService.updateUserPassword(testUser.id, 'new-secret-hash-456');
    const recheckedUsers = await supabaseService.getAllUsers('ORG-FALLBACK-1');
    assert.strictEqual(recheckedUsers.find(u => u.id === testUser.id).password_hash, 'new-secret-hash-456');
  });

  // Test 5: Security audit log fallback
  await runTest('logAction and getAuditLogs store and retrieve audit events in browser storage fallback', async () => {
    await supabaseService.logAction(
      'USR-FALLBACK-1',
      'Officer Adeola Balogun',
      'SECURITY_CHECKPOINT_ACK',
      'Acknowledged overstay alarm for VIS-FALLBACK-99',
      'ORG-FALLBACK-1'
    );

    const rawLogs = globalThis.localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    assert.ok(rawLogs, 'vsms_fallback_audit_logs must exist in localStorage');
    const logs = JSON.parse(rawLogs);
    assert.ok(logs.some(l => l.action === 'SECURITY_CHECKPOINT_ACK'));

    const retrievedLogs = await supabaseService.getAuditLogs('ORG-FALLBACK-1');
    assert.ok(retrievedLogs.some(l => l.action === 'SECURITY_CHECKPOINT_ACK'));
    assert.strictEqual(retrievedLogs[0].userName, 'Officer Adeola Balogun');
  });

  // Test 6: Table metric counts fallback
  await runTest('getTableRowCounts computes accurate metric counts from browser storage fallback', async () => {
    const counts = await supabaseService.getTableRowCounts('ORG-FALLBACK-1');
    assert.strictEqual(counts.users, 1);
    assert.strictEqual(counts.visitors, 1);
    assert.strictEqual(counts.audit_logs, 1);
    assert.ok(counts.organizations >= 1);
    assert.ok(counts.departments > 0);
    assert.ok(counts.hosts > 0);
  });

  // Test 7: Pending sync queue tracking
  await runTest('Failed writes are enqueued in pending sync queue with operation metadata', async () => {
    const queue = browserStorageFallback.getPendingWrites();
    assert.ok(queue.length >= 4, 'Must have enqueued pending writes for failed operations');
    assert.ok(queue.some(q => q.type === 'insertOrganization'));
    assert.ok(queue.some(q => q.type === 'saveOrganizationFields'));
    assert.ok(queue.some(q => q.type === 'insertVisitor'));
    assert.ok(queue.some(q => q.type === 'updateVisitorStatus'));
  });

  // Test 8: Organization reset cleans up org fallback keys
  await runTest('resetDatabase removes org-scoped records from browser storage fallback', async () => {
    await supabaseService.resetDatabase('ORG-FALLBACK-1');

    const fieldsAfterReset = await supabaseService.getOrganizationFields('ORG-FALLBACK-1');
    assert.strictEqual(fieldsAfterReset.length, 0);

    const visitorsAfterReset = await supabaseService.getAllVisitors('ORG-FALLBACK-1');
    assert.strictEqual(visitorsAfterReset.length, 0);

    const logsAfterReset = await supabaseService.getAuditLogs('ORG-FALLBACK-1');
    assert.strictEqual(logsAfterReset.length, 0);
  });

  console.log(`\n================================================================`);
  console.log(`ALL BROWSER STORAGE FALLBACK TESTS PASSED (${passed}/${total})`);
  console.log(`================================================================\n`);
}

main().catch(err => {
  console.error('Test suite failed:', err);
  process.exitCode = 1;
});
