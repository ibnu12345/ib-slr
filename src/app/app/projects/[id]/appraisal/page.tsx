import React from "react";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getArticlesByProjectId,
  getAppraisalRecords,
} from "../../../../../lib/db";
import { standardAppraisalFrameworks } from "../../../../../lib/appraisal/frameworks";
import { AppraisalStudio } from "./AppraisalStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QualityAppraisalPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [articles, appraisalRecords] = await Promise.all([
    getArticlesByProjectId(id),
    getAppraisalRecords(id),
  ]);

  // Evaluated articles are included studies after full text review
  const fullTextIncluded = articles.filter((a) => a.fullTextStatus === "included");
  const fallbackIncluded = articles.filter(
    (a) =>
      (a.titleAbstractStatus === "included" || a.screeningStatus === "included") &&
      a.fullTextStatus !== "excluded"
  );
  const eligibleArticles = fullTextIncluded.length > 0 ? fullTextIncluded : fallbackIncluded;

  return (
    <div className="space-y-6">
      <AppraisalStudio
        projectId={id}
        articles={eligibleArticles.length > 0 ? eligibleArticles : articles}
        frameworks={standardAppraisalFrameworks}
        initialRecords={appraisalRecords}
      />
    </div>
  );
}
