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
} from "lucide-react";

interface Props {
  projectId: string;
}

export function ProjectNavTabs({ projectId }: Props) {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: `/app/projects/${projectId}/overview`, icon: LayoutDashboard },
    { label: "Protocol & PICO", href: `/app/projects/${projectId}/protocol`, icon: FileText },
    { label: "Search Strategy", href: `/app/projects/${projectId}/search`, icon: Search },
    { label: "Import Center", href: `/app/projects/${projectId}/import`, icon: UploadCloud },
    { label: "Reference Library", href: `/app/projects/${projectId}/library`, icon: Library },
    { label: "Deduplication", href: `/app/projects/${projectId}/deduplication`, icon: CopyCheck },
  ];

  return (
    <div className="border-b border-[#E4E7EC] overflow-x-auto scrollbar-none">
      <nav className="flex space-x-1 sm:space-x-2 whitespace-nowrap">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
                isActive
                  ? "border-[#2F7D78] text-[#17324D] bg-[#FFFFFF] rounded-t-lg"
                  : "border-transparent text-[#667085] hover:text-[#17212B] hover:border-[#E4E7EC]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#2F7D78]" : "text-[#667085]"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
