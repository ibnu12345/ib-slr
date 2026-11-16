import React from "react";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getArticlesByProjectId,
  getCriteriaByProjectId,
  getExclusionReasons,
  getProtocolByProjectId,
} from "../../../../../../lib/db";
import { ScreeningStudio } from "../title-abstract/ScreeningStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FullTextScreeningPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [articles, criteria, exclusionReasons, protocol] = await Promise.all([
    getArticlesByProjectId(id),
    getCriteriaByProjectId(id),
    getExclusionReasons(id, "full_text"),
    getProtocolByProjectId(id),
  ]);

  // Full-text stage evaluates articles that were not excluded at title/abstract
  const fullTextCandidates = articles.filter((a) => a.screeningStatus !== "excluded");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
            Tahap 2: Screening Teks Lengkap (Full-Text Eligibility)
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Penilaian kelayakan terhadap naskah artikel lengkap (*reports assessed for eligibility*). Alasan eksklusi wajib dicatat untuk PRISMA 2020.
          </p>
        </div>
      </div>

      <ScreeningStudio
        projectId={id}
        stage="full_text"
        articles={fullTextCandidates}
        criteria={criteria}
        exclusionReasons={exclusionReasons}
        protocol={protocol}
      />
    </div>
  );
}
