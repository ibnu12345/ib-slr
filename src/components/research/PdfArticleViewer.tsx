"use client";

import React, { useState, useMemo } from "react";
import { Article, TextSection } from "../../lib/types/research";
import {
  FileText,
  Search,
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Quote,
  Loader2,
  Send,
} from "lucide-react";
import { uploadArticlePdfAction, askArticleEvidenceAction } from "../../lib/ai/actions";
import { AIArticleQAResponse } from "../../lib/types/ai";

interface Props {
  article: Article;
  highlightQuote?: string;
  onQuoteSelected?: (quote: string, pageNumber: number, sectionTitle: string) => void;
}

export function PdfArticleViewer({ article, highlightQuote, onQuoteSelected }: Props) {
  const [activeTab, setActiveTab] = useState<"pages" | "fulltext" | "upload" | "ai_qa">("pages");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchMatch, setActiveSearchMatch] = useState(0);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Q&A state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState<AIArticleQAResponse[]>([]);

  // Sections
  const sections: TextSection[] = useMemo(() => {
    if (article.textSections && article.textSections.length > 0) {
      return article.textSections;
    }
    // Fallback synthesis if sections absent
    return [
      {
        title: "Judul & Abstrak",
        pageNumber: 1,
        content: `${article.title}\n\nPenulis: ${article.authors}\nJurnal: ${article.journal || "N/A"} (${article.publicationYear || "N/A"})\n\nAbstrak:\n${article.abstract || "Abstrak belum tersedia."}`,
      },
      {
        title: "Teks Lengkap Terekstraksi",
        pageNumber: 2,
        content: article.extractedText || "Teks lengkap naskah belum diunggah atau diekstraksi. Silakan unggah file PDF pada tab 'Kelola Dokumen'.",
      },
    ];
  }, [article]);

  const currentSection = sections[currentPageIndex] || sections[0];

  // If a highlightQuote is provided from an external caller, auto-navigate to matching page
  React.useEffect(() => {
    if (highlightQuote && highlightQuote.trim().length > 5) {
      const qLower = highlightQuote.toLowerCase();
      const matchIndex = sections.findIndex((s) => s.content.toLowerCase().includes(qLower.slice(0, 30)));
      if (matchIndex >= 0) {
        setCurrentPageIndex(matchIndex);
        setActiveTab("pages");
      }
    }
  }, [highlightQuote, sections]);

  // Search matches calculation
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim() || !currentSection) return [];
    const text = currentSection.content.toLowerCase();
    const q = searchQuery.toLowerCase();
    const indices: number[] = [];
    let pos = text.indexOf(q);
    while (pos !== -1) {
      indices.push(pos);
      pos = text.indexOf(q, pos + 1);
    }
    return indices;
  }, [searchQuery, currentSection]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadFeedback(null);

    const formData = new FormData();
    formData.append("articleId", article.id);
    if (uploadFile) {
      formData.append("file", uploadFile);
    }
    if (pastedText) {
      formData.append("pastedText", pastedText);
    }

    try {
      const res = await uploadArticlePdfAction(formData);
      if (res.success) {
        setUploadFeedback({
          type: "success",
          message: "Dokumen PDF / naskah berhasil diperbarui dan diproses.",
        });
        setUploadFile(null);
        setPastedText("");
      } else {
        setUploadFeedback({
          type: "error",
          message: res.error || "Gagal mengunggah dokumen.",
        });
      }
    } catch {
      setUploadFeedback({
        type: "error",
        message: "Terjadi kesalahan sistem saat mengunggah dokumen.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    setAsking(true);
    try {
      const res = await askArticleEvidenceAction(article.id, question);
      if (res.success && res.response) {
        setQaHistory([res.response, ...qaHistory]);
        setQuestion("");
      }
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl shadow-sm flex flex-col h-[750px] overflow-hidden">
      {/* Top Document Toolbar */}
      <div className="bg-[#F7F8FA] border-b border-[#E4E7EC] p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#2F7D78]" />
          <span className="text-xs font-bold text-[#17324D] truncate max-w-[280px]">
            {article.pdfFileName || `${article.title.slice(0, 40)}...`}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            {article.ocrQuality === "native" ? "Native PDF Text (100% OCR)" : "OCR Terekstraksi"}
          </span>
          {(() => {
            const cleanDoi = article.doi
              ? article.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim()
              : "";
            return (
              <div className="flex items-center gap-1.5 ml-1">
                {cleanDoi && (
                  <a
                    href={`https://doi.org/${cleanDoi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#2F7D78] border border-[#2F7D78]/30 hover:bg-[#EFF7F6]"
                    title="Buka naskah artikel via tautan resmi DOI"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>DOI</span>
                  </a>
                )}
                <a
                  href={`https://scholar.google.com/scholar?q=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
                  title="Cari naskah PDF di Google Scholar"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google Scholar</span>
                </a>
              </div>
            );
          })()}
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E4E7EC] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("pages")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === "pages" ? "bg-[#17324D] text-white" : "text-[#667085] hover:text-[#17212B]"
            }`}
          >
            Halaman ({sections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fulltext")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === "fulltext" ? "bg-[#17324D] text-white" : "text-[#667085] hover:text-[#17212B]"
            }`}
          >
            Teks Penuh
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai_qa")}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
              activeTab === "ai_qa" ? "bg-[#2F7D78] text-white" : "text-[#2F7D78] hover:text-[#17212B]"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Tanya AI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === "upload" ? "bg-[#17324D] text-white" : "text-[#667085] hover:text-[#17212B]"
            }`}
          >
            Kelola File
          </button>
        </div>
      </div>

      {/* Sub-bar for Page navigation and In-Document Search */}
      {activeTab === "pages" && (
        <div className="bg-[#FFFFFF] border-b border-[#E4E7EC] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPageIndex === 0}
              onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
              className="p-1 rounded border border-[#E4E7EC] disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-[#17212B]">
              Halaman {currentPageIndex + 1} dari {sections.length}
            </span>
            <button
              type="button"
              disabled={currentPageIndex >= sections.length - 1}
              onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
              className="p-1 rounded border border-[#E4E7EC] disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[#667085] ml-2 font-medium">[{currentSection.title}]</span>
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#667085] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari teks di dokumen..."
                className="pl-8 pr-3 py-1 rounded-lg border border-[#E4E7EC] text-xs focus:outline-none focus:border-[#2F7D78] w-48"
              />
            </div>
            {searchQuery && (
              <span className="text-[11px] text-[#667085]">
                {searchMatches.length} kecocokan
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
        {activeTab === "pages" && (
          <div className="max-w-3xl mx-auto bg-white border border-[#E4E7EC] rounded-lg p-8 shadow-sm space-y-6 min-h-[600px]">
            <div className="border-b border-[#E4E7EC] pb-3 flex items-center justify-between text-xs text-[#667085]">
              <span className="font-bold text-[#17324D] uppercase tracking-wider">{currentSection.title}</span>
              <span>HALAMAN {currentSection.pageNumber}</span>
            </div>

            {/* Formatted Scholarly Text */}
            <div className="text-xs sm:text-sm text-[#17212B] leading-relaxed whitespace-pre-line font-serif space-y-4">
              {currentSection.content.split("\n\n").map((paragraph, pIdx) => {
                // Check if paragraph matches external highlightQuote
                const isHighlighted = highlightQuote && paragraph.toLowerCase().includes(highlightQuote.toLowerCase().slice(0, 30));

                return (
                  <p
                    key={pIdx}
                    className={`p-2 rounded transition-colors ${
                      isHighlighted
                        ? "bg-amber-100/80 border-l-4 border-amber-500 font-sans"
                        : "hover:bg-gray-50/70"
                    }`}
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>

            <div className="pt-6 border-t border-[#E4E7EC] flex items-center justify-between text-[11px] text-[#667085]">
              <span>IB-SLR Verified Text View</span>
              <span>DocRef: {article.doi || article.id}</span>
            </div>
          </div>
        )}

        {activeTab === "fulltext" && (
          <div className="max-w-3xl mx-auto bg-white border border-[#E4E7EC] rounded-lg p-8 shadow-sm space-y-8">
            {sections.map((sec, idx) => (
              <div key={idx} className="space-y-3 pb-6 border-b border-[#E4E7EC] last:border-0">
                <div className="flex items-center justify-between text-xs font-bold text-[#17324D]">
                  <span>{sec.title}</span>
                  <span className="text-[#667085] font-normal">Halaman {sec.pageNumber}</span>
                </div>
                <div className="text-xs text-[#17212B] leading-relaxed whitespace-pre-line font-serif">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "ai_qa" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white border border-[#2F7D78]/30 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2F7D78]" />
                <h4 className="text-sm font-bold text-[#17324D]">Tanya Bukti Ilmiah Naskah</h4>
              </div>
              <p className="text-xs text-[#667085]">
                Tanyakan pertanyaan spesifik terkait artikel ini (misal: ukuran sampel, dosis intervensi, p-value, alasan drop-out). AI hanya akan menjawab menggunakan kutipan verbatim dari teks asli.
              </p>

              <form onSubmit={handleAskAI} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ketik pertanyaan ilmiah, cth: Berapa ukuran sampel pada kelompok intervensi?"
                  className="flex-1 px-3 py-2 border border-[#E4E7EC] rounded-lg text-xs focus:outline-none focus:border-[#2F7D78]"
                />
                <button
                  type="submit"
                  disabled={asking || !question.trim()}
                  className="px-4 py-2 rounded-lg bg-[#2F7D78] text-white text-xs font-semibold hover:bg-[#25635f] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {asking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Tanya</span>
                </button>
              </form>
            </div>

            {/* QA Results Stream */}
            <div className="space-y-4">
              {qaHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#667085] bg-white border border-[#E4E7EC] rounded-xl p-6">
                  Belum ada riwayat pertanyaan. Silakan ajukan pertanyaan bukti di atas.
                </div>
              ) : (
                qaHistory.map((item) => (
                  <div key={item.id} className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-sm space-y-3 text-xs">
                    <div className="font-bold text-[#17324D] flex items-center justify-between">
                      <span>Q: {item.question}</span>
                      <span className="text-[10px] text-[#667085] font-normal">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[#17212B] leading-relaxed">
                      {item.answer}
                    </div>

                    {item.citations && item.citations.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider flex items-center gap-1">
                          <Quote className="w-3 h-3 text-[#2F7D78]" />
                          <span>Kutipan Bukti Verbatim:</span>
                        </div>
                        {item.citations.map((c, cIdx) => (
                          <div key={cIdx} className="text-[11px] p-2 rounded bg-amber-50/60 border border-amber-200/60 italic text-[#17212B]">
                            “{c.quote}” (Bagian: {c.section || "Naskah"}, Hal {c.pageNumber})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="max-w-xl mx-auto bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h4 className="text-sm font-bold text-[#17324D]">Kelola & Perbarui File Dokumen</h4>
              <p className="text-xs text-[#667085] mt-1">
                Unggah naskah PDF asli atau masukkan teks hasil OCR untuk dievaluasi oleh asisten AI dan diekstraksi datanya.
              </p>
            </div>

            {uploadFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  uploadFeedback.type === "success"
                    ? "bg-[#ECFDF3] border border-[#18794E]/30 text-[#18794E]"
                    : "bg-[#FEF3F2] border border-[#B42318]/30 text-[#B42318]"
                }`}
              >
                {uploadFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{uploadFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B]">File PDF Naskah (.pdf, Maks. 25MB)</label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#667085] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#17324D] file:text-white hover:file:bg-[#12273D] border border-[#E4E7EC] rounded-lg p-2"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E4E7EC]"></div>
                <span className="flex-shrink mx-3 text-[10px] text-[#667085] uppercase font-bold">atau tempel teks</span>
                <div className="flex-grow border-t border-[#E4E7EC]"></div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B]">Salinan Teks Lengkap Artikel</label>
                <textarea
                  rows={5}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Tempel teks lengkap (Introduction, Methods, Results, Discussion)..."
                  className="w-full px-3 py-2 border border-[#E4E7EC] rounded-lg text-xs focus:outline-none focus:border-[#2F7D78]"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || (!uploadFile && !pastedText.trim())}
                className="w-full py-2.5 rounded-lg bg-[#17324D] text-white text-xs font-semibold hover:bg-[#12273D] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploading ? "Memproses Dokumen..." : "Simpan & Proses Naskah"}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
