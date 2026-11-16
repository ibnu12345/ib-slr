"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Article, EligibilityCriterion, Protocol } from "../../../../../../lib/types/research";
import { ExclusionReason, ScreeningStage, ScreeningDecisionType } from "../../../../../../lib/types/screening";
import { submitScreeningDecisionAction } from "../../../../../../lib/screening/actions";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  X,
  ExternalLink,
  Keyboard,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface Props {
  projectId: string;
  stage: ScreeningStage;
  articles: Article[];
  criteria: EligibilityCriterion[];
  exclusionReasons: ExclusionReason[];
  protocol: Protocol | null;
}

export function ScreeningStudio({
  projectId,
  stage,
  articles: initialArticles,
  criteria,
  exclusionReasons,
  protocol,
}: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [selectedExclusionReason, setSelectedExclusionReason] = useState(
    exclusionReasons[0]?.label || "Populasi Tidak Sesuai"
  );
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const currentArticle = articles[currentIndex];

  // Screened vs total count
  const screenedCount = articles.filter((a) => a.screeningStatus !== "pending").length;
  const progressPct = articles.length > 0 ? Math.round((screenedCount / articles.length) * 100) : 0;

  const handleDecision = async (decision: ScreeningDecisionType, reason?: string) => {
    if (!currentArticle) return;
    setSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("articleId", currentArticle.id);
    formData.append("stage", stage);
    formData.append("decision", decision);
    if (reason) formData.append("exclusionReason", reason);
    if (reviewerNotes) formData.append("notes", reviewerNotes);

    try {
      const res = await submitScreeningDecisionAction(formData);
      if (res.success && res.newStatus) {
        // Update local article state
        const updated = [...articles];
        updated[currentIndex] = {
          ...updated[currentIndex],
          screeningStatus: res.newStatus,
        };
        setArticles(updated);
        setFeedback({
          type: "success",
          message: `Artikel ditandai: ${decision.toUpperCase()}`,
        });

        // Automatically move to next pending article if available
        if (currentIndex < articles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        setShowExcludeModal(false);
        setReviewerNotes("");
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal menyimpan keputusan." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan server saat menyimpan keputusan." });
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcut listener (I for Include, E for Exclude, U for Unclear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        showExcludeModal
      ) {
        return;
      }

      if (e.key === "i" || e.key === "I" || e.key === "1") {
        e.preventDefault();
        handleDecision("include");
      } else if (e.key === "e" || e.key === "E" || e.key === "2") {
        e.preventDefault();
        setShowExcludeModal(true);
      } else if (e.key === "u" || e.key === "U" || e.key === "3") {
        e.preventDefault();
        handleDecision("unclear");
      } else if (e.key === "ArrowRight" && currentIndex < articles.length - 1) {
        e.preventDefault();
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(currentIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, articles, showExcludeModal]);

  return (
    <div className="space-y-6">
      {/* Progress & Header Bar */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#17212B]">
              Kemajuan Screening: {screenedCount} dari {articles.length} Artikel ({progressPct}%)
            </span>
            <span className="text-[#667085] font-mono text-[11px]">
              Artikel {currentIndex + 1} / {articles.length}
            </span>
          </div>
          <div className="w-full bg-[#E4E7EC] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2F7D78] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Hotkey Indicator Pill */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#667085] bg-[#F7F8FA] px-3 py-1.5 rounded-lg border border-[#E4E7EC]">
          <Keyboard className="w-3.5 h-3.5 text-[#2F7D78]" />
          <span>Hotkey: <strong>I</strong> (Inklusi) · <strong>E</strong> (Eksklusi) · <strong>U</strong> (Unclear)</span>
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

      {/* Main Screening Layout: Left (Article Details) vs Right (Criteria Inspector) */}
      {articles.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#667085] mx-auto" />
          <h3 className="text-base font-bold text-[#17324D]">Belum Ada Artikel di Library</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Silakan unggah atau impor file referensi (RIS/BibTeX/CSV) terlebih dahulu di Import Center.
          </p>
          <Link
            href={`/app/projects/${projectId}/import`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#17324D] text-white text-xs font-semibold hover:bg-[#12273D]"
          >
            <span>Buka Import Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Article Viewer & Actions (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 space-y-4 shadow-sm">
              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-[#17324D]">
                    ID: {currentArticle.id.slice(-6)}
                  </span>
                  <span className="text-xs text-[#667085]">
                    Sumber: <strong>{currentArticle.sourceDatabase || "Import"}</strong>
                  </span>
                </div>

                <div>
                  {currentArticle.screeningStatus === "included" && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E]">
                      INCLUDED
                    </span>
                  )}
                  {currentArticle.screeningStatus === "excluded" && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3F2] text-[#B42318]">
                      EXCLUDED
                    </span>
                  )}
                  {currentArticle.screeningStatus === "unclear" && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF7EC] text-[#B7791F]">
                      UNCLEAR / MAYBE
                    </span>
                  )}
                  {currentArticle.screeningStatus === "pending" && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F7F8FA] border border-[#E4E7EC] text-[#667085]">
                      PENDING REVIEW
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#17212B] leading-snug">
                  {currentArticle.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085] mt-2">
                  <span className="font-semibold text-[#17212B]">{currentArticle.authors}</span>
                  <span>•</span>
                  <span>{currentArticle.journal || "Journal not specified"}</span>
                  <span>•</span>
                  <span>{currentArticle.publicationYear || "N/A"}</span>
                </div>
                {currentArticle.doi && (
                  <div className="mt-1">
                    <a
                      href={`https://doi.org/${currentArticle.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#2F7D78] hover:underline inline-flex items-center gap-1"
                    >
                      <span>doi:{currentArticle.doi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Abstract */}
              <div>
                <span className="text-xs font-bold text-[#17324D] uppercase tracking-wider block mb-1.5">
                  Abstrak Studi (Abstract):
                </span>
                <div className="p-4 bg-[#F7F8FA] rounded-lg border border-[#E4E7EC] text-xs sm:text-sm text-[#17212B] leading-relaxed max-h-[360px] overflow-y-auto">
                  {currentArticle.abstract || "Tidak ada abstrak yang tercatat pada metadata artikel ini."}
                </div>
              </div>

              {/* Screening Action Buttons */}
              <div className="pt-4 border-t border-[#E4E7EC] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision("include")}
                  className="py-3 px-4 rounded-xl bg-[#18794E] hover:bg-[#125D3B] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>INCLUDE (Inklusi - I)</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowExcludeModal(true)}
                  className="py-3 px-4 rounded-xl bg-[#B42318] hover:bg-[#8E1C13] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>EXCLUDE (Eksklusi - E)</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision("unclear")}
                  className="py-3 px-4 rounded-xl bg-[#B7791F] hover:bg-[#8F5E16] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>UNCLEAR (Ragu - U)</span>
                </button>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2 text-xs text-[#667085]">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="inline-flex items-center gap-1 font-semibold text-[#17212B] hover:underline disabled:opacity-30"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <span>Artikel {currentIndex + 1} dari {articles.length}</span>

                <button
                  type="button"
                  disabled={currentIndex === articles.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="inline-flex items-center gap-1 font-semibold text-[#17212B] hover:underline disabled:opacity-30"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Protocol Criteria Inspector */}
          <div className="space-y-4">
            <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-[#E4E7EC] pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                  Panduan Kriteria Kelayakan
                </span>
                <span className="text-[10px] text-[#2F7D78] font-bold font-mono">
                  {protocol?.framework || "PICO"}
                </span>
              </div>

              {/* Inclusions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#18794E] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Kriteria Inklusi:</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {criteria
                    .filter((c) => c.criterionType === "inclusion")
                    .map((c) => (
                      <div key={c.id} className="p-2 bg-[#ECFDF3] rounded border border-[#18794E]/20 text-[#17212B]">
                        {c.description}
                      </div>
                    ))}
                </div>
              </div>

              {/* Exclusions */}
              <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
                <span className="text-xs font-bold text-[#B42318] flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  <span>Kriteria Eksklusi:</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {criteria
                    .filter((c) => c.criterionType === "exclusion")
                    .map((c) => (
                      <div key={c.id} className="p-2 bg-[#FEF3F2] rounded border border-[#B42318]/20 text-[#17212B]">
                        {c.description}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Exclusion Reason Modal */}
      {showExcludeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl max-w-md w-full border border-[#E4E7EC] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
              <div className="flex items-center gap-2 text-[#B42318]">
                <XCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-[#17324D]">
                  Alasan Eksklusi (Mandatory Reason)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExcludeModal(false)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#667085]">
              Sesuai standar PRISMA 2020, setiap studi yang dikeluarkan wajib memiliki alasan metodologis yang tercatat dalam audit ledger.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17212B] mb-1">
                  Pilih Alasan Eksklusi:
                </label>
                <select
                  value={selectedExclusionReason}
                  onChange={(e) => setSelectedExclusionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg font-medium text-[#17212B]"
                >
                  {exclusionReasons.map((reason) => (
                    <option key={reason.id} value={reason.label}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17212B] mb-1">
                  Catatan Reviewer Tambahan (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Misal: Studi hanya melibatkan populasi anak di bawah 12 tahun..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
              <button
                type="button"
                onClick={() => setShowExcludeModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision("exclude", selectedExclusionReason)}
                className="px-4 py-1.5 rounded-lg bg-[#B42318] hover:bg-[#8E1C13] text-white text-xs font-bold shadow-sm"
              >
                {submitting ? "Menyimpan..." : "Konfirmasi Eksklusi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
