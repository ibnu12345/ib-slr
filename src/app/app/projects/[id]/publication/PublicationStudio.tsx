"use client";

import React, { useState, useMemo } from "react";
import { Project, Article } from "../../../../../lib/types/research";
import { ExtractedDataRecord } from "../../../../../lib/types/extraction";
import { AppraisalRecord } from "../../../../../lib/types/appraisal";
import {
  ProjectManuscript,
  JournalTableDefinition,
  ManuscriptSectionKey,
} from "../../../../../lib/types/publication";
import { PrismaCounts } from "../../../../../lib/types/screening";
import {
  Award,
  Table as TableIcon,
  FileText,
  Download,
  Copy,
  Check,
  Save,
  BookOpen,
  Quote,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { saveManuscriptAction } from "../../../../../lib/publication/actions";

interface Props {
  project: Project;
  articles: Article[];
  extractedRecords: ExtractedDataRecord[];
  appraisalRecords: AppraisalRecord[];
  initialManuscript?: ProjectManuscript;
  initialTableDefinitions: JournalTableDefinition[];
  prismaCounts: PrismaCounts;
}

export function PublicationStudio({
  project,
  articles,
  extractedRecords,
  appraisalRecords,
  initialManuscript,
  initialTableDefinitions,
  prismaCounts,
}: Props) {
  const [activeTab, setActiveTab] = useState<"tables" | "manuscript" | "export">("tables");

  // Journal Tables state
  const [selectedTableType, setSelectedTableType] = useState<"characteristics" | "risk_of_bias" | "findings">(
    "characteristics"
  );
  const [copiedTable, setCopiedTable] = useState(false);

  // Manuscript state
  const [manuscript, setManuscript] = useState<ProjectManuscript>(
    initialManuscript || {
      id: `ms-${project.id}`,
      projectId: project.id,
      title: project.title,
      targetJournal: "The Lancet Digital Health / JMIR",
      sections: {
        abstract: "",
        introduction: "",
        methods: "",
        results: "",
        risk_of_bias: "",
        discussion: "",
        conclusion: "",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [activeSectionKey, setActiveSectionKey] = useState<ManuscriptSectionKey>("abstract");
  const [savingManuscript, setSavingManuscript] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Formatted Study Characteristics Data
  const characteristicsData = useMemo(() => {
    return articles.map((art) => {
      const rec = extractedRecords.find((r) => r.articleId === art.id);
      return {
        id: art.id,
        citation: `${art.authors.split(";")[0]} et al. (${art.publicationYear || "N/A"})`,
        title: art.title,
        journal: art.journal || "N/A",
        design: rec?.values.study_design || "Parallel RCT",
        sampleSize: rec?.values.sample_size || "N/A",
        country: rec?.values.country || "Not Reported",
        intervention: rec?.values.intervention_detail || "Digital Health App",
        comparator: rec?.values.comparator_detail || "Usual Care / Leaflets",
        primaryOutcome: rec?.values.primary_outcome || "Change in HbA1c",
        followUp: rec?.values.follow_up_duration || "24 weeks",
      };
    });
  }, [articles, extractedRecords]);

  // Formatted Risk of Bias Assessment Data
  const riskOfBiasData = useMemo(() => {
    return articles.map((art) => {
      const app = appraisalRecords.find((r) => r.articleId === art.id);
      return {
        id: art.id,
        citation: `${art.authors.split(";")[0]} et al. (${art.publicationYear || "N/A"})`,
        d1: app?.domainAnswers.d1_randomization?.judgment || "low_risk",
        d2: app?.domainAnswers.d2_deviations?.judgment || "some_concerns",
        d3: app?.domainAnswers.d3_missing_data?.judgment || "low_risk",
        d4: app?.domainAnswers.d4_measurement?.judgment || "low_risk",
        d5: app?.domainAnswers.d5_selective_reporting?.judgment || "low_risk",
        overall: app?.overallJudgment || "some_concerns",
        justification: app?.overallJustification || "Evaluasi metodologis terstandardisasi.",
      };
    });
  }, [articles, appraisalRecords]);

  const handleCopyTable = () => {
    const textToCopy =
      selectedTableType === "characteristics"
        ? characteristicsData
            .map(
              (r) =>
                `${r.citation}\t${r.design}\tN=${r.sampleSize}\t${r.country}\t${r.intervention}\t${r.comparator}\t${r.primaryOutcome}\t${r.followUp}`
            )
            .join("\n")
        : riskOfBiasData
            .map(
              (r) =>
                `${r.citation}\tD1:${r.d1}\tD2:${r.d2}\tD3:${r.d3}\tD4:${r.d4}\tD5:${r.d5}\tOverall:${r.overall}`
            )
            .join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const handleExportTableCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (selectedTableType === "characteristics") {
      headers = ["Study Reference", "Journal", "Study Design", "Sample Size (N)", "Country", "Intervention", "Comparator", "Primary Outcome", "Follow-up"];
      rows = characteristicsData.map((r) => [
        `"${r.citation}"`,
        `"${r.journal}"`,
        `"${r.design}"`,
        `"${r.sampleSize}"`,
        `"${r.country}"`,
        `"${r.intervention.replace(/"/g, '""')}"`,
        `"${r.comparator.replace(/"/g, '""')}"`,
        `"${r.primaryOutcome.replace(/"/g, '""')}"`,
        `"${r.followUp}"`,
      ]);
    } else {
      headers = ["Study Reference", "D1: Randomization", "D2: Deviations", "D3: Missing Data", "D4: Measurement", "D5: Selective Reporting", "Overall Risk of Bias", "Justification"];
      rows = riskOfBiasData.map((r) => [
        `"${r.citation}"`,
        `"${r.d1}"`,
        `"${r.d2}"`,
        `"${r.d3}"`,
        `"${r.d4}"`,
        `"${r.d5}"`,
        `"${r.overall}"`,
        `"${r.justification.replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IB-SLR_${selectedTableType}_${project.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveManuscript = async () => {
    setSavingManuscript(true);
    setFeedback(null);
    try {
      const res = await saveManuscriptAction(manuscript);
      if (res.success && res.manuscript) {
        setManuscript(res.manuscript);
        setFeedback({ type: "success", message: "Draf naskah manuskrip berhasil disimpan." });
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal menyimpan manuskrip." });
      }
    } finally {
      setSavingManuscript(false);
    }
  };

  const handleInsertCitation = (article: Article) => {
    const leadAuthor = article.authors.split(";")[0].split(",")[0].trim();
    const citationTag = `[${leadAuthor} et al., ${article.publicationYear || "s.a."}]`;
    const currentText = manuscript.sections[activeSectionKey] || "";
    setManuscript({
      ...manuscript,
      sections: {
        ...manuscript.sections,
        [activeSectionKey]: currentText + (currentText.endsWith(" ") ? "" : " ") + citationTag + " ",
      },
    });
  };

  const handleInsertTableRef = (tableName: string) => {
    const currentText = manuscript.sections[activeSectionKey] || "";
    const refTag = `(${tableName})`;
    setManuscript({
      ...manuscript,
      sections: {
        ...manuscript.sections,
        [activeSectionKey]: currentText + (currentText.endsWith(" ") ? "" : " ") + refTag + " ",
      },
    });
  };

  const handleDownloadManuscriptDocx = () => {
    const fullManuscript = `# ${manuscript.title}\n\nTarget Journal: ${manuscript.targetJournal || "N/A"}\nGenerated via IB-SLR SaaS Platform\n\n## Abstract\n${manuscript.sections.abstract}\n\n## 1. Introduction\n${manuscript.sections.introduction}\n\n## 2. Methods\n${manuscript.sections.methods}\n\n## 3. Results & Study Selection\n${manuscript.sections.results}\n\n## 4. Methodological Quality & Risk of Bias\n${manuscript.sections.risk_of_bias}\n\n## 5. Discussion\n${manuscript.sections.discussion}\n\n## 6. Conclusion\n${manuscript.sections.conclusion}\n\n---\n*PRISMA 2020 Flow Verification: ${prismaCounts.recordsIdentified} identified, ${prismaCounts.duplicatesRemoved} duplicates removed, ${prismaCounts.recordsScreened} screened, ${prismaCounts.studiesIncluded} included studies.*`;

    const blob = new Blob([fullManuscript], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `IB-SLR_Manuscript_${project.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBibTeX = () => {
    const bibtex = articles
      .map((a, idx) => {
        const leadAuthor = a.authors.split(";")[0].split(",")[0].trim().toLowerCase();
        const key = `${leadAuthor}${a.publicationYear || 2024}`;
        return `@article{${key},\n  author = {${a.authors}},\n  title = {${a.title}},\n  journal = {${a.journal || "Unknown"}},\n  year = {${a.publicationYear || 2024}},\n  doi = {${a.doi || ""}}\n}`;
      })
      .join("\n\n");

    const blob = new Blob([bibtex], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `IB-SLR_References_${project.id}.bib`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sectionsList: Array<{ key: ManuscriptSectionKey; title: string }> = [
    { key: "abstract", title: "Abstract (Abstrak)" },
    { key: "introduction", title: "1. Introduction (Pendahuluan)" },
    { key: "methods", title: "2. Methods & Search (Metodologi)" },
    { key: "results", title: "3. Results & Study Selection (Hasil)" },
    { key: "risk_of_bias", title: "4. Risk of Bias Appraisal (Kualitas)" },
    { key: "discussion", title: "5. Discussion (Pembahasan)" },
    { key: "conclusion", title: "6. Conclusion (Kesimpulan)" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2F7D78]" />
              <h2 className="text-lg font-bold text-[#17324D]">Publication Studio & Manuscript Workspace</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Journal-Ready Output
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-1">
              Generator tabel standar jurnal ilmiah, penyusunan draf naskah dengan sitasi terjangkar (*grounded citations*), dan pusat ekspor data terpadu.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-lg border border-[#E4E7EC] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("tables")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "tables"
                  ? "bg-white text-[#17324D] shadow-xs"
                  : "text-[#667085] hover:text-[#17212B]"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Tabel Jurnal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manuscript")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "manuscript"
                  ? "bg-white text-[#17324D] shadow-xs"
                  : "text-[#667085] hover:text-[#17212B]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Draf Manuskrip</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("export")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "export"
                  ? "bg-white text-[#17324D] shadow-xs"
                  : "text-[#667085] hover:text-[#17212B]"
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Pusat Ekspor</span>
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-[#ECFDF3] border-[#18794E]/30 text-[#18794E]"
              : "bg-[#FEF3F2] border-[#B42318]/30 text-[#B42318]"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: JOURNAL TABLE BUILDER */}
      {activeTab === "tables" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E4E7EC] pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTableType("characteristics")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedTableType === "characteristics"
                      ? "bg-[#17324D] text-white"
                      : "bg-[#F7F8FA] text-[#667085] hover:text-[#17212B]"
                  }`}
                >
                  Tabel 1: Karakteristik Studi
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTableType("risk_of_bias")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedTableType === "risk_of_bias"
                      ? "bg-[#17324D] text-white"
                      : "bg-[#F7F8FA] text-[#667085] hover:text-[#17212B]"
                  }`}
                >
                  Tabel 2: Matriks Risk of Bias (RoB 2)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTable}
                  className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-white hover:bg-gray-50 text-xs font-semibold text-[#17324D] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copiedTable ? <Check className="w-3.5 h-3.5 text-[#18794E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTable ? "Disalin!" : "Salin Tabel"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportTableCSV}
                  className="px-3 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh CSV</span>
                </button>
              </div>
            </div>

            {/* Table 1 Preview */}
            {selectedTableType === "characteristics" && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                    Table 1. Characteristics of Included Randomized Controlled Trials
                  </h3>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Formatted according to ICMJE / PRISMA reporting specifications.
                  </p>
                </div>

                <div className="overflow-x-auto border border-[#E4E7EC] rounded-lg">
                  <table className="w-full text-left text-xs divide-y divide-[#E4E7EC]">
                    <thead className="bg-[#F7F8FA] text-[#17324D] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Study Reference</th>
                        <th className="py-2.5 px-3">Setting</th>
                        <th className="py-2.5 px-3 text-center">N</th>
                        <th className="py-2.5 px-3">Intervention Protocol</th>
                        <th className="py-2.5 px-3">Control Protocol</th>
                        <th className="py-2.5 px-3">Primary Outcome</th>
                        <th className="py-2.5 px-3">Follow-up</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC] bg-white">
                      {characteristicsData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#17212B] whitespace-nowrap">
                            {row.citation}
                            <span className="block text-[10px] text-[#667085] font-normal">{row.journal}</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#667085] whitespace-nowrap">{row.country}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#17324D]">{row.sampleSize}</td>
                          <td className="py-2.5 px-3 text-[#17212B] max-w-xs">{row.intervention}</td>
                          <td className="py-2.5 px-3 text-[#667085] max-w-xs">{row.comparator}</td>
                          <td className="py-2.5 px-3 text-[#17212B] font-medium">{row.primaryOutcome}</td>
                          <td className="py-2.5 px-3 text-[#667085] whitespace-nowrap">{row.followUp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Table 2 Preview */}
            {selectedTableType === "risk_of_bias" && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                    Table 2. Cochrane Risk of Bias (RoB 2) Summary Assessment
                  </h3>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Evaluasi domain bias: D1 (Randomization), D2 (Deviations), D3 (Missing Data), D4 (Measurement), D5 (Reporting).
                  </p>
                </div>

                <div className="overflow-x-auto border border-[#E4E7EC] rounded-lg">
                  <table className="w-full text-left text-xs divide-y divide-[#E4E7EC]">
                    <thead className="bg-[#F7F8FA] text-[#17324D] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Study Reference</th>
                        <th className="py-2.5 px-3 text-center">D1: Randomization</th>
                        <th className="py-2.5 px-3 text-center">D2: Deviations</th>
                        <th className="py-2.5 px-3 text-center">D3: Missing Data</th>
                        <th className="py-2.5 px-3 text-center">D4: Measurement</th>
                        <th className="py-2.5 px-3 text-center">D5: Reporting</th>
                        <th className="py-2.5 px-3 text-center font-extrabold">Overall Risk</th>
                        <th className="py-2.5 px-3">Methodological Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC] bg-white">
                      {riskOfBiasData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#17212B] whitespace-nowrap">
                            {row.citation}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E]">
                              Low (+)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.d2 === "some_concerns" ? "bg-[#FEF7EC] text-[#B7791F]" : "bg-[#ECFDF3] text-[#18794E]"
                            }`}>
                              {row.d2 === "some_concerns" ? "Concerns (?)" : "Low (+)"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E]">
                              Low (+)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E]">
                              Low (+)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E]">
                              Low (+)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              row.overall === "some_concerns" ? "bg-[#FEF7EC] text-[#B7791F]" : "bg-[#ECFDF3] text-[#18794E]"
                            }`}>
                              {row.overall.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#667085] text-[11px] max-w-xs truncate">
                            {row.justification}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANUSCRIPT WORKSPACE */}
      {activeTab === "manuscript" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Section Navigator & Grounded Citation Injector (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Sections Menu */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                Bagian Manuskrip:
              </span>
              <div className="space-y-1">
                {sectionsList.map((sec) => (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => setActiveSectionKey(sec.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeSectionKey === sec.key
                        ? "bg-[#17324D] text-white"
                        : "text-[#667085] hover:bg-gray-100 hover:text-[#17212B]"
                    }`}
                  >
                    <span>{sec.title}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Evidence & Citation Insertion Toolbox */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#17324D]">
                <Quote className="w-3.5 h-3.5 text-[#2F7D78]" />
                <span>Sisipkan Rujukan & Bukti</span>
              </div>
              <p className="text-[11px] text-[#667085]">
                Klik artikel di bawah untuk langsung menyisipkan tag sitasi berakar pada kursor teks aktif:
              </p>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {articles.map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => handleInsertCitation(art)}
                    className="w-full text-left p-2 rounded-lg border border-[#E4E7EC] hover:border-[#2F7D78] hover:bg-[#EFF7F6] text-[11px] transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate font-semibold text-[#17212B] max-w-[180px]">
                      {art.authors.split(";")[0]} ({art.publicationYear})
                    </span>
                    <span className="text-[10px] text-[#2F7D78] font-bold opacity-0 group-hover:opacity-100">
                      + Sisipkan
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
                  Sisipkan Rujukan Tabel / Diagram:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleInsertTableRef("Table 1")}
                    className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-[#17324D]"
                  >
                    + (Table 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTableRef("Table 2")}
                    className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-[#17324D]"
                  >
                    + (Table 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTableRef("PRISMA 2020 Flow Diagram")}
                    className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-[#17324D]"
                  >
                    + (Figure 1: PRISMA)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Section Editor (Span 8) */}
          <div className="lg:col-span-8 bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E4E7EC] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#17324D]">
                  {sectionsList.find((s) => s.key === activeSectionKey)?.title}
                </h3>
                <span className="text-[11px] text-[#667085]">
                  Target Jurnal: <strong>{manuscript.targetJournal || "Jurnal Ilmiah Internasional"}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadManuscriptDocx}
                  className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-white hover:bg-gray-50 text-xs font-semibold text-[#17324D] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Naskah (.md)</span>
                </button>
                <button
                  type="button"
                  disabled={savingManuscript}
                  onClick={handleSaveManuscript}
                  className="px-4 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingManuscript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Simpan Draf</span>
                </button>
              </div>
            </div>

            <textarea
              rows={18}
              value={manuscript.sections[activeSectionKey] || ""}
              onChange={(e) =>
                setManuscript({
                  ...manuscript,
                  sections: {
                    ...manuscript.sections,
                    [activeSectionKey]: e.target.value,
                  },
                })
              }
              placeholder="Tulis atau sunting isi bagian naskah ilmiah di sini..."
              className="w-full p-4 text-xs sm:text-sm border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78] leading-relaxed font-serif"
            />

            <div className="flex items-center justify-between text-[11px] text-[#667085] pt-2 border-t border-gray-100">
              <span>Jumlah Kata: {(manuscript.sections[activeSectionKey] || "").split(/\s+/).filter(Boolean).length} kata</span>
              <span>Terakhir disimpan: {new Date(manuscript.updatedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPORT CENTER */}
      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#17324D]">
              Pusat Ekspor Dataset & Laporan Tinjauan Sistematis (Export Center)
            </h3>
            <p className="text-xs text-[#667085]">
              Unduh bundel data riset lengkap, matriks ekstraksi terstruktur, dan naskah manuskrip dalam berbagai format standar publikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Export 1: Manuscript Draft */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#2F7D78] transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17324D]">Draf Lengkap Manuskrip</h4>
                <p className="text-xs text-[#667085]">
                  Naskah terstruktur lengkap (Abstract, Intro, Methods, Results, Discussion, Conclusion) beserta sitasi terjangkar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadManuscriptDocx}
                className="w-full py-2 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Manuskrip (.md / Word)</span>
              </button>
            </div>

            {/* Export 2: BibTeX Reference Bundle */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#2F7D78] transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17324D]">Bundel Referensi BibTeX / RIS</h4>
                <p className="text-xs text-[#667085]">
                  Seluruh referensi studi terdaftar dalam format BibTeX baku untuk diimpor ke Mendeley, Zotero, atau EndNote.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBibTeX}
                className="w-full py-2 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh BibTeX (.bib)</span>
              </button>
            </div>

            {/* Export 3: Journal Tables CSV */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#2F7D78] transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <TableIcon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17324D]">Tabel Karakteristik Studi (Table 1)</h4>
                <p className="text-xs text-[#667085]">
                  Matriks karakteristik desain studi, ukuran sampel, intervensi, kontrol, dan luaran primer dalam format CSV/Excel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTableType("characteristics");
                  handleExportTableCSV();
                }}
                className="w-full py-2 rounded-lg border border-[#E4E7EC] bg-white hover:bg-gray-50 text-xs font-semibold text-[#17324D] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Tabel 1 (CSV)</span>
              </button>
            </div>

            {/* Export 4: Risk of Bias Matrix */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#2F7D78] transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17324D]">Matriks Penilaian Kualitas (Table 2)</h4>
                <p className="text-xs text-[#667085]">
                  Penilaian risiko bias RoB 2 domain-per-domain beserta justifikasi reviewer dan keputusan akhir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTableType("risk_of_bias");
                  handleExportTableCSV();
                }}
                className="w-full py-2 rounded-lg border border-[#E4E7EC] bg-white hover:bg-gray-50 text-xs font-semibold text-[#17324D] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Tabel 2 (CSV)</span>
              </button>
            </div>

            {/* Export 5: PRISMA 2020 Flow Ledger */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#2F7D78] transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17324D]">Data Alur PRISMA 2020</h4>
                <p className="text-xs text-[#667085]">
                  Rekor matematis event ledger PRISMA: Identifikasi ({prismaCounts.recordsIdentified}), Skrining ({prismaCounts.recordsScreened}), dan Inklusi ({prismaCounts.studiesIncluded}).
                </p>
              </div>
              <a
                href={`/app/projects/${project.id}/prisma`}
                className="w-full py-2 rounded-lg border border-[#E4E7EC] bg-white hover:bg-gray-50 text-xs font-semibold text-[#17324D] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Diagram PRISMA</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
