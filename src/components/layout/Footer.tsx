import React from "react";
import Link from "next/link";
import { BookOpen, ShieldCheck, Github, Twitter, Linkedin } from "lucide-react";
import { SiteSettings, NavigationItem } from "../../lib/types/cms";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";

interface FooterProps {
  settings: SiteSettings;
  col1Items: NavigationItem[];
  col2Items: NavigationItem[];
  col3Items: NavigationItem[];
  legalItems: NavigationItem[];
}

export function Footer({ settings, col1Items, col2Items, col3Items, legalItems }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E4E7EC] pt-12 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-[#E4E7EC]">
          {/* Brand & Purpose Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#17324D] flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4 text-[#3E9C96]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#17324D]">
                {settings.brandName || "IB-SLR"}
              </span>
            </Link>
            <p className="text-xs text-[#667085] leading-relaxed max-w-sm">
              {settings.footerDisclaimer ||
                "A rigorous, AI-assisted systematic review workspace built for research integrity and reproducibility."}
            </p>
            <div className="flex items-center gap-3 text-[#667085] pt-2">
              {settings.githubUrl && (
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#17212B] transition-colors"
                  aria-label="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {settings.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#17212B] transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#17212B] transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EFF7F6] border border-[#2F7D78]/20 text-[11px] font-medium text-[#2F7D78]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evidence-Grounding & Row-Level Security</span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              {col1Items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="text-[#667085] hover:text-[#17212B] transition-colors text-xs"
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-3">
              Research
            </h4>
            <ul className="space-y-2">
              {col2Items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="text-[#667085] hover:text-[#17212B] transition-colors text-xs"
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-3">
              Organization
            </h4>
            <ul className="space-y-2">
              {col3Items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="text-[#667085] hover:text-[#17212B] transition-colors text-xs"
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667085]">
          <div className="flex items-center gap-4">
            <span>&copy; {currentYear} {settings.brandName || "IB-SLR"}. All rights reserved.</span>
            <LanguageSwitcher variant="footer" />
          </div>
          <div className="flex items-center space-x-4">
            {legalItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="hover:text-[#17212B] transition-colors"
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
