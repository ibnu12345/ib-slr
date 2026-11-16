"use client";

import React, { useState } from "react";
import { Article } from "../../../../../lib/types/research";
import { ThematicCode, ThematicExcerpt, SynthesisSummary } from "../../../../../lib/types/synthesis";
import {
  Layers,
  BarChart3,
  Tag,
  Plus,
  Quote,
  Trash2,
  Sparkles,
  Compass,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Globe,
  Loader2,
  X,
} from "lucide-react";
import {
  saveThematicCodeAction,
  deleteThematicCodeAction,
  saveThematicExcerptAction,
  deleteThematicExcerptAction,
} from "../../../../../lib/appraisal/actions";

interface Props {
  projectId: string;
  articles: Article[];
  initialCodes: ThematicCode[];
  initialExcerpts: ThematicExcerpt[];
  summary: SynthesisSummary;
}

export function SynthesisStudio({
  projectId,
  articles,
  initialCodes,
  initialExcerpts,
  summary,
}: Props) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "thematic" | "gaps">("dashboard");
  const [codes, setCodes] = useState<ThematicCode[]>(initialCodes);
  const [excerpts, setExcerpts] = useState<ThematicExcerpt[]>(initialExcerpts);

  // Modal states
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [newCodeName, setNewCodeName] = useState("");
  const [newCodeCategory, setNewCodeCategory] = useState("Karakteristik Intervensi");
  const [newCodeColor, setNewCodeColor] = useState("#2F7D78");
  const [newCodeDescription, setNewCodeDescription] = useState("");
  const [savingCode, setSavingCode] = useState(false);

  const [showAddExcerptModal, setShowAddExcerptModal] = useState(false);
  const [excerptArticleId, setExcerptArticleId] = useState(articles[0]?.id || "");
  const [excerptCodeId, setExcerptCodeId] = useState(codes[0]?.id || "");
  const [excerptQuote, setExcerptQuote] = useState("");
  const [excerptPage, setExcerptPage] = useState(1);
  const [excerptNotes, setExcerptNotes] = useState("");
  const [savingExcerpt, setSavingExcerpt] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName.trim() || savingCode) return;
    setSavingCode(true);

    const newCode: ThematicCode = {
      id: `thm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      name: newCodeName.trim(),
      category: newCodeCategory,
      color: newCodeColor,
      description: newCodeDescription.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await saveThematicCodeAction(newCode);
      if (res.success && res.code) {
        setCodes([...codes, res.code]);
        setShowAddCodeModal(false);
        setNewCodeName("");
        setNewCodeDescription("");
        setFeedback({ type: "success", message: `Kode tematik "${res.code.name}" berhasil dibuat.` });
      }
    } finally {
      setSavingCode(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm("Hapus kode tematik ini beserta seluruh tag kutipannya?")) return;
    const res = await deleteThematicCodeAction(codeId);
    if (res.success) {
      setCodes(codes.filter((c) => c.id !== codeId));
      setExcerpts(excerpts.filter((e) => e.codeId !== codeId));
      setFeedback({ type: "success", message: "Kode tematik berhasil dihapus." });
    }
  };

  const handleCreateExcerpt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excerptQuote.trim() || savingExcerpt) return;
    setSavingExcerpt(true);

    const newExcerpt: ThematicExcerpt = {
      id: `exc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      articleId: excerptArticleId,
      codeId: excerptCodeId,
      verbatimQuote: excerptQuote.trim(),
      pageNumber: excerptPage,
      notes: excerptNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await saveThematicExcerptAction(newExcerpt);
      if (res.success && res.excerpt) {
        setExcerpts([...excerpts, res.excerpt]);
        setShowAddExcerptModal(false);
        setExcerptQuote("");
        setExcerptNotes("");
        setFeedback({ type: "success", message: "Kutipan tematik berhasil ditambahkan." });
      }
    } finally {
      setSavingExcerpt(false);
    }
  };

  const handleDeleteExcerpt = async (excerptId: string) => {
    const res = await deleteThematicExcerptAction(excerptId);
    if (res.success) {
      setExcerpts(excerpts.filter((e) => e.id !== excerptId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2F7D78]" />
              <h2 className="text-lg font-bold text-[#17324D]">Evidence Synthesis & Thematic Workspace</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Sintesis Kualitatif & Deskriptif
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-1">
              Pengkodean tematik temuan artikel, agregasi pola bukti lintas studi, dan identifikasi kesenjangan riset (research gaps).
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-lg border border-[#E4E7EC] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-[#17324D] shadow-xs"
                  : "text-[#667085] hover:text-[#17212B]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Sintesis Deskriptif</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("thematic")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "thematic"
                  ? "bg-white text-[#17324D] shadow-xs"
                  : "text-[#667085] hover:text-[#17212B]"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Pengkodean Tematik ({excerpts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gaps")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "gaps"
                  ? "bg-white text-[#17324D] shadow-xs"
                  : "text-[#667085] hover:text-[#17212B]"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>Kesenjangan Riset</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
          <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block text-[11px]">Total Studi Diulas</span>
            <span className="text-lg font-bold text-[#17324D]">{articles.length} Artikel</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block text-[11px]">Kode Tematik Aktif</span>
            <span className="text-lg font-bold text-[#2F7D78]">{codes.length} Tema</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block text-[11px]">Kutipan Bertag (Quotes)</span>
            <span className="text-lg font-bold text-[#18794E]">{excerpts.length} Kutipan</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block text-[11px]">Kesenjangan Terpetakan</span>
            <span className="text-lg font-bold text-[#B7791F]">{summary.researchGaps.length} Topik</span>
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

      {/* TAB 1: DESCRIPTIVE SYNTHESIS DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeline Breakdown */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17324D]">
                <Calendar className="w-4 h-4 text-[#2F7D78]" />
                <span>Tren Publikasi Tahunan</span>
              </div>
              <div className="space-y-2 pt-2">
                {summary.timelineData.map((item) => (
                  <div key={item.year} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#17212B]">{item.year}</span>
                    <div className="flex items-center gap-2 flex-1 mx-3">
                      <div className="w-full bg-[#E4E7EC] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2F7D78] h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((item.count / articles.length) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-bold text-[#17324D]">{item.count} studi</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Design Distribution */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17324D]">
                <BarChart3 className="w-4 h-4 text-[#2F7D78]" />
                <span>Desain Metodologi Studi</span>
              </div>
              <div className="space-y-2 pt-2">
                {summary.studyDesignDistribution.map((item) => (
                  <div key={item.design} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#17212B] truncate max-w-[140px]">{item.design}</span>
                    <div className="flex items-center gap-2 flex-1 mx-3">
                      <div className="w-full bg-[#E4E7EC] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#18794E] h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((item.count / articles.length) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-bold text-[#17324D]">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographical Distribution */}
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17324D]">
                <Globe className="w-4 h-4 text-[#2F7D78]" />
                <span>Distribusi Negara / Setting</span>
              </div>
              <div className="space-y-2 pt-2">
                {summary.countryDistribution.map((item) => (
                  <div key={item.country} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#17212B] truncate max-w-[140px]">{item.country}</span>
                    <div className="flex items-center gap-2 flex-1 mx-3">
                      <div className="w-full bg-[#E4E7EC] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#17324D] h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((item.count / articles.length) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-bold text-[#17324D]">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cross-Study Thematic Matrix Table */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#17324D]">
              Matriks Keterwakilan Tema Lintas Studi (Cross-Study Thematic Matrix)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E4E7EC] rounded-lg overflow-hidden">
                <thead className="bg-[#F7F8FA] text-[#17324D] font-bold border-b border-[#E4E7EC]">
                  <tr>
                    <th className="py-2.5 px-3">Tema & Domain Sintesis</th>
                    <th className="py-2.5 px-3 text-center">Frekuensi Kutipan</th>
                    <th className="py-2.5 px-3">Studi yang Membahas Tema Ini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC]">
                  {summary.thematicMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#17212B]">{item.theme}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#2F7D78]">
                        {item.quoteCount} kutipan
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {item.articleIds.map((artId) => {
                            const art = articles.find((a) => a.id === artId);
                            return (
                              <span
                                key={artId}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EFF7F6] text-[#2F7D78] border border-[#2F7D78]/20"
                                title={art?.title}
                              >
                                {art?.authors.split(";")[0]} ({art?.publicationYear})
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEMATIC CODING WORKSPACE */}
      {activeTab === "thematic" && (
        <div className="space-y-6">
          {/* Top Actions: Add Code & Tag Excerpt */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#2F7D78]" />
              <h3 className="text-sm font-bold text-[#17324D]">Taksonomi Kode & Kutipan Tematik</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddCodeModal(true)}
                className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-white hover:bg-gray-50 text-xs font-semibold text-[#17324D] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#2F7D78]" />
                <span>Buat Kode Tematik Baru</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddExcerptModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Quote className="w-3.5 h-3.5" />
                <span>Tag Kutipan ke Kode</span>
              </button>
            </div>
          </div>

          {/* Code Pills Palette */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
              Daftar Kode Tematik ({codes.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {codes.map((code) => {
                const count = excerpts.filter((e) => e.codeId === code.id).length;
                return (
                  <div
                    key={code.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium bg-white shadow-xs group"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: code.color }}
                    />
                    <span className="font-semibold text-[#17324D]">{code.name}</span>
                    <span className="text-[10px] text-[#667085] bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCode(code.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coded Excerpts Stream */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
              Kutipan Ilmiah Terkode ({excerpts.length} kutipan):
            </h4>

            {excerpts.length === 0 ? (
              <div className="p-8 bg-white border border-[#E4E7EC] rounded-xl text-center text-xs text-[#667085]">
                Belum ada kutipan teks yang dikodekan. Klik tombol &quot;Tag Kutipan ke Kode&quot; untuk memulai.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {excerpts.map((exc) => {
                  const code = codes.find((c) => c.id === exc.codeId);
                  const art = articles.find((a) => a.id === exc.articleId);

                  return (
                    <div
                      key={exc.id}
                      className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-sm space-y-3 text-xs hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: code?.color || "#2F7D78" }}
                        >
                          {code?.name || "Tema"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#667085] font-semibold">
                            Hal {exc.pageNumber || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExcerpt(exc.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-[#17212B] italic leading-relaxed">
                        “{exc.verbatimQuote}”
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#667085] pt-1">
                        <span className="truncate max-w-[200px] font-medium text-[#17324D]">
                          {art?.title || exc.articleId}
                        </span>
                        <span>{art?.authors.split(";")[0]}</span>
                      </div>

                      {exc.notes && (
                        <p className="text-[11px] text-[#17212B] bg-gray-50 p-2 rounded border border-gray-100">
                          <strong>Catatan Sintesis:</strong> {exc.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RESEARCH GAPS EXPLORER */}
      {activeTab === "gaps" && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2F7D78]" />
              <h3 className="text-sm font-bold text-[#17324D]">
                Kesenjangan Riset & Peluang Studi Lanjutan (Research Gaps)
              </h3>
            </div>
            <p className="text-xs text-[#667085]">
              Disintesis secara otomatis dari perbandingan luaran ekstraksi PICO, durasi follow-up, serta domain bias RoB 2 yang teridentifikasi berulang pada literatur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summary.researchGaps.map((gap, gIdx) => (
              <div
                key={gIdx}
                className="bg-white border border-[#2F7D78]/30 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EFF7F6] text-[#2F7D78] font-bold text-xs flex items-center justify-center">
                    {gIdx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-[#17324D]">{gap.topic}</h4>
                </div>

                <p className="text-xs text-[#17212B] leading-relaxed">{gap.description}</p>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-[#667085] flex items-start gap-2">
                  <Compass className="w-4 h-4 text-[#2F7D78] shrink-0 mt-0.5" />
                  <span>
                    <strong>Bukti Empiris Literatur:</strong> {gap.evidenceNote}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add New Thematic Code */}
      {showAddCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#17324D]">Buat Kode Tematik Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddCodeModal(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Nama Kode Tematik:</label>
                <input
                  type="text"
                  required
                  value={newCodeName}
                  onChange={(e) => setNewCodeName(e.target.value)}
                  placeholder="Cth: Kepatuhan Pasien & Adherence"
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Kategori Induk:</label>
                <input
                  type="text"
                  value={newCodeCategory}
                  onChange={(e) => setNewCodeCategory(e.target.value)}
                  placeholder="Cth: Karakteristik Intervensi"
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Warna Badge:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCodeColor}
                    onChange={(e) => setNewCodeColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="font-mono text-gray-600">{newCodeColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Deskripsi & Ruang Lingkup:</label>
                <textarea
                  rows={2}
                  value={newCodeDescription}
                  onChange={(e) => setNewCodeDescription(e.target.value)}
                  placeholder="Uraikan batasan konsep yang dicakup oleh tema ini..."
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setShowAddCodeModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCode}
                  className="px-4 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {savingCode ? "Menyimpan..." : "Simpan Kode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tag Excerpt to Code */}
      {showAddExcerptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#17324D]">Tag Kutipan Naskah ke Kode Tematik</h3>
              <button
                type="button"
                onClick={() => setShowAddExcerptModal(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExcerpt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Pilih Artikel / Naskah:</label>
                <select
                  value={excerptArticleId}
                  onChange={(e) => setExcerptArticleId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg bg-white"
                >
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.title.slice(0, 60)}... ({art.publicationYear})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Pilih Kode Tematik:</label>
                <select
                  value={excerptCodeId}
                  onChange={(e) => setExcerptCodeId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg bg-white"
                >
                  {codes.map((code) => (
                    <option key={code.id} value={code.id}>
                      {code.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17212B] mb-1">
                  Kutipan Teks Verbatim (dari naskah):
                </label>
                <textarea
                  rows={3}
                  required
                  value={excerptQuote}
                  onChange={(e) => setExcerptQuote(e.target.value)}
                  placeholder="Salin kalimat persis dari naskah artikel..."
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78] italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17212B] mb-1">Nomor Halaman:</label>
                  <input
                    type="number"
                    min={1}
                    value={excerptPage}
                    onChange={(e) => setExcerptPage(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 border border-[#E4E7EC] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Catatan Analisis Reviewer:</label>
                <textarea
                  rows={2}
                  value={excerptNotes}
                  onChange={(e) => setExcerptNotes(e.target.value)}
                  placeholder="Interpretasi tematik atas kutipan ini..."
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#2F7D78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setShowAddExcerptModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingExcerpt}
                  className="px-4 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#25635f] text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {savingExcerpt ? "Menyimpan..." : "Simpan Tag Kutipan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
