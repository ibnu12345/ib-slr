import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getScreeningConflicts, getExclusionReasons } from "../../../../../lib/db";
import { ConflictAdjudicationStudio } from "./ConflictAdjudicationStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectConflictsPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [openConflicts, resolvedConflicts, exclusionReasons] = await Promise.all([
    getScreeningConflicts(id, "open"),
    getScreeningConflicts(id, "resolved"),
    getExclusionReasons(id),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC]">
        <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
          Resolusi Konflik & Adjudikasi Dual-Reviewer (Conflict Adjudication)
        </h2>
        <p className="text-xs text-[#667085] mt-1">
          Penyelesaian perbedaan keputusan antara dua peninjau independen (*blinded reviewers*) dengan justifikasi ilmiah dan rekam jejak audit.
        </p>
      </div>

      <ConflictAdjudicationStudio
        projectId={id}
        initialOpenConflicts={openConflicts}
        initialResolvedConflicts={resolvedConflicts}
        exclusionReasons={exclusionReasons}
      />
    </div>
  );
}
