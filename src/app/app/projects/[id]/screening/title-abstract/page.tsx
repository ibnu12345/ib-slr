import React from "react";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getArticlesByProjectId,
  getCriteriaByProjectId,
  getExclusionReasons,
  getProtocolByProjectId,
} from "../../../../../../lib/db";
import { ScreeningStudio } from "./ScreeningStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TitleAbstractScreeningPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [articles, criteria, exclusionReasons, protocol] = await Promise.all([
    getArticlesByProjectId(id),
    getCriteriaByProjectId(id),
    getExclusionReasons(id, "title_abstract"),
    getProtocolByProjectId(id),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
            Tahap 1: Screening Judul & Abstrak (Title & Abstract)
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Tinjau artikel berdasarkan kriteria kelayakan protokol. Gunakan tombol aksi atau hotkey keyboard untuk mempercepat penyaringan.
          </p>
        </div>
      </div>

      <ScreeningStudio
        projectId={id}
        stage="title_abstract"
        articles={articles}
        criteria={criteria}
        exclusionReasons={exclusionReasons}
        protocol={protocol}
      />
    </div>
  );
}
