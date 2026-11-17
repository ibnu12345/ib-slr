import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings, getNavigation } from "../lib/db";
import { getCurrentSession } from "../lib/auth/session";
import Script from "next/script";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { AnnouncementBanner } from "../components/layout/AnnouncementBanner";
import { LanguageProvider } from "../components/i18n/LanguageContext";
import { AdSenseBanner } from "../components/ads/AdSenseBanner";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: `${settings.brandName || "IB-SLR"} — ${settings.tagline || "From Literature to Evidence."}`,
      template: `%s | ${settings.brandName || "IB-SLR"}`,
    },
    description: settings.footerDisclaimer || "AI-assisted Systematic Literature Review workspace.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const [headerNav, col1, col2, col3, legal] = await Promise.all([
    getNavigation("header"),
    getNavigation("footer_col1"),
    getNavigation("footer_col2"),
    getNavigation("footer_col3"),
    getNavigation("footer_legal"),
  ]);
  const session = await getCurrentSession();

  const adsensePublisherId = "ca-pub-4685484644548395";

  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={adsensePublisherId} />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#17212B] antialiased">
        <LanguageProvider>
          <div className="no-print">
            <AnnouncementBanner announcement={settings.announcement} />
            <Navbar settings={settings} navItems={headerNav} session={session} />
          </div>
          <main className="flex-1">{children}</main>
          <div className="no-print">
            {settings.adsenseEnabled !== false && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AdSenseBanner
                  clientId={adsensePublisherId}
                  slotId={settings.adsenseSlotBanner}
                />
              </div>
            )}
            <Footer
              settings={settings}
              col1Items={col1}
              col2Items={col2}
              col3Items={col3}
              legalItems={legal}
            />
          </div>
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
