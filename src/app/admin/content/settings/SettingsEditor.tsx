"use client";

import React, { useState } from "react";
import { SiteSettings } from "../../../../lib/types/cms";
import { updateSiteSettingsAction } from "../../../../lib/cms/actions";
import { Save, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

interface Props {
  initialSettings: SiteSettings;
}

export function SettingsEditor({ initialSettings }: Props) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set("announcementActive", settings.announcement?.isActive ? "true" : "false");

    try {
      const res = await updateSiteSettingsAction(formData);
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Settings updated successfully." });
      } else {
        setFeedback({ type: "error", message: "Failed to update settings." });
      }
    } catch {
      setFeedback({ type: "error", message: "An unexpected error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-[#ECFDF3] border-[#18794E]/30 text-[#18794E]"
              : "bg-[#FEF3F2] border-[#B42318]/30 text-[#B42318]"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Brand Identity Card */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-[#17324D] border-b border-[#E4E7EC] pb-2">
          Product Brand & Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              Product Name (Strictly &quot;IB-SLR&quot;)
            </label>
            <input
              type="text"
              name="brandName"
              defaultValue={settings.brandName || "IB-SLR"}
              required
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg font-bold text-[#17324D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              Working Tagline
            </label>
            <input
              type="text"
              name="tagline"
              defaultValue={settings.tagline || "From Literature to Evidence."}
              required
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17212B] mb-1">
            Footer Academic Disclaimer
          </label>
          <textarea
            name="footerDisclaimer"
            rows={3}
            defaultValue={settings.footerDisclaimer || ""}
            className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
          />
        </div>
      </div>

      {/* Announcement Banner Card */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2F7D78]" />
            <h2 className="text-sm font-bold text-[#17324D]">Announcement Top Banner</h2>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-[#17212B]">
            <input
              type="checkbox"
              checked={settings.announcement?.isActive || false}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcement: {
                    ...(settings.announcement || { message: "" }),
                    isActive: e.target.checked,
                  },
                })
              }
              className="rounded text-[#2F7D78] focus:ring-[#2F7D78]"
            />
            <span>Enable Banner</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              Banner Message
            </label>
            <input
              type="text"
              name="announcementMessage"
              defaultValue={settings.announcement?.message || ""}
              placeholder="Announce releases, webinars, or system maintenance"
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Link Destination URL
              </label>
              <input
                type="text"
                name="announcementLinkUrl"
                defaultValue={settings.announcement?.linkUrl || ""}
                placeholder="/how-it-works"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg font-mono text-[#2F7D78]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Link Call-To-Action Text
              </label>
              <input
                type="text"
                name="announcementLinkText"
                defaultValue={settings.announcement?.linkText || "Learn more"}
                placeholder="Learn more"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Official Communication & Social Links */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-[#17324D] border-b border-[#E4E7EC] pb-2">
          Institutional Contact & Social Channels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              General Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              defaultValue={settings.contactEmail || ""}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              Support Desk Email
            </label>
            <input
              type="email"
              name="supportEmail"
              defaultValue={settings.supportEmail || ""}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              GitHub Repository URL
            </label>
            <input
              type="url"
              name="githubUrl"
              defaultValue={settings.githubUrl || ""}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              Twitter / X URL
            </label>
            <input
              type="url"
              name="twitterUrl"
              defaultValue={settings.twitterUrl || ""}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg font-mono"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#3E9C96]" />
          <span>{saving ? "Saving Changes..." : "Save Global Settings"}</span>
        </button>
      </div>
    </form>
  );
}
