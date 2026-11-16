import React from "react";
import Link from "next/link";
import { getAllPages } from "../../../../lib/db";
import { FileEdit, ExternalLink, ArrowRight, Eye, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPagesListPage() {
  const pages = await getAllPages();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            Pages & Section Management
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Edit live copy, feature grids, pricing tables, and SEO fields for all public routes.
          </p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Page Title & Slug</th>
                <th className="py-3 px-4">Sections</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {pages.map((p) => {
                const editSlug = p.slug === "/" ? "home" : p.slug.replace(/^\//, "");
                return (
                  <tr key={p.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#17212B] text-sm">{p.title}</div>
                      <div className="font-mono text-[11px] text-[#2F7D78]">{p.slug}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#17212B]">
                      {p.sections.length} blocks
                    </td>
                    <td className="py-3.5 px-4">
                      {p.status === "published" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF3] text-[#18794E]">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF7EC] text-[#B7791F]">
                          <Clock className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#667085]">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={p.slug}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#E4E7EC] hover:bg-white text-[11px] font-semibold text-[#667085] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </Link>
                      <Link
                        href={`/admin/content/pages/${editSlug}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#17324D] hover:bg-[#12273D] text-[11px] font-semibold text-white transition-colors"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>Edit Sections</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
