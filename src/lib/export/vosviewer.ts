import { Article } from "../types/research";
import { ExtractedDataRecord } from "../types/extraction";

/**
 * Generates an RIS formatted string specifically tailored for VOSviewer
 * (Nees Jan van Eck & Ludo Waltman, Leiden University).
 * VOSviewer parses TI (Title), AB (Abstract), AU (Authors), PY (Year), JO (Journal),
 * DO (DOI), and KW (Keywords) to build co-occurrence and co-authorship science maps.
 */
function extractCleanKeywords(article: Article, rec?: ExtractedDataRecord): string[] {
  const kwSet = new Set<string>();
  const fullText = `${article.title} ${article.abstract || ""}`.toLowerCase();

  // Systematic topic keywords
  if (fullText.includes("pedagogik") || fullText.includes("pedagogic") || fullText.includes("kompetensi") || fullText.includes("competence")) {
    kwSet.add("Pedagogical Competence");
  }
  if (fullText.includes("islam") || fullText.includes("religious") || fullText.includes("keagamaan") || fullText.includes("pai")) {
    kwSet.add("Islamic Religious Education");
  }
  if (fullText.includes("nonformal") || fullText.includes("non-formal") || fullText.includes("non formal")) {
    kwSet.add("Non-Formal Education");
  }
  if (fullText.includes("tpq") || fullText.includes("tpa") || fullText.includes("quran") || fullText.includes("qur'an")) {
    kwSet.add("TPQ (Taman Pendidikan Al-Qur'an)");
  }
  if (fullText.includes("madrasah") || fullText.includes("madin") || fullText.includes("diniyah")) {
    kwSet.add("Madrasah Diniyah Takmiliyah");
  }
  if (fullText.includes("pesantren") || fullText.includes("santri") || fullText.includes("boarding school")) {
    kwSet.add("Pondok Pesantren");
  }
  if (fullText.includes("guru") || fullText.includes("teacher") || fullText.includes("pendidik") || fullText.includes("educator")) {
    kwSet.add("Teacher Professionalism");
  }
  if (fullText.includes("ustadz") || fullText.includes("ustaz") || fullText.includes("ustadzah")) {
    kwSet.add("Ustadz Identity");
  }
  if (fullText.includes("kesejahteraan") || fullText.includes("welfare") || fullText.includes("honor") || fullText.includes("insentif") || fullText.includes("gaji")) {
    kwSet.add("Teacher Welfare");
  }
  if (fullText.includes("sertifikasi") || fullText.includes("certification") || fullText.includes("regulasi") || fullText.includes("kebijakan")) {
    kwSet.add("Certification & Policy");
  }
  if (fullText.includes("tantangan") || fullText.includes("challenge") || fullText.includes("hambatan") || fullText.includes("masalah")) {
    kwSet.add("Systemic Challenges");
  }
  if (fullText.includes("adaptasi") || fullText.includes("adaptation") || fullText.includes("strategi") || fullText.includes("strategy")) {
    kwSet.add("Pedagogical Adaptation");
  }
  if (fullText.includes("kurikulum") || fullText.includes("curriculum")) {
    kwSet.add("Curriculum Development");
  }
  if (fullText.includes("indonesia")) {
    kwSet.add("Indonesia");
  }

  // Study design from extraction record
  if (rec?.values.study_design) {
    kwSet.add(String(rec.values.study_design).replace(/\s*\/\s*.*/, "").trim());
  }
  if (rec?.values.country) {
    kwSet.add(String(rec.values.country).split(/[,(]/)[0].trim());
  }

  if (kwSet.size === 0) {
    kwSet.add("Systematic Literature Review");
    kwSet.add("Teacher Competence");
  }

  return Array.from(kwSet);
}

function parseAuthors(authorsStr?: string): string[] {
  if (!authorsStr || !authorsStr.trim()) return ["Anonymous"];
  const trimmed = authorsStr.trim();

  // If semicolon separated: keep Last, First intact per author
  if (trimmed.includes(";")) {
    return trimmed
      .split(";")
      .map((a) => a.trim())
      .filter(Boolean);
  }

  // If " and " separated
  if (trimmed.includes(" and ")) {
    return trimmed
      .split(/\s+and\s+/i)
      .map((a) => a.trim())
      .filter(Boolean);
  }

  // If comma separated:
  const parts = trimmed.split(",").map((a) => a.trim()).filter(Boolean);
  // If exactly 2 parts and neither contains space, it's a single "Last, First" name
  if (parts.length === 2 && !parts[0].includes(" ") && !parts[1].includes(" ")) {
    return [`${parts[0]}, ${parts[1]}`];
  }

  return parts;
}

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
    const authorList = parseAuthors(art.authors);

    for (const author of authorList) {
      lines.push(`AU  - ${author}`);
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

    // Add keywords from clean topic extraction
    const keywords = extractCleanKeywords(art, rec);
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
