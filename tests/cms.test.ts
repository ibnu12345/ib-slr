import { describe, it, expect } from "vitest";
import {
  getSiteSettings,
  updateSiteSettings,
  getNavigation,
  saveNavigationItem,
  deleteNavigationItem,
  getPageBySlug,
  getAllPages,
  savePageSection,
  reorderPageSections,
  getFaqs,
  getPricingPlans,
  getTestimonials,
  getAuditLogs,
} from "../src/lib/db";

describe("Milestone 1: CMS & Data-Driven Public Marketing Site", () => {
  it("should retrieve default brand settings with 'IB-SLR'", async () => {
    const settings = await getSiteSettings();
    expect(settings.brandName).toBe("IB-SLR");
    expect(settings.tagline).toBe("From Literature to Evidence.");
    expect(settings.announcement?.isActive).toBe(true);
  });

  it("should update site settings and record an immutable audit log", async () => {
    const originalLogs = await getAuditLogs(200);
    const initialLogCount = originalLogs.length;

    await updateSiteSettings(
      { contactEmail: "lead-researcher@ib-slr.local" },
      "usr-admin-1",
      "admin@ib-slr.local"
    );

    const updated = await getSiteSettings();
    expect(updated.contactEmail).toBe("lead-researcher@ib-slr.local");

    const newLogs = await getAuditLogs(200);
    expect(newLogs.length).toBeGreaterThan(initialLogCount);
    expect(newLogs[0].action).toBe("UPDATE_SITE_SETTINGS");
    expect(newLogs[0].userEmail).toBe("admin@ib-slr.local");
  });

  it("should filter navigation items by location", async () => {
    const headerNav = await getNavigation("header");
    expect(headerNav.length).toBeGreaterThan(0);
    expect(headerNav.every((item) => item.location === "header")).toBe(true);

    const footerLegal = await getNavigation("footer_legal");
    expect(footerLegal.length).toBeGreaterThan(0);
    expect(footerLegal.every((item) => item.location === "footer_legal")).toBe(true);
  });

  it("should retrieve homepage with all structured sections", async () => {
    const home = await getPageBySlug("/");
    expect(home).not.toBeNull();
    expect(home?.slug).toBe("/");
    expect(home?.sections.length).toBeGreaterThanOrEqual(5);

    const heroSection = home?.sections.find((s) => s.sectionType === "hero");
    expect(heroSection).toBeDefined();
    expect(heroSection?.title).toBeDefined();

    const featureSection = home?.sections.find((s) => s.sectionType === "feature_grid");
    expect(featureSection).toBeDefined();
  });

  it("should reorder sections and persist new sortOrder", async () => {
    const home = await getPageBySlug("/");
    expect(home).not.toBeNull();

    const sectionIds = home!.sections.map((s) => s.id);
    const reversedIds = [...sectionIds].reverse();

    await reorderPageSections(home!.id, reversedIds, "usr-admin-1", "admin@ib-slr.local");

    const reorderedHome = await getPageBySlug("/");
    expect(reorderedHome!.sections[0].id).toBe(reversedIds[0]);

    // Restore original order
    await reorderPageSections(home!.id, sectionIds, "usr-admin-1", "admin@ib-slr.local");
  });

  it("should hide draft pages from public queries unless includeDrafts is true", async () => {
    const allPages = await getAllPages();
    const testPage = allPages[0];
    const originalStatus = testPage.status;

    // Temporarily set to draft
    testPage.status = "draft";

    const publicView = await getPageBySlug(testPage.slug, false);
    expect(publicView).toBeNull();

    const adminPreview = await getPageBySlug(testPage.slug, true);
    expect(adminPreview).not.toBeNull();

    // Restore
    testPage.status = originalStatus;
  });

  it("should load pricing tiers and published FAQs", async () => {
    const plans = await getPricingPlans();
    expect(plans.length).toBeGreaterThanOrEqual(3);
    expect(plans.some((p) => p.tierKey === "academic_free")).toBe(true);

    const faqs = await getFaqs();
    expect(faqs.length).toBeGreaterThanOrEqual(4);
    expect(faqs.every((f) => f.isPublished)).toBe(true);
  });
});
