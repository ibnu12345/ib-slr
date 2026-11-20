"use client";

import React from "react";
import { useProjectNavigation } from "./ProjectNavigationContext";

interface Props {
  children: React.ReactNode;
}

export function ProjectContentContainer({ children }: Props) {
  const { pendingHref } = useProjectNavigation();

  return (
    <div
      className={`mt-6 transition-all duration-200 ${
        pendingHref ? "opacity-60 pointer-events-none filter blur-[0.3px]" : "opacity-100"
      }`}
    >
      {children}
    </div>
  );
}
