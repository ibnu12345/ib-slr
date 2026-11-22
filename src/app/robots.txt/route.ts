export async function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /app/
Disallow: /admin/
Disallow: /api/

User-agent: Mediapartners-Google
Allow: /

Sitemap: https://ib-slr-app.vercel.app/sitemap.xml
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
