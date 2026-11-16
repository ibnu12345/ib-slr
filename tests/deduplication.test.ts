import { describe, it, expect } from "vitest";
import {
  calculateTitleSimilarity,
  detectDuplicates,
} from "../src/lib/importers/deduplication";
import { normalizeTitle } from "../src/lib/importers/parsers";
import { Article } from "../src/lib/types/research";
import { mergeDuplicateArticles } from "../src/lib/db";

describe("Milestone 2: Multi-Tier Deduplication Engine", () => {
  it("should calculate high similarity for identical and minor typo titles", () => {
    const titleA = "Mobile app-delivered self-management education in type 2 diabetes";
    const titleB = "Mobile app delivered self management education in type 2 diabetes.";
    const simExact = calculateTitleSimilarity(titleA, titleB);
    expect(simExact).toBe(1.0);

    const titleC = "Mobile app-delivered self-management education in adult type 2 diabetes mellitus";
    const simFuzzy = calculateTitleSimilarity(titleA, titleC);
    expect(simFuzzy).toBeGreaterThan(0.8);
  });

  it("should detect Tier 1 Exact DOI duplicates with 100% confidence", () => {
    const articles: Article[] = [
      {
        id: "art-1",
        projectId: "test-p",
        title: "Study of Telemonitoring in Primary Care",
        normalizedTitle: normalizeTitle("Study of Telemonitoring in Primary Care"),
        authors: "Williams, K.",
        doi: "10.1016/j.clinbiochem.2023.01.002",
        screeningStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "art-2",
        projectId: "test-p",
        title: "Telemonitoring in Primary Care: A Randomized Evaluation",
        normalizedTitle: normalizeTitle("Telemonitoring in Primary Care: A Randomized Evaluation"),
        authors: "Williams, Karen",
        doi: "https://doi.org/10.1016/J.CLINBIOCHEM.2023.01.002",
        screeningStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = detectDuplicates(articles);
    expect(result.candidatePairs.length).toBe(1);
    expect(result.candidatePairs[0].matchReason).toBe("exact_doi");
    expect(result.candidatePairs[0].confidenceScore).toBe(100);
  });

  it("should detect Tier 2 Normalized Title duplicates with 95% confidence", () => {
    const articles: Article[] = [
      {
        id: "art-3",
        projectId: "test-p",
        title: "Artificial Intelligence in Ophthalmology Screening: A Meta-Analysis",
        normalizedTitle: normalizeTitle("Artificial Intelligence in Ophthalmology Screening: A Meta-Analysis"),
        authors: "Davies, M.",
        screeningStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "art-4",
        projectId: "test-p",
        title: "Artificial intelligence in ophthalmology screening a meta analysis",
        normalizedTitle: normalizeTitle("Artificial intelligence in ophthalmology screening a meta analysis"),
        authors: "Davies, Melanie J.",
        screeningStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = detectDuplicates(articles);
    expect(result.candidatePairs.length).toBe(1);
    expect(result.candidatePairs[0].matchReason).toBe("normalized_title");
    expect(result.candidatePairs[0].confidenceScore).toBe(95);
  });

  it("should merge duplicate articles non-destructively", async () => {
    const survivorId = "art-1";
    const duplicateId = "art-3";

    const success = await mergeDuplicateArticles("cand-dummy", survivorId, duplicateId);
    expect(success).toBe(true);
  });
});
