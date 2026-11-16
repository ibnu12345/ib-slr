export type ExtractionFieldType =
  | "text"
  | "long_text"
  | "number"
  | "select"
  | "multi_select"
  | "boolean"
  | "date";

export type ExtractionCategory =
  | "study_characteristics"
  | "population"
  | "interventions"
  | "outcomes"
  | "methodology"
  | "custom";

export interface ExtractionField {
  id: string;
  key: string;
  label: string;
  type: ExtractionFieldType;
  category: ExtractionCategory;
  description?: string;
  placeholder?: string;
  options?: string[]; // Used when type is "select" or "multi_select"
  required: boolean;
  sortOrder: number;
}

export interface ExtractionTemplate {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: number;
  fields: ExtractionField[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceQuote {
  quote: string;
  pageNumber?: number;
  section?: string;
  confidenceRating: "high" | "moderate" | "low";
  isFound: boolean;
  rationale?: string;
}

export type FieldVerificationState = "pending" | "verified" | "corrected" | "rejected";

export interface ExtractedDataRecord {
  id: string;
  projectId: string;
  articleId: string;
  templateId: string;
  values: Record<string, any>;
  evidence: Record<string, EvidenceQuote>;
  verificationStatus: Record<string, FieldVerificationState>;
  status: "in_progress" | "completed" | "verified";
  extractedBy: "human" | "ai_assisted";
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}
