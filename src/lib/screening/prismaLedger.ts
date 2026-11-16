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

  // Excluded at title & abstract
  const titleAbstractExcluded = activeArticles.filter(
    (a) => a.screeningStatus === "excluded"
  ).length;

  // Passed title/abstract
  const titleAbstractIncluded = activeArticles.filter(
    (a) => a.screeningStatus === "included" || a.screeningStatus === "unclear" || a.screeningStatus === "conflict"
  ).length;

  // Count events for reports sought and retrieved
  let reportsNotRetrieved = 0;
  let reportsExcludedFullText = 0;
  const exclusionsByReason: Record<string, number> = {};

  for (const ev of events) {
    if (ev.eventType === "reports_not_retrieved") {
      reportsNotRetrieved += ev.deltaCount;
    } else if (ev.eventType === "reports_excluded_full_text") {
      reportsExcludedFullText += ev.deltaCount;
      const reason = ev.reason || "Kriteria Umum";
      exclusionsByReason[reason] = (exclusionsByReason[reason] || 0) + ev.deltaCount;
    }
  }

  // PRISMA 2020 Equation checks:
  // Records Screened = Records Identified - Duplicates Removed
  const recordsScreened = Math.max(0, totalArticles - duplicateArticles);

  // Reports Sought for retrieval = Records Screened - Records Excluded at Title/Abstract
  const reportsSought = Math.max(0, recordsScreened - titleAbstractExcluded);

  // Reports Assessed for full-text eligibility = Reports Sought - Reports Not Retrieved
  const reportsAssessed = Math.max(0, reportsSought - reportsNotRetrieved);

  // Studies Included in review = Reports Assessed - Reports Excluded at Full Text
  const studiesIncluded = Math.max(0, reportsAssessed - reportsExcludedFullText);

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
