import { describe, it, expect } from "vitest";
import {
  getAppraisalRecords,
  saveAppraisalRecord,
  getThematicCodes,
  saveThematicCode,
  getThematicExcerpts,
  saveThematicExcerpt,
  getSynthesisSummary,
} from "../src/lib/db";
import { AppraisalRecord } from "../src/lib/types/appraisal";
import { ThematicCode, ThematicExcerpt } from "../src/lib/types/synthesis";

describe("Quality Appraisal & Thematic Synthesis Engine", () => {
  it("loads pre-seeded RoB 2 appraisal records and handles domain updates", async () => {
    const records = await getAppraisalRecords("prj-demo-1");
    expect(records.length).toBeGreaterThan(0);

    const art1Appraisal = records.find((r) => r.articleId === "art-1");
    expect(art1Appraisal).toBeDefined();
    expect(art1Appraisal?.frameworkId).toBe("rob-2-rct");
    expect(art1Appraisal?.domainAnswers.d1_randomization.judgment).toBe("low_risk");
    expect(art1Appraisal?.domainAnswers.d2_deviations.judgment).toBe("some_concerns");
    expect(art1Appraisal?.overallJudgment).toBe("some_concerns");

    // Save a new appraisal record
    const newRecord: AppraisalRecord = {
      id: "app-test-new",
      projectId: "prj-demo-1",
      articleId: "art-3",
      frameworkId: "rob-2-rct",
      reviewerId: "usr-test",
      reviewerName: "Test Reviewer",
      domainAnswers: {
        d1_randomization: { judgment: "high_risk", notes: "No allocation concealment" },
      },
      overallJudgment: "high_risk",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveAppraisalRecord(newRecord, "usr-test", "test@ib-slr.local");
    expect(saved.id).toBe("app-test-new");

    const updatedRecords = await getAppraisalRecords("prj-demo-1");
    expect(updatedRecords.some((r) => r.id === "app-test-new")).toBe(true);
  });

  it("manages thematic codes and tagged excerpts", async () => {
    const initialCodes = await getThematicCodes("prj-demo-1");
    expect(initialCodes.length).toBeGreaterThan(2);

    const newCode: ThematicCode = {
      id: "thm-test-telehealth",
      projectId: "prj-demo-1",
      name: "Telehealth Scalability & Cost",
      category: "Health Economics",
      color: "#2F7D78",
      createdAt: new Date().toISOString(),
    };

    await saveThematicCode(newCode, "usr-test", "test@ib-slr.local");
    const codes = await getThematicCodes("prj-demo-1");
    expect(codes.some((c) => c.id === "thm-test-telehealth")).toBe(true);

    // Save excerpt
    const newExcerpt: ThematicExcerpt = {
      id: "exc-test-1",
      projectId: "prj-demo-1",
      articleId: "art-1",
      codeId: "thm-test-telehealth",
      verbatimQuote: "The intervention achieved cost-effective outpatient outreach.",
      pageNumber: 5,
      createdAt: new Date().toISOString(),
    };

    await saveThematicExcerpt(newExcerpt, "usr-test", "test@ib-slr.local");
    const excerpts = await getThematicExcerpts("prj-demo-1");
    expect(excerpts.some((e) => e.id === "exc-test-1")).toBe(true);
  });

  it("calculates synthesis summary metrics, timelines, and research gaps correctly", async () => {
    const summary = await getSynthesisSummary("prj-demo-1");
    expect(summary.timelineData.length).toBeGreaterThan(0);
    expect(summary.thematicMatrix.length).toBeGreaterThan(0);
    expect(summary.researchGaps.length).toBeGreaterThan(0);
    expect(summary.researchGaps[0].topic).toBeDefined();
    expect(summary.researchGaps[0].evidenceNote).toBeDefined();
  });
});
