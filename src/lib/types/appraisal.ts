export type AppraisalJudgment = "low_risk" | "some_concerns" | "high_risk" | "unclear";

export interface AppraisalQuestion {
  id: string;
  questionText: string;
  guidance?: string;
}

export interface AppraisalDomain {
  id: string;
  key: string;
  label: string;
  guidance: string;
  questions?: AppraisalQuestion[];
}

export interface AppraisalFramework {
  id: string;
  code: "RoB2" | "CASP_Qualitative" | "JBI_Cohort" | "MMAT";
  name: string;
  description: string;
  targetStudyDesign: string;
  domains: AppraisalDomain[];
}

export interface DomainEvaluation {
  judgment: AppraisalJudgment;
  notes: string;
  evidenceQuote?: string;
  pageNumber?: number;
}

export interface AppraisalRecord {
  id: string;
  projectId: string;
  articleId: string;
  frameworkId: string;
  reviewerId: string;
  reviewerName: string;
  domainAnswers: Record<string, DomainEvaluation>;
  overallJudgment: AppraisalJudgment;
  overallJustification?: string;
  status: "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
}
