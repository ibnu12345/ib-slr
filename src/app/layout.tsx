import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings, getNavigation } from "../lib/db";
import { getCurrentSession } from "../lib/auth/session";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { AnnouncementBanner } from "../components/layout/AnnouncementBanner";

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

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#17212B] antialiased">
        <AnnouncementBanner announcement={settings.announcement} />
        <Navbar settings={settings} navItems={headerNav} session={session} />
        <main className="flex-1">{children}</main>
        <Footer
          settings={settings}
          col1Items={col1}
          col2Items={col2}
          col3Items={col3}
          legalItems={legal}
        />
      </body>
    </html>
  );
}
