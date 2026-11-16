import React from "react";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getArticlesByProjectId,
  getExtractedDataRecords,
  getAppraisalRecords,
  getManuscriptByProjectId,
  getTableDefinitions,
  getProjectPrismaCounts,
} from "../../../../../lib/db";
import { PublicationStudio } from "./PublicationStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicationPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [articles, extractedRecords, appraisalRecords, manuscript, tableDefs, prismaCounts] =
    await Promise.all([
      getArticlesByProjectId(id),
      getExtractedDataRecords(id),
      getAppraisalRecords(id),
      getManuscriptByProjectId(id),
      getTableDefinitions(id),
      getProjectPrismaCounts(id),
    ]);

  return (
    <div className="space-y-6">
      <PublicationStudio
        project={project}
        articles={articles}
        extractedRecords={extractedRecords}
        appraisalRecords={appraisalRecords}
        initialManuscript={manuscript}
        initialTableDefinitions={tableDefs}
        prismaCounts={prismaCounts}
      />
    </div>
  );
}
