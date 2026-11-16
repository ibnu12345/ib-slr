export type PlanTier = "starter" | "professional" | "institutional";

export interface PlanQuota {
  maxProjects: number;
  maxReferencesPerProject: number;
  maxAiCredits: number;
  maxStorageMb: number;
  dualReviewBlinding: boolean;
  advancedExportFormats: boolean;
}

export interface WorkspaceUsage {
  workspaceId: string;
  plan: PlanTier;
  projectsCount: number;
  totalReferencesCount: number;
  aiCreditsUsed: number;
  storageUsedMb: number;
  quotas: PlanQuota;
  quotaPercentages: {
    projects: number;
    references: number;
    aiCredits: number;
    storage: number;
  };
}
