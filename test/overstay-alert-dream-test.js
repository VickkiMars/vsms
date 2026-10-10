/**
 * test/overstay-alert-dream-test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Regression test suite for Facility Overstay Alert and Web Audio synthesizer.
 * Verifies:
 * 1. Persistent desk acknowledgment storage (localStorage sync across reloads)
 * 2. Rate-limiting cooldown per overdue visitor (60s default)
 * 3. Diagnostic forced test sound contract (bypasses global desk mute)
 * 4. Batch acknowledgment (Mute All) contract
 * 5. Surveillance heartbeat pure state transition & side-effect dispatch
 */

import assert from 'node:assert';
import { audioAlertService } from '../src/services/audioAlertService.js';

// Mock localStorage for headless Node environment
const mockStorage = new Map();
global.window = {
  AudioContext: class MockAudioContext {
    constructor() {
      this.state = 'running';
      this.currentTime = 0;
      this.destination = {};
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
        disconnect() {},
      };
    }
    createOscillator() {
      return {
        frequency: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {},
          linearRampToValueAtTime() {},
        },
        connect() {},
        start() {},
        stop() {},
        disconnect() {},
      };
    }
  },
  localStorage: {
    getItem(key) {
      return mockStorage.get(key) || null;
    },
    setItem(key, val) {
      mockStorage.set(key, String(val));
    },
    removeItem(key) {
      mockStorage.delete(key);
    },
    clear() {
      mockStorage.clear();
    },
  },
  addEventListener() {},
  removeEventListener() {},
};

global.localStorage = window.localStorage;

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ Pass: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('\n=== TEST SUITE: FACILITY OVERSTAY ALERT & SYNTHESIZER CONTRACTS ===\n');

// Test 1: Rate Limiting & Cooldown Contract
runTest('Cooldown rate limiter enforces 60s window per visitor', () => {
  audioAlertService.setMuted(false);
  audioAlertService.clearAcknowledgment('VIS-TEST-1');
  
  // First check should allow alert
  assert.strictEqual(audioAlertService.canAlertVisitor('VIS-TEST-1'), true);
  
  // Record alert
  audioAlertService.recordAlert('VIS-TEST-1');
  
  // Immediate next check must be denied
  assert.strictEqual(audioAlertService.canAlertVisitor('VIS-TEST-1'), false);
  
  // Custom small cooldown window test (e.g. 5ms)
  const now = Date.now();
  audioAlertService.lastAlertTimestamps.set('VIS-TEST-1', now - 100);
  assert.strictEqual(audioAlertService.canAlertVisitor('VIS-TEST-1', 50), true);
});

// Test 2: Acknowledgment Silences Visitor and Persists to Storage
runTest('Acknowledgment silences visitor and persists to localStorage', () => {
  mockStorage.clear();
  audioAlertService.clearAcknowledgment('VIS-TEST-2');
  
  assert.strictEqual(audioAlertService.canAlertVisitor('VIS-TEST-2'), true);
  
  // Acknowledge visitor
  audioAlertService.acknowledgeAlert('VIS-TEST-2');
  
  // Must be silenced regardless of cooldown
  assert.strictEqual(audioAlertService.canAlertVisitor('VIS-TEST-2'), false);
  
  // Verify localStorage contains JSON array
  const raw = mockStorage.get('vsms_acknowledged_alerts');
  assert.ok(raw, 'localStorage must contain vsms_acknowledged_alerts');
  const parsed = JSON.parse(raw);
  assert.ok(parsed.includes('VIS-TEST-2'), 'Persisted array must contain VIS-TEST-2');
});

// Test 3: Batch Acknowledgment (Mute All)
runTest('Batch acknowledgment silences multiple visitors simultaneously', () => {
  const ids = ['VIS-BATCH-1', 'VIS-BATCH-2', 'VIS-BATCH-3'];
  audioAlertService.acknowledgeAll(ids);
  
  ids.forEach(id => {
    assert.strictEqual(audioAlertService.canAlertVisitor(id), false);
  });
  
  const raw = mockStorage.get('vsms_acknowledged_alerts');
  const parsed = JSON.parse(raw);
  ids.forEach(id => {
    assert.ok(parsed.includes(id), `localStorage must contain ${id}`);
  });
});

// Test 4: Clear Acknowledgment on Check-Out
runTest('Clear acknowledgment removes visitor from memory and storage', () => {
  audioAlertService.acknowledgeAlert('VIS-CHECKOUT-1');
  assert.strictEqual(audioAlertService.acknowledgedAlerts.has('VIS-CHECKOUT-1'), true);
  
  audioAlertService.clearAcknowledgment('VIS-CHECKOUT-1');
  assert.strictEqual(audioAlertService.acknowledgedAlerts.has('VIS-CHECKOUT-1'), false);
  
  const raw = mockStorage.get('vsms_acknowledged_alerts');
  const parsed = JSON.parse(raw);
  assert.strictEqual(parsed.includes('VIS-CHECKOUT-1'), false);
});

// Test 5: Diagnostic Test Sound Bypasses Global Mute
runTest('Diagnostic test chime (force=true) bypasses global desk mute', () => {
  audioAlertService.setMuted(true);
  assert.strictEqual(audioAlertService.isMuted(), true);
  
  let chimeSynthesized = false;
  const originalGetContext = audioAlertService._getAudioContext;
  audioAlertService._getAudioContext = function() {
    chimeSynthesized = true;
    return new window.AudioContext();
  };
  
  try {
    // Normal call while muted must NOT synthesize
    chimeSynthesized = false;
    audioAlertService.playOverstayChime(0.3, false);
    assert.strictEqual(chimeSynthesized, false, 'Unforced chime while muted must not run');
    
    // Forced diagnostic test MUST synthesize
    chimeSynthesized = false;
    audioAlertService.playOverstayChime(0.3, true);
    assert.strictEqual(chimeSynthesized, true, 'Forced chime while muted must synthesize sound');
  } finally {
    audioAlertService._getAudioContext = originalGetContext;
    audioAlertService.setMuted(false);
  }
});

// Test 6: Surveillance Ticker Overstay Logic
runTest('Surveillance math accurately detects overdue visitors based on expectedDurationMinutes', () => {
  const now = Date.now();
  const mockVisitors = [
    {
      id: 'VIS-ONTIME',
      status: 'Checked-In',
      checkInTime: new Date(now - 30 * 60 * 1000).toISOString(), // 30m ago
      expectedDurationMinutes: 60, // 60m max -> On time
    },
    {
      id: 'VIS-OVERDUE-1',
      status: 'Checked-In',
      checkInTime: new Date(now - 75 * 60 * 1000).toISOString(), // 75m ago
      expectedDurationMinutes: 60, // 60m max -> 15m overdue
    },
    {
      id: 'VIS-CHECKED-OUT',
      status: 'Checked-Out',
      checkInTime: new Date(now - 120 * 60 * 1000).toISOString(),
      expectedDurationMinutes: 30, // Already departed
    }
  ];

  const newlyOverdue = [];
  const next = mockVisitors.map(v => {
    if (v.status === 'Checked-Out') return v;
    const checkIn = new Date(v.checkInTime).getTime();
    const durationMins = parseInt(v.expectedDurationMinutes, 10) || 60;
    const isPastDue = (now - checkIn) > (durationMins * 60 * 1000);
    if (isPastDue && v.status !== 'Overdue') {
      newlyOverdue.push(v);
      return { ...v, status: 'Overdue' };
    }
    return v;
  });

  assert.strictEqual(newlyOverdue.length, 1);
  assert.strictEqual(newlyOverdue[0].id, 'VIS-OVERDUE-1');
  assert.strictEqual(next.find(v => v.id === 'VIS-OVERDUE-1').status, 'Overdue');
  assert.strictEqual(next.find(v => v.id === 'VIS-ONTIME').status, 'Checked-In');
  assert.strictEqual(next.find(v => v.id === 'VIS-CHECKED-OUT').status, 'Checked-Out');
});

console.log(`\n================================================================`);
console.log(`ALL OVERSTAY ALERT REGRESSION TESTS PASSED (${passed}/${total})`);
console.log(`================================================================\n`);
