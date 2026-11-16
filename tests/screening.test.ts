import { describe, it, expect } from "vitest";
import {
  recordScreeningDecision,
  getScreeningConflicts,
  adjudicateConflict,
  getArticlesByProjectId,
  getProjectPrismaCounts,
} from "../src/lib/db";
import { calculatePrismaCounts } from "../src/lib/screening/prismaLedger";
import { Article } from "../src/lib/types/research";
import { PrismaEvent } from "../src/lib/types/screening";

describe("Milestone 3: Screening Workflow, Dual Reviewers & PRISMA 2020 Ledger", () => {
  const projectId = "prj-demo-1";

  it("should record independent screening decision and update article status", async () => {
    const articles = await getArticlesByProjectId(projectId);
    const targetArticle = articles[0];

    const res = await recordScreeningDecision(
      projectId,
      targetArticle.id,
      "usr-researcher-1",
      "Dr. Clara Oswald",
      "title_abstract",
      "include",
      undefined,
      "Meets PICO criteria"
    );

    expect(res.decision).toBeDefined();
    expect(res.decision.decision).toBe("include");
    expect(res.status).toBe("included");
  });

  it("should detect conflict when a second reviewer diverges on decisions", async () => {
    const articles = await getArticlesByProjectId(projectId);
    const targetArticle = articles[1];

    // Reviewer 1: Include
    await recordScreeningDecision(
      projectId,
      targetArticle.id,
      "rev-1",
      "Reviewer One",
      "title_abstract",
      "include"
    );

    // Reviewer 2: Exclude
    const res2 = await recordScreeningDecision(
      projectId,
      targetArticle.id,
      "rev-2",
      "Reviewer Two",
      "title_abstract",
      "exclude",
      "Desain Studi Tidak Memenuhi Syarat"
    );

    // Conflicting decisions must trigger status = "conflict"
    expect(res2.status).toBe("conflict");

    const openConflicts = await getScreeningConflicts(projectId, "open");
    const foundConflict = openConflicts.find((c) => c.articleId === targetArticle.id);
    expect(foundConflict).toBeDefined();
    expect(foundConflict?.status).toBe("open");
  });

  it("should adjudicate screening conflict and update final article status", async () => {
    const openConflicts = await getScreeningConflicts(projectId, "open");
    expect(openConflicts.length).toBeGreaterThan(0);

    const conflict = openConflicts[0];

    const success = await adjudicateConflict(
      conflict.id,
      "include",
      undefined,
      "usr-admin-1",
      "Lead Reviewer",
      "Intervensi digital terbukti memenuhi spesifikasi protokol."
    );

    expect(success).toBe(true);

    // Conflict is now marked resolved
    const remainingOpen = await getScreeningConflicts(projectId, "open");
    const stillOpen = remainingOpen.some((c) => c.id === conflict.id);
    expect(stillOpen).toBe(false);
  });

  it("should compute PRISMA 2020 counts deterministically from actual ledger events", () => {
    const dummyArticles: Article[] = [
      { id: "a1", projectId: "p1", title: "A1", normalizedTitle: "a1", authors: "X", screeningStatus: "included", createdAt: "", updatedAt: "" },
      { id: "a2", projectId: "p1", title: "A2", normalizedTitle: "a2", authors: "X", screeningStatus: "excluded", createdAt: "", updatedAt: "" },
      { id: "a3", projectId: "p1", title: "A3", normalizedTitle: "a3", authors: "X", isDuplicate: true, screeningStatus: "pending", createdAt: "", updatedAt: "" },
      { id: "a4", projectId: "p1", title: "A4", normalizedTitle: "a4", authors: "X", screeningStatus: "included", createdAt: "", updatedAt: "" },
    ];

    const dummyEvents: PrismaEvent[] = [
      { id: "e1", projectId: "p1", eventType: "reports_excluded_full_text", deltaCount: 1, reason: "Ineligible Outcome", createdAt: "" },
    ];

    const counts = calculatePrismaCounts(dummyEvents, dummyArticles);

    // Total identified = 4
    expect(counts.recordsIdentified).toBe(4);
    // Duplicates removed = 1
    expect(counts.duplicatesRemoved).toBe(1);
    // Records screened = 4 - 1 = 3
    expect(counts.recordsScreened).toBe(3);
    // Records excluded at title/abstract = 1 (a2)
    expect(counts.recordsExcludedTitleAbstract).toBe(1);
    // Reports sought = 3 - 1 = 2
    expect(counts.reportsSought).toBe(2);
    // Reports assessed = 2 - 0 = 2
    expect(counts.reportsAssessedFullText).toBe(2);
    // Reports excluded at full-text = 1 (from event)
    expect(counts.reportsExcludedFullText).toBe(1);
    // Studies included = 2 - 1 = 1
    expect(counts.studiesIncluded).toBe(1);
    // Exclusion reasons breakdown
    expect(counts.exclusionsByReason["Ineligible Outcome"]).toBe(1);
  });
});
