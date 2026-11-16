import { Article, EligibilityCriterion, Protocol } from "./research";
import { ExtractionField } from "./extraction";

export type AIConfidenceRating = "high" | "moderate" | "low";

export interface EvidenceQuoteItem {
  quote: string;
  section?: string;
  pageNumber?: number;
}

export interface CriterionEvaluation {
  criterionId: string;
  criterionType: "inclusion" | "exclusion";
  description: string;
  matched: boolean | null;
  evidence?: string;
  pageNumber?: number;
}

export interface AIScreeningSuggestion {
  id: string;
  articleId: string;
  recommendation: "include" | "exclude" | "unclear";
  confidenceRating: AIConfidenceRating;
  rationale: string;
  evidenceQuotes: EvidenceQuoteItem[];
  criteriaEvaluations: CriterionEvaluation[];
  model: string;
  promptVersion: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  createdAt: string;
}

export interface AIExtractedField {
  fieldKey: string;
  value: any;
  verbatimQuote: string;
  pageNumber?: number;
  sectionName?: string;
  confidenceRating: AIConfidenceRating;
  isFound: boolean;
  rationale?: string;
}

export interface AIExtractionSuggestion {
  id: string;
  articleId: string;
  templateId: string;
  fields: Record<string, AIExtractedField>;
  model: string;
  promptVersion: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
  };
  createdAt: string;
}

export interface AICitation {
  quote: string;
  pageNumber?: number;
  section?: string;
}

export interface AIArticleQAResponse {
  id: string;
  articleId: string;
  question: string;
  answer: string;
  citations: AICitation[];
  notFoundInText: boolean;
  confidenceRating: AIConfidenceRating;
  model: string;
  createdAt: string;
}

export interface AIProvider {
  name: string;
  screenArticle(
    article: Article,
    criteria: EligibilityCriterion[],
    protocol?: Protocol
  ): Promise<AIScreeningSuggestion>;

  extractFields(
    article: Article,
    fields: ExtractionField[],
    templateId: string
  ): Promise<AIExtractionSuggestion>;

  answerArticleQuery(
    article: Article,
    question: string
  ): Promise<AIArticleQAResponse>;
}
