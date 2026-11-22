import { getAllArticles } from "../../lib/blog/articles";

export async function GET() {
  const baseUrl = "https://ib-slr-app.vercel.app";
  const articles = getAllArticles();

  const staticUrls = [
    { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${baseUrl}/blog`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/features`, changefreq: "weekly", priority: "0.7" },
    { loc: `${baseUrl}/how-it-works`, changefreq: "weekly", priority: "0.7" },
    { loc: `${baseUrl}/pricing`, changefreq: "weekly", priority: "0.7" },
    { loc: `${baseUrl}/resources`, changefreq: "weekly", priority: "0.7" },
    { loc: `${baseUrl}/about`, changefreq: "weekly", priority: "0.7" },
    { loc: `${baseUrl}/contact`, changefreq: "weekly", priority: "0.7" },
    { loc: `${baseUrl}/privacy`, changefreq: "monthly", priority: "0.5" },
    { loc: `${baseUrl}/terms`, changefreq: "monthly", priority: "0.5" },
    { loc: `${baseUrl}/security`, changefreq: "monthly", priority: "0.5" },
  ];

  const articleUrls = articles.map((art) => ({
    loc: `${baseUrl}/blog/${art.slug}`,
    changefreq: "weekly",
    priority: "0.8",
  }));

  const allUrls = [...staticUrls, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
