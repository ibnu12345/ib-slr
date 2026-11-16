import { describe, it, expect } from "vitest";
import { generateVosviewerRis, generateVosviewerCsv, generateVosviewerBibtex } from "../src/lib/export/vosviewer";
import { Article } from "../src/lib/types/research";
import { ExtractedDataRecord } from "../src/lib/types/extraction";

describe("VOSviewer Bibliometric Exporter", () => {
  const mockArticles: Article[] = [
    {
      id: "art-1",
      projectId: "prj-demo-1",
      title: "Mobile Health Applications for Glycemic Control",
      normalizedTitle: "mobile health applications for glycemic control",
      authors: "Chen, L.; Kumar, A.; Davis, M.",
      journal: "Lancet Digital Health",
      publicationYear: 2024,
      volume: "6",
      issue: "2",
      pages: "e102-e110",
      doi: "10.1016/S2589-7500(23)00214-5",
      abstract: "We conducted a randomized trial evaluating a smartphone therapeutic in 320 type 2 diabetes patients.",
      screeningStatus: "included",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "art-2",
      projectId: "prj-demo-1",
      title: "Telemonitoring and Automated Coaching in Diabetes",
      normalizedTitle: "telemonitoring and automated coaching in diabetes",
      authors: "Smith, J.; Miller, P.",
      journal: "Diabetes Care",
      publicationYear: 2023,
      doi: "10.2337/dc23-0145",
      abstract: "Automated AI coaching achieved significant reduction in HbA1c over 24 weeks.",
      screeningStatus: "included",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockRecords: ExtractedDataRecord[] = [
    {
      id: "rec-1",
      projectId: "prj-demo-1",
      articleId: "art-1",
      templateId: "tmpl-pico-core",
      values: {
        study_design: "Parallel RCT",
        sample_size: 320,
        country: "United States",
        intervention_detail: "Mobile App",
      },
      evidence: {},
      verificationStatus: {},
      status: "verified",
      extractedBy: "ai_assisted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("generates valid RIS format with VOSviewer tags (TY, TI, AU, AB, KW, ER)", () => {
    const ris = generateVosviewerRis(mockArticles, mockRecords);

    expect(ris).toContain("TY  - JOUR");
    expect(ris).toContain("TI  - Mobile Health Applications for Glycemic Control");
    expect(ris).toContain("AU  - Chen");
    expect(ris).toContain("AU  - Kumar");
    expect(ris).toContain("JO  - Lancet Digital Health");
    expect(ris).toContain("PY  - 2024");
    expect(ris).toContain("DO  - 10.1016/S2589-7500(23)00214-5");
    expect(ris).toContain("AB  - We conducted a randomized trial");
    expect(ris).toContain("KW  - Parallel RCT");
    expect(ris).toContain("KW  - United States");
    expect(ris).toContain("ER  - ");
  });

  it("generates valid CSV format with standard bibliometric headers", () => {
    const csv = generateVosviewerCsv(mockArticles, mockRecords);

    expect(csv).toContain("Title,Authors,Source title,Publication Year");
    expect(csv).toContain('"Mobile Health Applications for Glycemic Control"');
    expect(csv).toContain('"Lancet Digital Health"');
    expect(csv).toContain('"2024"');
    expect(csv).toContain('"Parallel RCT"');
  });

  it("generates BibTeX collection for reference mapping", () => {
    const bib = generateVosviewerBibtex(mockArticles, mockRecords);

    expect(bib).toContain("@article{art_art_1,");
    expect(bib).toContain("title = {Mobile Health Applications for Glycemic Control},");
    expect(bib).toContain("journal = {Lancet Digital Health},");
    expect(bib).toContain("year = {2024},");
  });
});
