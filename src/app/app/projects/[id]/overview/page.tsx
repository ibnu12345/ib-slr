import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getProtocolByProjectId,
  getCriteriaByProjectId,
  getSearchRunsByProjectId,
  getArticlesByProjectId,
  getDuplicateCandidates,
} from "../../../../../lib/db";
import {
  FileText,
  Search,
  UploadCloud,
  Library,
  CopyCheck,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
  Sparkles,
  Printer,
  Award,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectOverviewPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [protocol, criteria, searchRuns, articles, duplicateCandidates] = await Promise.all([
    getProtocolByProjectId(id),
    getCriteriaByProjectId(id),
    getSearchRunsByProjectId(id),
    getArticlesByProjectId(id),
    getDuplicateCandidates(id),
  ]);

  const inclusionCount = criteria.filter((c) => c.criterionType === "inclusion").length;
  const exclusionCount = criteria.filter((c) => c.criterionType === "exclusion").length;

  return (
    <div className="space-y-6">
      {/* Comprehensive Report Print Banner */}
      <div className="bg-gradient-to-r from-[#17324D] via-[#1E4366] to-[#2F7D78] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
              Fitur Baru Dokumen Siap Cetak
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-400 text-emerald-950">
              PRISMA 2020 Compliant
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Cetak / Simpan PDF Ringkasan Proyek Keseluruhan
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Dossier lengkap proyek dari hulu ke hilir: <strong>Judul Lengkap</strong>, <strong>Kata Kunci (Keywords)</strong>, <strong>3 Research Questions (RQ)</strong>, <strong>Kerangka Protokol SPIDER</strong>, <strong>Tabel Kriteria Inklusi & Eksklusi</strong>, <strong>Strategi & String Pencarian Database</strong>, <strong>Alur PRISMA 2020</strong>, <strong>Hasil Quality Appraisal</strong>, hingga <strong>Matriks 176 Studi Terpilih</strong>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Link
            href={`/app/projects/${id}/report`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#17324D] hover:bg-gray-100 text-xs font-bold shadow-md transition-all group"
          >
            <Printer className="w-4 h-4 text-[#2F7D78] group-hover:scale-110 transition-transform" />
            <span>Buka & Cetak PDF Lengkap</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Total Articles In Library
          </div>
          <div className="text-2xl font-bold text-[#17324D]">{articles.length}</div>
          <div className="text-[11px] text-[#2F7D78] mt-1 font-medium">
            Active references loaded
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Search Runs Logged
          </div>
          <div className="text-2xl font-bold text-[#17324D]">{searchRuns.length}</div>
          <div className="text-[11px] text-[#667085] mt-1">Database provenance recorded</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Pending Duplicates
          </div>
          <div className="text-2xl font-bold text-[#B7791F]">
            {duplicateCandidates.length}
          </div>
          <div className="text-[11px] text-[#667085] mt-1">
            {duplicateCandidates.length > 0 ? "Requires human merge review" : "No duplicates pending"}
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Protocol Status
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#17324D]">
              v{protocol?.version || 1}
            </span>
            {protocol?.isLocked ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ECFDF3] text-[#18794E]">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FEF7EC] text-[#B7791F]">
                <Unlock className="w-3 h-3" />
                Draft
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#667085] mt-1">
            {inclusionCount} Inklusi · {exclusionCount} Eksklusi
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={`/app/projects/${id}/protocol`}
          className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 hover:border-[#2F7D78] hover:shadow-sm transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#17324D] mb-1">
              1. Protocol & Kriteria Kelayakan
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Atur framework {protocol?.framework || "PICO"}, populasi, intervensi, komparator, serta kriteria inklusi & eksklusi.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-[#2F7D78] mt-2">
            <span>Buka Protocol</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href={`/app/projects/${id}/import`}
          className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 hover:border-[#2F7D78] hover:shadow-sm transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center mb-3">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#17324D] mb-1">
              2. Literature Import Center
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Unggah file referensi dalam format RIS, BibTeX, atau CSV. Rekam search provenance secara otomatis.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-[#2F7D78] mt-2">
            <span>Impor Referensi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href={`/app/projects/${id}/deduplication`}
          className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 hover:border-[#2F7D78] hover:shadow-sm transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center mb-3">
              <CopyCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#17324D] mb-1">
              3. Deduplikasi Bertingkat
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Deteksi kecocokan exact DOI, normalized title, dan fuzzy similarity dengan peninjauan merge non-destruktif.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-[#2F7D78] mt-2">
            <span>Tinjau Duplikat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Protocol Snapshot Summary Box */}
      {protocol && (
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2F7D78]" />
              <h3 className="text-sm font-bold text-[#17324D]">
                Ringkasan Protokol {protocol.framework} (Versi {protocol.version})
              </h3>
            </div>
            <Link
              href={`/app/projects/${id}/protocol`}
              className="text-xs text-[#2F7D78] hover:underline font-semibold"
            >
              Ubah Spesifikasi
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {protocol.framework === "PICO" && (
              <>
                <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E4E7EC]">
                  <span className="font-bold text-[#17324D] block mb-1">
                    [P] Population / Participants:
                  </span>
                  <p className="text-[#667085]">
                    {protocol.picoPopulation || "Belum ditentukan."}
                  </p>
                </div>
                <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E4E7EC]">
                  <span className="font-bold text-[#17324D] block mb-1">
                    [I] Intervention / Exposure:
                  </span>
                  <p className="text-[#667085]">
                    {protocol.picoIntervention || "Belum ditentukan."}
                  </p>
                </div>
                <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E4E7EC]">
                  <span className="font-bold text-[#17324D] block mb-1">
                    [C] Comparison / Control:
                  </span>
                  <p className="text-[#667085]">
                    {protocol.picoComparator || "Belum ditentukan."}
                  </p>
                </div>
                <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E4E7EC]">
                  <span className="font-bold text-[#17324D] block mb-1">
                    [O] Primary & Secondary Outcomes:
                  </span>
                  <p className="text-[#667085]">
                    {protocol.picoOutcome || "Belum ditentukan."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
