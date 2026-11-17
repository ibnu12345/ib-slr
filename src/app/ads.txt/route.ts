import { getSiteSettings } from "../../../src/lib/db";

export async function GET() {
  const settings = await getSiteSettings();
  const rawClientId = settings.adsenseClientId || "pub-ib-slr-academic";
  // Convert ca-pub-12345 to pub-12345 if necessary
  const pubId = rawClientId.replace(/^ca-/, "");

  const content = `# Google AdSense ads.txt for IB-SLR
# http://www.google.com/adsense
google.com, ${pubId}, DIRECT, f08c47fec0942fa0
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
