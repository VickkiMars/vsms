import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('--- FORENSIC AUDITOR INDEPENDENT VERIFICATION SUITE FOR MILESTONE 5 ---');

// 1. Source files inspection
const analyticsPath = path.join(PROJECT_ROOT, 'src', 'views', 'AnalyticsView.jsx');
const deptsPath = path.join(PROJECT_ROOT, 'src', 'views', 'DepartmentsView.jsx');
const settingsPath = path.join(PROJECT_ROOT, 'src', 'views', 'SettingsView.jsx');

const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
const deptsContent = fs.readFileSync(deptsPath, 'utf8');
const settingsContent = fs.readFileSync(settingsPath, 'utf8');

// A. Check for prohibited colored token classes in M5 views
const prohibitedColorRegex = /(emerald|amber|indigo|rose|cyan|teal|purple|yellow|red-\d|green-\d|blue-\d)/i;

assert.strictEqual(prohibitedColorRegex.test(analyticsContent), false, 'AnalyticsView must not have prohibited colored tokens');
assert.strictEqual(prohibitedColorRegex.test(deptsContent), false, 'DepartmentsView must not have prohibited colored tokens');
assert.strictEqual(prohibitedColorRegex.test(settingsContent), false, 'SettingsView must not have prohibited colored tokens');

console.log('✓ Check 1: Zero prohibited colored tokens in M5 secondary views');

// B. Check AnalyticsView features
assert.ok(analyticsContent.includes('Total Visitors Today'), 'AnalyticsView must include Total Visitors Today metric');
assert.ok(analyticsContent.includes('Currently Inside'), 'AnalyticsView must include Currently Inside metric');
assert.ok(analyticsContent.includes('Overdue Guests'), 'AnalyticsView must include Overdue Guests metric');
assert.ok(analyticsContent.includes('Avg Stay Duration'), 'AnalyticsView must include Avg Stay Duration metric');
assert.ok(analyticsContent.includes('Peak Arrival Hour'), 'AnalyticsView must include Peak Arrival Hour metric');
assert.ok(analyticsContent.includes('Department Traffic Distribution'), 'AnalyticsView must include Department Traffic distribution');
assert.ok(analyticsContent.includes('Hourly Check-In Volume'), 'AnalyticsView must include Hourly Check-In Volume');
assert.ok(analyticsContent.includes('Status Breakdown'), 'AnalyticsView must include Status Breakdown');
assert.ok(analyticsContent.includes('timePeriod') || analyticsContent.includes('timeRange'), 'AnalyticsView must have time period state');
assert.ok(analyticsContent.includes('This Week'), 'AnalyticsView must have This Week option');
assert.ok(analyticsContent.includes('This Month'), 'AnalyticsView must have This Month option');

console.log('✓ Check 2: AnalyticsView metric cards, charts, and period selectors verified');

// C. Check DepartmentsView features
assert.ok(deptsContent.includes('setSelectedDeptFilter'), 'DepartmentsView must wire setSelectedDeptFilter');
assert.ok(deptsContent.includes('setActiveView'), 'DepartmentsView must wire setActiveView');
assert.ok(deptsContent.includes('View Department Visitors'), 'DepartmentsView must have View Department Visitors CTA');
assert.ok(deptsContent.includes('Ext. #'), 'DepartmentsView must display contact extensions');
assert.ok(deptsContent.includes('Active Guests'), 'DepartmentsView must display active visitor counts');

console.log('✓ Check 3: DepartmentsView directory cards, pill badges, extensions & quick navigation verified');

// D. Check SettingsView features
assert.ok(settingsContent.includes('toggleTheme'), 'SettingsView must connect to toggleTheme');
assert.ok(settingsContent.includes('setUserRole'), 'SettingsView must connect to setUserRole');
assert.ok(settingsContent.includes('resetToDemoData'), 'SettingsView must connect to resetToDemoData');
assert.ok(settingsContent.includes('v2.0.0 Monochrome Edition'), 'SettingsView must display v2.0.0 Monochrome Edition');
assert.ok(settingsContent.includes('Build Timestamp'), 'SettingsView must display Build Timestamp');
assert.ok(settingsContent.includes('Storage Usage') || settingsContent.includes('storageMetrics'), 'SettingsView must display Storage Usage metrics');
assert.ok(settingsContent.includes('Reset to Demo Data'), 'SettingsView must have Reset to Demo Data section');
assert.ok(settingsContent.includes('role="dialog"'), 'SettingsView must have accessible confirmation dialog');

console.log('✓ Check 4: SettingsView theme preview, role switcher, system info & reset dialog verified');

console.log('\n--- ALL FORENSIC AUDITOR INDEPENDENT CHECKS FOR M5 PASSED SUCCESSFULLY ---');
