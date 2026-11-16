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

  // Evaluated articles are included articles or articles in library
  const eligibleArticles = articles.filter(
    (a) => a.screeningStatus === "included" || a.screeningStatus === "pending" || a.screeningStatus === "unclear"
  );

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
