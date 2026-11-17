"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { createProjectAction } from "../../../../lib/research/actions";
import { useLanguage } from "../../../../components/i18n/LanguageContext";

export default function NewProjectPage() {
  const router = useRouter();
  const { isId } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reviewType, setReviewType] = useState("systematic_review");
  const [framework, setFramework] = useState("PICO");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("reviewType", reviewType);
    formData.append("framework", framework);

    try {
      const res = await createProjectAction(formData);
      if (!res.success || !res.project) {
        setError(res.error || (isId ? "Gagal membuat proyek penelitian." : "Failed to create research project."));
      } else {
        router.push(`/app/projects/${res.project.id}/protocol`);
      }
    } catch {
      setError(isId ? "Terjadi kesalahan server yang tidak terduga." : "An unexpected server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F7D78] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isId ? "Kembali ke Workspace" : "Back to Workspace"}</span>
        </Link>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-6 border-b border-[#E4E7EC] mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#17324D] text-[#3E9C96] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#17324D]">
              {isId ? "Inisiasi Proyek Systematic Literature Review Baru" : "Initiate New Systematic Literature Review"}
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              {isId
                ? "Tentukan judul, ruang lingkup metodologis, dan framework penelitian Anda"
                : "Define research title, methodological scope, and question formulation framework"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[#FEF3F2] border border-[#B42318]/30 text-xs text-[#B42318] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#17212B] mb-1">
              {isId ? "Judul Penelitian / Review Title" : "Research Title / Review Question"} <span className="text-[#B42318]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isId
                  ? "Contoh: The Impact of Artificial Intelligence on Primary Healthcare Screening: A Systematic Review"
                  : "e.g., The Impact of Artificial Intelligence on Primary Healthcare Screening: A Systematic Review"
              }
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-lg text-[#17212B] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1">
                {isId ? "Jenis Tinjauan (Review Type)" : "Review Methodology"}
              </label>
              <select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
              >
                <option value="systematic_review">Systematic Literature Review (SLR)</option>
                <option value="scoping_review">Scoping Review</option>
                <option value="rapid_review">Rapid Evidence Assessment</option>
                <option value="meta_analysis">Systematic Review & Meta-Analysis</option>
                <option value="umbrella_review">Umbrella Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1">
                {isId ? "Framework Protokol Pertanyaan" : "Protocol Formulation Framework"}
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
              >
                <option value="PICO">PICO (Population, Intervention, Comparator, Outcome)</option>
                <option value="PICo">PICo (Population, Interest, Context - Qualitative)</option>
                <option value="SPIDER">SPIDER (Sample, Phenomenon, Design, Eval, Research)</option>
                <option value="PEO">PEO (Population, Exposure, Outcome)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17212B] mb-1">
              {isId ? "Ringkasan / Latar Belakang Singkat" : "Brief Background & Objectives"}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isId
                  ? "Tuliskan latar belakang masalah, tujuan ilmiah, atau konteks tinjauan..."
                  : "State the research problem, clinical/scientific background, and synthesis scope..."
              }
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-lg leading-relaxed"
            />
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-[#EFF7F6] to-white border border-[#2F7D78]/25 text-xs text-[#17324D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold flex items-center gap-1.5 text-[#2F7D78]">
                <Sparkles className="w-4 h-4" />
                {isId ? "Ketentuan Kuota & Pay-Per-Project:" : "Quota Policy & Pay-Per-Project Pass:"}
              </span>
              <p className="text-[#667085] mt-0.5 leading-relaxed">
                {isId
                  ? "Paket gratis mencakup 1x proyek aktif. Setelah itu, opsi top-up 1X Proyek Aktif tambahan tersedia seharga Rp 10.000 per proyek tanpa perlu berlangganan bulanan."
                  : "Academic Free tier includes 1 active review project. Need an extra active project slot? Unlock +1 Active Project for just Rp 10,000 (~$0.65) with zero recurring commitments."}
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded bg-[#18794E] text-white text-[10px] font-bold">
              Rp 10.000 / 1X Pass
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E7EC]">
            <Link
              href="/app"
              className="px-4 py-2 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA] transition-colors"
            >
              {isId ? "Batal" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50"
            >
              <span>
                {loading
                  ? (isId ? "Menyiapkan Proyek..." : "Initiating Project...")
                  : (isId ? "Lanjut ke Protocol Builder" : "Proceed to Protocol Builder")}
              </span>
              <ArrowRight className="w-4 h-4 text-[#3E9C96]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
