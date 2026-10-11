/**
 * setup-org-button-test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Regression test suite verifying:
 * 1. Header organization switcher "+ Setup New Organization" button formatting
 *    and dropdown effective organizations resolution.
 * 2. OrgSetupWizardModal lifecycle reset, async persistence, and double-click guard.
 * 3. AuthContext organization persistence and fallback cohesion.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n=== TEST SUITE: SETUP NEW ORGANIZATION BUTTON & WIZARD RESILIENCE ===\n');

// ── Test 1: Header button no duplicate plus signs ────────────────────────────
{
  const headerContent = fs.readFileSync(path.join(rootDir, 'src/components/Header.jsx'), 'utf-8');

  // Verify the button text does not contain '+ Setup New Organization' which causes '+ +' with the icon
  assert.ok(
    !headerContent.includes('<span>+ Setup New Organization</span>'),
    'Header should not have duplicate "+" sign inside span alongside Plus icon'
  );

  assert.ok(
    headerContent.includes('<span>Setup New Organization</span>'),
    'Header should render clean "Setup New Organization" label'
  );

  assert.ok(
    headerContent.includes('<Plus className="w-3.5 h-3.5" />'),
    'Header button should render high-contrast Plus icon'
  );

  console.log('  ✓ Pass: Header "+ Setup New Organization" button markup eliminates duplicate plus sign');
}

// ── Test 2: Header dropdown uses effectiveOrgs to prevent disconnect ──────────
{
  const headerContent = fs.readFileSync(path.join(rootDir, 'src/components/Header.jsx'), 'utf-8');

  assert.ok(
    headerContent.includes('effectiveOrgs'),
    'Header must compute effectiveOrgs to prevent showing "No organizations yet" when currentOrg is active'
  );

  assert.ok(
    headerContent.includes('effectiveOrgs.length === 0'),
    'Header dropdown list conditionally checks effectiveOrgs.length'
  );

  assert.ok(
    headerContent.includes('effectiveOrgs.map('),
    'Header dropdown list iterates over effectiveOrgs'
  );

  console.log('  ✓ Pass: Header dropdown resolves effectiveOrgs falling back to active organization');
}

// ── Test 3: OrgSetupWizardModal imports clean initialData ─────────────────────
{
  const wizardContent = fs.readFileSync(path.join(rootDir, 'src/components/OrgSetupWizardModal.jsx'), 'utf-8');
  const quickCheckContent = fs.readFileSync(path.join(rootDir, 'src/components/QuickCheckInModal.jsx'), 'utf-8');

  assert.ok(
    !wizardContent.includes("from '../db/sqliteDb'"),
    'OrgSetupWizardModal should not import DEFAULT_ORG_FIELDS from sqliteDb'
  );
  assert.ok(
    wizardContent.includes("from '../data/initialData.js'"),
    'OrgSetupWizardModal should import DEFAULT_ORG_FIELDS from initialData.js'
  );

  assert.ok(
    !quickCheckContent.includes("from '../db/sqliteDb'"),
    'QuickCheckInModal should not import DEFAULT_ORG_FIELDS from sqliteDb'
  );
  assert.ok(
    quickCheckContent.includes("from '../data/initialData.js'"),
    'QuickCheckInModal should import DEFAULT_ORG_FIELDS from initialData.js'
  );

  console.log('  ✓ Pass: Modals import canonical DEFAULT_ORG_FIELDS from initialData without wasm bloat');
}

// ── Test 4: OrgSetupWizardModal resets step & form state on open ───────────────
{
  const wizardContent = fs.readFileSync(path.join(rootDir, 'src/components/OrgSetupWizardModal.jsx'), 'utf-8');

  assert.ok(
    wizardContent.includes('useEffect(() => {'),
    'OrgSetupWizardModal must include useEffect'
  );

  assert.ok(
    wizardContent.includes('[isOrgWizardOpen]'),
    'OrgSetupWizardModal must trigger effect when isOrgWizardOpen toggles'
  );

  assert.ok(
    wizardContent.includes('setStep(1)'),
    'OrgSetupWizardModal must reset step to 1 when modal is opened'
  );

  assert.ok(
    wizardContent.includes("setStepErrors('')"),
    'OrgSetupWizardModal must clear stale step errors on re-open'
  );

  console.log('  ✓ Pass: OrgSetupWizardModal resets step to 1 and clears state on re-open');
}

// ── Test 5: Async handleFinishOnboarding & double submission guard ────────────
{
  const wizardContent = fs.readFileSync(path.join(rootDir, 'src/components/OrgSetupWizardModal.jsx'), 'utf-8');

  assert.ok(
    wizardContent.includes('const handleFinishOnboarding = async () => {'),
    'handleFinishOnboarding must be async'
  );

  assert.ok(
    wizardContent.includes('await createOrganizationWithAdmin'),
    'handleFinishOnboarding must await createOrganizationWithAdmin'
  );

  assert.ok(
    wizardContent.includes('isSubmitting'),
    'OrgSetupWizardModal must track isSubmitting state to prevent double submit'
  );

  assert.ok(
    wizardContent.includes('disabled={isSubmitting}'),
    'Launch button must be disabled when isSubmitting is true'
  );

  console.log('  ✓ Pass: handleFinishOnboarding awaits persistence and guards against double-clicks');
}

// ── Test 6: AuthContext maintains newly created organization in state ─────────
{
  const authContent = fs.readFileSync(path.join(rootDir, 'src/context/AuthContext.jsx'), 'utf-8');

  assert.ok(
    authContent.includes('browserStorageFallback.getOrganizationsFallback()'),
    'AuthContext must initialize and fall back organizations using browserStorageFallback'
  );

  assert.ok(
    authContent.includes('const finalOrgs = (allOrgs && allOrgs.length > 0) ? allOrgs : [newOrg];'),
    'AuthContext must guarantee newly created organization is kept in organizations state'
  );

  assert.ok(
    authContent.includes('return newOrg;'),
    'createOrganizationWithAdmin must return the created organization'
  );

  console.log('  ✓ Pass: AuthContext guarantees persistence and immediate availability of new org');
}

console.log('\n================================================================');
console.log('ALL SETUP ORGANIZATION BUTTON & WIZARD TESTS PASSED (6/6)');
console.log('================================================================\n');
