export type ReviewType =
  | "systematic_review"
  | "scoping_review"
  | "rapid_review"
  | "meta_analysis"
  | "umbrella_review";

export type ProtocolFramework = "PICO" | "PICo" | "SPIDER" | "PEO" | "custom";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  reviewType: ReviewType;
  status: "active" | "archived" | "completed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Protocol {
  id: string;
  projectId: string;
  version: number;
  framework: ProtocolFramework;
  background?: string;
  objectives?: string;
  // PICO fields
  picoPopulation?: string;
  picoIntervention?: string;
  picoComparator?: string;
  picoOutcome?: string;
  // PICo fields (Qualitative: Population, Interest, Context)
  picoInterest?: string;
  picoContext?: string;
  // SPIDER fields (Sample, Phenomenon of Interest, Design, Evaluation, Research type)
  spiderSample?: string;
  spiderPhenomenon?: string;
  spiderDesign?: string;
  spiderEvaluation?: string;
  spiderResearchType?: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityCriterion {
  id: string;
  projectId: string;
  criterionType: "inclusion" | "exclusion";
  category?: string; // e.g. Study Design, Population, Intervention, Language, Year
  description: string;
  sortOrder: number;
}

export interface SearchRun {
  id: string;
  projectId: string;
  sourceDatabase: string; // e.g. PubMed, Crossref, OpenAlex, Scopus, Manual Import
  queryString: string;
  filtersApplied: Record<string, any>;
  searchDate: string;
  resultsCount: number;
  importedBy: string;
  createdAt: string;
}

export interface Article {
  id: string;
  projectId: string;
  searchRunId?: string;
  title: string;
  normalizedTitle: string;
  authors: string;
  journal?: string;
  publicationYear?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  abstract?: string;
  screeningStatus: "pending" | "included" | "excluded" | "unclear" | "conflict";
  sourceDatabase?: string;
  pdfUrl?: string;
  isDuplicate?: boolean;
  mergedIntoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateCandidate {
  id: string;
  projectId: string;
  articleAId: string;
  articleBId: string;
  confidenceScore: number; // 0 to 100
  matchReason: "exact_doi" | "normalized_title" | "fuzzy_title";
  status: "pending" | "merged" | "dismissed";
  survivorArticleId?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}
