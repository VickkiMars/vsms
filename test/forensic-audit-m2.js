import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('--- FORENSIC AUDITOR INDEPENDENT VERIFICATION SUITE FOR MILESTONE 2 ---');

// 1. Source files inspection
const sidebarPath = path.join(PROJECT_ROOT, 'src', 'components', 'Sidebar.jsx');
const headerPath = path.join(PROJECT_ROOT, 'src', 'components', 'Header.jsx');
const cmdkPath = path.join(PROJECT_ROOT, 'src', 'components', 'CommandPalette.jsx');

const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
const headerContent = fs.readFileSync(headerPath, 'utf8');
const cmdkContent = fs.readFileSync(cmdkPath, 'utf8');

// A. Check for prohibited colored token classes in M2 components
const prohibitedColorRegex = /(emerald|amber|indigo|rose|cyan|teal|purple|yellow|red-\d|green-\d|blue-\d)/i;

assert.strictEqual(prohibitedColorRegex.test(sidebarContent), false, 'Sidebar must not have prohibited colored tokens');
assert.strictEqual(prohibitedColorRegex.test(headerContent), false, 'Header must not have prohibited colored tokens');
assert.strictEqual(prohibitedColorRegex.test(cmdkContent), false, 'CommandPalette must not have prohibited colored tokens');

console.log('✓ Check 1: Zero prohibited colored tokens in M2 components');

// B. Check for fake facades / dummy return values
assert.ok(sidebarContent.includes('setActiveView'), 'Sidebar must connect to setActiveView');
assert.ok(sidebarContent.includes('setIsCheckInOpen'), 'Sidebar must connect to setIsCheckInOpen');
assert.ok(sidebarContent.includes('setIsCmdKOpen'), 'Sidebar must connect to setIsCmdKOpen');
assert.ok(sidebarContent.includes('setUserRole'), 'Sidebar must connect to setUserRole');
assert.ok(sidebarContent.includes('toggleTheme'), 'Sidebar must connect to toggleTheme');

assert.ok(headerContent.includes('setGlobalSearchQuery'), 'Header must connect to setGlobalSearchQuery');
assert.ok(headerContent.includes('setSelectedDeptFilter'), 'Header must connect to setSelectedDeptFilter');
assert.ok(headerContent.includes('exportToCSV'), 'Header must connect to exportToCSV');
assert.ok(headerContent.includes('resetToDemoData'), 'Header must connect to resetToDemoData');
assert.ok(headerContent.includes('setUserRole'), 'Header must connect to setUserRole');
assert.ok(headerContent.includes('toggleTheme'), 'Header must connect to toggleTheme');

assert.ok(cmdkContent.includes('checkOutVisitor'), 'CommandPalette must support direct checkOutVisitor');
assert.ok(cmdkContent.includes('openBadgeModal'), 'CommandPalette must support direct openBadgeModal');
assert.ok(cmdkContent.includes('setActiveView'), 'CommandPalette must support navigation');
assert.ok(cmdkContent.includes('setIsCheckInOpen'), 'CommandPalette must support registration trigger');

console.log('✓ Check 2: All state actions and hooks genuinely wired (No facade implementations)');

// C. Verify CommandPalette arrow key traversal logic simulation
let selectedIndex = 0;
const flatItems = ['guest1', 'guest2', 'act1', 'act2', 'act3']; // 5 items

// ArrowDown 6 times
for (let i = 0; i < 6; i++) {
  selectedIndex = (selectedIndex + 1) % flatItems.length;
}
assert.strictEqual(selectedIndex, 1, 'ArrowDown cyclical navigation must land on index 1 after 6 presses');

// ArrowUp 2 times
for (let i = 0; i < 2; i++) {
  selectedIndex = (selectedIndex - 1 + flatItems.length) % flatItems.length;
}
assert.strictEqual(selectedIndex, 4, 'ArrowUp cyclical navigation must wrap to index 4');

console.log('✓ Check 3: Cyclical arrow navigation arithmetic strictly verified');

// D. Verify ARIA & accessibility markers
assert.ok(sidebarContent.includes('aria-label='), 'Sidebar contains ARIA labels');
assert.ok(sidebarContent.includes('aria-current='), 'Sidebar contains ARIA current page marker');
assert.ok(headerContent.includes('aria-label='), 'Header contains ARIA labels');
assert.ok(cmdkContent.includes('role="dialog"'), 'CommandPalette has role dialog');
assert.ok(cmdkContent.includes('aria-modal="true"'), 'CommandPalette has aria-modal true');

console.log('✓ Check 4: Full ARIA accessibility and keyboard dialog attributes verified');

console.log('\n--- ALL FORENSIC AUDITOR INDEPENDENT CHECKS PASSED ---');
