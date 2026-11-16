export type JournalTableType = "characteristics" | "risk_of_bias" | "synthesis_matrix";

export interface JournalTableColumn {
  key: string;
  label: string;
  visible: boolean;
}

export interface JournalTableDefinition {
  id: string;
  projectId: string;
  tableType: JournalTableType;
  title: string;
  caption?: string;
  columns: JournalTableColumn[];
  createdAt: string;
  updatedAt: string;
}

export type ManuscriptSectionKey =
  | "abstract"
  | "introduction"
  | "methods"
  | "results"
  | "risk_of_bias"
  | "discussion"
  | "conclusion";

export interface ProjectManuscript {
  id: string;
  projectId: string;
  title: string;
  targetJournal?: string;
  sections: Record<ManuscriptSectionKey, string>;
  createdAt: string;
  updatedAt: string;
}
