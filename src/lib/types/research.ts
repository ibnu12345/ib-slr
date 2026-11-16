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
  reviewType: "systematic_review" | "scoping_review" | "rapid_review" | "meta_analysis";
  status: "active" | "archived" | "completed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Protocol {
  id: string;
  projectId: string;
  version: number;
  framework: "PICO" | "PICo" | "SPIDER" | "PEO" | "custom";
  background?: string;
  objectives?: string;
  picoPopulation?: string;
  picoIntervention?: string;
  picoComparator?: string;
  picoOutcome?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityCriterion {
  id: string;
  projectId: string;
  criterionType: "inclusion" | "exclusion";
  category?: string;
  description: string;
  sortOrder: number;
}
