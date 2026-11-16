import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getDuplicateCandidates, getArticlesByProjectId } from "../../../../../lib/db";
import { DeduplicationStudio } from "./DeduplicationStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDeduplicationPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [candidates, articles] = await Promise.all([
    getDuplicateCandidates(id),
    getArticlesByProjectId(id),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC]">
        <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
          Studio Deduplikasi Literatur (Duplicate Candidate Review)
        </h2>
        <p className="text-xs text-[#667085] mt-1">
          Identifikasi duplikat bertingkat: kecocokan persis DOI, normalisasi judul, dan kesamaan fonetik/fuzzy dengan verifikasi manusia (*human-in-the-loop*).
        </p>
      </div>

      <DeduplicationStudio
        projectId={id}
        initialCandidates={candidates}
        totalArticles={articles.length}
      />
    </div>
  );
}
