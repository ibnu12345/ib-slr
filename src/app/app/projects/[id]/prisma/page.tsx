import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getProjectPrismaCounts, getPrismaEvents } from "../../../../../lib/db";
import { PrismaDiagramView } from "./PrismaDiagramView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPrismaPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [prismaCounts, events] = await Promise.all([
    getProjectPrismaCounts(id),
    getPrismaEvents(id),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-full">
      <div className="no-print pb-4 border-b border-[#E4E7EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
            Diagram Alur PRISMA 2020 (Event-Driven Flow Diagram)
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Dihitung secara deterministik dari audit ledger alur kerja aktual. Tidak ada angka yang direkayasa atau diestimasi (*zero fabrication*).
          </p>
        </div>
      </div>

      <PrismaDiagramView
        projectId={id}
        project={project}
        counts={prismaCounts}
        events={events}
      />
    </div>
  );
}
