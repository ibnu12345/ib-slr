import { Article, DuplicateCandidate } from "../types/research";
import { normalizeDoi, normalizeTitle } from "./parsers";

/**
 * Calculates Levenshtein Distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

/**
 * Calculates string similarity ratio between 0.0 and 1.0 based on Levenshtein distance
 */
export function calculateTitleSimilarity(a: string, b: string): number {
  const cleanA = normalizeTitle(a);
  const cleanB = normalizeTitle(b);

  if (cleanA === cleanB) return 1.0;
  if (!cleanA || !cleanB) return 0.0;

  const maxLen = Math.max(cleanA.length, cleanB.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(cleanA, cleanB);
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

  for (let i = 0; i < activeArticles.length; i++) {
    for (let j = i + 1; j < activeArticles.length; j++) {
      const a = activeArticles[i];
      const b = activeArticles[j];

      // Tier 1: Exact DOI matching
      const doiA = normalizeDoi(a.doi);
      const doiB = normalizeDoi(b.doi);

      if (doiA && doiB && doiA === doiB) {
        exactCount++;
        candidatePairs.push({
          articleA: a,
          articleB: b,
          confidenceScore: 100,
          matchReason: "exact_doi",
        });
        continue;
      }

      // Tier 2: Normalized title exact matching
      const normTitleA = normalizeTitle(a.title);
      const normTitleB = normalizeTitle(b.title);

      if (normTitleA && normTitleB && normTitleA === normTitleB) {
        exactCount++;
        candidatePairs.push({
          articleA: a,
          articleB: b,
          confidenceScore: 95,
          matchReason: "normalized_title",
        });
        continue;
      }

      // Tier 3: Fuzzy title similarity (threshold >= 0.85)
      const similarity = calculateTitleSimilarity(a.title, b.title);
      if (similarity >= 0.85) {
        fuzzyCount++;
        candidatePairs.push({
          articleA: a,
          articleB: b,
          confidenceScore: Math.round(similarity * 100),
          matchReason: "fuzzy_title",
        });
      }
    }
  }

  return {
    candidatePairs,
    exactDuplicatesCount: exactCount,
    fuzzyCandidatesCount: fuzzyCount,
  };
}
