"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  FileText,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  ListFilter,
  Layers,
  Clock,
  Compass,
} from "lucide-react";
import { AIScreeningCard } from "../../../../../../components/research/AIScreeningCard";
import { PdfArticleViewer } from "../../../../../../components/research/PdfArticleViewer";

interface Props {
  projectId: string;
  stage: ScreeningStage;
  articles: Article[];
  criteria: EligibilityCriterion[];
  exclusionReasons: ExclusionReason[];
  protocol: Protocol | null;
}

type FilterOption = "all" | "pending" | "included" | "excluded" | "unclear";

export function ScreeningStudio({
  projectId,
  stage,
  articles: initialArticles,
  criteria,
  exclusionReasons,
  protocol,
}: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [statusFilter, setStatusFilter] = useState<FilterOption>("all");

  // Track selected article by ID to be resilient to filtering and updates
  const [selectedArticleId, setSelectedArticleId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedId = localStorage.getItem(`ib_slr_screen_last_id_${projectId}_${stage}`);
        if (savedId && initialArticles.some((a) => a.id === savedId)) {
          return savedId;
        }
      } catch {}
    }
    // Auto-resume to the first un-screened (pending) article
    const firstPending = initialArticles.find((a) => a.screeningStatus === "pending");
    if (firstPending) return firstPending.id;
    return initialArticles[0]?.id || "";
  });

  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showNavigatorModal, setShowNavigatorModal] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [navFilter, setNavFilter] = useState<FilterOption>("all");
  const [navViewMode, setNavViewMode] = useState<"matrix" | "list">("matrix");
  const [jumpInput, setJumpInput] = useState("");

  const [selectedExclusionReason, setSelectedExclusionReason] = useState(
    exclusionReasons[0]?.label || "Populasi Tidak Sesuai"
  );
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Synchronize state if incoming initialArticles change, but preserve decisions made in the current active session
  useEffect(() => {
    setArticles((currentArticles) => {
      if (!currentArticles || currentArticles.length === 0) return initialArticles;
      return initialArticles.map((incoming) => {
        const existing = currentArticles.find((curr) => curr.id === incoming.id);
        // If the user already decided this article in the studio session, keep the user's decision
        if (existing && existing.screeningStatus !== "pending" && incoming.screeningStatus === "pending") {
          return existing;
        }
        return incoming;
      });
    });
  }, [initialArticles]);

  // Save last visited article ID to localStorage
  useEffect(() => {
    if (selectedArticleId && typeof window !== "undefined") {
      try {
        localStorage.setItem(`ib_slr_screen_last_id_${projectId}_${stage}`, selectedArticleId);
      } catch {}
    }
  }, [selectedArticleId, projectId, stage]);

  // Aggregate counts
  const totalCount = articles.length;
  const pendingCount = useMemo(
    () => articles.filter((a) => a.screeningStatus === "pending").length,
    [articles]
  );
  const includedCount = useMemo(
    () => articles.filter((a) => a.screeningStatus === "included").length,
    [articles]
  );
  const excludedCount = useMemo(
    () => articles.filter((a) => a.screeningStatus === "excluded").length,
    [articles]
  );
  const unclearCount = useMemo(
    () => articles.filter((a) => a.screeningStatus === "unclear").length,
    [articles]
  );
  const screenedCount = totalCount - pendingCount;
  const progressPct = totalCount > 0 ? Math.round((screenedCount / totalCount) * 100) : 0;

  // Filtered queue based on selected status filter
  const filteredArticles = useMemo(() => {
    if (statusFilter === "all") return articles;
    return articles.filter((a) => a.screeningStatus === statusFilter);
  }, [articles, statusFilter]);

  // Current article in the active queue
  const currentArticle = useMemo(() => {
    let found = articles.find((a) => a.id === selectedArticleId);
    if (!found || (statusFilter !== "all" && found.screeningStatus !== statusFilter)) {
      found = filteredArticles[0] || articles[0];
    }
    return found;
  }, [articles, selectedArticleId, statusFilter, filteredArticles]);

  // Master index across all articles (1-based for human display)
  const masterIndex = currentArticle
    ? articles.findIndex((a) => a.id === currentArticle.id)
    : 0;
  const currentArticleNumber = masterIndex + 1;

  // Filtered index within active view
  const filteredIndex = currentArticle
    ? filteredArticles.findIndex((a) => a.id === currentArticle.id)
    : 0;

  // Quick jump actions
  const jumpToFirstPending = () => {
    const first = articles.find((a) => a.screeningStatus === "pending");
    if (first) {
      setSelectedArticleId(first.id);
      setStatusFilter("all");
      setFeedback({
        type: "success",
        message: `Melompat ke artikel belum di-screening pertama (#${
          articles.findIndex((a) => a.id === first.id) + 1
        })`,
      });
    } else {
      setFeedback({
        type: "success",
        message: "Luar biasa! Seluruh artikel pada tahap ini telah selesai di-screening.",
      });
    }
  };

  const jumpToNextPending = () => {
    const next = articles.find(
      (a, idx) => idx > masterIndex && a.screeningStatus === "pending"
    );
    if (next) {
      setSelectedArticleId(next.id);
    } else {
      // Loop from beginning
      const anyPending = articles.find((a) => a.screeningStatus === "pending");
      if (anyPending) {
        setSelectedArticleId(anyPending.id);
      } else {
        alert("Semua artikel sudah selesai di-screening!");
      }
    }
  };

  const handleManualJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= articles.length) {
      setSelectedArticleId(articles[num - 1].id);
      setJumpInput("");
      setFeedback({
        type: "success",
        message: `Melompat ke artikel #${num}`,
      });
    } else {
      alert(`Silakan masukkan nomor artikel antara 1 dan ${articles.length}`);
    }
  };

  const handleDecision = async (decision: ScreeningDecisionType, reason?: string) => {
    if (!currentArticle) return;
    const targetArticle = currentArticle;
    const targetNumber = currentArticleNumber;
    const previousStatus = targetArticle.screeningStatus;
    const previousReason = (targetArticle as any).activeExclusionReason;
    const previousId = selectedArticleId;

    const newStatus: Article["screeningStatus"] =
      decision === "include" ? "included" : decision === "exclude" ? "excluded" : "unclear";

    // 1. INSTANT OPTIMISTIC UI UPDATE (0ms delay!)
    const updated = articles.map((a) =>
      a.id === targetArticle.id
        ? {
            ...a,
            screeningStatus: newStatus,
            activeExclusionReason: reason,
            ...(stage === "full_text"
              ? { fullTextStatus: newStatus, fullTextExclusionReason: reason }
              : { titleAbstractStatus: newStatus, titleAbstractExclusionReason: reason }),
          }
        : a
    );
    setArticles(updated);
    setShowExcludeModal(false);
    setReviewerNotes("");

    setFeedback({
      type: "success",
      message: `Artikel #${targetNumber} ditandai: ${decision.toUpperCase()}`,
    });

    // 2. INSTANT ADVANCE: Immediately jump to the next pending article
    const currentIdx = masterIndex;
    const nextPending = updated.find(
      (a, idx) => idx > currentIdx && a.screeningStatus === "pending"
    );
    if (nextPending) {
      setSelectedArticleId(nextPending.id);
    } else {
      const prevPending = updated.find(
        (a, idx) => idx < currentIdx && a.screeningStatus === "pending"
      );
      if (prevPending) {
        setSelectedArticleId(prevPending.id);
      } else if (currentIdx < updated.length - 1) {
        setSelectedArticleId(updated[currentIdx + 1].id);
      }
    }

    // 3. ASYNC BACKGROUND PERSISTENCE
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("articleId", targetArticle.id);
    formData.append("stage", stage);
    formData.append("decision", decision);
    if (reason) formData.append("exclusionReason", reason);
    if (reviewerNotes) formData.append("notes", reviewerNotes);

    try {
      const res = await submitScreeningDecisionAction(formData);
      if (!res.success) {
        console.warn("Screening decision warning:", res.error);
        if (res.error?.includes("required") || res.error?.includes("wajib")) {
          // Rollback on explicit validation error
          setArticles((prev) =>
            prev.map((a) =>
              a.id === targetArticle.id
                ? { ...a, screeningStatus: previousStatus, activeExclusionReason: previousReason }
                : a
            )
          );
          setSelectedArticleId(previousId);
          setFeedback({ type: "error", message: res.error || "Gagal menyimpan keputusan di server." });
        }
      }
    } catch (netErr) {
      console.warn("Background persistence network retry scheduled:", netErr);
      setTimeout(() => {
        submitScreeningDecisionAction(formData).catch(() => {});
      }, 1500);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        showExcludeModal ||
        showNavigatorModal ||
        showPdfModal
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
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (filteredIndex < filteredArticles.length - 1) {
          setSelectedArticleId(filteredArticles[filteredIndex + 1].id);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (filteredIndex > 0) {
          setSelectedArticleId(filteredArticles[filteredIndex - 1].id);
        }
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        jumpToNextPending();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentArticle,
    filteredIndex,
    filteredArticles,
    showExcludeModal,
    showNavigatorModal,
    showPdfModal,
  ]);

  // Navigator list/matrix filtered articles
  const navFilteredArticles = useMemo(() => {
    return articles
      .map((art, idx) => ({ article: art, number: idx + 1 }))
      .filter(({ article, number }) => {
        if (navFilter !== "all" && article.screeningStatus !== navFilter) {
          return false;
        }
        if (navSearch.trim()) {
          const q = navSearch.toLowerCase().trim();
          const matchNum = number.toString() === q;
          const matchTitle = article.title.toLowerCase().includes(q);
          const matchAuthor = article.authors.toLowerCase().includes(q);
          const matchId = article.id.toLowerCase().includes(q);
          return matchNum || matchTitle || matchAuthor || matchId;
        }
        return true;
      });
  }, [articles, navFilter, navSearch]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Overall Progress Visualizer */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#17324D] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#2F7D78]" />
                Kemajuan Screening
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5F4] text-[#2F7D78]">
                {screenedCount} / {totalCount} Selesai ({progressPct}%)
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-1">
              {pendingCount > 0 ? (
                <span>
                  Tersisa <strong>{pendingCount} artikel</strong> yang belum di-screening.
                </span>
              ) : (
                <span className="text-[#18794E] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline" /> Semua artikel telah selesai di-screening!
                </span>
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={jumpToFirstPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#25635F] text-white text-xs font-semibold shadow-sm transition-colors"
                title="Lompat langsung ke artikel pertama yang statusnya masih Pending"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Lanjut Screening Pending</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowNavigatorModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#17324D] text-xs font-semibold shadow-sm transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Lihat Daftar & Nomor Artikel</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#F2F4F7] text-[#344054] rounded text-[10px] font-mono">
                #{currentArticleNumber}
              </span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E4E7EC] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#2F7D78] to-[#3E9C96] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 2. Status Filter Tabs (Antrian Screening) */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-xs font-bold text-[#667085] mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Antrian:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-[#17324D] text-white shadow-sm"
                : "bg-[#F2F4F7] text-[#344054] hover:bg-[#E4E7EC]"
            }`}
          >
            Semua ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-[#B7791F] text-white shadow-sm"
                : "bg-[#FEF7EC] text-[#B7791F] hover:bg-[#FDE8CC]"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Belum Di-screening ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("included")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === "included"
                ? "bg-[#18794E] text-white shadow-sm"
                : "bg-[#ECFDF3] text-[#18794E] hover:bg-[#D1FADF]"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Inklusi ({includedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("excluded")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === "excluded"
                ? "bg-[#B42318] text-white shadow-sm"
                : "bg-[#FEF3F2] text-[#B42318] hover:bg-[#FEE4E2]"
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Eksklusi ({excludedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("unclear")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === "unclear"
                ? "bg-[#7A4E0B] text-white shadow-sm"
                : "bg-[#F7F8FA] text-[#7A4E0B] hover:bg-[#E4E7EC]"
            }`}
          >
            <HelpCircle className="w-3 h-3" />
            <span>Ragu / Unclear ({unclearCount})</span>
          </button>
        </div>

        {/* Fast Jump Input */}
        <form onSubmit={handleManualJumpSubmit} className="flex items-center gap-1.5">
          <label htmlFor="jump-num-input" className="text-xs text-[#667085] font-semibold">
            Lompat ke No:
          </label>
          <input
            id="jump-num-input"
            type="number"
            min={1}
            max={totalCount || 1}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            placeholder={`1-${totalCount}`}
            className="w-20 px-2.5 py-1 text-xs border border-[#D0D5DD] rounded-lg font-mono text-[#17324D] focus:ring-1 focus:ring-[#2F7D78] focus:border-[#2F7D78]"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-[#17324D] text-white rounded-lg text-xs font-semibold hover:bg-[#12273D] transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
            feedback.type === "success"
              ? "bg-[#ECFDF3] border-[#18794E]/30 text-[#18794E]"
              : "bg-[#FEF3F2] border-[#B42318]/30 text-[#B42318]"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs hover:opacity-70 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Studio View */}
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
      ) : !currentArticle ? (
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-10 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-[#18794E] mx-auto" />
          <h3 className="text-base font-bold text-[#17324D]">
            Tidak Ada Artikel Pada Antrian "{statusFilter.toUpperCase()}"
          </h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Semua artikel dalam kategori ini telah diproses atau tidak ditemukan.
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="px-4 py-2 rounded-lg bg-[#17324D] text-white text-xs font-semibold"
          >
            Tampilkan Semua Artikel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Article Viewer & Actions (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-2xl p-6 space-y-5 shadow-sm">
              {/* Status Header with Article Index & Badge */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#E4E7EC] pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[#17324D] text-white shadow-xs">
                    Artikel #{currentArticleNumber} dari {totalCount}
                  </span>

                  <span className="text-[11px] text-[#667085]">
                    Sumber: <strong>{currentArticle.sourceDatabase || "Manual Import"}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentArticle.screeningStatus === "included" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF3] text-[#18794E] border border-[#18794E]/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> INCLUDED (Inklusi)
                    </span>
                  )}
                  {currentArticle.screeningStatus === "excluded" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3F2] text-[#B42318] border border-[#B42318]/20 flex items-center gap-1.5 flex-wrap">
                      <XCircle className="w-3 h-3 shrink-0" />
                      <span>EXCLUDED (Eksklusi)</span>
                      {currentArticle.activeExclusionReason && (
                        <span className="text-[10px] font-normal text-[#B42318]/80 bg-white/60 px-1.5 py-0.2 rounded border border-[#B42318]/20">
                          {currentArticle.activeExclusionReason}
                        </span>
                      )}
                    </span>
                  )}
                  {currentArticle.screeningStatus === "unclear" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF7EC] text-[#B7791F] border border-[#B7791F]/20 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> UNCLEAR (Ragu)
                    </span>
                  )}
                  {currentArticle.screeningStatus === "pending" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F2F4F7] text-[#475467] border border-[#D0D5DD] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#B7791F]" /> BELUM DI-SCREENING
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#17212B] leading-snug">
                  {currentArticle.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#667085] mt-2">
                  <span className="font-semibold text-[#17212B]">{currentArticle.authors}</span>
                  <span>•</span>
                  <span>{currentArticle.journal || "Journal not specified"}</span>
                  <span>•</span>
                  <span>{currentArticle.publicationYear || "Tahun N/A"}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {currentArticle.doi && (
                    <a
                      href={`https://doi.org/${currentArticle.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#2F7D78] hover:underline inline-flex items-center gap-1"
                    >
                      <span>doi:{currentArticle.doi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPdfModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC] text-xs font-semibold text-[#17324D] hover:bg-gray-100 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#2F7D78]" />
                    <span>Buka PDF / Naskah Lengkap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNavigatorModal(true)}
                    className="inline-flex items-center gap-1 text-xs text-[#2F7D78] hover:underline font-semibold"
                  >
                    <span>Lompat artikel lain...</span>
                  </button>
                </div>
              </div>

              {/* Abstract Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                    Abstrak Studi (Abstract):
                  </span>
                  <span className="text-[11px] text-[#667085]">
                    ID Referensi: <code className="font-mono">{currentArticle.id}</code>
                  </span>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#1E293B] leading-relaxed max-h-[380px] overflow-y-auto font-sans">
                  {currentArticle.abstract || "Tidak ada abstrak yang tercatat pada metadata file referensi ini."}
                </div>
              </div>

              {/* AI Screening Assistant */}
              <AIScreeningCard
                articleId={currentArticle.id}
                projectId={projectId}
                onApplyRecommendation={(decision, reason) => handleDecision(decision, reason)}
              />

              {/* Action Buttons: Include, Exclude, Unclear */}
              <div className="pt-4 border-t border-[#E4E7EC] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                {/* Hotkey Helper Pill */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-[#667085] pt-1">
                  <Keyboard className="w-3.5 h-3.5 text-[#2F7D78]" />
                  <span>
                    Hotkey: <strong>I</strong> (Inklusi) · <strong>E</strong> (Eksklusi) · <strong>U</strong> (Ragu) · <strong>← / →</strong> (Navigasi) · <strong>P</strong> (Next Pending)
                  </span>
                </div>
              </div>

              {/* Bottom Pagination & Step Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E4E7EC] text-xs text-[#667085]">
                <button
                  type="button"
                  disabled={filteredIndex === 0}
                  onClick={() => {
                    if (filteredIndex > 0) {
                      setSelectedArticleId(filteredArticles[filteredIndex - 1].id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] font-semibold text-[#17212B] hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span>
                    Item {filteredIndex + 1} dari {filteredArticles.length} (Filter: {statusFilter.toUpperCase()})
                  </span>
                </div>

                <button
                  type="button"
                  disabled={filteredIndex >= filteredArticles.length - 1}
                  onClick={() => {
                    if (filteredIndex < filteredArticles.length - 1) {
                      setSelectedArticleId(filteredArticles[filteredIndex + 1].id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] font-semibold text-[#17212B] hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Protocol Criteria Inspector */}
          <div className="space-y-4">
            <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-[#E4E7EC] pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#17324D] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2F7D78]" />
                  Kriteria Kelayakan Protokol
                </span>
                <span className="text-[10px] text-[#2F7D78] font-bold font-mono px-2 py-0.5 rounded bg-[#E8F5F4]">
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
                  {criteria.filter((c) => c.criterionType === "inclusion").length === 0 ? (
                    <div className="text-[#667085] italic p-2 bg-gray-50 rounded">
                      Belum ada kriteria inklusi spesifik.
                    </div>
                  ) : (
                    criteria
                      .filter((c) => c.criterionType === "inclusion")
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 bg-[#ECFDF3] rounded-lg border border-[#18794E]/20 text-[#17212B]"
                        >
                          <span className="font-semibold text-[#18794E] uppercase text-[10px] block">
                            {c.category}:
                          </span>
                          {c.description}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Exclusions */}
              <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
                <span className="text-xs font-bold text-[#B42318] flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  <span>Kriteria Eksklusi:</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {criteria.filter((c) => c.criterionType === "exclusion").length === 0 ? (
                    <div className="text-[#667085] italic p-2 bg-gray-50 rounded">
                      Belum ada kriteria eksklusi spesifik.
                    </div>
                  ) : (
                    criteria
                      .filter((c) => c.criterionType === "exclusion")
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 bg-[#FEF3F2] rounded-lg border border-[#B42318]/20 text-[#17212B]"
                        >
                          <span className="font-semibold text-[#B42318] uppercase text-[10px] block">
                            {c.category}:
                          </span>
                          {c.description}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Protocol Summary Card */}
              {protocol && (
                <div className="pt-3 border-t border-[#E4E7EC] space-y-2 text-xs">
                  <span className="font-bold text-[#17324D] uppercase tracking-wider text-[11px] block">
                    Pertanyaan Penelitian:
                  </span>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[#334155] text-[11px] leading-relaxed">
                    {protocol.objectives || protocol.background || "Protokol belum mencatat tujuan rinci."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Mandatory Exclusion Reason Modal */}
      {showExcludeModal && currentArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2 text-[#B42318]">
                <XCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-[#17324D]">
                  Alasan Eksklusi Artikel #{currentArticleNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExcludeModal(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#667085]">
              Sesuai pedoman PRISMA 2020, alasan mengeluarkan artikel wajib dicatat dalam ledger audit penelitian.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17212B] mb-1">
                  Pilih Alasan Eksklusi:
                </label>
                <select
                  value={selectedExclusionReason}
                  onChange={(e) => setSelectedExclusionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D0D5DD] rounded-lg font-medium text-[#17212B] focus:ring-1 focus:ring-[#B42318]"
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
                  Catatan Tambahan (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Misal: Desain studi observasional tanpa kelompok kontrol..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D0D5DD] rounded-lg focus:ring-1 focus:ring-[#B42318]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
              <button
                type="button"
                onClick={() => setShowExcludeModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085] hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision("exclude", selectedExclusionReason)}
                className="px-4 py-2 rounded-lg bg-[#B42318] hover:bg-[#8E1C13] text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Konfirmasi Eksklusi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Article Navigator & Number Matrix Modal */}
      {showNavigatorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#E4E7EC]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E4E7EC] bg-[#F8FAFC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#2F7D78]" />
                  <h3 className="text-sm sm:text-base font-bold text-[#17324D]">
                    Daftar & Navigator Nomor Artikel (Total: {totalCount})
                  </h3>
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  Klik nomor artikel apa saja untuk langsung melompat ke artikel tersebut.
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      jumpToFirstPending();
                      setShowNavigatorModal(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F7D78] text-white text-xs font-semibold shadow-xs hover:bg-[#25635F]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Lompat ke Pending Pertama</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowNavigatorModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Filter & Search Bar */}
            <div className="p-4 border-b border-[#E4E7EC] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Cari nomor (#), judul, atau penulis..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#D0D5DD] rounded-lg focus:ring-1 focus:ring-[#2F7D78] focus:border-[#2F7D78]"
                />
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
                <button
                  type="button"
                  onClick={() => setNavFilter("all")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    navFilter === "all" ? "bg-[#17324D] text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Semua ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNavFilter("pending")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
                    navFilter === "pending"
                      ? "bg-[#B7791F] text-white"
                      : "bg-[#FEF7EC] text-[#B7791F]"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNavFilter("included")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    navFilter === "included"
                      ? "bg-[#18794E] text-white"
                      : "bg-[#ECFDF3] text-[#18794E]"
                  }`}
                >
                  Inklusi ({includedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNavFilter("excluded")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    navFilter === "excluded"
                      ? "bg-[#B42318] text-white"
                      : "bg-[#FEF3F2] text-[#B42318]"
                  }`}
                >
                  Eksklusi ({excludedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNavFilter("unclear")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    navFilter === "unclear"
                      ? "bg-[#7A4E0B] text-white"
                      : "bg-gray-100 text-[#7A4E0B]"
                  }`}
                >
                  Ragu ({unclearCount})
                </button>
              </div>

              {/* View Mode Toggle: Matrix vs List */}
              <div className="flex items-center border border-[#D0D5DD] rounded-lg p-0.5 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setNavViewMode("matrix")}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                    navViewMode === "matrix" ? "bg-[#17324D] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Matriks Nomor
                </button>
                <button
                  type="button"
                  onClick={() => setNavViewMode("list")}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                    navViewMode === "list" ? "bg-[#17324D] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Daftar Rinci
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {navFilteredArticles.length === 0 ? (
                <div className="text-center py-12 text-[#667085] text-xs">
                  Tidak ada artikel yang cocok dengan pencarian atau filter ini.
                </div>
              ) : navViewMode === "matrix" ? (
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] pb-3 border-b border-[#E4E7EC] text-[#667085]">
                    <span className="font-semibold text-[#17324D]">Keterangan Warna:</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                      Inklusi (Included)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                      Eksklusi (Excluded)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                      Ragu (Unclear)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                      Belum Di-screening (Pending)
                    </span>
                  </div>

                  {/* Number Grid Matrix */}
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {navFilteredArticles.map(({ article, number }) => {
                      const isCurrent = article.id === currentArticle?.id;
                      const status = article.screeningStatus;

                      let badgeStyle =
                        "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200";
                      if (status === "included") {
                        badgeStyle =
                          "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 font-bold";
                      } else if (status === "excluded") {
                        badgeStyle =
                          "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 font-bold";
                      } else if (status === "unclear") {
                        badgeStyle =
                          "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 font-bold";
                      }

                      return (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => {
                            setSelectedArticleId(article.id);
                            setShowNavigatorModal(false);
                          }}
                          title={`#${number}: ${article.title} (${status})`}
                          className={`relative p-2 rounded-xl text-xs font-mono border transition-all text-center flex flex-col items-center justify-center ${badgeStyle} ${
                            isCurrent
                              ? "ring-2 ring-[#2F7D78] ring-offset-2 scale-105 shadow-md"
                              : ""
                          }`}
                        >
                          <span className="text-[11px] font-bold">#{number}</span>
                          <span className="text-[9px] uppercase tracking-tighter opacity-75">
                            {status === "pending" ? "Belum" : status.slice(0, 3)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Detailed Table List View */
                <div className="border border-[#E4E7EC] rounded-xl overflow-hidden text-xs">
                  <table className="min-w-full divide-y divide-[#E4E7EC]">
                    <thead className="bg-[#F8FAFC] text-[#667085] font-semibold">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left w-16">No</th>
                        <th className="px-3.5 py-2.5 text-left w-28">Status</th>
                        <th className="px-3.5 py-2.5 text-left">Judul Artikel & Penulis</th>
                        <th className="px-3.5 py-2.5 text-right w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC] bg-white">
                      {navFilteredArticles.map(({ article, number }) => {
                        const isCurrent = article.id === currentArticle?.id;
                        return (
                          <tr
                            key={article.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              isCurrent ? "bg-[#E8F5F4]/40 font-semibold" : ""
                            }`}
                          >
                            <td className="px-3.5 py-2.5 font-mono text-[#17324D]">
                              #{number}
                            </td>
                            <td className="px-3.5 py-2.5">
                              {article.screeningStatus === "included" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E]">
                                  INCLUDED
                                </span>
                              )}
                              {article.screeningStatus === "excluded" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3F2] text-[#B42318]">
                                  EXCLUDED
                                </span>
                              )}
                              {article.screeningStatus === "unclear" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7EC] text-[#B7791F]">
                                  UNCLEAR
                                </span>
                              )}
                              {article.screeningStatus === "pending" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                                  PENDING
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <p className="font-semibold text-[#17212B] line-clamp-1">
                                {article.title}
                              </p>
                              <p className="text-[11px] text-[#667085] line-clamp-1 mt-0.5">
                                {article.authors} ({article.publicationYear || "N/A"})
                              </p>
                            </td>
                            <td className="px-3.5 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedArticleId(article.id);
                                  setShowNavigatorModal(false);
                                }}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                                  isCurrent
                                    ? "bg-[#2F7D78] text-white"
                                    : "bg-gray-100 hover:bg-[#17324D] hover:text-white text-[#17324D]"
                                }`}
                              >
                                {isCurrent ? "Sedang Dibuka" : "Buka"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E4E7EC] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#667085]">
              <span>
                Menampilkan {navFilteredArticles.length} dari {totalCount} total artikel
              </span>
              <button
                type="button"
                onClick={() => setShowNavigatorModal(false)}
                className="px-4 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#17324D] font-semibold hover:bg-gray-50"
              >
                Tutup Navigator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PDF & Full-Text Evidence Modal */}
      {showPdfModal && currentArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F7F8FA]">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-[#2F7D78] shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-[#17324D] truncate">
                  #{currentArticleNumber}: {currentArticle.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-black transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PdfArticleViewer article={currentArticle} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
