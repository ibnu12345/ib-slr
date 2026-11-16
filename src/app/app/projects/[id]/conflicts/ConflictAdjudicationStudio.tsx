"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ScreeningConflict, ExclusionReason, ScreeningDecisionType } from "../../../../../lib/types/screening";
import { Article } from "../../../../../lib/types/research";
import { adjudicateConflictAction } from "../../../../../lib/screening/actions";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Save,
} from "lucide-react";

interface ConflictItem extends ScreeningConflict {
  article?: Article;
}

interface Props {
  projectId: string;
  initialOpenConflicts: ConflictItem[];
  initialResolvedConflicts: ConflictItem[];
  exclusionReasons: ExclusionReason[];
}

export function ConflictAdjudicationStudio({
  projectId,
  initialOpenConflicts,
  initialResolvedConflicts,
  exclusionReasons,
}: Props) {
  const [openConflicts, setOpenConflicts] = useState<ConflictItem[]>(initialOpenConflicts);
  const [resolvedConflicts, setResolvedConflicts] = useState<ConflictItem[]>(initialResolvedConflicts);
  const [activeTab, setActiveTab] = useState<"open" | "resolved">("open");
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);

  const [resolvedDecision, setResolvedDecision] = useState<ScreeningDecisionType>("include");
  const [exclusionReason, setExclusionReason] = useState(exclusionReasons[0]?.label || "Populasi Tidak Sesuai");
  const [adjudicationNotes, setAdjudicationNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const handleAdjudicateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;

    setSaving(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("conflictId", selectedConflict.id);
    formData.append("projectId", projectId);
    formData.append("resolvedDecision", resolvedDecision);
    if (resolvedDecision === "exclude") {
      formData.append("exclusionReason", exclusionReason);
    }
    formData.append("adjudicationNotes", adjudicationNotes);

    try {
      const res = await adjudicateConflictAction(formData);
      if (res.success) {
        setOpenConflicts(openConflicts.filter((c) => c.id !== selectedConflict.id));
        setResolvedConflicts([
          {
            ...selectedConflict,
            status: "resolved",
            resolvedDecision,
            resolvedExclusionReason: resolvedDecision === "exclude" ? exclusionReason : undefined,
            adjudicationNotes,
            resolvedAt: new Date().toISOString(),
          },
          ...resolvedConflicts,
        ]);
        setSelectedConflict(null);
        setAdjudicationNotes("");
        setFeedback({
          type: "success",
          message: "Adjudikasi konflik berhasil diselesaikan dan status artikel diperbarui.",
        });
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal melakukan adjudikasi." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan server saat adjudikasi." });
    } finally {
      setSaving(false);
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

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("open")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "open"
              ? "bg-[#FEF7EC] text-[#B7791F] border border-[#B7791F]/40"
              : "text-[#667085] hover:text-[#17212B]"
          }`}
        >
          Konflik Aktif Menunggu Adjudikasi ({openConflicts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("resolved")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "resolved"
              ? "bg-[#ECFDF3] text-[#18794E] border border-[#18794E]/40"
              : "text-[#667085] hover:text-[#17212B]"
          }`}
        >
          Konflik Selesai Diadjudikasi ({resolvedConflicts.length})
        </button>
      </div>

      {/* Open Conflicts List */}
      {activeTab === "open" && (
        <div className="space-y-4">
          {openConflicts.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#18794E] mx-auto" />
              <h3 className="text-base font-bold text-[#17324D]">Tidak Ada Konflik Screening Terbuka</h3>
              <p className="text-xs text-[#667085] max-w-md mx-auto">
                Seluruh keputusan peninjau independen selaras, atau artikel belum memiliki dua penilaian yang saling bertolak belakang.
              </p>
            </div>
          ) : (
            openConflicts.map((c) => (
              <div
                key={c.id}
                className="bg-[#FFFFFF] border-2 border-[#FEF7EC] rounded-xl p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E4E7EC] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#FEF7EC] text-[#B7791F]">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-[#17324D]">
                      Konflik Tahap: {c.stage === "title_abstract" ? "Title & Abstract" : "Full-Text"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FEF7EC] text-[#B7791F]">
                    Memerlukan Adjudikasi
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#17212B] leading-snug">
                    {c.article?.title || `Artikel ID: ${c.articleId}`}
                  </h4>
                  <div className="text-xs text-[#667085] mt-1">
                    {c.article?.authors} • {c.article?.journal || "N/A"} ({c.article?.publicationYear || "N/A"})
                  </div>
                </div>

                {/* Independent Reviewer Decisions Comparison */}
                <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EC] space-y-2">
                  <span className="text-[11px] font-bold text-[#17324D] uppercase tracking-wider block mb-1">
                    Penilaian Independen Reviewer:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {c.decisions.map((d, dIdx) => (
                      <div
                        key={d.id || dIdx}
                        className="p-3 bg-white rounded-lg border border-[#E4E7EC] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#17212B]">{d.reviewerName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              d.decision === "include"
                                ? "bg-[#ECFDF3] text-[#18794E]"
                                : d.decision === "exclude"
                                ? "bg-[#FEF3F2] text-[#B42318]"
                                : "bg-[#FEF7EC] text-[#B7791F]"
                            }`}
                          >
                            {d.decision}
                          </span>
                        </div>
                        {d.exclusionReason && (
                          <div className="text-[11px] text-[#B42318]">
                            <strong>Alasan:</strong> {d.exclusionReason}
                          </div>
                        )}
                        {d.notes && (
                          <div className="text-[11px] text-[#667085] italic">
                            &ldquo;{d.notes}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedConflict(c)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white shadow-sm transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#3E9C96]" />
                    <span>Adjudikasi Sebagai Lead Reviewer</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Resolved Conflicts List */}
      {activeTab === "resolved" && (
        <div className="space-y-4">
          {resolvedConflicts.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-8 text-center text-xs text-[#667085]">
              Belum ada riwayat konflik yang diselesaikan.
            </div>
          ) : (
            resolvedConflicts.map((c) => (
              <div
                key={c.id}
                className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 space-y-3 shadow-sm text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
                  <span className="font-bold text-[#17324D]">
                    {c.article?.title || `Artikel ID: ${c.articleId}`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#ECFDF3] text-[#18794E]">
                    Resolved ({c.resolvedDecision?.toUpperCase()})
                  </span>
                </div>
                <div className="text-[#667085]">
                  Diadjudikasi oleh: <strong>{c.adjudicatedBy || "Lead Reviewer"}</strong> • {c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : ""}
                </div>
                {c.adjudicationNotes && (
                  <div className="p-2.5 bg-[#F7F8FA] rounded border border-[#E4E7EC] text-[#17212B]">
                    <strong>Catatan Adjudikasi:</strong> {c.adjudicationNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Adjudication Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl max-w-lg w-full border border-[#E4E7EC] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2 text-[#17324D]">
                <UserCheck className="w-5 h-5 text-[#2F7D78]" />
                <h3 className="text-sm font-bold">
                  Form Adjudikasi Keputusan Final
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConflict(null)}
                className="text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#667085]">
              Sebagai Adjudikator / Third Reviewer, buat keputusan final untuk menyelesaikan konflik penilaian studi ini:
            </p>

            <form onSubmit={handleAdjudicateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#17212B] mb-1">
                  Keputusan Final Adjudikasi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolvedDecision("include")}
                    className={`py-2 px-3 rounded-lg border font-bold text-center transition-colors ${
                      resolvedDecision === "include"
                        ? "bg-[#18794E] text-white border-[#18794E]"
                        : "bg-white text-[#667085] border-[#E4E7EC]"
                    }`}
                  >
                    INCLUDE (Masukkan Studi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolvedDecision("exclude")}
                    className={`py-2 px-3 rounded-lg border font-bold text-center transition-colors ${
                      resolvedDecision === "exclude"
                        ? "bg-[#B42318] text-white border-[#B42318]"
                        : "bg-white text-[#667085] border-[#E4E7EC]"
                    }`}
                  >
                    EXCLUDE (Keluarkan Studi)
                  </button>
                </div>
              </div>

              {resolvedDecision === "exclude" && (
                <div>
                  <label className="block font-bold text-[#17212B] mb-1">
                    Alasan Eksklusi Final (Wajib):
                  </label>
                  <select
                    value={exclusionReason}
                    onChange={(e) => setExclusionReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                  >
                    {exclusionReasons.map((r) => (
                      <option key={r.id} value={r.label}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#17212B] mb-1">
                  Rasionalisasi Ilmiah & Catatan Adjudikasi:
                </label>
                <textarea
                  rows={3}
                  required
                  value={adjudicationNotes}
                  onChange={(e) => setAdjudicationNotes(e.target.value)}
                  placeholder="Jelaskan alasan mengapa studi ini diputuskan include/exclude sesuai kriteria protokol..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setSelectedConflict(null)}
                  className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-[#3E9C96]" />
                  <span>{saving ? "Menyimpan..." : "Tetapkan Keputusan Final"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
