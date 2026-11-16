import React from "react";
import { getSiteSettings } from "../../../../lib/db";
import { SettingsEditor } from "./SettingsEditor";

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC]">
        <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
          Brand & Global Site Settings
        </h1>
        <p className="text-xs text-[#667085] mt-1">
          Configure product name, tagline, announcement banner, and official institutional contact points.
        </p>
      </div>

      <SettingsEditor initialSettings={settings} />
    </div>
  );
}
