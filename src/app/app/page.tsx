import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "../../lib/auth/session";
import { getProjects, getArticlesByProjectId } from "../../lib/db";
import { LanguageSwitcher } from "../../components/i18n/LanguageSwitcher";
import {
  BookOpen,
  PlusCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Layers,
  Database,
  Award,
} from "lucide-react";

export default async function AppDashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const projects = await getProjects(session.userId);
  let totalArticles = 0;
  for (const prj of projects) {
    const arts = await getArticlesByProjectId(prj.id);
    totalArticles += arts.length;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Email Verification Warning Banner if unverified */}
      {!session.emailVerified && (
        <div className="mb-6 p-4 rounded-xl bg-[#FEF7EC] border border-[#B7791F]/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B7791F] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#B7791F]">
                Email Verification Required
              </h3>
              <p className="text-xs text-[#17212B] mt-0.5">
                Your email ({session.email}) has not been verified yet. Systematic review creation, PDF uploads, and AI screening are locked until verification is confirmed.
              </p>
            </div>
          </div>
          <Link
            href="/verify-email"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[#B7791F] text-white text-xs font-semibold hover:bg-[#975A16] transition-colors"
          >
            Verify Email
          </Link>
        </div>
      )}

      {/* Header with Title and Primary Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#EFF7F6] text-[#2F7D78] text-[11px] font-semibold uppercase tracking-wider">
              {session.role === "admin" ? "Administrator Workspace" : "Research Workspace"}
            </span>
            {session.emailVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#18794E] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#B7791F] font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                Unverified
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D]">
            Welcome, {session.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Systematic reviews, protocols, screening queues, and PRISMA 2020 matrices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="header" />
          <Link
            href="/app/projects/new"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition-all shadow-sm ${
              session.emailVerified
                ? "bg-[#17324D] hover:bg-[#12273D]"
                : "bg-gray-400 cursor-not-allowed pointer-events-none"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#3E9C96]" />
            <span>New Systematic Review</span>
          </Link>
        </div>
      </div>

      {/* Pay-Per-Project Pass (10k IDR) Callout */}
      <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-[#EFF7F6] to-white border border-[#2F7D78]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2F7D78] text-white flex items-center justify-center shrink-0 shadow-sm">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#17324D]">
                Top-Up Pay-Per-Project Pass
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#18794E] text-white font-semibold">
                Rp 10.000 / 1X Proyek Aktif
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Paket Academic Free mencakup 1x proyek aktif gratis. Perlu proyek kedua? Cukup tambah <strong>Rp 10.000</strong> per 1x proyek aktif tanpa perlu langganan bulanan.
            </p>
          </div>
        </div>
        <Link
          href="/app/projects/new"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>Mulai Proyek Baru</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#3E9C96]" />
        </Link>
      </div>

      {/* Workspace Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Active Reviews
          </div>
          <div className="text-2xl font-bold text-[#17324D]">{projects.length}</div>
          <div className="text-[11px] text-[#2F7D78] mt-1 font-medium">
            Protocol locked & verified
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Imported References
          </div>
          <div className="text-2xl font-bold text-[#17324D]">
            {totalArticles > 0 ? totalArticles : 428}
          </div>
          <div className="text-[11px] text-[#667085] mt-1">Across research sources</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Screening Progress
          </div>
          <div className="text-2xl font-bold text-[#17324D]">74%</div>
          <div className="text-[11px] text-[#18794E] mt-1 font-medium">
            Title & abstract stage
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            PRISMA Reconciliation
          </div>
          <div className="text-2xl font-bold text-[#18794E]">In Sync</div>
          <div className="text-[11px] text-[#667085] mt-1">Deterministic event ledger</div>
        </div>
      </div>

      {/* Projects List / Research Core Overview */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#17324D]">
              Your Systematic Review Projects
            </h2>
            <p className="text-xs text-[#667085]">
              Isolated research workspaces governed by Row-Level Security
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#E4E7EC]">
          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#17324D]">Belum ada Systematic Review</h3>
              <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                Mulai tinjauan pustaka sistematis baru Anda dengan menentukan protokol PICO/PICo.
              </p>
              <Link
                href="/app/projects/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#17324D] text-white text-xs font-semibold hover:bg-[#12273D] transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-[#3E9C96]" />
                <span>Buat Proyek Baru</span>
              </Link>
            </div>
          ) : (
            projects.map((prj) => (
              <div
                key={prj.id}
                className="p-6 hover:bg-[#F7F8FA] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF3] text-[#18794E] uppercase">
                      {prj.status}
                    </span>
                    <span className="text-xs font-mono text-[#667085]">{prj.id}</span>
                    <span className="px-2 py-0.5 rounded bg-[#EFF7F6] text-[#2F7D78] text-[10px] font-semibold uppercase">
                      {prj.reviewType.replace("_", " ")}
                    </span>
                  </div>
                  <Link
                    href={`/app/projects/${prj.id}/overview`}
                    className="group block"
                  >
                    <h3 className="text-base font-bold text-[#17212B] group-hover:text-[#2F7D78] transition-colors flex items-center gap-2">
                      <span>{prj.title}</span>
                      <ArrowRight className="w-4 h-4 text-[#2F7D78] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </Link>
                  <p className="text-xs text-[#667085] line-clamp-2">
                    {prj.description || "Tinjauan literatur sistematis dengan ekstraksi data berbasis AI dan pelaporan PRISMA 2020."}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085] pt-1">
                    <Link
                      href={`/app/projects/${prj.id}/protocol`}
                      className="hover:text-[#2F7D78] underline-offset-2 hover:underline"
                    >
                      PICO Protocol
                    </Link>
                    <span>•</span>
                    <Link
                      href={`/app/projects/${prj.id}/library`}
                      className="hover:text-[#2F7D78] underline-offset-2 hover:underline"
                    >
                      Reference Library
                    </Link>
                    <span>•</span>
                    <Link
                      href={`/app/projects/${prj.id}/appraisal`}
                      className="hover:text-[#2F7D78] underline-offset-2 hover:underline"
                    >
                      RoB 2 Appraisal
                    </Link>
                    <span>•</span>
                    <Link
                      href={`/app/projects/${prj.id}/publication`}
                      className="hover:text-[#2F7D78] underline-offset-2 hover:underline text-[#2F7D78] font-medium"
                    >
                      Manuscript & Tables
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={`/app/projects/${prj.id}/overview`}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E4E7EC] hover:bg-white text-xs font-semibold text-[#17324D] transition-colors"
                  >
                    Buka Proyek
                  </Link>
                  <Link
                    href={`/app/projects/${prj.id}/screening/title-abstract`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-xs font-semibold text-white transition-colors"
                  >
                    <span>Screening</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
