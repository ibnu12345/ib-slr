import {
  ScreeningStage,
  ScreeningDecisionType,
  ExclusionReason,
  PrismaEvent,
  PrismaEventType,
  PrismaCounts,
} from "../types/screening";
import { Article } from "../types/research";

export const defaultExclusionReasons: ExclusionReason[] = [
  {
    id: "ex-1",
    projectId: "global",
    code: "WRONG_POPULATION",
    label: "Populasi Tidak Sesuai (Ineligible Population)",
    stage: "title_abstract",
    sortOrder: 1,
  },
  {
    id: "ex-2",
    projectId: "global",
    code: "WRONG_INTERVENTION",
    label: "Intervensi Tidak Sesuai (Ineligible Intervention)",
    stage: "title_abstract",
    sortOrder: 2,
  },
  {
    id: "ex-3",
    projectId: "global",
    code: "WRONG_STUDY_DESIGN",
    label: "Desain Studi Tidak Memenuhi Syarat (Ineligible Study Design)",
    stage: "title_abstract",
    sortOrder: 3,
  },
  {
    id: "ex-4",
    projectId: "global",
    code: "WRONG_OUTCOME",
    label: "Luaran / Hasil Tidak Dilaporkan (Ineligible Outcome)",
    stage: "full_text",
    sortOrder: 4,
  },
  {
    id: "ex-5",
    projectId: "global",
    code: "NO_FULL_TEXT",
    label: "Teks Lengkap Tidak Dapat Diakses (Full Text Not Retrieved)",
    stage: "full_text",
    sortOrder: 5,
  },
  {
    id: "ex-6",
    projectId: "global",
    code: "FOREIGN_LANGUAGE",
    label: "Bahasa di Luar Kriteria Inklusi (Language Limitation)",
    stage: "title_abstract",
    sortOrder: 6,
  },
];

/**
 * Calculates deterministic PRISMA 2020 flow counts based on recorded events and actual project articles
 */
export function calculatePrismaCounts(
  events: PrismaEvent[],
  articles: Article[]
): PrismaCounts {
  // Total identified includes active articles + duplicate articles
  const totalArticles = articles.length;
  const duplicateArticles = articles.filter((a) => a.isDuplicate).length;
  const activeArticles = articles.filter((a) => !a.isDuplicate);

  // Excluded specifically at Title & Abstract (Stage 1)
  const titleAbstractExcluded = activeArticles.filter((a) => {
    if (a.titleAbstractStatus === "excluded") return true;
    if (a.screeningStatus === "excluded" && (!a.fullTextStatus || a.fullTextStatus === "pending")) return true;
    return false;
  }).length;

  // Count events for reports not retrieved
  let reportsNotRetrieved = 0;
  for (const ev of events) {
    if (ev.eventType === "reports_not_retrieved") {
      reportsNotRetrieved += ev.deltaCount;
    }
  }

  // PRISMA 2020 Flow equations:
  // Records Screened = Records Identified - Duplicates Removed
  const recordsScreened = Math.max(0, totalArticles - duplicateArticles);

  // Reports Sought for retrieval = Records Screened - Records Excluded at Title/Abstract
  const reportsSought = Math.max(0, recordsScreened - titleAbstractExcluded);

  // Reports Assessed for full-text eligibility = Reports Sought - Reports Not Retrieved
  const reportsAssessed = Math.max(0, reportsSought - reportsNotRetrieved);

  // Excluded specifically at Full Text (Stage 2)
  const fullTextExcludedArticles = activeArticles.filter((a) => a.fullTextStatus === "excluded");
  let reportsExcludedFullText = fullTextExcludedArticles.length;

  const exclusionsByReason: Record<string, number> = {};

  // Accumulate reasons directly from excluded articles
  for (const art of fullTextExcludedArticles) {
    const reason = art.fullTextExclusionReason || art.activeExclusionReason || "Kriteria Kelayakan Spesifik";
    exclusionsByReason[reason] = (exclusionsByReason[reason] || 0) + 1;
  }

  // Also integrate reasons from PRISMA audit ledger events
  for (const ev of events) {
    if (ev.eventType === "reports_excluded_full_text") {
      const reason = ev.reason || "Kriteria Umum";
      if (!exclusionsByReason[reason]) {
        exclusionsByReason[reason] = ev.deltaCount;
      }
    }
  }

  if (reportsExcludedFullText === 0) {
    let eventExcludedCount = 0;
    for (const ev of events) {
      if (ev.eventType === "reports_excluded_full_text") {
        eventExcludedCount += ev.deltaCount;
      }
    }
    reportsExcludedFullText = eventExcludedCount;
  }

  // Studies Included in review:
  // Articles included at full-text stage, or passed full-text without being excluded
  const fullTextIncludedArticles = activeArticles.filter(
    (a) => a.fullTextStatus === "included" || (a.screeningStatus === "included" && a.titleAbstractStatus !== "excluded" && a.fullTextStatus !== "excluded")
  );

  const studiesIncluded = Math.min(
    reportsAssessed,
    Math.max(0, fullTextIncludedArticles.length > 0 ? fullTextIncludedArticles.length : reportsAssessed - reportsExcludedFullText)
  );

  return {
    recordsIdentified: totalArticles,
    duplicatesRemoved: duplicateArticles,
    recordsScreened,
    recordsExcludedTitleAbstract: titleAbstractExcluded,
    reportsSought,
    reportsNotRetrieved,
    reportsAssessedFullText: reportsAssessed,
    reportsExcludedFullText,
    studiesIncluded,
    exclusionsByReason,
  };
}
