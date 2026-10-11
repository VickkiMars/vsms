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

    const cleanInput = visitorFullName.toUpperCase().trim();
    const queryTokens = cleanInput.split(/[\s,.-]+/).filter(t => t.length > 2);

    if (queryTokens.length === 0) {
      return {
        isScreened: true,
        isWanted: false,
        severity: 'CLEAN',
        confidenceScore: 0,
        matchedPerson: null
      };
    }

    let topMatch = null;
    let highestScore = 0;

    for (const person of this.records) {
      const personName = (person.name || '').toUpperCase().trim();
      if (!personName) continue;

      const personTokens = personName.split(/[\s,.-]+/).filter(t => t.length > 2);

      // 1. Exact string match
      if (personName === cleanInput) {
        highestScore = 100;
        topMatch = person;
        break;
      }

      // 2. Token intersection match
      const matchingTokens = queryTokens.filter(t => personTokens.includes(t));
      const matchCount = matchingTokens.length;

      if (matchCount >= 2) {
        // High confidence multi-name match (e.g. "Maina Abdulrasheed" vs "ABDULRASHEED ABDULLAHI MAINA")
        const ratio = Math.round((matchCount * 2 / (queryTokens.length + personTokens.length)) * 100);
        const score = Math.max(80, ratio);
        if (score > highestScore) {
          highestScore = score;
          topMatch = person;
        }
      } else if (matchCount === 1) {
        // Single unique token match (e.g. rare surname "Mbalaso" or "Adekunle")
        const singleToken = matchingTokens[0];
        if (singleToken.length >= 6) {
          const score = 65; // Moderate amber advisory
          if (score > highestScore) {
            highestScore = score;
            topMatch = person;
          }
        }
      }
    }

    if (!topMatch || highestScore < 50) {
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
      severity: highestScore >= 75 ? 'RED' : 'AMBER',
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
