/**
 * EFCC Wanted Persons Registry & Identity Verification Service
 * 
 * Provides automated background screening and identity verification
 * against the official Economic and Financial Crimes Commission (EFCC)
 * Wanted Persons database (https://www.efcc.gov.ng/WantedPersons).
 */

import { efccWantedSeed } from '../data/efccWantedSeed.js';

/**
 * Extracts structured demographic and legal entities from the EFCC narrative HTML.
 *
 * @param {string} html - HTML description from the EFCC record
 * @returns {Object} Structured metadata
 */
export function parseEFCCDescription(html = '') {
  if (!html || typeof html !== 'string') {
    return {
      allegedOffense: 'Financial Crime Investigation',
      age: undefined,
      gender: 'unknown',
      stateOfOrigin: undefined,
      lastKnownAddress: undefined,
      associatedEntity: undefined
    };
  }

  // Strip tags and normalize whitespace
  const clean = html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

  // 1. Alleged Offense
  const offenseMatch = clean.match(/alleged case of\s+([^.]+?)(?:\.|\s+Adekunle|\s+Maina|\s+Mbalaso|\s+Oshiba|\s+Nwachukwu|\s+Anybody|$)/i);
  const allegedOffense = offenseMatch ? offenseMatch[1].trim() : 'Alleged Economic & Financial Crime';

  // 2. Age & Gender
  const ageMatch = clean.match(/(?:is a\s+)?(\d{2})[- ]year[- ]old\s+(male|female)/i) || 
                   clean.match(/,\s*(\d{2}),\s*is an?\s+indigene/i);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : undefined;
  const gender = (ageMatch && ageMatch[2]) ? ageMatch[2].toLowerCase() : 
                 (/\bher\b|\bfemale\b/i.test(clean) ? 'female' : 'male');

  // 3. State & LGA of Origin
  const stateMatch = clean.match(/(?:from|indigene of [^,]+ in)\s+([A-Za-z\s]+?)\s+State/i);
  const stateOfOrigin = stateMatch ? `${stateMatch[1].trim()} State` : undefined;

  // 4. Last Known Address
  const addressMatch = clean.match(/last known address is(?:\s+at)?:?\s*([^.]+?)(?:\.|\s+Anybody)/i);
  const lastKnownAddress = addressMatch ? addressMatch[1].trim() : undefined;

  // 5. Associated Company
  const companyMatch = clean.match(/of\s+([A-Z0-9\s.,]+(?:LIMITED|LTD|PLC|GLOBAL|VENTURES|CORP))/i);
  const associatedEntity = companyMatch ? companyMatch[1].trim() : undefined;

  return {
    allegedOffense,
    age,
    gender,
    stateOfOrigin,
    lastKnownAddress,
    associatedEntity
  };
}

/**
 * Computes Levenshtein distance between two strings.
 */
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * Computes comprehensive match percentage (0 - 100) between two names,
 * accounting for word order permutations, partial word omission, and character typos.
 *
 * @param {string} query - Entered visitor name
 * @param {string} target - Watchlist candidate name
 * @returns {number} Integer percentage score from 0 to 100
 */
export function computeNameMatchScore(query = '', target = '') {
  const cleanQ = query.toUpperCase().trim();
  const cleanT = target.toUpperCase().trim();
  if (!cleanQ || !cleanT) return 0;
  if (cleanQ === cleanT) return 100;

  // 1. Raw character-level Levenshtein similarity
  const maxLen = Math.max(cleanQ.length, cleanT.length);
  const rawLevSim = Math.round(((maxLen - levenshteinDistance(cleanQ, cleanT)) / maxLen) * 100);

  // 2. Token extraction
  const qTokens = cleanQ.split(/[\s,.-]+/).filter(t => t.length > 0);
  const tTokens = cleanT.split(/[\s,.-]+/).filter(t => t.length > 0);

  if (qTokens.length === 0 || tTokens.length === 0) return 0;

  // 3. Word-sorted Levenshtein similarity (neutralizes word order permutations)
  const sortedQ = [...qTokens].sort().join(' ');
  const sortedT = [...tTokens].sort().join(' ');
  const sortedMaxLen = Math.max(sortedQ.length, sortedT.length);
  const sortedLevSim = Math.round(((sortedMaxLen - levenshteinDistance(sortedQ, sortedT)) / sortedMaxLen) * 100);

  // 4. Token-level Dice matching with typo tolerance
  let matchedWeight = 0;
  const usedTargetIndices = new Set();

  for (const qt of qTokens) {
    let bestSim = 0;
    let bestIdx = -1;
    for (let i = 0; i < tTokens.length; i++) {
      if (usedTargetIndices.has(i)) continue;
      const tt = tTokens[i];
      const tokMax = Math.max(qt.length, tt.length);
      const sim = (tokMax - levenshteinDistance(qt, tt)) / tokMax;
      if (sim > bestSim) {
        bestSim = sim;
        bestIdx = i;
      }
    }
    // Only count as token match if similarity is at least 80% (permits slight typos)
    if (bestSim >= 0.8 && bestIdx !== -1) {
      matchedWeight += bestSim;
      usedTargetIndices.add(bestIdx);
    }
  }

  const tokenDice = Math.round(((2 * matchedWeight) / (qTokens.length + tTokens.length)) * 100);

  return Math.max(rawLevSim, sortedLevSim, tokenDice);
}

class EFCCWatchlistService {
  constructor() {
    this.records = Array.isArray(efccWantedSeed) ? efccWantedSeed : [];
    this.isLoaded = this.records.length > 0;
    this.lastSync = this.isLoaded ? Date.now() : 0;
  }

  /**
   * Refreshes the watchlist from the live EFCC endpoint or proxy if possible.
   * Gracefully falls back to bundled seed records if offline or blocked by CORS.
   */
  async syncLiveWatchlist() {
    try {
      // Try local proxy first (Vite proxy: /api/efcc -> https://www.efcc.gov.ng/backend)
      const proxyUrl = '/api/efcc/wanted_persons/list.php?limit=50&page=1';
      let res = await fetch(proxyUrl).catch(() => null);

      if (!res || !res.ok) {
        // Fallback to direct URL if in server/node environment
        res = await fetch('https://www.efcc.gov.ng/backend/wanted_persons/list.php?limit=50&page=1').catch(() => null);
      }

      if (res && res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.records = json.data;
          this.lastSync = Date.now();
          this.isLoaded = true;
          return { success: true, count: this.records.length, source: 'live' };
        }
      }
    } catch {
      // Network/CORS fallback
    }

    // Default to validated offline seed
    this.records = efccWantedSeed;
    this.isLoaded = true;
    return { success: true, count: this.records.length, source: 'bundled_seed' };
  }

  /**
   * Verifies an incoming visitor's name against the EFCC wanted persons database.
   * Only raises wanted alert if match confidence is at least 80%.
   *
   * @param {string} visitorFullName - Full name of the visitor
   * @returns {Object} Verification assessment result
   */
  verifyVisitor(visitorFullName = '') {
    if (!visitorFullName || typeof visitorFullName !== 'string') {
      return {
        isScreened: false,
        isWanted: false,
        severity: 'CLEAN',
        confidenceScore: 0,
        matchedPerson: null
      };
    }

    const cleanInput = visitorFullName.trim();
    if (cleanInput.length < 3) {
      return {
        isScreened: false,
        isWanted: false,
        severity: 'CLEAN',
        confidenceScore: 0,
        matchedPerson: null
      };
    }

    let topMatch = null;
    let highestScore = 0;

    for (const person of this.records) {
      const personName = (person.name || '').trim();
      if (!personName) continue;

      const score = computeNameMatchScore(cleanInput, personName);
      if (score > highestScore) {
        highestScore = score;
        topMatch = person;
      }
    }

    // Strict 80% threshold requirement: Do NOT raise alert if match is below 80%
    if (!topMatch || highestScore < 80) {
      return {
        isScreened: true,
        isWanted: false,
        severity: 'CLEAN',
        confidenceScore: highestScore,
        matchedPerson: null
      };
    }

    const parsed = parseEFCCDescription(topMatch.description || '');

    return {
      isScreened: true,
      isWanted: true,
      severity: highestScore >= 95 ? 'CRITICAL' : 'HIGH',
      confidenceScore: highestScore,
      matchedPerson: {
        id: topMatch.id,
        name: topMatch.name,
        slug: topMatch.slug,
        imageUrl: topMatch.image_url || `https://www.efcc.gov.ng${topMatch.image}`,
        created_at: topMatch.created_at,
        allegedOffense: parsed.allegedOffense,
        age: parsed.age,
        gender: parsed.gender,
        stateOfOrigin: parsed.stateOfOrigin,
        lastKnownAddress: parsed.lastKnownAddress,
        associatedEntity: parsed.associatedEntity,
        detailsUrl: `https://www.efcc.gov.ng/WantedPersonDetails/${topMatch.id}`
      }
    };
  }

  /**
   * Returns all wanted persons records.
   */
  getAllRecords() {
    return this.records;
  }
}

export const efccWatchlistService = new EFCCWatchlistService();
