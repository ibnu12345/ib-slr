export interface ThematicCode {
  id: string;
  projectId: string;
  name: string;
  color: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface ThematicExcerpt {
  id: string;
  projectId: string;
  articleId: string;
  codeId: string;
  verbatimQuote: string;
  pageNumber?: number;
  sectionTitle?: string;
  notes?: string;
  createdAt: string;
}

export interface SynthesisSummary {
  timelineData: Array<{ year: number; count: number }>;
  countryDistribution: Array<{ country: string; count: number }>;
  studyDesignDistribution: Array<{ design: string; count: number }>;
  thematicMatrix: Array<{ theme: string; articleIds: string[]; quoteCount: number }>;
  researchGaps: Array<{ topic: string; description: string; evidenceNote: string }>;
}
