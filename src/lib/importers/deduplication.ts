import { Article, DuplicateCandidate } from "../types/research";
import { normalizeDoi, normalizeTitle } from "./parsers";

/**
 * Highly optimized Levenshtein Distance using only two 1D rows
 * with early cutoff if maximum distance is exceeded.
 */
export function levenshteinDistance(a: string, b: string, maxAllowedDistance?: number): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  if (Math.abs(m - n) > (maxAllowedDistance ?? Infinity)) {
    return Math.abs(m - n);
  }

  let prevRow = new Array(n + 1);
  let currRow = new Array(n + 1);

  for (let j = 0; j <= n; j++) prevRow[j] = j;

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    let minInRow = i;
    const charA = a.charCodeAt(i - 1);

    for (let j = 1; j <= n; j++) {
      const cost = charA === b.charCodeAt(j - 1) ? 0 : 1;
      const val = Math.min(
        prevRow[j] + 1,       // deletion
        currRow[j - 1] + 1,   // insertion
        prevRow[j - 1] + cost // substitution
      );
      currRow[j] = val;
      if (val < minInRow) minInRow = val;
    }

    // Early termination if row minimum exceeds maximum allowed
    if (maxAllowedDistance !== undefined && minInRow > maxAllowedDistance) {
      return maxAllowedDistance + 1;
    }

    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[n];
}

/**
 * Calculates string similarity ratio between 0.0 and 1.0 based on Levenshtein distance
 */
export function calculateTitleSimilarity(a: string, b: string): number {
  const cleanA = normalizeTitle(a);
  const cleanB = normalizeTitle(b);

  if (cleanA === cleanB) return 1.0;
  if (!cleanA || !cleanB) return 0.0;

  const lenA = cleanA.length;
  const lenB = cleanB.length;
  const maxLen = Math.max(lenA, lenB);
  if (maxLen === 0) return 1.0;

  // Length heuristic: if difference exceeds 15%, similarity is strictly < 0.85
  if (Math.abs(lenA - lenB) / maxLen > 0.15) {
    return 0.0;
  }

  // Maximum edits allowed for >= 0.85 similarity
  const maxEdits = Math.floor(maxLen * 0.15);
  const distance = levenshteinDistance(cleanA, cleanB, maxEdits);
  if (distance > maxEdits) return 0.0;

  return Math.max(0, 1.0 - distance / maxLen);
}

export interface DuplicateDetectionResult {
  candidatePairs: Array<{
    articleA: Article;
    articleB: Article;
    confidenceScore: number;
    matchReason: "exact_doi" | "normalized_title" | "fuzzy_title";
  }>;
  exactDuplicatesCount: number;
  fuzzyCandidatesCount: number;
}

/**
 * Multi-tier duplicate detection algorithm for a collection of articles in a project
 */
export function detectDuplicates(articles: Article[]): DuplicateDetectionResult {
  const candidatePairs: DuplicateDetectionResult["candidatePairs"] = [];
  const activeArticles = articles.filter((a) => !a.isDuplicate);

  let exactCount = 0;
  let fuzzyCount = 0;

  // Hash maps for O(N) Tier 1 & Tier 2 lookup
  const doiMap = new Map<string, Article[]>();
  const titleMap = new Map<string, Article[]>();

  for (const art of activeArticles) {
    const doi = normalizeDoi(art.doi);
    if (doi) {
      const existing = doiMap.get(doi) || [];
      existing.push(art);
      doiMap.set(doi, existing);
    }

    const normTitle = normalizeTitle(art.title);
    if (normTitle) {
      const existing = titleMap.get(normTitle) || [];
      existing.push(art);
      titleMap.set(normTitle, existing);
    }
  }

  const seenPairKeys = new Set<string>();
  const addPair = (
    a: Article,
    b: Article,
    confidenceScore: number,
    matchReason: "exact_doi" | "normalized_title" | "fuzzy_title"
  ) => {
    const key = a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
    if (seenPairKeys.has(key)) return;
    seenPairKeys.add(key);

    candidatePairs.push({
      articleA: a,
      articleB: b,
      confidenceScore,
      matchReason,
    });
  };

  // Tier 1: Exact DOI
  for (const [, list] of doiMap.entries()) {
    if (list.length > 1) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          exactCount++;
          addPair(list[i], list[j], 100, "exact_doi");
        }
      }
    }
  }

  // Tier 2: Normalized title exact matching
  for (const [, list] of titleMap.entries()) {
    if (list.length > 1) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          exactCount++;
          addPair(list[i], list[j], 95, "normalized_title");
        }
      }
    }
  }

  // Tier 3: Fuzzy title similarity for remaining pairs
  // Limit comparisons to candidates with prefix or length proximity
  const maxFuzzyCompares = 20000;
  let compareCount = 0;

  for (let i = 0; i < activeArticles.length && compareCount < maxFuzzyCompares; i++) {
    const a = activeArticles[i];
    const normA = normalizeTitle(a.title);
    if (!normA) continue;

    for (let j = i + 1; j < activeArticles.length && compareCount < maxFuzzyCompares; j++) {
      const b = activeArticles[j];
      const key = a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
      if (seenPairKeys.has(key)) continue;

      const normB = normalizeTitle(b.title);
      if (!normB) continue;

      // Quick filter: check length difference
      const maxLen = Math.max(normA.length, normB.length);
      if (Math.abs(normA.length - normB.length) / maxLen > 0.15) continue;

      // Check first char similarity if strings are long
      if (maxLen > 25 && normA[0] !== normB[0] && normA[1] !== normB[1]) {
        continue;
      }

      compareCount++;
      const similarity = calculateTitleSimilarity(normA, normB);
      if (similarity >= 0.85) {
        fuzzyCount++;
        addPair(a, b, Math.round(similarity * 100), "fuzzy_title");
      }
    }
  }

  return {
    candidatePairs,
    exactDuplicatesCount: exactCount,
    fuzzyCandidatesCount: fuzzyCount,
  };
}
