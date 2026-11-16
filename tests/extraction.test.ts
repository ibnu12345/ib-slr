import { describe, it, expect, beforeEach } from "vitest";
import {
  getExtractionTemplates,
  saveExtractionTemplate,
  getExtractedDataRecords,
  saveExtractedDataRecord,
  verifyExtractedField,
} from "../src/lib/db";
import { ExtractionTemplate, ExtractedDataRecord } from "../src/lib/types/extraction";

describe("Data Extraction Studio Database & State Machine", () => {
  it("loads default extraction templates for project", async () => {
    const templates = await getExtractionTemplates("prj-demo-1");
    expect(templates.length).toBeGreaterThan(0);
    const defaultTemplate = templates.find((t) => t.isDefault);
    expect(defaultTemplate).toBeDefined();
    expect(defaultTemplate?.fields.length).toBeGreaterThan(5);
    expect(defaultTemplate?.fields.some((f) => f.key === "study_design")).toBe(true);
  });

  it("creates and updates custom extraction templates", async () => {
    const customTemplate: ExtractionTemplate = {
      id: "tmpl-custom-qualitative",
      projectId: "prj-demo-1",
      name: "Qualitative SLR Extraction Template",
      description: "Custom template for interview and thematic synthesis studies.",
      version: 1,
      isDefault: false,
      fields: [
        {
          id: "f-q1",
          key: "qualitative_method",
          label: "Qualitative Methodology",
          type: "select",
          category: "methodology",
          options: ["Grounded Theory", "Phenomenology", "Ethnography", "Thematic Analysis"],
          required: true,
          sortOrder: 1,
        },
        {
          id: "f-q2",
          key: "data_collection_method",
          label: "Data Collection Mode",
          type: "text",
          category: "methodology",
          required: true,
          sortOrder: 2,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveExtractionTemplate(customTemplate, "usr-test", "test@ib-slr.local");
    expect(saved.id).toBe("tmpl-custom-qualitative");

    const retrieved = await getExtractionTemplates("prj-demo-1");
    expect(retrieved.some((t) => t.id === "tmpl-custom-qualitative")).toBe(true);
  });

  it("handles field verification state machine and marks record as verified when all fields complete", async () => {
    const record: ExtractedDataRecord = {
      id: "rec-test-workflow",
      projectId: "prj-demo-1",
      articleId: "art-test-workflow",
      templateId: "tmpl-pico-default",
      values: {
        field_a: "Initial Draft Value",
        field_b: 100,
      },
      evidence: {
        field_a: {
          quote: "Draft quotation from page 1",
          pageNumber: 1,
          confidenceRating: "high",
          isFound: true,
        },
        field_b: {
          quote: "Quotation for 100 participants",
          pageNumber: 2,
          confidenceRating: "high",
          isFound: true,
        },
      },
      verificationStatus: {
        field_a: "pending",
        field_b: "pending",
      },
      status: "in_progress",
      extractedBy: "ai_assisted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveExtractedDataRecord(record, "usr-test", "test@ib-slr.local");

    // 1. Verify first field
    const step1 = await verifyExtractedField("rec-test-workflow", "field_a", "verified", undefined, "Dr. Clara");
    expect(step1.verificationStatus.field_a).toBe("verified");
    expect(step1.status).toBe("in_progress"); // field_b still pending

    // 2. Correct second field with new human-adjusted value
    const step2 = await verifyExtractedField("rec-test-workflow", "field_b", "corrected", 120, "Dr. Clara");
    expect(step2.verificationStatus.field_b).toBe("corrected");
    expect(step2.values.field_b).toBe(120);
    // Both fields now resolved -> status must transition to 'verified'
    expect(step2.status).toBe("verified");
    expect(step2.verifiedBy).toBe("Dr. Clara");
  });
});
