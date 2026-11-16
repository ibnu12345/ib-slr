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

  // Candidates for extraction are included articles or pending/unclear if early extraction
  const eligibleArticles = articles.filter(
    (a) => a.screeningStatus === "included" || a.screeningStatus === "pending" || a.screeningStatus === "unclear"
  );

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
