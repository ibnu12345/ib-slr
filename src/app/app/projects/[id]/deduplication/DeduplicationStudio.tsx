"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Article, DuplicateCandidate } from "../../../../../lib/types/research";
import {
  runDuplicateDetectionAction,
  mergeDuplicateAction,
  dismissDuplicateAction,
} from "../../../../../lib/research/actions";
import {
  CopyCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  ExternalLink,
  RotateCw,
} from "lucide-react";

interface CandidateWithArticles extends DuplicateCandidate {
  articleA?: Article;
  articleB?: Article;
}

interface Props {
  projectId: string;
  initialCandidates: CandidateWithArticles[];
  totalArticles: number;
}

export function DeduplicationStudio({
  projectId,
  initialCandidates,
  totalArticles,
}: Props) {
  const [candidates, setCandidates] = useState<CandidateWithArticles[]>(initialCandidates);
  const [scanning, setScanning] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const handleRunScan = async () => {
    setScanning(true);
    setFeedback(null);
    try {
      const res = await runDuplicateDetectionAction(projectId);
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Pemindaian selesai: ${res.count} pasang kandidat duplikat terdeteksi.`,
        });
        window.location.reload();
      } else {
        setFeedback({ type: "error", message: "Gagal memindai duplikat." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan server saat pemindaian." });
    } finally {
      setScanning(false);
    }
  };

  const handleMerge = async (candidateId: string, survivorId: string, duplicateId: string) => {
    setProcessingId(candidateId);
    setFeedback(null);
    try {
      const res = await mergeDuplicateAction(candidateId, survivorId, duplicateId);
      if (res.success) {
        setCandidates(candidates.filter((c) => c.id !== candidateId));
        setFeedback({
          type: "success",
          message: "Artikel berhasil digabungkan (merge) secara non-destruktif. Riwayat provenance tetap terjaga.",
        });
      } else {
        setFeedback({ type: "error", message: "Gagal menggabungkan duplikat." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan saat merge." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (candidateId: string) => {
    setProcessingId(candidateId);
    setFeedback(null);
    try {
      const res = await dismissDuplicateAction(candidateId);
      if (res.success) {
        setCandidates(candidates.filter((c) => c.id !== candidateId));
        setFeedback({
          type: "success",
          message: "Kandidat ditandai sebagai 'Bukan Duplikat' (Dismissed).",
        });
      } else {
        setFeedback({ type: "error", message: "Gagal membatalkan kandidat." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan saat memproses." });
    } finally {
      setProcessingId(null);
    }
  };

  const getReasonLabel = (reason: DuplicateCandidate["matchReason"]) => {
    switch (reason) {
      case "exact_doi":
        return "Tier 1: Kecocokan Persis DOI (100%)";
      case "normalized_title":
        return "Tier 2: Judul Persis Ternormalisasi (95%)";
      case "fuzzy_title":
        return "Tier 3: Kesamaan Judul Fuzzy (Levenshtein >= 85%)";
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
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

      {/* Control Header */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-sm font-bold text-[#17324D] block">
            Status Deduplikasi
          </span>
          <span className="text-xs text-[#667085]">
            {candidates.length} pasang kandidat duplikat menunggu konfirmasi peninjau dari total {totalArticles} artikel aktif.
          </span>
        </div>

        <button
          type="button"
          disabled={scanning}
          onClick={handleRunScan}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
          <span>{scanning ? "Memindai Koleksi..." : "Pindai Ulang Duplikat"}</span>
        </button>
      </div>

      {/* Review Queue */}
      <div className="space-y-6">
        {candidates.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#17324D]">
              Semua Duplikat Selesai Ditinjau
            </h3>
            <p className="text-xs text-[#667085] max-w-md mx-auto">
              Tidak ada kandidat duplikat yang pending. Seluruh artikel di perpustakaan Anda siap untuk disaring di tahap screening.
            </p>
            <div className="pt-2">
              <Link
                href={`/app/projects/${projectId}/library`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#17324D] text-white text-xs font-semibold hover:bg-[#12273D] transition-colors"
              >
                <span>Buka Reference Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          candidates.map((cand) => {
            const isProcessing = processingId === cand.id;
            const a = cand.articleA;
            const b = cand.articleB;

            if (!a || !b) return null;

            return (
              <div
                key={cand.id}
                className="bg-[#FFFFFF] border-2 border-[#E4E7EC] hover:border-[#2F7D78]/50 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                {/* Candidate Match Header */}
                <div className="bg-[#F7F8FA] px-6 py-3 border-b border-[#E4E7EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EFF7F6] text-[#2F7D78] border border-[#2F7D78]/25">
                      {getReasonLabel(cand.matchReason)}
                    </span>
                    <span className="text-xs font-semibold text-[#17324D]">
                      Tingkat Kemiripan: <strong className="text-[#18794E]">{cand.confidenceScore}%</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDismiss(cand.id)}
                    className="text-xs text-[#667085] hover:text-[#B42318] flex items-center gap-1 font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Bukan Duplikat (Abaikan)</span>
                  </button>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E4E7EC] p-6 gap-6">
                  {/* Record A */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-[#17324D]">
                          Catatan A (ID: {a.id.slice(-6)})
                        </span>
                        <span className="text-[11px] text-[#667085]">
                          Sumber: <strong>{a.sourceDatabase || "Import"}</strong>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-[#17212B] leading-snug">
                        {a.title}
                      </h4>
                      <p className="text-[11px] text-[#667085] mt-1">
                        <strong>Penulis:</strong> {a.authors}
                      </p>
                      <p className="text-[11px] text-[#667085]">
                        <strong>Jurnal:</strong> {a.journal || "N/A"} ({a.publicationYear || "N/A"})
                      </p>
                      {a.doi && (
                        <p className="text-[11px] font-mono text-[#2F7D78]">
                          <strong>DOI:</strong> {a.doi}
                        </p>
                      )}
                      {a.abstract && (
                        <p className="text-[11px] text-[#667085] line-clamp-3 mt-2 italic bg-[#F7F8FA] p-2 rounded border border-[#E4E7EC]">
                          &ldquo;{a.abstract}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E4E7EC]">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleMerge(cand.id, a.id, b.id)}
                        className="w-full py-2 px-3 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3E9C96]" />
                        <span>Pertahankan Catatan A (Gabung B)</span>
                      </button>
                    </div>
                  </div>

                  {/* Record B */}
                  <div className="space-y-3 flex flex-col justify-between pt-6 md:pt-0">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-[#17324D]">
                          Catatan B (ID: {b.id.slice(-6)})
                        </span>
                        <span className="text-[11px] text-[#667085]">
                          Sumber: <strong>{b.sourceDatabase || "Import"}</strong>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-[#17212B] leading-snug">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-[#667085] mt-1">
                        <strong>Penulis:</strong> {b.authors}
                      </p>
                      <p className="text-[11px] text-[#667085]">
                        <strong>Jurnal:</strong> {b.journal || "N/A"} ({b.publicationYear || "N/A"})
                      </p>
                      {b.doi && (
                        <p className="text-[11px] font-mono text-[#2F7D78]">
                          <strong>DOI:</strong> {b.doi}
                        </p>
                      )}
                      {b.abstract && (
                        <p className="text-[11px] text-[#667085] line-clamp-3 mt-2 italic bg-[#F7F8FA] p-2 rounded border border-[#E4E7EC]">
                          &ldquo;{b.abstract}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E4E7EC]">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleMerge(cand.id, b.id, a.id)}
                        className="w-full py-2 px-3 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pertahankan Catatan B (Gabung A)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
