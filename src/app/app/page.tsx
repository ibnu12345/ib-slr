import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "../../lib/auth/session";
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
} from "lucide-react";

export default async function AppDashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
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

      {/* Workspace Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Active Reviews
          </div>
          <div className="text-2xl font-bold text-[#17324D]">1</div>
          <div className="text-[11px] text-[#2F7D78] mt-1 font-medium">
            Protocol locked & verified
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1">
            Imported References
          </div>
          <div className="text-2xl font-bold text-[#17324D]">428</div>
          <div className="text-[11px] text-[#667085] mt-1">Across 3 database searches</div>
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
          {/* Default Research Project Record */}
          <div className="p-6 hover:bg-[#F7F8FA] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF3] text-[#18794E]">
                  Active
                </span>
                <span className="text-xs font-mono text-[#667085]">PRISMA-2026-001</span>
              </div>
              <h3 className="text-base font-bold text-[#17212B]">
                Effectiveness of Digital Health Interventions on Glycemic Control in Type 2 Diabetes
              </h3>
              <p className="text-xs text-[#667085] line-clamp-2">
                PICO: Population: Adults with Type 2 Diabetes; Intervention: AI/Smartphone digital therapeutics; Comparator: Standard clinical care; Outcome: HbA1c reduction.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085] pt-1">
                <span>PICO Framework</span>
                <span>•</span>
                <span>PubMed, Crossref, Scopus</span>
                <span>•</span>
                <span>Updated 2 hours ago</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/app/projects/demo-1/overview"
                className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] hover:bg-white text-xs font-semibold text-[#17324D] transition-colors"
              >
                View Protocol
              </Link>
              <Link
                href="/app/projects/demo-1/screening/title-abstract"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-xs font-semibold text-white transition-colors"
              >
                <span>Continue Screening</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
