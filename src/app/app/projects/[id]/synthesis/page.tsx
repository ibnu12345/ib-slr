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

  // Studies included in synthesis
  const fullTextIncluded = articles.filter((a) => a.fullTextStatus === "included");
  const fallbackIncluded = articles.filter(
    (a) =>
      (a.titleAbstractStatus === "included" || a.screeningStatus === "included") &&
      a.fullTextStatus !== "excluded"
  );
  const eligibleArticles = fullTextIncluded.length > 0 ? fullTextIncluded : fallbackIncluded;

  return (
    <div className="space-y-6">
      <SynthesisStudio
        projectId={id}
        articles={eligibleArticles.length > 0 ? eligibleArticles : articles}
        initialCodes={codes}
        initialExcerpts={excerpts}
        summary={summary}
      />
    </div>
  );
}
