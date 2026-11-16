import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "../../../../lib/auth/session";
import { getProjectById } from "../../../../lib/db";
import { ProjectNavTabs } from "./ProjectNavTabs";
import { ArrowLeft, BookOpen, ShieldCheck, Lock } from "lucide-react";
import { LanguageSwitcher } from "../../../../components/i18n/LanguageSwitcher";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export default async function ProjectLayout({ params, children }: Props) {
  const { id } = await params;
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const project = await getProjectById(id);
  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2 text-xs text-[#667085]">
          <Link href="/app" className="hover:text-[#17212B] flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#17324D] truncate max-w-sm">
            {project.title}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher variant="compact" />
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-[#EFF7F6] text-[#2F7D78] border border-[#2F7D78]/20">
            {project.reviewType.replace("_", " ")}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ECFDF3] text-[#18794E]">
            {project.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Project Title Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17324D]">
          {project.title}
        </h1>
        {project.description && (
          <p className="text-xs sm:text-sm text-[#667085] mt-1 max-w-4xl leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <ProjectNavTabs projectId={project.id} />

      {/* Page Canvas */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
