import React from "react";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getArticlesByProjectId,
  getThematicCodes,
  getThematicExcerpts,
  getSynthesisSummary,
} from "../../../../../lib/db";
import { SynthesisStudio } from "./SynthesisStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EvidenceSynthesisPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [articles, codes, excerpts, summary] = await Promise.all([
    getArticlesByProjectId(id),
    getThematicCodes(id),
    getThematicExcerpts(id),
    getSynthesisSummary(id),
  ]);

  return (
    <div className="space-y-6">
      <SynthesisStudio
        projectId={id}
        articles={articles}
        initialCodes={codes}
        initialExcerpts={excerpts}
        summary={summary}
      />
    </div>
  );
}
