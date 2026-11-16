import { describe, it, expect } from "vitest";
import { getWorkspaceUsage, PLAN_QUOTAS } from "../src/lib/saas/quotas";

describe("Milestone 7: SaaS Hardening, Quotas & Operations Engine", () => {
  it("enforces plan quota tiers and entitlements", () => {
    expect(PLAN_QUOTAS.starter.maxProjects).toBe(1);
    expect(PLAN_QUOTAS.starter.dualReviewBlinding).toBe(false);

    expect(PLAN_QUOTAS.professional.maxProjects).toBe(10);
    expect(PLAN_QUOTAS.professional.dualReviewBlinding).toBe(true);
    expect(PLAN_QUOTAS.professional.advancedExportFormats).toBe(true);

    expect(PLAN_QUOTAS.institutional.maxProjects).toBeGreaterThan(1000);
    expect(PLAN_QUOTAS.institutional.maxAiCredits).toBe(50000);
  });

  it("calculates real workspace usage metrics against quota boundaries", async () => {
    const usage = await getWorkspaceUsage("ws-demo-1", "professional");
    expect(usage).toBeDefined();
    expect(usage.workspaceId).toBe("ws-demo-1");
    expect(usage.plan).toBe("professional");
    expect(usage.projectsCount).toBeGreaterThan(0);
    expect(usage.totalReferencesCount).toBeGreaterThan(0);
    expect(usage.quotaPercentages.projects).toBeGreaterThanOrEqual(0);
    expect(usage.quotaPercentages.projects).toBeLessThanOrEqual(100);
  });

  it("calculates starter plan quota exhaustion correctly", async () => {
    const starterUsage = await getWorkspaceUsage("ws-demo-1", "starter");
    expect(starterUsage.plan).toBe("starter");
    expect(starterUsage.quotas.maxProjects).toBe(1);
    // 1 project in demo equals 100% of starter quota
    expect(starterUsage.quotaPercentages.projects).toBe(100);
  });
});
