import React from "react";
import { getAllNavigationItems } from "../../../../lib/db";
import { NavigationEditor } from "./NavigationEditor";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const items = await getAllNavigationItems();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC]">
        <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
          Navigation & Menu Management
        </h1>
        <p className="text-xs text-[#667085] mt-1">
          Customize header menus and footer column links across the entire public website.
        </p>
      </div>

      <NavigationEditor initialItems={items} />
    </div>
  );
}
