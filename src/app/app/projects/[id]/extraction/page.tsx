import React from "react";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getArticlesByProjectId,
  getExtractionTemplates,
  getExtractedDataRecords,
} from "../../../../../lib/db";
import { ExtractionStudio } from "./ExtractionStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DataExtractionPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [articles, templates, extractedRecords] = await Promise.all([
    getArticlesByProjectId(id),
    getExtractionTemplates(id),
    getExtractedDataRecords(id),
  ]);

  // Downstream pipeline evaluates studies that passed screening:
  // Prefer studies included after full-text screening; if full-text not started, fallback to Stage 1 included
  const fullTextIncluded = articles.filter((a) => a.fullTextStatus === "included");
  const fallbackIncluded = articles.filter(
    (a) =>
      (a.titleAbstractStatus === "included" || a.screeningStatus === "included") &&
      a.fullTextStatus !== "excluded"
  );
  const eligibleArticles = fullTextIncluded.length > 0 ? fullTextIncluded : fallbackIncluded;

  return (
    <div className="space-y-6">
      <ExtractionStudio
        projectId={id}
        articles={eligibleArticles.length > 0 ? eligibleArticles : articles}
        templates={templates}
        initialRecords={extractedRecords}
      />
    </div>
  );
}
