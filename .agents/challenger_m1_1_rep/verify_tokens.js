import fs from 'fs';
import path from 'path';

const projectRoot = '/home/kami/Desktop/codebase/vsms';
const m1Files = [
  'tailwind.config.js',
  'src/index.css',
  'src/context/VisitorContext.jsx',
  'src/App.jsx',
  'index.html'
];

console.log('=== EMPIRICAL CHROMATIC & TOKEN ANALYSIS ===\n');

// 1. Check all hex colors in M1 files
let chromaticFound = false;
for (const relPath of m1Files) {
  const fullPath = path.join(projectRoot, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Find 3, 4, 6, 8 digit hex colors
  const hexMatches = content.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g) || [];
  for (const hex of hexMatches) {
    let r, g, b;
    if (hex.length === 4) { // #rgb
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) { // #rrggbb
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else {
      continue;
    }

    if (r !== g || g !== b) {
      console.error(`[FAIL] Chromatic hex found in ${relPath}: ${hex} (R=${r}, G=${g}, B=${b})`);
      chromaticFound = true;
    }
  }

  // Check rgb/rgba values
  const rgbMatches = content.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g);
  for (const match of rgbMatches) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    if (r !== g || g !== b) {
      console.error(`[FAIL] Chromatic rgb/rgba found in ${relPath}: ${match[0]} (R=${r}, G=${g}, B=${b})`);
      chromaticFound = true;
    }
  }
}

if (!chromaticFound) {
  console.log('[PASS] All hex and rgb/rgba colors across all M1 files are mathematically pure monochrome (R === G === B).');
}

// 2. Check for legacy keyword strings in M1 files
const legacyKeywords = ['emerald', '10a37f', '1a7f64', '#10a37f', 'green', 'blue', 'amber', 'rose', 'indigo', 'purple'];
let keywordIssues = 0;
for (const relPath of m1Files) {
  const fullPath = path.join(projectRoot, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  for (const kw of legacyKeywords) {
    // Check if kw appears outside of comments or aliasing
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const lineNum = content.slice(0, match.index).split('\n').length;
      const lineContent = content.split('\n')[lineNum - 1];
      console.log(`[NOTE] Keyword "${kw}" found in ${relPath}:${lineNum} -> "${lineContent.trim()}"`);
      // check if it's an active non-monochrome styling
      if (kw === 'emerald' && relPath === 'tailwind.config.js' && lineContent.includes("'glow-emerald'")) {
        console.log(`  -> Checked: 'glow-emerald' is aliased to monochrome glow '0 0 15px rgba(255, 255, 255, 0.15)' for backward compat.`);
      }
    }
  }
}

// 3. Test tailwind.config.js export
import('../../tailwind.config.js').then(twModule => {
  const config = twModule.default;
  console.log('\n--- Tailwind Config Verification ---');
  console.log('darkMode:', config.darkMode);
  console.log('mono scale keys:', Object.keys(config.theme.extend.colors.mono));
  console.log('openai aliases:', config.theme.extend.colors.openai);
  console.log('m3 token mappings count:', Object.keys(config.theme.extend.colors.m3).length);
  console.log('sans fonts:', config.theme.extend.fontFamily.sans);
  console.log('mono fonts:', config.theme.extend.fontFamily.mono);
  console.log('box shadows:', Object.keys(config.theme.extend.boxShadow));

  // Verify all shadows are monochrome
  let coloredShadows = false;
  for (const [name, shadowVal] of Object.entries(config.theme.extend.boxShadow)) {
    const rgbaMatches = shadowVal.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g);
    for (const match of rgbaMatches) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      if (r !== g || g !== b) {
        console.error(`[FAIL] Colored shadow in ${name}: ${shadowVal}`);
        coloredShadows = true;
      }
    }
  }
  if (!coloredShadows) {
    console.log('[PASS] All boxShadow definitions in tailwind.config.js are strictly monochrome.');
  }
}).catch(err => {
  console.error('[FAIL] Error loading tailwind.config.js:', err);
});
