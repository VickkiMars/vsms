import { INITIAL_VISITORS } from '../../src/data/initialData.js';

console.log('=== BADGE ID GENERATION VERIFICATION ===\n');

// Simulate VisitorContext registerVisitor badge ID logic
let visitors = [...INITIAL_VISITORS];

function registerVisitor(fullName) {
  const newId = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
  const existingMaxBadge = visitors.reduce((max, v) => {
    const num = parseInt(v.badgeId?.replace(/^BDG-/, '') || '0', 10);
    return num > max ? num : max;
  }, 80);
  const badgeId = `BDG-${String(existingMaxBadge + 1).padStart(3, '0')}`;

  const newVisitor = {
    id: newId,
    fullName,
    badgeId,
    checkInTime: new Date().toISOString(),
    status: 'Checked-In'
  };

  visitors = [newVisitor, ...visitors];
  return newVisitor;
}

console.log('Initial visitors count:', visitors.length);
console.log('Initial max badge:', Math.max(...visitors.map(v => parseInt(v.badgeId.replace('BDG-', ''), 10))));

const guests = ['Guest A', 'Guest B', 'Guest C', 'Guest D', 'Guest E'];
const registered = guests.map(g => registerVisitor(g));

console.log('\nRegistered array (returned by guests.map):');
registered.forEach((r, idx) => console.log(`  registered[${idx}]: name=${r.fullName}, badgeId=${r.badgeId}`));

console.log('\nvisitors state array (prefixed on register):');
visitors.slice(0, 5).forEach((v, idx) => console.log(`  visitors[${idx}]: name=${v.fullName}, badgeId=${v.badgeId}`));

// Forward check on registered array
console.log('\nVerifying sequence on registered array (forward order):');
for (let i = 0; i < registered.length - 1; i++) {
  const n1 = parseInt(registered[i].badgeId.replace('BDG-', ''), 10);
  const n2 = parseInt(registered[i + 1].badgeId.replace('BDG-', ''), 10);
  console.log(`  i=${i}: n1=${n1}, n2=${n2}, n2 === n1 + 1: ${n2 === n1 + 1}`);
}

// Reverse check on visitors array
console.log('\nVerifying sequence on visitors state array (reverse chronological order):');
for (let i = 0; i < registered.length - 1; i++) {
  const n1 = parseInt(visitors[i].badgeId.replace('BDG-', ''), 10);
  const n2 = parseInt(visitors[i + 1].badgeId.replace('BDG-', ''), 10);
  console.log(`  i=${i}: n1=${n1}, n2=${n2}, n1 === n2 + 1: ${n1 === n2 + 1}`);
}
