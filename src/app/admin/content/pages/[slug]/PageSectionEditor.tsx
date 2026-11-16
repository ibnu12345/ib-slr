"use client";

import React, { useState } from "react";
import { CMSPage, PageSection, ContentStatus } from "../../../../../lib/types/cms";
import {
  savePageSectionAction,
  reorderSectionsAction,
  togglePageStatusAction,
} from "../../../../../lib/cms/actions";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  FileEdit,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  page: CMSPage;
}

export function PageSectionEditor({ page }: Props) {
  const [sections, setSections] = useState<PageSection[]>(
    [...page.sections].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [pageStatus, setPageStatus] = useState<ContentStatus>(page.status);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // Reorder up/down
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update sortOrder values
    newSections.forEach((s, idx) => {
      s.sortOrder = idx + 1;
    });

    setSections(newSections);
    const orderedIds = newSections.map((s) => s.id);

    try {
      await reorderSectionsAction(page.id, orderedIds);
      setFeedback({ type: "success", message: "Section order updated successfully." });
    } catch {
      setFeedback({ type: "error", message: "Failed to persist section reordering." });
    }
  };

  const handleTogglePageStatus = async (newStatus: ContentStatus) => {
    try {
      await togglePageStatusAction(page.slug, newStatus);
      setPageStatus(newStatus);
      setFeedback({
        type: "success",
        message: `Page publication status set to ${newStatus.toUpperCase()}.`,
      });
    } catch {
      setFeedback({ type: "error", message: "Failed to update page publication status." });
    }
  };

  const handleSaveSection = async (section: PageSection, formElement: HTMLFormElement) => {
    setSaving(true);
    setFeedback(null);

    const formData = new FormData(formElement);
    formData.append("pageId", page.id);
    formData.append("sectionId", section.id);
    formData.append("sectionType", section.sectionType);
    formData.append("sortOrder", section.sortOrder.toString());

    try {
      const res = await savePageSectionAction(formData);
      if (res.success) {
        setFeedback({ type: "success", message: `Section "${section.title || section.sectionType}" saved successfully.` });
        setEditingSectionId(null);
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to save section." });
      }
    } catch {
      setFeedback({ type: "error", message: "An unexpected error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
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

      {/* Page Lifecycle Bar */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-[#17212B] block">
            Publication Lifecycle
          </span>
          <span className="text-[11px] text-[#667085]">
            Control whether this page is publicly indexed or restricted to admin preview.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTogglePageStatus("draft")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              pageStatus === "draft"
                ? "bg-[#FEF7EC] text-[#B7791F] border border-[#B7791F]/40"
                : "bg-white text-[#667085] border border-[#E4E7EC] hover:bg-[#F7F8FA]"
            }`}
          >
            Draft Mode
          </button>
          <button
            type="button"
            onClick={() => handleTogglePageStatus("published")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              pageStatus === "published"
                ? "bg-[#ECFDF3] text-[#18794E] border border-[#18794E]/40"
                : "bg-white text-[#667085] border border-[#E4E7EC] hover:bg-[#F7F8FA]"
            }`}
          >
            Published Live
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#17324D]">
            Page Sections ({sections.length})
          </h2>
          <span className="text-xs text-[#667085]">
            Reorder blocks using arrows; click &quot;Edit&quot; to modify copy.
          </span>
        </div>

        {sections.map((section, idx) => {
          const isEditing = editingSectionId === section.id;
          return (
            <div
              key={section.id}
              className={`bg-[#FFFFFF] border rounded-xl overflow-hidden transition-all shadow-sm ${
                isEditing ? "border-[#2F7D78] ring-1 ring-[#2F7D78]" : "border-[#E4E7EC]"
              }`}
            >
              {/* Header Row */}
              <div className="p-4 flex items-center justify-between gap-4 bg-[#FFFFFF]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-[#F7F8FA] border border-[#E4E7EC] text-[11px] font-bold text-[#667085] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#17212B]">
                        {section.title || section.sectionType.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#EFF7F6] text-[#2F7D78]">
                        {section.sectionType}
                      </span>
                      {!section.isVisible && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-gray-100 text-gray-500">
                          Hidden
                        </span>
                      )}
                    </div>
                    {section.subtitle && (
                      <p className="text-xs text-[#667085] truncate max-w-lg mt-0.5">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="p-1.5 text-[#667085] hover:text-[#17212B] hover:bg-[#F7F8FA] rounded disabled:opacity-30 transition-colors"
                    title="Move section up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="p-1.5 text-[#667085] hover:text-[#17212B] hover:bg-[#F7F8FA] rounded disabled:opacity-30 transition-colors"
                    title="Move section down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSectionId(isEditing ? null : section.id)}
                    className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E4E7EC] hover:bg-[#F7F8FA] text-xs font-semibold text-[#17212B] transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-[#2F7D78]" />
                    <span>{isEditing ? "Close" : "Edit"}</span>
                  </button>
                </div>
              </div>

              {/* Edit Form Body */}
              {isEditing && (
                <div className="p-6 bg-[#F7F8FA] border-t border-[#E4E7EC]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveSection(section, e.currentTarget);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#17212B] mb-1">
                          Section Title / Headline
                        </label>
                        <input
                          type="text"
                          name="title"
                          defaultValue={section.title || ""}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#17212B] mb-1">
                          Section Subtitle / Description
                        </label>
                        <input
                          type="text"
                          name="subtitle"
                          defaultValue={section.subtitle || ""}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Section Specific Fields */}
                    {section.sectionType === "hero" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E4E7EC]">
                        <div>
                          <label className="block text-xs font-semibold text-[#17212B] mb-1">
                            Eyebrow Badge
                          </label>
                          <input
                            type="text"
                            defaultValue={section.content?.badge || ""}
                            onChange={(e) => {
                              section.content.badge = e.target.value;
                            }}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#17212B] mb-1">
                            Primary CTA Text
                          </label>
                          <input
                            type="text"
                            defaultValue={section.content?.primaryCtaText || ""}
                            onChange={(e) => {
                              section.content.primaryCtaText = e.target.value;
                            }}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#17212B] mb-1">
                            Primary CTA URL
                          </label>
                          <input
                            type="text"
                            defaultValue={section.content?.primaryCtaUrl || ""}
                            onChange={(e) => {
                              section.content.primaryCtaUrl = e.target.value;
                            }}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#17212B] mb-1">
                            Secondary CTA Text
                          </label>
                          <input
                            type="text"
                            defaultValue={section.content?.secondaryCtaText || ""}
                            onChange={(e) => {
                              section.content.secondaryCtaText = e.target.value;
                            }}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    {section.sectionType === "rich_text" && (
                      <div className="pt-2 border-t border-[#E4E7EC]">
                        <label className="block text-xs font-semibold text-[#17212B] mb-1">
                          Rich Text Markdown Body
                        </label>
                        <textarea
                          rows={8}
                          defaultValue={section.content?.body || ""}
                          onChange={(e) => {
                            section.content.body = e.target.value;
                          }}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg font-mono"
                        />
                      </div>
                    )}

                    {/* Hidden content payload passing updated JSON */}
                    <input
                      type="hidden"
                      name="content"
                      value={JSON.stringify(section.content || {})}
                    />

                    <div className="flex items-center justify-between pt-4 border-t border-[#E4E7EC]">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs font-medium text-[#17212B]">
                          <input
                            type="checkbox"
                            name="isVisible"
                            value="true"
                            defaultChecked={section.isVisible}
                            className="rounded text-[#2F7D78] focus:ring-[#2F7D78]"
                          />
                          <span>Visible to Public</span>
                        </label>

                        <select
                          name="status"
                          defaultValue={section.status}
                          className="px-2.5 py-1 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSectionId(null)}
                          className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085] hover:bg-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{saving ? "Saving..." : "Save Section"}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
