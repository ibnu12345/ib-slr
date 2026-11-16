"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Article } from "../../../../../lib/types/research";
import {
  Search,
  Filter,
  Eye,
  ExternalLink,
  BookOpen,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";

interface Props {
  projectId: string;
  initialArticles: Article[];
}

export function LibraryTable({ projectId, initialArticles }: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = articles.filter((art) => {
    if (statusFilter !== "all" && art.screeningStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchAuthor = art.authors.toLowerCase().includes(q);
      const matchJournal = art.journal?.toLowerCase().includes(q);
      const matchDoi = art.doi?.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchJournal || matchDoi;
    }
    return true;
  });

  const getStatusBadge = (status: Article["screeningStatus"]) => {
    switch (status) {
      case "included":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#18794E]">
            <CheckCircle2 className="w-3 h-3" />
            INCLUDED
          </span>
        );
      case "excluded":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3F2] text-[#B42318]">
            EXCLUDED
          </span>
        );
      case "conflict":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7EC] text-[#B7791F]">
            <AlertTriangle className="w-3 h-3" />
            CONFLICT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7F8FA] border border-[#E4E7EC] text-[#667085]">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, penulis, jurnal, atau DOI..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E4E7EC] rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#667085] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-[#E4E7EC] rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="all">Semua Status ({articles.length})</option>
            <option value="pending">Pending Screening</option>
            <option value="included">Included</option>
            <option value="excluded">Excluded</option>
            <option value="conflict">Conflict</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Artikel / Judul & Penulis</th>
                <th className="py-3 px-4">Tahun / Jurnal</th>
                <th className="py-3 px-4">DOI / Identifiers</th>
                <th className="py-3 px-4">Sumber Database</th>
                <th className="py-3 px-4">Screening</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#667085]">
                    Tidak ada referensi yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-bold text-[#17212B] text-xs leading-snug line-clamp-2">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-[#667085] truncate mt-0.5">
                        {art.authors}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#17212B]">
                      <div className="font-semibold">{art.publicationYear || "N/A"}</div>
                      <div className="text-[11px] text-[#667085] truncate max-w-[140px]">
                        {art.journal || "Journal not specified"}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#2F7D78]">
                      {art.doi ? (
                        <a
                          href={`https://doi.org/${art.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1 max-w-[140px] truncate"
                        >
                          <span>{art.doi}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-gray-400">No DOI</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[11px] text-[#667085]">
                      {art.sourceDatabase || "Direct Import"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(art.screeningStatus)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(art)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFF7F6] border border-[#2F7D78]/25 text-[11px] font-semibold text-[#2F7D78] hover:bg-[#D8EDE9] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article Detail Drawer / Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-[#E4E7EC] shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[#E4E7EC] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2F7D78] block">
                  Detail Rekam Literatur
                </span>
                <h3 className="text-base font-bold text-[#17324D] leading-snug mt-0.5">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="text-gray-400 hover:text-[#17212B] p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F8FA] rounded-lg border border-[#E4E7EC]">
                <div>
                  <span className="text-[#667085] block font-medium">Penulis / Authors:</span>
                  <span className="font-semibold text-[#17212B]">{selectedArticle.authors}</span>
                </div>
                <div>
                  <span className="text-[#667085] block font-medium">Jurnal / Publikasi:</span>
                  <span className="font-semibold text-[#17212B]">
                    {selectedArticle.journal || "N/A"} ({selectedArticle.publicationYear || "N/A"})
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block font-medium">Digital Object Identifier (DOI):</span>
                  <span className="font-mono text-[#2F7D78]">{selectedArticle.doi || "None"}</span>
                </div>
                <div>
                  <span className="text-[#667085] block font-medium">Sumber Provenance:</span>
                  <span className="font-semibold text-[#17212B]">{selectedArticle.sourceDatabase || "Import"}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#17324D] block mb-1">Abstrak Studi (Abstract):</span>
                <div className="p-4 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17212B] leading-relaxed max-h-60 overflow-y-auto text-xs">
                  {selectedArticle.abstract || "Abstrak tidak dilaporkan dalam file import metadata."}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4E7EC] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 rounded-lg bg-[#17324D] text-white text-xs font-semibold hover:bg-[#12273D] transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
