import { Article } from "../types/research";
import { ExtractedDataRecord } from "../types/extraction";

/**
 * Generates an RIS formatted string specifically tailored for VOSviewer
 * (Nees Jan van Eck & Ludo Waltman, Leiden University).
 * VOSviewer parses TI (Title), AB (Abstract), AU (Authors), PY (Year), JO (Journal),
 * DO (DOI), and KW (Keywords) to build co-occurrence and co-authorship science maps.
 */
export function generateVosviewerRis(
  articles: Article[],
  extractedRecords: ExtractedDataRecord[] = []
): string {
  const entries: string[] = [];

  for (const art of articles) {
    const rec = extractedRecords.find((r) => r.articleId === art.id);
    const lines: string[] = [];

    lines.push("TY  - JOUR");
    lines.push(`TI  - ${art.title || "Untitled"}`);

    // Split authors into separate AU lines
    const authorList = (art.authors || "Anonymous")
      .split(/[,;]/)
      .map((a) => a.trim())
      .filter(Boolean);

    if (authorList.length > 0) {
      for (const author of authorList) {
        lines.push(`AU  - ${author}`);
      }
    } else {
      lines.push("AU  - Anonymous");
    }

    if (art.journal) {
      lines.push(`JO  - ${art.journal}`);
      lines.push(`T2  - ${art.journal}`);
    }

    if (art.publicationYear) {
      lines.push(`PY  - ${art.publicationYear}`);
      lines.push(`Y1  - ${art.publicationYear}`);
    }

    if (art.volume) lines.push(`VL  - ${art.volume}`);
    if (art.issue) lines.push(`IS  - ${art.issue}`);
    if (art.pages) lines.push(`SP  - ${art.pages}`);
    if (art.doi) lines.push(`DO  - ${art.doi}`);

    // Abstract for text mining and keyword extraction in VOSviewer
    if (art.abstract) {
      lines.push(`AB  - ${art.abstract.replace(/\r?\n/g, " ")}`);
    }

    // Add keywords from extracted variables (e.g. study design, country, intervention)
    const keywords: string[] = [];
    if (rec?.values.study_design) keywords.push(String(rec.values.study_design));
    if (rec?.values.country) keywords.push(String(rec.values.country));
    if (rec?.values.intervention_detail) keywords.push(String(rec.values.intervention_detail));
    if (rec?.values.primary_outcome) keywords.push(String(rec.values.primary_outcome));

    // Default academic keywords if none extracted
    if (keywords.length === 0) {
      keywords.push("Systematic Literature Review", "Evidence Synthesis");
    }

    for (const kw of keywords) {
      lines.push(`KW  - ${kw}`);
    }

    lines.push("ER  - ");
    entries.push(lines.join("\n"));
  }

  return entries.join("\n\n");
}

/**
 * Generates a CSV bibliographic corpus file for VOSviewer.
 * Matches standard headers accepted by VOSviewer's "Create a map based on text data"
 * and "Create a map based on bibliographic data" wizards.
 */
export function generateVosviewerCsv(
  articles: Article[],
  extractedRecords: ExtractedDataRecord[] = []
): string {
  const headers = [
    "ID",
    "Title",
    "Authors",
    "Source title",
    "Publication Year",
    "Volume",
    "Issue",
    "Pages",
    "DOI",
    "Abstract",
    "Author Keywords",
    "Index Keywords",
    "Study Design",
    "Sample Size",
    "Country",
    "Intervention",
    "Comparator",
    "Primary Outcome",
    "Screening Status",
  ];

  const rows = articles.map((art) => {
    const rec = extractedRecords.find((r) => r.articleId === art.id);

    // Derived keywords for VOSviewer co-occurrence
    const derivedKeywords: string[] = [];
    if (rec?.values.study_design) derivedKeywords.push(String(rec.values.study_design));
    if (rec?.values.country) derivedKeywords.push(String(rec.values.country));
    if (rec?.values.intervention_detail) derivedKeywords.push(String(rec.values.intervention_detail));

    const clean = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;

    return [
      clean(art.id),
      clean(art.title),
      clean(art.authors),
      clean(art.journal || "Journal"),
      clean(art.publicationYear || ""),
      clean(art.volume || ""),
      clean(art.issue || ""),
      clean(art.pages || ""),
      clean(art.doi || ""),
      clean((art.abstract || "").replace(/\r?\n/g, " ")),
      clean(derivedKeywords.join("; ")),
      clean(derivedKeywords.join("; ")),
      clean(rec?.values.study_design || ""),
      clean(rec?.values.sample_size || ""),
      clean(rec?.values.country || ""),
      clean(rec?.values.intervention_detail || ""),
      clean(rec?.values.comparator_detail || ""),
      clean(rec?.values.primary_outcome || ""),
      clean(art.screeningStatus),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Generates a BibTeX collection for VOSviewer
 */
export function generateVosviewerBibtex(
  articles: Article[],
  extractedRecords: ExtractedDataRecord[] = []
): string {
  const entries: string[] = [];

  for (const art of articles) {
    const rec = extractedRecords.find((r) => r.articleId === art.id);
    const key = `art_${art.id.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const lines: string[] = [
      `@article{${key},`,
      `  title = {${art.title || "Untitled"}},`,
      `  author = {${(art.authors || "Anonymous").replace(/;/g, " and ")}},`,
      `  journal = {${art.journal || "Journal of Evidence Synthesis"}},`,
      `  year = {${art.publicationYear || 2024}},`,
    ];

    if (art.volume) lines.push(`  volume = {${art.volume}},`);
    if (art.issue) lines.push(`  number = {${art.issue}},`);
    if (art.pages) lines.push(`  pages = {${art.pages}},`);
    if (art.doi) lines.push(`  doi = {${art.doi}},`);
    if (art.abstract) {
      lines.push(`  abstract = {${art.abstract.replace(/\r?\n/g, " ")}},`);
    }

    if (rec?.values.study_design || rec?.values.intervention_detail) {
      const kw = [rec.values.study_design, rec.values.country, rec.values.intervention_detail]
        .filter(Boolean)
        .join(", ");
      lines.push(`  keywords = {${kw}},`);
    }

    lines.push(`}`);
    entries.push(lines.join("\n"));
  }

  return entries.join("\n\n");
}
