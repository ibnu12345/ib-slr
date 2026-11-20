import React from "react";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getProtocolByProjectId,
  getCriteriaByProjectId,
  getSearchRunsByProjectId,
  getArticlesByProjectId,
  getExtractedDataRecords,
  getAppraisalRecords,
  getProjectPrismaCounts,
} from "../../../../../../lib/db";
import { ComprehensiveReportView } from "../ComprehensiveReportView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StandaloneReportPrintPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [
    protocol,
    criteria,
    searchRuns,
    articles,
    extractedRecords,
    appraisalRecords,
    prismaCounts,
  ] = await Promise.all([
    getProtocolByProjectId(id),
    getCriteriaByProjectId(id),
    getSearchRunsByProjectId(id),
    getArticlesByProjectId(id),
    getExtractedDataRecords(id),
    getAppraisalRecords(id),
    getProjectPrismaCounts(id),
  ]);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <ComprehensiveReportView
        project={project}
        protocol={protocol}
        criteria={criteria}
        searchRuns={searchRuns}
        articles={articles}
        extractedRecords={extractedRecords}
        appraisalRecords={appraisalRecords}
        prismaCounts={prismaCounts}
      />
    </div>
  );
}
