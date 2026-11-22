import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getAllArticles, getAllCategories } from "../../lib/blog/articles";
import { AdSenseBanner } from "../../components/ads/AdSenseBanner";
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  BookmarkCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Panduan Metodologi Riset & PRISMA 2020 | Blog IB-SLR",
  description:
    "Pusat edukasi dan panduan komprehensif Systematic Literature Review (SLR), standar PRISMA 2020, strategi pencarian Boolean, uji Cohen's Kappa, dan publikasi jurnal Scopus.",
  keywords: [
    "Systematic Literature Review",
    "PRISMA 2020",
    "Cohen's Kappa",
    "RoB 2",
    "Boolean Search",
    "Scopus Q1",
    "Metodologi Riset",
  ],
};

export default function BlogIndexPage() {
  const articles = getAllArticles();
  const categories = getAllCategories();
  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  const adsenseClientId = "ca-pub-4685484644548395";

  return (
    <div className="w-full min-h-screen bg-[#F7F8FA] pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#EFF7F6] to-[#F7F8FA] border-b border-[#E4E7EC] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#2F7D78] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#2F7D78]/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>IB-SLR Knowledge Hub & Research Academy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#17324D] tracking-tight max-w-4xl mx-auto leading-tight">
            Panduan Komprehensif <span className="text-[#2F7D78]">Systematic Review</span> & Standar PRISMA 2020
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#667085] max-w-2xl mx-auto leading-relaxed">
            Kumpulan artikel metodologi, strategi pencarian database ilmiah, penilaian risiko bias (RoB 2), dan panduan publikasi jurnal internasional bereputasi.
          </p>

          {/* Quick Categories Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <span className="text-xs text-[#667085] font-medium mr-2">Topik Populer:</span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-white text-[#17324D] border border-[#E4E7EC] shadow-2xs hover:border-[#2F7D78] transition-colors cursor-default"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Top Compliant AdSense Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AdSenseBanner
          clientId={adsenseClientId}
          slotId="1234567890"
          format="horizontal"
          className="my-2"
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Featured Article Card */}
        {featuredArticle && (
          <div className="mb-14">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2F7D78] uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Artikel Utama Pilihan Editor</span>
            </div>

            <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-sm hover:shadow-md transition-shadow overflow-hidden p-6 sm:p-10 flex flex-col lg:flex-row gap-8 items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#EFF7F6] text-[#2F7D78] border border-[#2F7D78]/20">
                    {featuredArticle.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{featuredArticle.publishedAt}</span>
                  </div>
                </div>

                <Link href={`/blog/${featuredArticle.slug}`}>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#17324D] hover:text-[#2F7D78] transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>
                </Link>

                <p className="mt-3 text-sm text-[#475467] leading-relaxed line-clamp-3">
                  {featuredArticle.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-6">
                  {featuredArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded text-[11px] bg-[#F2F4F7] text-[#344054] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-[#F2F4F7] flex items-center justify-between">
                  <div className="text-xs text-[#475467]">
                    Oleh: <span className="font-semibold text-[#17324D]">{featuredArticle.author.name}</span>
                    <span className="text-[#98A2B3] ml-2">({featuredArticle.author.role})</span>
                  </div>

                  <Link
                    href={`/blog/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F7D78] hover:bg-[#266662] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Baca Panduan Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Articles Section */}
        <div>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E4E7EC]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#17324D]">
              Semua Artikel & Panduan Akademik
            </h2>
            <span className="text-xs text-[#667085]">
              Menampilkan {regularArticles.length} artikel terkurasi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {regularArticles.map((article) => (
              <article
                key={article.slug}
                className="bg-white rounded-xl border border-[#E4E7EC] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-6 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#EFF7F6] text-[#2F7D78]">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-[#667085]">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  <Link href={`/blog/${article.slug}`}>
                    <h3 className="text-base sm:text-lg font-bold text-[#17324D] group-hover:text-[#2F7D78] transition-colors leading-snug">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="mt-2.5 text-xs sm:text-sm text-[#475467] leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F2F4F7]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#98A2B3]">{article.publishedAt}</span>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F7D78] hover:text-[#266662] transition-colors"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Academic Resource Callout Box */}
        <div className="mt-16 bg-[#17324D] rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/10 text-[#54BAB9] text-xs font-semibold uppercase tracking-wider">
              Platform SLR Berstandar PRISMA 2020
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 leading-snug">
              Siap Menjalankan Systematic Literature Review Anda?
            </h3>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              Manfaatkan mesin deduplikasi DOI otomatis, dual-reviewer screening dengan kalkulasi Cohen&apos;s Kappa, dan generator diagram alir PRISMA 2020 langsung di IB-SLR.
            </p>
          </div>
          <Link
            href="/register"
            className="px-6 py-3.5 rounded-xl bg-[#2F7D78] hover:bg-[#266662] text-white font-semibold text-xs sm:text-sm shrink-0 transition-colors shadow-md"
          >
            Mulai 1 Proyek Gratis
          </Link>
        </div>
      </main>
    </div>
  );
}
