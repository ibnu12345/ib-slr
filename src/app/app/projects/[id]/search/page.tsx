import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getSearchRunsByProjectId } from "../../../../../lib/db";
import { SearchRunLogger } from "./SearchRunLogger";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectSearchPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const searchRuns = await getSearchRunsByProjectId(id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC]">
        <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
          Rekam Jejak Pencarian Literatur (Search Strategy & Provenance)
        </h2>
        <p className="text-xs text-[#667085] mt-1">
          Dokumentasikan query persis, database sumber, filter, dan jumlah artikel yang ditemukan sesuai standar Cochrane & PRISMA.
        </p>
      </div>

      <SearchRunLogger projectId={id} initialRuns={searchRuns} />
    </div>
  );
}
