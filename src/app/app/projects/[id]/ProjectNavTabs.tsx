"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

interface Props {
  projectId: string;
}

export function ProjectNavTabs({ projectId }: Props) {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: `/app/projects/${projectId}/overview`, icon: LayoutDashboard },
    { label: "Protocol", href: `/app/projects/${projectId}/protocol`, icon: FileText },
    { label: "Search Strategy", href: `/app/projects/${projectId}/search`, icon: Search },
    { label: "Import Center", href: `/app/projects/${projectId}/import`, icon: UploadCloud },
    { label: "Reference Library", href: `/app/projects/${projectId}/library`, icon: Library },
    { label: "Deduplication", href: `/app/projects/${projectId}/deduplication`, icon: CopyCheck },
    { label: "Screening: Title/Abstract", href: `/app/projects/${projectId}/screening/title-abstract`, icon: CheckSquare },
    { label: "Screening: Full-Text", href: `/app/projects/${projectId}/screening/full-text`, icon: FileSearch },
    { label: "Conflicts", href: `/app/projects/${projectId}/conflicts`, icon: AlertTriangle },
    { label: "Data Extraction", href: `/app/projects/${projectId}/extraction`, icon: Database },
    { label: "PRISMA 2020", href: `/app/projects/${projectId}/prisma`, icon: GitBranch },
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
