import { describe, it, expect } from "vitest";
import {
  getManuscriptByProjectId,
  saveManuscript,
  getTableDefinitions,
  saveTableDefinition,
} from "../src/lib/db";
import { ProjectManuscript, JournalTableDefinition } from "../src/lib/types/publication";

describe("Publication Studio, Journal Tables & Manuscript Workspace", () => {
  it("retrieves pre-seeded manuscript draft and updates sections", async () => {
    const manuscript = await getManuscriptByProjectId("prj-demo-1");
    expect(manuscript).toBeDefined();
    expect(manuscript?.title).toContain("Digital Health");
    expect(manuscript?.sections.abstract).toBeDefined();
    expect(manuscript?.sections.introduction).toBeDefined();
    expect(manuscript?.sections.results).toBeDefined();

    // Update section
    const updated: ProjectManuscript = {
      ...manuscript!,
      sections: {
        ...manuscript!.sections,
        discussion: "Updated discussion evaluating mobile applications across clinical trials.",
      },
    };

    const saved = await saveManuscript(updated, "usr-test", "test@ib-slr.local");
    expect(saved.sections.discussion).toContain("Updated discussion");

    const reloaded = await getManuscriptByProjectId("prj-demo-1");
    expect(reloaded?.sections.discussion).toContain("Updated discussion");
  });

  it("manages journal table definitions and column customizations", async () => {
    const tableDefs = await getTableDefinitions("prj-demo-1");
    expect(tableDefs.length).toBeGreaterThan(1);

    const table1 = tableDefs.find((t) => t.tableType === "characteristics");
    expect(table1).toBeDefined();
    expect(table1?.columns.some((c) => c.key === "sample_size")).toBe(true);

    const newDef: JournalTableDefinition = {
      id: "tbl-custom-outcomes",
      projectId: "prj-demo-1",
      tableType: "synthesis_matrix",
      title: "Table 3. Detailed Outcome Metrics Matrix",
      columns: [
        { key: "study_id", label: "Study Reference", visible: true },
        { key: "hba1c_change", label: "HbA1c Change (%)", visible: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedDef = await saveTableDefinition(newDef, "usr-test", "test@ib-slr.local");
    expect(savedDef.id).toBe("tbl-custom-outcomes");

    const reloadedDefs = await getTableDefinitions("prj-demo-1");
    expect(reloadedDefs.some((t) => t.id === "tbl-custom-outcomes")).toBe(true);
  });
});
