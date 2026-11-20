"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProjectNavContextValue {
  pendingHref: string | null;
  pendingTitle: string | null;
  startNavigation: (href: string, title?: string) => void;
}

const ProjectNavContext = createContext<ProjectNavContextValue>({
  pendingHref: null,
  pendingTitle: null,
  startNavigation: () => {},
});

export function useProjectNavigation() {
  return useContext(ProjectNavContext);
}

interface Props {
  children: React.ReactNode;
}

export function ProjectNavigationProvider({ children }: Props) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);

  // Automatically clear loading state once the target page finishes rendering
  useEffect(() => {
    setPendingHref(null);
    setPendingTitle(null);
  }, [pathname]);

  const startNavigation = (href: string, title?: string) => {
    if (pathname !== href) {
      setPendingHref(href);
      if (title) setPendingTitle(title);
    }
  };

  return (
    <ProjectNavContext.Provider value={{ pendingHref, pendingTitle, startNavigation }}>
      {/* 1. Global Viewport Top Animated Gradient Progress Bar */}
      {pendingHref && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2F7D78] via-[#3E9C96] to-[#18794E] z-[99999] shadow-md animate-pulse">
          <div className="h-full bg-white/40 w-1/3 animate-indeterminate" />
        </div>
      )}

      {/* 2. Floating Tactile Notification Badge */}
      {pendingHref && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] bg-[#17324D]/95 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 border border-white/20">
          <Loader2 className="w-4 h-4 text-[#A3E5DE] animate-spin" />
          <span>Memuat {pendingTitle || "Menu Penelitian"}...</span>
        </div>
      )}

      {children}
    </ProjectNavContext.Provider>
  );
}
