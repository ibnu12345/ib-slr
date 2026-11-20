"use client";

import React, { useState, useMemo } from "react";
import { Article } from "../../../../../lib/types/research";
import {
  ExtractionTemplate,
  ExtractedDataRecord,
  ExtractionField,
  FieldVerificationState,
} from "../../../../../lib/types/extraction";
import {
  Database,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Download,
  Plus,
  ShieldCheck,
  Quote,
  Loader2,
  Check,
  Edit2,
  X,
  ExternalLink,
  Table as TableIcon,
  ChevronRight,
  Filter,
  AlertCircle,
} from "lucide-react";
import { PdfArticleViewer } from "../../../../../components/research/PdfArticleViewer";
import {
  runAIExtractionForArticleAction,
  runBatchAIExtractionAction,
  verifyExtractionFieldAction,
} from "../../../../../lib/ai/actions";
import { generateVosviewerRis } from "../../../../../lib/export/vosviewer";

const fallbackDefaultTemplate: ExtractionTemplate = {
  id: "tmpl-pico-default",
  projectId: "global",
  name: "PICO & Karakteristik Studi Review (Standar)",
  description: "Template standar ekstraksi karakteristik partisipan, fokus kajian/intervensi, komparator, dan luaran studi.",
  version: 1,
  isDefault: true,
  fields: [
    {
      id: "fld-1",
      key: "study_design",
      label: "Desain Studi (Study Design)",
      type: "select",
      category: "study_characteristics",
      options: [
        "Qualitative Study / Kualitatif",
        "Cross-Sectional Survey / Kuantitatif",
        "Quasi-Experimental Study",
        "Mixed Methods Study",
        "Research & Development (R&D)",
        "Classroom Action Research (PTK)",
        "Systematic Literature Review",
      ],
      required: true,
      sortOrder: 1,
    },
    {
      id: "fld-2",
      key: "sample_size",
      label: "Jumlah Sampel / Partisipan (N)",
      type: "number",
      category: "population",
      required: true,
      sortOrder: 2,
    },
    {
      id: "fld-3",
      key: "country",
      label: "Setting / Lokasi Penelitian",
      type: "text",
      category: "population",
      required: true,
      sortOrder: 3,
    },
    {
      id: "fld-4",
      key: "intervention_detail",
      label: "Fokus Kajian / Program Intervensi",
      type: "long_text",
      category: "interventions",
      required: true,
      sortOrder: 4,
    },
    {
      id: "fld-5",
      key: "comparator_detail",
      label: "Konteks Pembanding / Baseline",
      type: "long_text",
      category: "interventions",
      required: true,
      sortOrder: 5,
    },
    {
      id: "fld-6",
      key: "primary_outcome",
      label: "Temuan / Luaran Utama Penelitian",
      type: "long_text",
      category: "outcomes",
      required: true,
      sortOrder: 6,
    },
    {
      id: "fld-7",
      key: "follow_up_duration",
      label: "Durasi / Periode Penelitian",
      type: "text",
      category: "outcomes",
      required: false,
      sortOrder: 7,
    },
    {
      id: "fld-8",
      key: "risk_of_bias_notes",
      label: "Keterbatasan Metodologi / Catatan Bias",
      type: "long_text",
      category: "methodology",
      required: false,
      sortOrder: 8,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface Props {
  projectId: string;
  articles: Article[];
  templates: ExtractionTemplate[];
  initialRecords: ExtractedDataRecord[];
}

export function ExtractionStudio({
  projectId,
  articles,
  templates: initialTemplates,
  initialRecords,
}: Props) {
  const [templates, setTemplates] = useState<ExtractionTemplate[]>(
    initialTemplates.length > 0 ? initialTemplates : [fallbackDefaultTemplate]
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplates.find((t) => t.isDefault)?.id || initialTemplates[0]?.id || fallbackDefaultTemplate.id
  );

  const [records, setRecords] = useState<ExtractedDataRecord[]>(initialRecords);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || "");
  const [activeHighlightQuote, setActiveHighlightQuote] = useState<string>("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified">("all");

  // AI loading state
  const [extractingAI, setExtractingAI] = useState(false);
  const [runningBatchAI, setRunningBatchAI] = useState(false);
  const [savingFieldKey, setSavingFieldKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Field editing state
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});

  // Template creation modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldCategory, setNewFieldCategory] = useState<ExtractionField["category"]>("study_characteristics");
  const [newFieldType, setNewFieldType] = useState<ExtractionField["type"]>("text");

  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const selectedArticle = useMemo(() => {
    return articles.find((a) => a.id === selectedArticleId) || articles[0];
  }, [articles, selectedArticleId]);

  const currentRecord = useMemo(() => {
    if (!selectedArticle || !currentTemplate) return null;
    return records.find(
      (r) => r.articleId === selectedArticle.id && r.templateId === currentTemplate.id
    ) || null;
  }, [records, selectedArticle, currentTemplate]);

  // Verification stats for current record
  const verificationStats = useMemo(() => {
    if (!currentRecord || !currentTemplate) return { total: 0, verified: 0, pct: 0 };
    const total = currentTemplate.fields.length;
    let verified = 0;
    for (const f of currentTemplate.fields) {
      const st = currentRecord.verificationStatus[f.key];
      if (st === "verified" || st === "corrected") {
        verified++;
      }
    }
    return {
      total,
      verified,
      pct: total > 0 ? Math.round((verified / total) * 100) : 0,
    };
  }, [currentRecord, currentTemplate]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    if (statusFilter === "all") return articles;
    return articles.filter((a) => {
      const rec = records.find((r) => r.articleId === a.id && r.templateId === selectedTemplateId);
      if (statusFilter === "verified") return rec?.status === "verified";
      if (statusFilter === "pending") return !rec || rec.status !== "verified";
      return true;
    });
  }, [articles, records, selectedTemplateId, statusFilter]);

  const handleRunAIExtraction = async () => {
    const templateToUse = currentTemplate || templates[0] || fallbackDefaultTemplate;
    if (!selectedArticle || extractingAI) return;
    setExtractingAI(true);
    setFeedback(null);

    try {
      const res = await runAIExtractionForArticleAction(selectedArticle.id, projectId, templateToUse.id);
      if (res.success && res.record) {
        // Update local records state
        const index = records.findIndex((r) => r.id === res.record!.id);
        if (index >= 0) {
          const updated = [...records];
          updated[index] = res.record;
          setRecords(updated);
        } else {
          setRecords([res.record, ...records]);
        }
        setFeedback({
          type: "success",
          message: `Ekstraksi data AI selesai untuk "${selectedArticle.title.slice(0, 45)}..." dengan kutipan bukti berakar pada teks naskah.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal melakukan ekstraksi AI.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan server saat ekstraksi AI.",
      });
    } finally {
      setExtractingAI(false);
    }
  };

  const handleRunBatchAIExtraction = async () => {
    if (runningBatchAI || articles.length === 0) return;
    const templateToUse = currentTemplate || templates[0] || fallbackDefaultTemplate;
    const unextracted = articles.filter(
      (a) => !records.some((r) => r.articleId === a.id && r.templateId === templateToUse.id)
    );
    const targetArticles = unextracted.length > 0 ? unextracted : articles;

    if (
      !confirm(
        `Jalankan Ekstraksi AI Otomatis untuk ${targetArticles.length} artikel menggunakan template "${templateToUse.name}"?`
      )
    ) {
      return;
    }

    setRunningBatchAI(true);
    setFeedback(null);

    try {
      const res = await runBatchAIExtractionAction(
        projectId,
        templateToUse.id,
        targetArticles.map((a) => a.id)
      );
      if (res.success && res.records) {
        const updatedMap = new Map<string, ExtractedDataRecord>();
        for (const r of records) updatedMap.set(`${r.articleId}_${r.templateId}`, r);
        for (const r of res.records) updatedMap.set(`${r.articleId}_${r.templateId}`, r);
        setRecords(Array.from(updatedMap.values()));

        setFeedback({
          type: "success",
          message: `Batch Ekstraksi AI sukses: Berhasil mengekstrak ${res.count || res.records.length} artikel secara otomatis!`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal melakukan batch ekstraksi AI.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan server saat batch ekstraksi AI.",
      });
    } finally {
      setRunningBatchAI(false);
    }
  };

  const handleVerifyField = async (
    fieldKey: string,
    status: FieldVerificationState,
    correctedValue?: any
  ) => {
    if (!currentRecord) return;
    setSavingFieldKey(fieldKey);

    try {
      const valueToSave = correctedValue !== undefined ? correctedValue : (editingValues[fieldKey] !== undefined ? editingValues[fieldKey] : currentRecord.values[fieldKey]);
      const res = await verifyExtractionFieldAction(currentRecord.id, fieldKey, status, valueToSave);
      if (res.success && res.record) {
        const index = records.findIndex((r) => r.id === res.record!.id);
        if (index >= 0) {
          const updated = [...records];
          updated[index] = res.record;
          setRecords(updated);
        }
      }
    } finally {
      setSavingFieldKey(null);
    }
  };

  const handleExportCSV = () => {
    if (!currentTemplate) return;
    const headers = ["Article ID", "Title", "Authors", "Year", ...currentTemplate.fields.map((f) => f.label)];
    const rows = articles.map((art) => {
      const rec = records.find((r) => r.articleId === art.id && r.templateId === currentTemplate.id);
      const row = [
        art.id,
        `"${art.title.replace(/"/g, '""')}"`,
        `"${art.authors.replace(/"/g, '""')}"`,
        art.publicationYear || "",
      ];
      for (const f of currentTemplate.fields) {
        const val = rec ? rec.values[f.key] : "";
        row.push(`"${String(val || "").replace(/"/g, '""')}"`);
      }
      return row.join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IB-SLR_Extraction_Matrix_${projectId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportVosviewer = () => {
    const ris = generateVosviewerRis(articles, records);
    const blob = new Blob([ris], { type: "application/x-research-info-systems;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `IB-SLR_${projectId}_VOSviewer_Corpus.ris`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim() || !currentTemplate) return;
    const key = newFieldKey.trim() || newFieldName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const newField: ExtractionField = {
      id: `fld-${Date.now()}`,
      key,
      label: newFieldName.trim(),
      type: newFieldType,
      category: newFieldCategory,
      required: false,
      sortOrder: currentTemplate.fields.length + 1,
    };

    const updatedTemplate = {
      ...currentTemplate,
      fields: [...currentTemplate.fields, newField],
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = templates.map((t) => (t.id === currentTemplate.id ? updatedTemplate : t));
    setTemplates(updatedTemplates);
    setNewFieldName("");
    setNewFieldKey("");
    setShowTemplateModal(false);
  };

  // Group current template fields by category
  const categories = useMemo(() => {
    if (!currentTemplate) return [];
    const catMap: Record<string, { label: string; fields: ExtractionField[] }> = {
      study_characteristics: { label: "Karakteristik & Desain Studi", fields: [] },
      population: { label: "Populasi & Karakteristik Sampel", fields: [] },
      interventions: { label: "Intervensi & Komparator", fields: [] },
      outcomes: { label: "Luaran Klinis & Efek (Outcomes)", fields: [] },
      methodology: { label: "Metodologi & Catatan Bias", fields: [] },
      custom: { label: "Variabel Khusus / Tambahan", fields: [] },
    };

    for (const f of currentTemplate.fields) {
      if (catMap[f.category]) {
        catMap[f.category].fields.push(f);
      } else {
        catMap.custom.fields.push(f);
      }
    }

    return Object.entries(catMap).filter(([_, v]) => v.fields.length > 0);
  }, [currentTemplate]);

  return (
    <div className="space-y-6">
      {/* Studio Header & Top Bar */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#2F7D78]" />
              <h2 className="text-lg font-bold text-[#17324D]">Data Extraction Studio</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Human-in-the-Loop
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-1">
              Ekstraksi variabel data terstruktur (PICO) dengan draf bantuan AI berlandaskan kutipan verbatim dan verifikasi langsung oleh peneliti.
            </p>
          </div>

          {/* Action Buttons: Export & Manage Template & Batch AI */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={runningBatchAI}
              onClick={handleRunBatchAIExtraction}
              className="px-3.5 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              title="Ekstrak otomatis seluruh studi dengan bantuan AI"
            >
              {runningBatchAI ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{runningBatchAI ? "Mengekstrak Semua..." : `Batch AI: Ekstrak Semua (${articles.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] hover:bg-gray-100 text-xs font-semibold text-[#17324D] flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Kelola Template</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-white hover:bg-gray-50 text-xs font-semibold text-[#17324D] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Matriks (CSV)</span>
            </button>
            <button
              type="button"
              onClick={handleExportVosviewer}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Unduh format RIS untuk analisis bibliometrik dan visualisasi peta sains di VOSviewer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor VOSviewer (.ris)</span>
            </button>
          </div>
        </div>

        {/* Template Selector & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#17324D]">Template Aktif:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-white font-medium text-[#17212B] focus:outline-none focus:border-[#2F7D78]"
            >
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} ({tmpl.fields.length} variabel)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#667085]" />
            <span className="text-[#667085]">Filter Status:</span>
            <div className="flex rounded-lg border border-[#E4E7EC] p-0.5 bg-[#F7F8FA]">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  statusFilter === "all" ? "bg-white text-[#17324D] shadow-xs" : "text-[#667085]"
                }`}
              >
                Semua ({articles.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  statusFilter === "pending" ? "bg-white text-[#17324D] shadow-xs" : "text-[#667085]"
                }`}
              >
                Perlu Verifikasi
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("verified")}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  statusFilter === "verified" ? "bg-white text-[#17324D] shadow-xs" : "text-[#667085]"
                }`}
              >
                Terverifikasi
              </button>
            </div>
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

      {/* Main Split-Screen Workspace: Left (Article selector + Extraction form) vs Right (PDF Viewer) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Extraction Form & Review Queue (Span 6) */}
        <div className="xl:col-span-6 space-y-4">
          {/* Article Horizontal Selector Ribbon */}
          <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-3 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block mb-2">
              Daftar Naskah Studi ({filteredArticles.length} artikel):
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {filteredArticles.map((art) => {
                const rec = records.find(
                  (r) => r.articleId === art.id && r.templateId === selectedTemplateId
                );
                const isSelected = art.id === selectedArticleId;
                const isVerified = rec?.status === "verified";

                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => {
                      setSelectedArticleId(art.id);
                      setActiveHighlightQuote("");
                    }}
                    className={`px-3 py-2 rounded-lg border text-left shrink-0 max-w-[200px] transition-all ${
                      isSelected
                        ? "border-[#2F7D78] bg-[#EFF7F6] ring-1 ring-[#2F7D78]"
                        : "border-[#E4E7EC] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-xs font-bold text-[#17324D] truncate">{art.title}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-[#667085]">{art.authors.split(";")[0]}</span>
                      {isVerified ? (
                        <span className="text-[#18794E] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          <span>100%</span>
                        </span>
                      ) : rec ? (
                        <span className="text-[#B7791F] font-semibold">Draf</span>
                      ) : (
                        <span className="text-[#667085]">Kosong</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Article Header & AI Extraction Trigger */}
          {selectedArticle && (
            <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E4E7EC] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-[#17324D]">
                      {selectedArticle.id}
                    </span>
                    <span className="text-xs font-semibold text-[#17324D]">
                      {selectedArticle.journal} ({selectedArticle.publicationYear})
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#17212B] mt-1 leading-snug">
                    {selectedArticle.title}
                  </h3>
                  {/* Action / Download Links Bar */}
                  {(() => {
                    const cleanDoi = selectedArticle.doi
                      ? selectedArticle.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim()
                      : "";
                    const doiUrl = cleanDoi ? `https://doi.org/${cleanDoi}` : null;
                    const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(selectedArticle.title)}`;

                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[#E4E7EC]/60">
                        {doiUrl && (
                          <a
                            href={doiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EFF7F6] text-[#2F7D78] hover:bg-[#d8ecea] border border-[#2F7D78]/20 transition-colors"
                            title="Buka naskah artikel langsung via tautan resmi DOI"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>DOI: {cleanDoi}</span>
                          </a>
                        )}
                        <a
                          href={scholarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          title="Cari dan unduh naskah PDF lengkap di Google Scholar"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh PDF via Google Scholar</span>
                        </a>
                        {selectedArticle.pdfUrl && (
                          <a
                            href={selectedArticle.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>PDF Tersimpan</span>
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <button
                  type="button"
                  disabled={extractingAI}
                  onClick={handleRunAIExtraction}
                  className="shrink-0 px-3.5 py-2 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {extractingAI ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{extractingAI ? "Mengekstrak AI..." : "Ekstraksi Otomatis AI"}</span>
                </button>
              </div>

              {/* Verification Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#17324D]">
                    Kemajuan Verifikasi Peneliti: {verificationStats.verified}/{verificationStats.total} Variabel
                  </span>
                  <span className="font-bold text-[#2F7D78]">{verificationStats.pct}%</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2F7D78] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${verificationStats.pct}%` }}
                  />
                </div>
              </div>

              {/* Extraction Fields by Category */}
              <div className="space-y-6 pt-2">
                {categories.map(([catKey, cat]) => (
                  <div key={catKey} className="space-y-3">
                    <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider pb-1 border-b border-[#E4E7EC]/70">
                      {cat.label}
                    </h4>

                    <div className="space-y-4">
                      {cat.fields.map((field) => {
                        const val = currentRecord ? currentRecord.values[field.key] : "";
                        const evidence = currentRecord ? currentRecord.evidence[field.key] : null;
                        const vStatus = currentRecord ? currentRecord.verificationStatus[field.key] : "pending";
                        const isVerified = vStatus === "verified" || vStatus === "corrected";

                        return (
                          <div
                            key={field.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isVerified
                                ? "bg-white border-[#18794E]/30"
                                : "bg-white border-[#E4E7EC] hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <label className="text-xs font-bold text-[#17212B] flex items-center gap-1.5">
                                <span>{field.label}</span>
                                {field.required && <span className="text-[#B42318]">*</span>}
                              </label>

                              {/* Status Badge */}
                              <div>
                                {vStatus === "verified" && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E] flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>TERVERIFIKASI</span>
                                  </span>
                                )}
                                {vStatus === "corrected" && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF7F6] text-[#2F7D78] flex items-center gap-1">
                                    <Edit2 className="w-3 h-3" />
                                    <span>DIKOREKSI PENELITI</span>
                                  </span>
                                )}
                                {vStatus === "pending" && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FEF7EC] text-[#B7791F]">
                                    MENUNGGU VERIFIKASI
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Field Input Control */}
                            <div className="mt-1">
                              {field.type === "long_text" ? (
                                <textarea
                                  rows={2}
                                  value={editingValues[field.key] !== undefined ? editingValues[field.key] : val || ""}
                                  onChange={(e) =>
                                    setEditingValues({ ...editingValues, [field.key]: e.target.value })
                                  }
                                  className="w-full px-3 py-2 text-xs border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78]"
                                  placeholder="Nilai variabel hasil ekstraksi..."
                                />
                              ) : field.type === "select" && field.options ? (
                                <select
                                  value={editingValues[field.key] !== undefined ? editingValues[field.key] : val || ""}
                                  onChange={(e) =>
                                    setEditingValues({ ...editingValues, [field.key]: e.target.value })
                                  }
                                  className="w-full px-3 py-2 text-xs border border-[#E4E7EC] rounded-lg bg-white focus:outline-none focus:border-[#2F7D78]"
                                >
                                  <option value="">Pilih opsi...</option>
                                  {field.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type === "number" ? "number" : "text"}
                                  value={editingValues[field.key] !== undefined ? editingValues[field.key] : val || ""}
                                  onChange={(e) =>
                                    setEditingValues({ ...editingValues, [field.key]: e.target.value })
                                  }
                                  className="w-full px-3 py-1.5 text-xs border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78]"
                                  placeholder="Nilai variabel..."
                                />
                              )}
                            </div>

                            {/* Verbatim Grounded Evidence Callout */}
                            {evidence && evidence.quote ? (
                              <div
                                onClick={() => setActiveHighlightQuote(evidence.quote)}
                                className="mt-2.5 p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] cursor-pointer hover:bg-amber-100/70 transition-colors"
                              >
                                <div className="flex items-center justify-between text-[10px] text-[#667085] mb-1">
                                  <div className="flex items-center gap-1 font-semibold text-[#17324D]">
                                    <Quote className="w-3 h-3 text-[#2F7D78]" />
                                    <span>Bukti Teks Verbatim ({evidence.section || "Naskah"}):</span>
                                  </div>
                                  <span className="font-semibold text-[#2F7D78]">
                                    Hal {evidence.pageNumber || 1} · Klik untuk Sorot
                                  </span>
                                </div>
                                <p className="italic text-[#17212B] line-clamp-2">“{evidence.quote}”</p>
                              </div>
                            ) : (
                              <div className="mt-2 text-[10px] text-[#667085] italic">
                                Belum ada kutipan bukti otomatis. Klik &quot;Ekstraksi Otomatis AI&quot; atau isi manual.
                              </div>
                            )}

                            {/* Verification Actions */}
                            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                              <button
                                type="button"
                                disabled={savingFieldKey === field.key || !currentRecord}
                                onClick={() => handleVerifyField(field.key, "verified")}
                                className="px-3 py-1 rounded bg-[#ECFDF3] hover:bg-[#d1fadf] text-[#18794E] text-[11px] font-bold flex items-center gap-1 border border-[#18794E]/20 transition-colors disabled:opacity-40"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui (Verify)</span>
                              </button>

                              <button
                                type="button"
                                disabled={savingFieldKey === field.key || !currentRecord}
                                onClick={() =>
                                  handleVerifyField(
                                    field.key,
                                    "corrected",
                                    editingValues[field.key] !== undefined ? editingValues[field.key] : val
                                  )
                                }
                                className="px-3 py-1 rounded bg-[#EFF7F6] hover:bg-[#d8ecea] text-[#2F7D78] text-[11px] font-bold flex items-center gap-1 border border-[#2F7D78]/20 transition-colors disabled:opacity-40"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Koreksi & Simpan</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Integrated PDF & Evidence Text Viewer (Span 6) */}
        <div className="xl:col-span-6 sticky top-6">
          {selectedArticle ? (
            <PdfArticleViewer
              article={selectedArticle}
              highlightQuote={activeHighlightQuote}
            />
          ) : (
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-12 text-center text-xs text-[#667085]">
              Pilih artikel di sebelah kiri untuk melihat naskah ilmiah.
            </div>
          )}
        </div>
      </div>

      {/* Template Management Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#17324D]">Tambah Variabel ke Template Ekstraksi</h3>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Nama Variabel (Label):</label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Cth: Dosis Metformin Harian (mg)"
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Kategori Variabel:</label>
                <select
                  value={newFieldCategory}
                  onChange={(e) => setNewFieldCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg bg-white"
                >
                  <option value="study_characteristics">Karakteristik & Desain Studi</option>
                  <option value="population">Populasi & Sampel</option>
                  <option value="interventions">Intervensi & Komparator</option>
                  <option value="outcomes">Luaran Klinis (Outcomes)</option>
                  <option value="methodology">Metodologi & Bias</option>
                  <option value="custom">Variabel Khusus</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Tipe Data Input:</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg bg-white"
                >
                  <option value="text">Teks Singkat (Text)</option>
                  <option value="number">Angka / Numerik (Number)</option>
                  <option value="long_text">Teks Paragraf (Long Text)</option>
                  <option value="select">Pilihan Tunggal (Select)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddCustomField}
                disabled={!newFieldName.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                Tambah Variabel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
