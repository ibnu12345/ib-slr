import { Article, EligibilityCriterion, Protocol } from "../types/research";
import { ExtractionField, ExtractionTemplate } from "../types/extraction";
import {
  AIScreeningSuggestion,
  AIExtractionSuggestion,
  AIArticleQAResponse,
} from "../types/ai";
import { defaultAIProvider } from "./provider";

export async function screenArticleWithAI(
  article: Article,
  criteria: EligibilityCriterion[],
  protocol?: Protocol
): Promise<AIScreeningSuggestion> {
  return defaultAIProvider.screenArticle(article, criteria, protocol);
}

export async function extractFieldsWithAI(
  article: Article,
  template: ExtractionTemplate
): Promise<AIExtractionSuggestion> {
  return defaultAIProvider.extractFields(article, template.fields, template.id);
}

export async function askArticleEvidenceAI(
  article: Article,
  question: string
): Promise<AIArticleQAResponse> {
  return defaultAIProvider.answerArticleQuery(article, question);
}
