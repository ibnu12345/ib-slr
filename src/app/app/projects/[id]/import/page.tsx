import React from "react";
import { notFound } from "next/navigation";
import { getProjectById } from "../../../../../lib/db";
import { ImportCenter } from "./ImportCenter";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectImportPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC]">
        <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
          Pusat Impor Literatur (Reference Import Center)
        </h2>
        <p className="text-xs text-[#667085] mt-1">
          Unggah file referensi bibliografis dari database riset (PubMed, Scopus, WoS, EndNote, Zotero) dalam format RIS, BibTeX, atau CSV.
        </p>
      </div>

      <ImportCenter projectId={id} />
    </div>
  );
}
