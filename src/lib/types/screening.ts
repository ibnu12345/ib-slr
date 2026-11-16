export type ScreeningStage = "title_abstract" | "full_text";

export type ScreeningDecisionType = "include" | "exclude" | "unclear";

export interface ScreeningDecision {
  id: string;
  projectId: string;
  articleId: string;
  reviewerId: string;
  reviewerName: string;
  stage: ScreeningStage;
  decision: ScreeningDecisionType;
  exclusionReasonId?: string;
  exclusionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningConflict {
  id: string;
  projectId: string;
  articleId: string;
  stage: ScreeningStage;
  decisions: ScreeningDecision[];
  status: "open" | "resolved";
  resolvedDecision?: ScreeningDecisionType;
  resolvedExclusionReason?: string;
  adjudicatedBy?: string;
  adjudicationNotes?: string;
  resolvedAt?: string;
}

export interface ExclusionReason {
  id: string;
  projectId: string;
  code: string;
  label: string;
  stage: ScreeningStage;
  sortOrder: number;
}

export type PrismaEventType =
  | "records_identified"
  | "duplicates_removed"
  | "records_screened"
  | "records_excluded_title_abstract"
  | "reports_sought"
  | "reports_not_retrieved"
  | "reports_assessed_full_text"
  | "reports_excluded_full_text"
  | "studies_included";

export interface PrismaEvent {
  id: string;
  projectId: string;
  eventType: PrismaEventType;
  deltaCount: number;
  reason?: string;
  metadata?: Record<string, any>;
  triggeredBy?: string;
  createdAt: string;
}

export interface PrismaCounts {
  recordsIdentified: number;
  duplicatesRemoved: number;
  recordsScreened: number;
  recordsExcludedTitleAbstract: number;
  reportsSought: number;
  reportsNotRetrieved: number;
  reportsAssessedFullText: number;
  reportsExcludedFullText: number;
  studiesIncluded: number;
  exclusionsByReason: Record<string, number>;
}
