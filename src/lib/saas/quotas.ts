import { PlanTier, PlanQuota, WorkspaceUsage } from "../types/saas";
import { getDb } from "../db";

export const PLAN_QUOTAS: Record<PlanTier, PlanQuota> = {
  starter: {
    maxProjects: 1,
    maxReferencesPerProject: 200,
    maxAiCredits: 50,
    maxStorageMb: 50,
    dualReviewBlinding: false,
    advancedExportFormats: false,
  },
  professional: {
    maxProjects: 10,
    maxReferencesPerProject: 10000,
    maxAiCredits: 1000,
    maxStorageMb: 5000,
    dualReviewBlinding: true,
    advancedExportFormats: true,
  },
  institutional: {
    maxProjects: 99999,
    maxReferencesPerProject: 999999,
    maxAiCredits: 50000,
    maxStorageMb: 100000,
    dualReviewBlinding: true,
    advancedExportFormats: true,
  },
};

export async function getWorkspaceUsage(
  workspaceId: string,
  plan: PlanTier = "professional"
): Promise<WorkspaceUsage> {
  const db = getDb();
  const workspaceProjects = db.projects.filter((p) => p.workspaceId === workspaceId);
  const projectIds = workspaceProjects.map((p) => p.id);

  const workspaceArticles = db.articles.filter((a) => projectIds.includes(a.projectId));
  const aiSuggestions = db.aiScreeningSuggestions.filter((s) =>
    workspaceArticles.some((a) => a.id === s.articleId)
  );

  let totalStorageBytes = 0;
  for (const art of workspaceArticles) {
    if (art.pdfFileSize) totalStorageBytes += art.pdfFileSize;
  }
  const storageUsedMb = Math.round((totalStorageBytes / (1024 * 1024)) * 10) / 10;

  const quotas = PLAN_QUOTAS[plan] || PLAN_QUOTAS.professional;

  const projectsPct = Math.min(100, Math.round((workspaceProjects.length / quotas.maxProjects) * 100));
  const refPct = Math.min(
    100,
    Math.round((workspaceArticles.length / (quotas.maxReferencesPerProject * Math.max(1, workspaceProjects.length))) * 100)
  );
  const aiPct = Math.min(100, Math.round((aiSuggestions.length / quotas.maxAiCredits) * 100));
  const storagePct = Math.min(100, Math.round((storageUsedMb / quotas.maxStorageMb) * 100));

  return {
    workspaceId,
    plan,
    projectsCount: workspaceProjects.length,
    totalReferencesCount: workspaceArticles.length,
    aiCreditsUsed: aiSuggestions.length,
    storageUsedMb,
    quotas,
    quotaPercentages: {
      projects: projectsPct,
      references: refPct,
      aiCredits: aiPct,
      storage: storagePct,
    },
  };
}
