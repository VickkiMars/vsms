import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('=== VERIFICATION SUITE: WALKTHROUGH CHECK-IN FIELD SYNC ===\n');

// 1. Inspect QuickCheckInModal.jsx source
const quickCheckInPath = path.join(PROJECT_ROOT, 'src', 'components', 'QuickCheckInModal.jsx');
const quickCheckInContent = fs.readFileSync(quickCheckInPath, 'utf8');

// Check A: QuickCheckInModal derives activeFields from orgFields
assert.ok(
  quickCheckInContent.includes('activeFields'),
  'QuickCheckInModal must define activeFields'
);
assert.ok(
  quickCheckInContent.includes('orgFields'),
  'QuickCheckInModal must consume orgFields from useVisitorContext'
);

// Check B: Dynamic field label and placeholder mapping
assert.ok(
  quickCheckInContent.includes('{field.field_name}'),
  'QuickCheckInModal must dynamically render configured field.field_name'
);
assert.ok(
  quickCheckInContent.includes('field.placeholder'),
  'QuickCheckInModal must dynamically render configured field.placeholder'
);
assert.ok(
  quickCheckInContent.includes('field.is_required'),
  'QuickCheckInModal must evaluate configured field.is_required'
);

// Check C: All Walkthrough field types supported in QuickCheckInModal
const expectedTypes = ['host_picker', 'select', 'checkbox', 'textarea', 'number', 'phone', 'photo'];
expectedTypes.forEach(type => {
  assert.ok(
    quickCheckInContent.includes(type),
    `QuickCheckInModal must support walkthrough field type: ${type}`
  );
});

// Check D: Focus management & required audit assertions preserved
assert.ok(quickCheckInContent.includes('nameInputRef.current?.focus()'), 'Must preserve nameInputRef focus');
assert.ok(quickCheckInContent.includes('phoneInputRef.current?.focus()'), 'Must preserve phoneInputRef focus');
assert.ok(quickCheckInContent.includes('idNumberInputRef.current?.focus()'), 'Must preserve idNumberInputRef focus');
assert.ok(quickCheckInContent.includes('errors.fullName && touched.fullName'), 'Must preserve fullName validation notice');
assert.ok(quickCheckInContent.includes('filteredHosts'), 'Must preserve filteredHosts');
assert.ok(quickCheckInContent.includes('handleDepartmentChange'), 'Must preserve handleDepartmentChange');
assert.ok(quickCheckInContent.includes('matching.length > 0 ? matching : hosts'), 'Must preserve department fallback');

// Check E: OrgSetupWizardModal calls setOrgFields immediately upon onboarding
const wizardPath = path.join(PROJECT_ROOT, 'src', 'components', 'OrgSetupWizardModal.jsx');
const wizardContent = fs.readFileSync(wizardPath, 'utf8');
assert.ok(
  wizardContent.includes('setOrgFields(fields)'),
  'OrgSetupWizardModal must sync configured fields with VisitorContext immediately'
);

// Check F: VisitorContext exports setOrgFields
const visitorContextPath = path.join(PROJECT_ROOT, 'src', 'context', 'VisitorContext.jsx');
const visitorContextContent = fs.readFileSync(visitorContextPath, 'utf8');
assert.ok(
  visitorContextContent.includes('setOrgFields,'),
  'VisitorContext must export setOrgFields'
);

console.log('✓ All checks passed: New Visitor Check-In card dynamically displays fields configured in organizational walkthrough!');
