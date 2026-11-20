"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../../../components/i18n/LanguageContext";
import {
  LayoutDashboard,
  FileText,
  Search,
  UploadCloud,
  Library,
  CopyCheck,
  CheckSquare,
  FileSearch,
  AlertTriangle,
  GitBranch,
  Database,
  ShieldAlert,
  Layers,
  Award,
  Loader2,
  Printer,
} from "lucide-react";

interface Props {
  projectId: string;
}

export function ProjectNavTabs({ projectId }: Props) {
  const pathname = usePathname();
  const { isId } = useLanguage();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending state when navigation arrives at the target pathname
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const tabs = [
    { label: isId ? "Ringkasan" : "Overview", href: `/app/projects/${projectId}/overview`, icon: LayoutDashboard },
    { label: isId ? "Protokol PICO" : "Protocol", href: `/app/projects/${projectId}/protocol`, icon: FileText },
    { label: isId ? "Strategi Pencarian" : "Search Strategy", href: `/app/projects/${projectId}/search`, icon: Search },
    { label: isId ? "Pusat Impor" : "Import Center", href: `/app/projects/${projectId}/import`, icon: UploadCloud },
    { label: isId ? "Perpustakaan Referensi" : "Reference Library", href: `/app/projects/${projectId}/library`, icon: Library },
    { label: isId ? "Deduplikasi" : "Deduplication", href: `/app/projects/${projectId}/deduplication`, icon: CopyCheck },
    { label: isId ? "Screening: Judul/Abstrak" : "Screening: Title/Abstract", href: `/app/projects/${projectId}/screening/title-abstract`, icon: CheckSquare },
    { label: isId ? "Screening: Teks Lengkap" : "Screening: Full-Text", href: `/app/projects/${projectId}/screening/full-text`, icon: FileSearch },
    { label: isId ? "Konflik Penilaian" : "Conflicts", href: `/app/projects/${projectId}/conflicts`, icon: AlertTriangle },
    { label: isId ? "Ekstraksi Data" : "Data Extraction", href: `/app/projects/${projectId}/extraction`, icon: Database },
    { label: isId ? "Penilaian RoB 2" : "Appraisal (RoB)", href: `/app/projects/${projectId}/appraisal`, icon: ShieldAlert },
    { label: isId ? "Sintesis Bukti" : "Synthesis", href: `/app/projects/${projectId}/synthesis`, icon: Layers },
    { label: isId ? "Diagram PRISMA" : "PRISMA 2020", href: `/app/projects/${projectId}/prisma`, icon: GitBranch },
    { label: isId ? "Studio Publikasi" : "Publication Studio", href: `/app/projects/${projectId}/publication`, icon: Award },
    { label: isId ? "Laporan Lengkap (PDF)" : "Full Report (PDF)", href: `/app/projects/${projectId}/report`, icon: Printer },
  ];

  return (
    <div className="relative border-b border-[#E4E7EC]">
      {/* Sleek top animated loading progress bar when user clicks any tab */}
      {pendingHref && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2F7D78] via-[#18794E] to-[#2F7D78] animate-pulse z-20" />
      )}

      <div className="overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-1.5 whitespace-nowrap">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const isPending = pendingHref === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => {
                  if (pathname !== tab.href) {
                    setPendingHref(tab.href);
                  }
                }}
                className={`inline-flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? "border-[#2F7D78] text-[#17324D] bg-[#FFFFFF] rounded-t-lg shadow-xs"
                    : isPending
                    ? "border-[#2F7D78] text-[#2F7D78] bg-[#EFF7F6]/60 rounded-t-lg animate-pulse"
                    : "border-transparent text-[#667085] hover:text-[#17212B] hover:border-[#E4E7EC]"
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#2F7D78] animate-spin" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#2F7D78]" : "text-[#667085]"}`} />
                )}
                <span>{tab.label}</span>
                {isPending && (
                  <span className="text-[10px] text-[#2F7D78] font-normal ml-0.5">...</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
