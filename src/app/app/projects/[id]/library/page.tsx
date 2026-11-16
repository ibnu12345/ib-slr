import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getArticlesByProjectId } from "../../../../../lib/db";
import { LibraryTable } from "./LibraryTable";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectLibraryPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const articles = await getArticlesByProjectId(id);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#17324D]">
            Perpustakaan Referensi (Reference Library)
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Daftar master artikel yang telah diimpor dan siap masuk ke tahap screening title/abstract dan full-text.
          </p>
        </div>
      </div>

      <LibraryTable projectId={id} initialArticles={articles} />
    </div>
  );
}
