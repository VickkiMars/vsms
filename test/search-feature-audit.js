import assert from 'node:assert';
import { matchVisitor, filterAndCategorizeVisitors } from '../src/utils/searchHelper.js';

console.log('=== VERIFICATION TEST SUITE: PAST & PRESENT VISITOR SEARCH CAPABILITIES ===\n');

// Sample test dataset with present, overdue, and past visitors
const testVisitors = [
  {
    id: 'VIS-001',
    badgeId: 'BDG-101',
    fullName: 'Jane Doe',
    company: 'Acme Corp',
    hostName: 'Engr. Marcus Sterling',
    department: 'IT & Cyber Security',
    purpose: 'System Audit',
    phone: '+234 801 111 2222',
    email: 'jane.doe@acme.com',
    vehiclePlate: 'ABC-123-XY',
    notes: 'Escort required to Server Room 4',
    status: 'Checked-In',
    checkInTime: '2026-10-11T09:00:00Z',
    checkOutTime: null,
    custom_data: { contractor_id: 'CTR-999', vip_level: 'Gold' }
  },
  {
    id: 'VIS-002',
    badgeId: 'BDG-102',
    fullName: 'Babatunde Adeleke',
    company: 'Lagos Energy Systems',
    hostName: 'Dr. Alex Rivera',
    department: 'Executive Suite',
    purpose: 'Board Meeting',
    phone: '+234 802 333 4444',
    email: 'babatunde@lagosenergy.ng',
    vehiclePlate: 'EPE-456-ZZ',
    notes: 'Driver parked at VIP Bay 2',
    status: 'Overdue',
    checkInTime: '2026-10-11T06:00:00Z',
    checkOutTime: null,
    custom_data: { dietary: 'Vegetarian' }
  },
  {
    id: 'VIS-003',
    badgeId: 'BDG-103',
    fullName: 'Fatima Al-Mansoor',
    company: 'Apex Logistics',
    hostName: 'Barr. Aisha Sterling',
    department: 'Legal & Regulatory',
    purpose: 'Contract Review',
    phone: '+234 803 555 6666',
    email: 'fatima@apexlogistics.com',
    vehiclePlate: 'KJA-789-AA',
    notes: 'Checked out after signing NDA',
    status: 'Checked-Out',
    checkInTime: '2026-10-10T11:00:00Z',
    checkOutTime: '2026-10-10T13:30:00Z',
    custom_data: { visitor_tag: 'Historical' }
  },
  {
    id: 'VIS-004',
    badgeId: 'BDG-104',
    fullName: 'David Chukwu',
    company: 'Chukwu & Sons Engineering',
    hostName: 'Engr. Marcus Sterling',
    department: 'IT & Cyber Security',
    purpose: 'Hardware Maintenance',
    phone: '+234 804 777 8888',
    email: 'david@chukwu.com',
    vehiclePlate: 'ABJ-321-BB',
    notes: 'Former visitor, completed last month',
    status: 'Checked-Out',
    checkInTime: '2026-09-15T08:00:00Z',
    checkOutTime: '2026-09-15T16:00:00Z',
    custom_data: { badge_returned: true }
  }
];

// Test 1: Match past visitor by name
const matchPastName = matchVisitor(testVisitors[2], 'Fatima');
assert.strictEqual(matchPastName, true, 'Past visitor Fatima should match by name');
console.log('✓ Test 1: Past visitor matched by full name');

// Test 2: Match past visitor by badge ID (case-insensitive)
const matchPastBadge = matchVisitor(testVisitors[2], 'bdg-103');
assert.strictEqual(matchPastBadge, true, 'Past visitor should match by lowercase badgeId');
console.log('✓ Test 2: Past visitor matched by badge ID');

// Test 3: Match past visitor by vehicle plate
const matchPastPlate = matchVisitor(testVisitors[3], 'ABJ-321-BB');
assert.strictEqual(matchPastPlate, true, 'Past visitor David Chukwu should match by vehiclePlate');
console.log('✓ Test 3: Past visitor matched by vehicle plate');

// Test 4: Match past visitor by notes
const matchPastNotes = matchVisitor(testVisitors[2], 'NDA');
assert.strictEqual(matchPastNotes, true, 'Past visitor Fatima should match by notes');
console.log('✓ Test 4: Past visitor matched by notes');

// Test 5: Match past visitor by custom data
const matchPastCustom = matchVisitor(testVisitors[2], 'Historical');
assert.strictEqual(matchPastCustom, true, 'Past visitor Fatima should match by custom data tag');
console.log('✓ Test 5: Past visitor matched by custom data field');

// Test 6: Search status keyword "past" returns only checked-out visitors
const pastKeywordMatches = testVisitors.filter(v => matchVisitor(v, 'past'));
assert.strictEqual(pastKeywordMatches.length, 2, 'Keyword "past" should return exactly 2 checked-out visitors');
assert.ok(pastKeywordMatches.every(v => v.status === 'Checked-Out'), 'All matches for "past" must have status Checked-Out');
console.log('✓ Test 6: Status alias "past" returns all checked-out visitors');

// Test 7: Search status keyword "checked-out" returns only checked-out visitors
const checkedOutMatches = testVisitors.filter(v => matchVisitor(v, 'checked-out'));
assert.strictEqual(checkedOutMatches.length, 2, 'Keyword "checked-out" should return 2 checked-out visitors');
console.log('✓ Test 7: Status alias "checked-out" returns checked-out visitors');

// Test 8: Search status keyword "present" returns active inside and overdue visitors
const presentMatches = testVisitors.filter(v => matchVisitor(v, 'present'));
assert.strictEqual(presentMatches.length, 2, 'Keyword "present" should return 2 on-premises visitors');
assert.ok(presentMatches.some(v => v.status === 'Checked-In'));
assert.ok(presentMatches.some(v => v.status === 'Overdue'));
console.log('✓ Test 8: Status alias "present" returns active inside and overdue visitors');

// Test 9: Search status keyword "overdue" returns overdue visitor
const overdueMatches = testVisitors.filter(v => matchVisitor(v, 'overdue'));
assert.strictEqual(overdueMatches.length, 1);
assert.strictEqual(overdueMatches[0].fullName, 'Babatunde Adeleke');
console.log('✓ Test 9: Status alias "overdue" correctly filters overdue visitors');

// Test 10: Categorization utility partitions past and present accurately
const categorized = filterAndCategorizeVisitors(testVisitors, 'Sterling');
assert.strictEqual(categorized.allMatches.length, 3, 'Host Sterling should match 3 records (1 present, 2 past)');
assert.strictEqual(categorized.presentMatches.length, 1, '1 present visitor visiting host Sterling');
assert.strictEqual(categorized.pastMatches.length, 2, '2 past visitors visiting host Sterling');
console.log('✓ Test 10: filterAndCategorizeVisitors accurately separates past and present records');

// Test 11: Empty query matches all records
const allRecords = filterAndCategorizeVisitors(testVisitors, '');
assert.strictEqual(allRecords.allMatches.length, 4, 'Empty query must match 100% of records');
console.log('✓ Test 11: Empty query matches 100% of past and present records');

// Test 12: Department filter combined with search query across past records
const deptFiltered = filterAndCategorizeVisitors(testVisitors, 'Marcus', 'IT & Cyber Security');
assert.strictEqual(deptFiltered.allMatches.length, 2);
assert.strictEqual(deptFiltered.pastMatches.length, 1);
console.log('✓ Test 12: Combined department filter and search across past records');

// Test 13: Edge cases (null, undefined, special characters, ReDoS safe)
assert.strictEqual(matchVisitor(null, 'test'), false);
assert.strictEqual(matchVisitor(testVisitors[0], null), true);
assert.strictEqual(matchVisitor(testVisitors[0], undefined), true);
assert.strictEqual(matchVisitor(testVisitors[0], '   '), true);
assert.strictEqual(matchVisitor(testVisitors[0], "'; DROP TABLE visitors; --"), false);
assert.strictEqual(matchVisitor(testVisitors[0], '.*+?^${}()|[]\\'), false);
console.log('✓ Test 13: Edge cases, null checks, and injection queries handled safely');

console.log('\n=== ALL 13 PAST & PRESENT SEARCH TESTS PASSED SUCCESSFULLY! ===\n');
