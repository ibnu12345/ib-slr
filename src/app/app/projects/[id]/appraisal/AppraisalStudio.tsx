"use client";

import React, { useState, useMemo } from "react";
import { Article } from "../../../../../lib/types/research";
import {
  AppraisalFramework,
  AppraisalRecord,
  AppraisalJudgment,
  DomainEvaluation,
} from "../../../../../lib/types/appraisal";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Info,
  Save,
  Quote,
  Loader2,
  ExternalLink,
  Table,
  Check,
} from "lucide-react";
import { saveAppraisalRecordAction } from "../../../../../lib/appraisal/actions";
import { PdfArticleViewer } from "../../../../../components/research/PdfArticleViewer";

interface Props {
  projectId: string;
  articles: Article[];
  frameworks: AppraisalFramework[];
  initialRecords: AppraisalRecord[];
}

export function AppraisalStudio({
  projectId,
  articles,
  frameworks,
  initialRecords,
}: Props) {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>(frameworks[0]?.id || "rob-2-rct");
  const [records, setRecords] = useState<AppraisalRecord[]>(initialRecords);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || "");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentFramework = useMemo(() => {
    return frameworks.find((f) => f.id === selectedFrameworkId) || frameworks[0];
  }, [frameworks, selectedFrameworkId]);

  const selectedArticle = useMemo(() => {
    return articles.find((a) => a.id === selectedArticleId) || articles[0];
  }, [articles, selectedArticleId]);

  const currentRecord = useMemo(() => {
    if (!selectedArticle || !currentFramework) return null;
    return records.find(
      (r) => r.articleId === selectedArticle.id && r.frameworkId === currentFramework.id
    ) || null;
  }, [records, selectedArticle, currentFramework]);

  // Form edit state for currently selected article
  const [domainAnswers, setDomainAnswers] = useState<Record<string, DomainEvaluation>>(
    currentRecord?.domainAnswers || {}
  );
  const [overallJudgment, setOverallJudgment] = useState<AppraisalJudgment>(
    currentRecord?.overallJudgment || "low_risk"
  );
  const [overallJustification, setOverallJustification] = useState<string>(
    currentRecord?.overallJustification || ""
  );

  // Sync state when article or framework changes
  React.useEffect(() => {
    if (currentRecord) {
      setDomainAnswers(currentRecord.domainAnswers);
      setOverallJudgment(currentRecord.overallJudgment);
      setOverallJustification(currentRecord.overallJustification || "");
    } else {
      // Initialize empty template for this article
      const initial: Record<string, DomainEvaluation> = {};
      for (const d of currentFramework.domains) {
        initial[d.key] = {
          judgment: "low_risk",
          notes: "",
          evidenceQuote: "",
        };
      }
      setDomainAnswers(initial);
      setOverallJudgment("low_risk");
      setOverallJustification("");
    }
  }, [currentRecord, selectedArticleId, selectedFrameworkId, currentFramework]);

  const handleDomainChange = (
    domainKey: string,
    field: keyof DomainEvaluation,
    value: any
  ) => {
    const updated = {
      ...domainAnswers,
      [domainKey]: {
        ...(domainAnswers[domainKey] || { judgment: "low_risk", notes: "" }),
        [field]: value,
      },
    };
    setDomainAnswers(updated);

    // Auto-calculate suggested overall judgment
    if (field === "judgment") {
      const allJudgments = Object.values(updated).map((v) => v.judgment);
      if (allJudgments.includes("high_risk")) {
        setOverallJudgment("high_risk");
      } else if (allJudgments.filter((j) => j === "some_concerns").length >= 1) {
        setOverallJudgment("some_concerns");
      } else {
        setOverallJudgment("low_risk");
      }
    }
  };

  const handleSaveAppraisal = async () => {
    if (!selectedArticle || !currentFramework) return;
    setSaving(true);
    setFeedback(null);

    const recordToSave: AppraisalRecord = {
      id: currentRecord ? currentRecord.id : `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      articleId: selectedArticle.id,
      frameworkId: currentFramework.id,
      reviewerId: "usr-researcher-1",
      reviewerName: "Dr. Clara Oswald",
      domainAnswers,
      overallJudgment,
      overallJustification,
      status: "completed",
      createdAt: currentRecord ? currentRecord.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await saveAppraisalRecordAction(recordToSave);
      if (res.success && res.record) {
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
          message: `Penilaian kualitas untuk "${selectedArticle.title.slice(0, 40)}..." berhasil disimpan.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menyimpan penilaian kualitas.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan server saat menyimpan penilaian.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportAppraisalCSV = () => {
    const headers = [
      "Article ID",
      "Title",
      "Authors",
      "Year",
      "Framework",
      ...currentFramework.domains.map((d) => d.label),
      "Overall Judgment",
      "Justification",
    ];

    const rows = articles.map((art) => {
      const rec = records.find((r) => r.articleId === art.id && r.frameworkId === currentFramework.id);
      const row = [
        art.id,
        `"${art.title.replace(/"/g, '""')}"`,
        `"${art.authors.replace(/"/g, '""')}"`,
        art.publicationYear || "",
        currentFramework.code,
      ];
      for (const d of currentFramework.domains) {
        const ans = rec ? rec.domainAnswers[d.key]?.judgment : "Not Assessed";
        row.push(`"${ans || ""}"`);
      }
      row.push(`"${rec ? rec.overallJudgment : "Not Assessed"}"`);
      row.push(`"${rec ? (rec.overallJustification || "").replace(/"/g, '""') : ""}"`);
      return row.join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IB-SLR_Risk_Of_Bias_${currentFramework.code}_${projectId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#2F7D78]" />
              <h2 className="text-lg font-bold text-[#17324D]">Quality Appraisal & Risk of Bias Studio</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Methodological Rigor
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-1">
              Evaluasi risiko bias metodologis domain-per-domain berbasis bukti teks verbatim untuk memastikan validitas sintesis bukti.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportAppraisalCSV}
              className="px-3.5 py-1.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Tabel Bias (CSV)</span>
            </button>
          </div>
        </div>

        {/* Framework Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#17324D]">Instrumen Penilaian:</span>
            <select
              value={selectedFrameworkId}
              onChange={(e) => setSelectedFrameworkId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-white font-medium text-[#17212B] focus:outline-none focus:border-[#2F7D78]"
            >
              {frameworks.map((fw) => (
                <option key={fw.id} value={fw.id}>
                  {fw.name} ({fw.targetStudyDesign})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-[#667085] italic">
            {currentFramework.description}
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
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Cross-Study Risk of Bias Traffic Light Plot & Summary Matrix */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#2F7D78]" />
            <h3 className="text-sm font-bold text-[#17324D]">
              Matriks Ringkasan Risiko Bias (Traffic Light Plot & Summary Table)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#667085]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18794E]" /> Low Risk (+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]" /> Some Concerns (?)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B42318]" /> High Risk (-)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#E4E7EC] rounded-lg overflow-hidden">
            <thead className="bg-[#F7F8FA] text-[#17324D] font-bold border-b border-[#E4E7EC]">
              <tr>
                <th className="py-2.5 px-3">Studi / Artikel</th>
                <th className="py-2.5 px-3">Tahun</th>
                {currentFramework.domains.map((d, dIdx) => (
                  <th key={d.id} className="py-2.5 px-3 text-center" title={d.label}>
                    D{dIdx + 1}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center font-extrabold">Overall Risk</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {articles.map((art) => {
                const rec = records.find(
                  (r) => r.articleId === art.id && r.frameworkId === currentFramework.id
                );
                const isSelected = art.id === selectedArticleId;

                return (
                  <tr
                    key={art.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-[#EFF7F6]" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[#17212B] max-w-xs truncate">
                      {art.title}
                    </td>
                    <td className="py-2.5 px-3 text-[#667085]">{art.publicationYear || "N/A"}</td>
                    {currentFramework.domains.map((d) => {
                      const ans = rec ? rec.domainAnswers[d.key]?.judgment : null;
                      return (
                        <td key={d.id} className="py-2.5 px-3 text-center">
                          {ans === "low_risk" && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs" title="Low Risk (+)">
                              +
                            </span>
                          )}
                          {ans === "some_concerns" && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs" title="Some Concerns (?)">
                              ?
                            </span>
                          )}
                          {ans === "high_risk" && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800 font-bold text-xs" title="High Risk (-)">
                              -
                            </span>
                          )}
                          {!ans && <span className="text-gray-300">-</span>}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-center">
                      {rec?.overallJudgment === "low_risk" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E]">
                          LOW RISK
                        </span>
                      )}
                      {rec?.overallJudgment === "some_concerns" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7EC] text-[#B7791F]">
                          SOME CONCERNS
                        </span>
                      )}
                      {rec?.overallJudgment === "high_risk" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3F2] text-[#B42318]">
                          HIGH RISK
                        </span>
                      )}
                      {!rec && <span className="text-[10px] text-[#667085]">Belum Dinilai</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedArticleId(art.id)}
                        className="text-xs text-[#2F7D78] font-bold hover:underline"
                      >
                        {isSelected ? "Sedang Dinilai" : "Pilih Studi"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Assessment Form for Selected Article */}
      {selectedArticle && (
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-[#17324D]">
                  {selectedArticle.id}
                </span>
                <span className="text-xs text-[#667085]">
                  Penilai: <strong>Dr. Clara Oswald</strong>
                </span>
              </div>
              <h3 className="text-base font-bold text-[#17212B] mt-1">
                {selectedArticle.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-[#F7F8FA] hover:bg-gray-100 text-xs font-semibold text-[#17324D] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Buka Dokumen / PDF Viewer</span>
            </button>
          </div>

          {/* Domain-by-Domain Assessment Cards */}
          <div className="space-y-6">
            {currentFramework.domains.map((domain, index) => {
              const currentVal = domainAnswers[domain.key] || { judgment: "low_risk", notes: "" };

              return (
                <div
                  key={domain.id}
                  className="p-5 rounded-xl border border-[#E4E7EC] bg-white space-y-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E7EC]/70 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#17324D]">
                        {index + 1}. {domain.label}
                      </h4>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        {domain.guidance}
                      </p>
                    </div>

                    {/* Radio Button Options for Judgment */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDomainChange(domain.key, "judgment", "low_risk")}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          currentVal.judgment === "low_risk"
                            ? "bg-[#18794E] text-white shadow-xs"
                            : "bg-[#F7F8FA] text-[#667085] border border-[#E4E7EC] hover:bg-gray-100"
                        }`}
                      >
                        Low Risk (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDomainChange(domain.key, "judgment", "some_concerns")}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          currentVal.judgment === "some_concerns"
                            ? "bg-[#B7791F] text-white shadow-xs"
                            : "bg-[#F7F8FA] text-[#667085] border border-[#E4E7EC] hover:bg-gray-100"
                        }`}
                      >
                        Some Concerns (?)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDomainChange(domain.key, "judgment", "high_risk")}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          currentVal.judgment === "high_risk"
                            ? "bg-[#B42318] text-white shadow-xs"
                            : "bg-[#F7F8FA] text-[#667085] border border-[#E4E7EC] hover:bg-gray-100"
                        }`}
                      >
                        High Risk (-)
                      </button>
                    </div>
                  </div>

                  {/* Justification & Evidence Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#17212B] mb-1">
                        Catatan & Justifikasi Metodologis:
                      </label>
                      <textarea
                        rows={3}
                        value={currentVal.notes || ""}
                        onChange={(e) => handleDomainChange(domain.key, "notes", e.target.value)}
                        placeholder="Uraikan alasan ilmiah pertimbangan risiko bias pada domain ini..."
                        className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#17212B] mb-1">
                        Kutipan Bukti Verbatim Naskah (Opsional):
                      </label>
                      <textarea
                        rows={3}
                        value={currentVal.evidenceQuote || ""}
                        onChange={(e) => handleDomainChange(domain.key, "evidenceQuote", e.target.value)}
                        placeholder="Salin kutipan naskah yang membuktikan kepatuhan/pelanggaran metodologis..."
                        className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78] italic text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Study Judgment & Save */}
          <div className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                  Keputusan Risiko Bias Keseluruhan (Overall Risk of Bias):
                </h4>
                <p className="text-[11px] text-[#667085] mt-0.5">
                  Ditentukan dari evaluasi seluruh domain di atas berdasarkan algoritma standar Cochrane / instrumen terkait.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOverallJudgment("low_risk")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    overallJudgment === "low_risk"
                      ? "bg-[#18794E] text-white shadow-xs"
                      : "bg-white text-[#667085] border border-[#E4E7EC]"
                  }`}
                >
                  LOW RISK
                </button>
                <button
                  type="button"
                  onClick={() => setOverallJudgment("some_concerns")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    overallJudgment === "some_concerns"
                      ? "bg-[#B7791F] text-white shadow-xs"
                      : "bg-white text-[#667085] border border-[#E4E7EC]"
                  }`}
                >
                  SOME CONCERNS
                </button>
                <button
                  type="button"
                  onClick={() => setOverallJudgment("high_risk")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    overallJudgment === "high_risk"
                      ? "bg-[#B42318] text-white shadow-xs"
                      : "bg-white text-[#667085] border border-[#E4E7EC]"
                  }`}
                >
                  HIGH RISK
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Ringkasan Kesimpulan Penilai (Overall Justification):
              </label>
              <textarea
                rows={2}
                value={overallJustification}
                onChange={(e) => setOverallJustification(e.target.value)}
                placeholder="Rangkuman penilaian kualitas metodologis studi secara umum..."
                className="w-full px-3 py-2 text-xs border border-[#E4E7EC] rounded-lg bg-white focus:outline-none focus:border-[#2F7D78]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveAppraisal}
                className="px-5 py-2 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? "Menyimpan Penilaian..." : "Simpan Penilaian Kualitas Studi Ini"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Text PDF Modal */}
      {showPdfModal && selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F7F8FA]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2F7D78]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#17324D] truncate max-w-xl">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PdfArticleViewer article={selectedArticle} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
