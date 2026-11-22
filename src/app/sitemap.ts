import { MetadataRoute } from "next";
import { getAllArticles } from "../lib/blog/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ib-slr-app.vercel.app";
  const articles = getAllArticles();

  const articleEntries: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${baseUrl}/blog/${art.slug}`,
    lastModified: new Date(art.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticRoutes = [
    "",
    "/features",
    "/how-it-works",
    "/for-researchers",
    "/for-institutions",
    "/pricing",
    "/blog",
    "/resources",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/security",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : 0.7,
  }));

  return [...staticEntries, ...articleEntries];
}
