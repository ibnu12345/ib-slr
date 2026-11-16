"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp, Quote, ShieldCheck, Loader2 } from "lucide-react";
import { AIScreeningSuggestion } from "../../lib/types/ai";
import { getOrGenerateAIScreeningAction } from "../../lib/ai/actions";
import { ScreeningDecisionType } from "../../lib/types/screening";

interface Props {
  articleId: string;
  projectId: string;
  onApplyRecommendation: (decision: ScreeningDecisionType, reason?: string) => void;
}

export function AIScreeningCard({ articleId, projectId, onApplyRecommendation }: Props) {
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState<AIScreeningSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getOrGenerateAIScreeningAction(articleId, projectId).then((res) => {
      if (!isMounted) return;
      if (res.success && res.suggestion) {
        setSuggestion(res.suggestion);
      } else {
        setError(res.error || "Gagal memuat rekomendasi AI.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [articleId, projectId]);

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-4 shadow-sm flex items-center justify-center gap-2 text-xs text-[#667085]">
        <Loader2 className="w-4 h-4 animate-spin text-[#2F7D78]" />
        <span>AI sedang menganalisis kriteria kelayakan artikel...</span>
      </div>
    );
  }

  if (error || !suggestion) {
    return null; // Fail gracefully without breaking human screening
  }

  const isInclude = suggestion.recommendation === "include";
  const isExclude = suggestion.recommendation === "exclude";
  const isUnclear = suggestion.recommendation === "unclear";

  return (
    <div className="bg-[#FFFFFF] border border-[#2F7D78]/30 rounded-xl p-4 shadow-sm space-y-3.5">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#2F7D78]" />
          <h4 className="text-xs font-bold text-[#17324D]">Rekomendasi AI Evidence Assistant</h4>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F7F8FA] border border-[#E4E7EC] text-[#667085]">
            Penasehat Ilmiah
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#667085]">Tingkat Bukti:</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              suggestion.confidenceRating === "high"
                ? "bg-[#ECFDF3] text-[#18794E]"
                : "bg-[#FEF7EC] text-[#B7791F]"
            }`}
          >
            {suggestion.confidenceRating === "high" ? "Tinggi (Definitif)" : "Sedang (Perlu Verifikasi)"}
          </span>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div
        className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isInclude
            ? "bg-[#ECFDF3] border-[#18794E]/30"
            : isExclude
            ? "bg-[#FEF3F2] border-[#B42318]/30"
            : "bg-[#FEF7EC] border-[#B7791F]/30"
        }`}
      >
        <div className="flex items-center gap-2">
          {isInclude && <CheckCircle2 className="w-5 h-5 text-[#18794E] shrink-0" />}
          {isExclude && <XCircle className="w-5 h-5 text-[#B42318] shrink-0" />}
          {isUnclear && <HelpCircle className="w-5 h-5 text-[#B7791F] shrink-0" />}
          <div>
            <div className="text-xs font-bold">
              {isInclude && <span className="text-[#18794E]">REKOMENDASI: INKLUSI (INCLUDE)</span>}
              {isExclude && <span className="text-[#B42318]">REKOMENDASI: EKSKLUSI (EXCLUDE)</span>}
              {isUnclear && <span className="text-[#B7791F]">REKOMENDASI: PERIKSA TEKS LENGKAP (UNCLEAR)</span>}
            </div>
            <p className="text-[11px] text-[#17212B] mt-0.5 leading-relaxed">{suggestion.rationale}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const decision: ScreeningDecisionType = isInclude ? "include" : isExclude ? "exclude" : "unclear";
            const reason = isExclude ? "Kriteria Eksklusi Protokol Terdeteksi AI" : undefined;
            onApplyRecommendation(decision, reason);
          }}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
            isInclude
              ? "bg-[#18794E] text-white hover:bg-[#125d3b]"
              : isExclude
              ? "bg-[#B42318] text-white hover:bg-[#8e1b13]"
              : "bg-[#B7791F] text-white hover:bg-[#8f5e18]"
          }`}
        >
          <span>Terapkan Rekomendasi Ini</span>
        </button>
      </div>

      {/* Grounded Evidence Quotes Accordion */}
      {suggestion.evidenceQuotes && suggestion.evidenceQuotes.length > 0 && (
        <div className="border border-[#E4E7EC] rounded-lg overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setShowEvidence(!showEvidence)}
            className="w-full px-3 py-2 bg-[#F7F8FA] flex items-center justify-between text-[#17324D] font-medium hover:bg-gray-100"
          >
            <div className="flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Bukti Kutipan Verbatim ({suggestion.evidenceQuotes.length} kutipan ditemukan)</span>
            </div>
            {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showEvidence && (
            <div className="p-3 space-y-2 bg-[#FFFFFF]">
              {suggestion.evidenceQuotes.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded bg-amber-50/50 border border-amber-200/60 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#667085]">
                    <span className="font-semibold text-[#17324D]">{q.section || "Bagian Naskah"}</span>
                    {q.pageNumber && <span>Halaman {q.pageNumber}</span>}
                  </div>
                  <p className="italic text-[#17212B]">“{q.quote}”</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Academic Disclaimers */}
      <div className="flex items-center gap-1.5 text-[10px] text-[#667085]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D78] shrink-0" />
        <span>
          Evaluasi AI berlandaskan teks asli (zero-hallucination policy). Reviewer manusia tetap memegang keputusan akhir.
        </span>
      </div>
    </div>
  );
}
