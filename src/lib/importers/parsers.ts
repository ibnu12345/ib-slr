export interface ParsedReference {
  title: string;
  authors: string;
  journal?: string;
  publicationYear?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  abstract?: string;
  sourceType?: string;
}

/**
 * Normalizes DOI: strips https://doi.org/, dx.doi.org, trims and lowercases
 */
export function normalizeDoi(doi?: string): string | undefined {
  if (!doi) return undefined;
  const cleaned = doi
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim()
    .toLowerCase();
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Normalizes title for exact matching: lowercases, removes punctuation, collapses whitespace
 */
export function normalizeTitle(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, " ") // Remove punctuation and symbols
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Parse RIS format bibliographic records
 */
export function parseRis(content: string): ParsedReference[] {
  const records: ParsedReference[] = [];
  const lines = content.split(/\r?\n/);

  let currentRecord: Partial<ParsedReference> | null = null;
  let currentAuthors: string[] = [];
  let lastTag = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);

    if (match) {
      const tag = match[1];
      const val = match[2].trim();
      lastTag = tag;

      if (tag === "TY") {
        // Start of new record
        if (currentRecord && currentRecord.title) {
          records.push({
            title: currentRecord.title,
            authors: currentAuthors.join("; ") || "Unknown Authors",
            journal: currentRecord.journal,
            publicationYear: currentRecord.publicationYear,
            volume: currentRecord.volume,
            issue: currentRecord.issue,
            pages: currentRecord.pages,
            doi: normalizeDoi(currentRecord.doi),
            abstract: currentRecord.abstract,
            sourceType: currentRecord.sourceType,
          });
        }
        currentRecord = { sourceType: val };
        currentAuthors = [];
      } else if (!currentRecord) {
        currentRecord = {};
      }

      if (tag === "TI" || tag === "T1") {
        currentRecord.title = val;
      } else if (tag === "AU" || tag === "A1") {
        if (val) currentAuthors.push(val);
      } else if (tag === "PY" || tag === "Y1") {
        const yearMatch = val.match(/\b(19\d\d|20\d\d)\b/);
        if (yearMatch) {
          currentRecord.publicationYear = parseInt(yearMatch[1], 10);
        }
      } else if (tag === "JO" || tag === "JF" || tag === "T2") {
        currentRecord.journal = val;
      } else if (tag === "VL") {
        currentRecord.volume = val;
      } else if (tag === "IS") {
        currentRecord.issue = val;
      } else if (tag === "SP") {
        currentRecord.pages = val;
      } else if (tag === "EP") {
        currentRecord.pages = currentRecord.pages ? `${currentRecord.pages}-${val}` : val;
      } else if (tag === "DO") {
        currentRecord.doi = val;
      } else if (tag === "AB" || tag === "N2") {
        currentRecord.abstract = val;
      } else if (tag === "ER") {
        // End of record
        if (currentRecord && currentRecord.title) {
          records.push({
            title: currentRecord.title,
            authors: currentAuthors.join("; ") || "Unknown Authors",
            journal: currentRecord.journal,
            publicationYear: currentRecord.publicationYear,
            volume: currentRecord.volume,
            issue: currentRecord.issue,
            pages: currentRecord.pages,
            doi: normalizeDoi(currentRecord.doi),
            abstract: currentRecord.abstract,
            sourceType: currentRecord.sourceType,
          });
        }
        currentRecord = null;
        currentAuthors = [];
      }
    } else if (currentRecord && line.trim().length > 0 && lastTag) {
      // Continuation line for multi-line abstract or title
      if (lastTag === "AB" || lastTag === "N2") {
        currentRecord.abstract = currentRecord.abstract
          ? `${currentRecord.abstract} ${line.trim()}`
          : line.trim();
      } else if (lastTag === "TI" || lastTag === "T1") {
        currentRecord.title = currentRecord.title
          ? `${currentRecord.title} ${line.trim()}`
          : line.trim();
      }
    }
  }

  // Push final record if no ER tag closed it
  if (currentRecord && currentRecord.title) {
    records.push({
      title: currentRecord.title,
      authors: currentAuthors.join("; ") || "Unknown Authors",
      journal: currentRecord.journal,
      publicationYear: currentRecord.publicationYear,
      volume: currentRecord.volume,
      issue: currentRecord.issue,
      pages: currentRecord.pages,
      doi: normalizeDoi(currentRecord.doi),
      abstract: currentRecord.abstract,
      sourceType: currentRecord.sourceType,
    });
  }

  return records;
}

/**
 * Parse BibTeX format bibliographic records
 */
export function parseBibTeX(content: string): ParsedReference[] {
  const records: ParsedReference[] = [];

  // Match entries like @article{key, ...} or @misc{key, ...}
  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,]+),([\s\S]*?)\n\s*\}/g;
  let entryMatch: RegExpExecArray | null;

  while ((entryMatch = entryRegex.exec(content)) !== null) {
    const entryType = entryMatch[1];
    const body = entryMatch[3];

    const record: Partial<ParsedReference> = { sourceType: entryType };

    // Match fields: fieldName = {value} or fieldName = "value" or fieldName = value
    const fieldRegex = /([a-zA-Z_]+)\s*=\s*(?:\{([^}]*)\}|"([^"]*)"|([^,]+))/g;
    let fieldMatch: RegExpExecArray | null;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const field = fieldMatch[1].toLowerCase();
      const rawVal = fieldMatch[2] ?? fieldMatch[3] ?? fieldMatch[4] ?? "";
      const val = rawVal.replace(/\s+/g, " ").trim();

      if (field === "title") {
        record.title = val;
      } else if (field === "author" || field === "authors") {
        // In BibTeX, authors separated by "and"
        record.authors = val.split(/\s+and\s+/i).join("; ");
      } else if (field === "year") {
        const y = parseInt(val, 10);
        if (!isNaN(y)) record.publicationYear = y;
      } else if (field === "journal" || field === "booktitle") {
        record.journal = val;
      } else if (field === "volume") {
        record.volume = val;
      } else if (field === "number" || field === "issue") {
        record.issue = val;
      } else if (field === "pages") {
        record.pages = val;
      } else if (field === "doi") {
        record.doi = normalizeDoi(val);
      } else if (field === "abstract") {
        record.abstract = val;
      }
    }

    if (record.title) {
      records.push({
        title: record.title,
        authors: record.authors || "Unknown Authors",
        journal: record.journal,
        publicationYear: record.publicationYear,
        volume: record.volume,
        issue: record.issue,
        pages: record.pages,
        doi: normalizeDoi(record.doi),
        abstract: record.abstract,
        sourceType: record.sourceType,
      });
    }
  }

  return records;
}

/**
 * Parse CSV format bibliographic files
 */
export function parseCsv(content: string): ParsedReference[] {
  const records: ParsedReference[] = [];
  const rows = parseCsvRows(content);
  if (rows.length < 2) return records;

  const header = rows[0].map((h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ""));

  // Identify column indices
  const titleIdx = header.findIndex((h) => h === "title" || h === "articletitle" || h === "documenttitle");
  const authorIdx = header.findIndex((h) => h === "author" || h === "authors" || h === "authornames");
  const yearIdx = header.findIndex((h) => h === "year" || h === "publicationyear" || h === "pubyear" || h === "date");
  const journalIdx = header.findIndex((h) => h === "journal" || h === "sourcetitle" || h === "publicationname");
  const doiIdx = header.findIndex((h) => h === "doi");
  const abstractIdx = header.findIndex((h) => h === "abstract" || h === "description");
  const volumeIdx = header.findIndex((h) => h === "volume");
  const issueIdx = header.findIndex((h) => h === "issue");
  const pagesIdx = header.findIndex((h) => h === "pages" || h === "page");

  if (titleIdx === -1) {
    throw new Error("CSV does not contain a recognizable 'Title' header column.");
  }

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length <= titleIdx) continue;

    const title = row[titleIdx]?.trim();
    if (!title) continue;

    const authors = authorIdx !== -1 ? row[authorIdx]?.trim() || "Unknown Authors" : "Unknown Authors";
    let publicationYear: number | undefined;
    if (yearIdx !== -1 && row[yearIdx]) {
      const parsedYear = parseInt(row[yearIdx], 10);
      if (!isNaN(parsedYear) && parsedYear > 1800 && parsedYear < 2100) {
        publicationYear = parsedYear;
      }
    }

    records.push({
      title,
      authors,
      journal: journalIdx !== -1 ? row[journalIdx]?.trim() : undefined,
      publicationYear,
      volume: volumeIdx !== -1 ? row[volumeIdx]?.trim() : undefined,
      issue: issueIdx !== -1 ? row[issueIdx]?.trim() : undefined,
      pages: pagesIdx !== -1 ? row[pagesIdx]?.trim() : undefined,
      doi: doiIdx !== -1 ? normalizeDoi(row[doiIdx]) : undefined,
      abstract: abstractIdx !== -1 ? row[abstractIdx]?.trim() : undefined,
    });
  }

  return records;
}

/**
 * RFC 4180 compliant CSV line/cell splitter supporting quoted commas and multi-line fields
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\r") {
        // ignore CR
      } else if (char === "\n") {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}
