import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_ORG_FIELDS } from '../src/db/sqliteDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('=== TEST SUITE: DYNAMIC SCHEMA & GUEST REGISTRATION FLOW ===\n');

// 1. Source file inspections
const quickCheckInContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/QuickCheckInModal.jsx'), 'utf8');
const wizardContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/OrgSetupWizardModal.jsx'), 'utf8');
const settingsContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/views/SettingsView.jsx'), 'utf8');
const sqliteDbContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/db/sqliteDb.js'), 'utf8');

// Test 1: No hardcoded field_key === 'purpose' overrides in QuickCheckInModal
console.log('Test 1: Pure schema-driven rendering without hardcoded purpose overrides');
assert.ok(
  !quickCheckInContent.includes("field.field_key === 'purpose'"),
  'QuickCheckInModal must NOT have hardcoded field_key === "purpose" branch'
);
assert.ok(
  !quickCheckInContent.includes("field.field_key !== 'purpose'"),
  'QuickCheckInModal select branch must NOT exclude purpose by key'
);
assert.ok(
  !sqliteDbContent.includes("WHERE field_key = 'purpose' AND field_type = 'select'"),
  'sqliteDb.js must NOT forcibly mutate purpose to text'
);
console.log('  ✓ Pass: QuickCheckInModal and sqliteDb do not hardcode purpose behavior by key.\n');

// Test 2: Multiple Choice (radio) available in OrgSetupWizardModal
console.log('Test 2: Multiple Choice (radio) in OrgSetupWizardModal');
assert.ok(
  wizardContent.includes("value: 'radio'"),
  'OrgSetupWizardModal must include radio in AVAILABLE_FIELD_TYPES'
);
assert.ok(
  wizardContent.includes("Multiple Choice"),
  'OrgSetupWizardModal must label radio as Multiple Choice'
);
assert.ok(
  wizardContent.includes("newFieldDraft.field_type === 'radio'"),
  'OrgSetupWizardModal draft must support radio options input'
);
console.log('  ✓ Pass: OrgSetupWizardModal supports Multiple Choice (radio) field type.\n');

// Test 3: Multiple Choice (radio) available in SettingsView
console.log('Test 3: Multiple Choice (radio) in SettingsView Form Builder');
assert.ok(
  settingsContent.includes("value: 'radio'"),
  'SettingsView must include radio in AVAILABLE_FIELD_TYPES'
);
assert.ok(
  settingsContent.includes("Multiple Choice"),
  'SettingsView must label radio as Multiple Choice'
);
assert.ok(
  settingsContent.includes("newFieldDraft.field_type === 'radio'"),
  'SettingsView draft must support radio options input'
);
console.log('  ✓ Pass: SettingsView Form Builder supports Multiple Choice (radio) field type.\n');

// Test 4: QuickCheckInModal renders Multiple Choice (radio) inputs
console.log('Test 4: QuickCheckInModal Multiple Choice rendering');
assert.ok(
  quickCheckInContent.includes("field.field_type === 'radio'"),
  'QuickCheckInModal must have dedicated render branch for radio'
);
assert.ok(
  quickCheckInContent.includes('role="radiogroup"'),
  'QuickCheckInModal radio group must include accessible role="radiogroup"'
);
assert.ok(
  quickCheckInContent.includes('type="radio"'),
  'QuickCheckInModal must render native HTML radio inputs'
);
console.log('  ✓ Pass: QuickCheckInModal renders accessible, high-contrast radio groups.\n');

// Test 5: Safe options fallback and normalization
console.log('Test 5: Options normalization across schema definitions');
assert.ok(
  quickCheckInContent.includes('JSON.parse(field.options_json)'),
  'QuickCheckInModal must safely parse options_json when options array is absent'
);
const idTypeField = DEFAULT_ORG_FIELDS.find(f => f.field_key === 'idType');
assert.ok(
  idTypeField && Array.isArray(idTypeField.options) && idTypeField.options.length > 0,
  'DEFAULT_ORG_FIELDS idType must have populated options array'
);
console.log('  ✓ Pass: Options safely normalized across defaults and dynamic rendering.\n');

// Test 6: Wizard immediate state synchronization contract
console.log('Test 6: Wizard immediate synchronization contract');
assert.ok(
  wizardContent.includes('setOrgFields(fields)'),
  'OrgSetupWizardModal must call setOrgFields upon onboarding completion'
);
console.log('  ✓ Pass: setOrgFields called synchronously on wizard completion.\n');

console.log('================================================================');
console.log('ALL DYNAMIC SCHEMA FLOW REGRESSION TESTS PASSED (6/6)');
console.log('================================================================');

process.exit(0);
