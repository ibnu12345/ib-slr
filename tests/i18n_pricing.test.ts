import { describe, it, expect } from "vitest";
import { translations } from "../src/lib/i18n/translations";
import { getPricingPlans } from "../src/lib/db";

describe("Bilingual i18n & Pricing Model", () => {
  it("provides comprehensive translations in both Indonesian and English", () => {
    expect(translations.id).toBeDefined();
    expect(translations.en).toBeDefined();

    const idKeys = Object.keys(translations.id);
    const enKeys = Object.keys(translations.en);

    expect(idKeys.length).toBeGreaterThan(30);
    expect(enKeys.length).toBeGreaterThan(30);

    // Both should contain the same set of keys
    for (const key of idKeys) {
      expect(translations.en).toHaveProperty(key);
      expect((translations.id as any)[key]).toBeTruthy();
      expect((translations.en as any)[key]).toBeTruthy();
    }
  });

  it("includes Pay-Per-Project Pass (Rp 10.000) for additional 1X active project", async () => {
    const plans = await getPricingPlans();

    // Check Academic Free
    const academicFree = plans.find((p) => p.tierKey === "academic_free" || p.id === "plan-academic");
    expect(academicFree).toBeDefined();
    expect(academicFree?.priceMonthly).toBe(0);
    expect(academicFree?.features.some((f) => f.includes("1 Active Systematic Review") || f.includes("Rp 10.000"))).toBe(true);

    // Check Pay-Per-Project Pass
    const payPerProject = plans.find((p) => p.tierKey === "pay_per_project" || p.id === "plan-pay-per-project");
    expect(payPerProject).toBeDefined();
    expect(payPerProject?.name).toContain("Pay-Per-Project");
    expect(payPerProject?.priceIdr).toBe("Rp 10.000");
    expect(payPerProject?.features.some((f) => f.includes("Rp 10.000") || f.includes("+1 Slot"))).toBe(true);
  });
});
