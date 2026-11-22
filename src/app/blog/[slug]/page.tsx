import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug, getRelatedArticles, getAllArticles } from "../../../lib/blog/articles";
import { ArticleContentRenderer } from "../../../components/blog/ArticleContentRenderer";
import { AdSenseBanner } from "../../../components/ads/AdSenseBanner";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan | IB-SLR" };
  }

  return {
    title: `${article.title} | IB-SLR Knowledge Hub`,
    description: article.excerpt,
    keywords: article.tags,
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags,
    },
  };
}

export default async function SingleArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(article.slug, article.category);
  const adsenseClientId = "ca-pub-4685484644548395";

  // Schema.org Article Structured Data for Google Rich Snippets & AdSense Quality
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "IB-SLR Academic Research Platform",
      logo: {
        "@type": "ImageObject",
        url: "https://ib-slr-app.vercel.app/logo-icon.png",
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    keywords: article.tags.join(", "),
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F8FA] pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Article Header & Navigation */}
      <div className="bg-white border-b border-[#E4E7EC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#667085] mb-6">
            <Link href="/" className="hover:text-[#17324D] transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#17324D] transition-colors">
              Blog & Panduan
            </Link>
            <span>/</span>
            <span className="text-[#17324D] font-medium truncate max-w-xs sm:max-w-md">
              {article.category}
            </span>
          </nav>

          {/* Category Badge & Metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF7F6] text-[#2F7D78] border border-[#2F7D78]/20">
              {article.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-[#667085]">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#667085]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Diterbitkan: {article.publishedAt}</span>
            </div>
          </div>

          {/* Article Main Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#17324D] tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#475467] leading-relaxed">
            {article.excerpt}
          </p>

          {/* Author Card */}
          <div className="mt-8 pt-6 border-t border-[#F2F4F7] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EFF7F6] border border-[#2F7D78]/30 flex items-center justify-center font-bold text-[#2F7D78] text-sm">
                IB
              </div>
              <div>
                <div className="text-sm font-bold text-[#17324D]">
                  {article.author.name}
                </div>
                <div className="text-xs text-[#667085]">
                  {article.author.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-medium text-[#344054] hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Blog</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner AdSense Placement */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AdSenseBanner
          clientId={adsenseClientId}
          slotId="1234567890"
          format="horizontal"
          className="my-2"
        />
      </div>

      {/* Main Article Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs p-6 sm:p-12">
          {/* Article Rendered Body */}
          <ArticleContentRenderer
            content={article.content}
            adsenseClientId={adsenseClientId}
            adsenseSlotId="1234567890"
          />

          {/* Tags Footer */}
          <div className="mt-12 pt-6 border-t border-[#E4E7EC] flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#17324D] mr-2">Tag Terkait:</span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#F2F4F7] text-[#344054]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Banner AdSense Placement */}
        <div className="my-8">
          <AdSenseBanner
            clientId={adsenseClientId}
            slotId="1234567890"
            format="horizontal"
            className="my-0"
          />
        </div>

        {/* Academic Bio Box */}
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E4E7EC] p-6 flex items-start gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center shrink-0 font-bold text-base border border-[#2F7D78]/20">
            SLR
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17324D]">
              Tentang Divisi Editorial & Riset IB-SLR
            </h3>
            <p className="text-xs text-[#667085] mt-1 leading-relaxed">
              Seluruh panduan disusun oleh tim peneliti dan praktisi sintesis bukti ilmiah berbasis standar Cochrane, PRISMA 2020, dan pedoman editorial jurnal ilmiah internasional bereputasi tinggi.
            </p>
          </div>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg sm:text-xl font-bold text-[#17324D] mb-4">
              Artikel Terkait Lainnya
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="bg-white rounded-xl border border-[#E4E7EC] p-4 hover:border-[#2F7D78] hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-[#2F7D78] uppercase">
                      {rel.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#17324D] group-hover:text-[#2F7D78] transition-colors mt-1 line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#2F7D78] font-semibold mt-4">
                    <span>Baca panduan</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
