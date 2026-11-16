"use client";

import React from "react";
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
} from "lucide-react";

interface Props {
  projectId: string;
}

export function ProjectNavTabs({ projectId }: Props) {
  const pathname = usePathname();
  const { isId } = useLanguage();

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
  ];

  return (
    <div className="border-b border-[#E4E7EC] overflow-x-auto scrollbar-none">
      <nav className="flex space-x-1 sm:space-x-1.5 whitespace-nowrap">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                isActive
                  ? "border-[#2F7D78] text-[#17324D] bg-[#FFFFFF] rounded-t-lg"
                  : "border-transparent text-[#667085] hover:text-[#17212B] hover:border-[#E4E7EC]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#2F7D78]" : "text-[#667085]"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
