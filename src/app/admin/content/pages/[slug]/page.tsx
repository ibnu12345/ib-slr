import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPageBySlug } from "../../../../../lib/db";
import { PageSectionEditor } from "./PageSectionEditor";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminPageEditorView({ params }: Props) {
  const { slug } = await params;
  const lookupSlug = slug === "home" ? "/" : `/${slug}`;
  const page = await getPageBySlug(lookupSlug, true);

  if (!page) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
        <div className="space-y-1">
          <Link
            href="/admin/content/pages"
            className="inline-flex items-center gap-1 text-xs text-[#2F7D78] hover:underline font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Pages</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            Editing: {page.title}
          </h1>
          <p className="text-xs text-[#667085] font-mono">Route: {page.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={page.slug}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] hover:bg-white text-xs font-semibold text-[#17212B] transition-colors"
          >
            <span>Preview Live Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#667085]" />
          </Link>
        </div>
      </div>

      <PageSectionEditor page={page} />
    </div>
  );
}
