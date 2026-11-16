import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getProtocolByProjectId, getCriteriaByProjectId } from "../../../../../lib/db";
import { ProtocolEditor } from "./ProtocolEditor";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectProtocolPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [protocol, criteria] = await Promise.all([
    getProtocolByProjectId(id),
    getCriteriaByProjectId(id),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
            Protocol Builder & Kriteria Kelayakan (Eligibility Criteria)
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Rumuskan pertanyaan penelitian secara terstruktur dan tetapkan batasan inklusi & eksklusi yang terkunci.
          </p>
        </div>
      </div>

      <ProtocolEditor
        projectId={id}
        initialProtocol={protocol}
        initialCriteria={criteria}
      />
    </div>
  );
}
