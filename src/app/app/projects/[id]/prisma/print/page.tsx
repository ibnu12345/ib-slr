import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getProjectPrismaCounts, getPrismaEvents } from "../../../../../../lib/db";
import { PrismaDiagramView } from "../PrismaDiagramView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StandalonePrismaPrintPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [prismaCounts, events] = await Promise.all([
    getProjectPrismaCounts(id),
    getPrismaEvents(id),
  ]);

  return (
    <div className="min-h-screen bg-white p-6 sm:p-10">
      <PrismaDiagramView
        projectId={id}
        project={project}
        counts={prismaCounts}
        events={events}
      />
    </div>
  );
}
