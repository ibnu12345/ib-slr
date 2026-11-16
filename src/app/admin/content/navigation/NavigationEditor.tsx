"use client";

import React, { useState } from "react";
import { NavigationItem } from "../../../../lib/types/cms";
import {
  saveNavigationItemAction,
  deleteNavigationItemAction,
} from "../../../../lib/cms/actions";
import { Plus, Trash2, Save, CheckCircle2, AlertCircle, Menu } from "lucide-react";

interface Props {
  initialItems: NavigationItem[];
}

export function NavigationEditor({ initialItems }: Props) {
  const [items, setItems] = useState<NavigationItem[]>(initialItems);
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const displayedItems =
    filterLocation === "all"
      ? items
      : items.filter((i) => i.location === filterLocation);

  const handleSaveItem = async (item: NavigationItem) => {
    setSavingId(item.id);
    setFeedback(null);

    const formData = new FormData();
    formData.append("id", item.id);
    formData.append("location", item.location);
    formData.append("label", item.label);
    formData.append("url", item.url);
    formData.append("sortOrder", item.sortOrder.toString());
    formData.append("isExternal", item.isExternal ? "true" : "false");
    formData.append("isVisible", item.isVisible ? "true" : "false");

    try {
      const res = await saveNavigationItemAction(formData);
      if (res.success) {
        setFeedback({ type: "success", message: `Navigation item "${item.label}" updated.` });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to update item." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to persist navigation item." });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this navigation link?")) return;

    try {
      await deleteNavigationItemAction(id);
      setItems(items.filter((i) => i.id !== id));
      setFeedback({ type: "success", message: "Navigation item deleted." });
    } catch {
      setFeedback({ type: "error", message: "Failed to delete navigation item." });
    }
  };

  const handleAddNew = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      location: filterLocation === "all" ? "header" : (filterLocation as any),
      label: "New Link",
      url: "/new-page",
      sortOrder: items.length + 1,
      isExternal: false,
      isVisible: true,
    };
    setItems([...items, newItem]);
  };

  return (
    <div className="space-y-6">
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

      {/* Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#E4E7EC] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#17212B]">Filter Location:</span>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="text-xs bg-white border border-[#E4E7EC] rounded-lg px-2.5 py-1 text-[#17212B]"
          >
            <option value="all">All Locations</option>
            <option value="header">Header Main Menu</option>
            <option value="footer_col1">Footer Col 1 (Product)</option>
            <option value="footer_col2">Footer Col 2 (Research)</option>
            <option value="footer_col3">Footer Col 3 (Company)</option>
            <option value="footer_legal">Footer Legal</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#3E9C96]" />
          <span>Add New Link</span>
        </button>
      </div>

      {/* Navigation Items Table */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8FA] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Label</th>
              <th className="py-3 px-4">Destination URL</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Visible</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EC]">
            {displayedItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-[#F7F8FA] transition-colors">
                <td className="py-3 px-4 w-16">
                  <input
                    type="number"
                    value={item.sortOrder}
                    onChange={(e) => {
                      const updated = [...items];
                      const target = updated.find((i) => i.id === item.id);
                      if (target) target.sortOrder = parseInt(e.target.value, 10) || 0;
                      setItems(updated);
                    }}
                    className="w-12 px-1.5 py-1 text-xs bg-white border border-[#E4E7EC] rounded text-center"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...items];
                      const target = updated.find((i) => i.id === item.id);
                      if (target) target.label = e.target.value;
                      setItems(updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#E4E7EC] rounded font-medium"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => {
                      const updated = [...items];
                      const target = updated.find((i) => i.id === item.id);
                      if (target) target.url = e.target.value;
                      setItems(updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#E4E7EC] rounded font-mono text-[#2F7D78]"
                  />
                </td>
                <td className="py-3 px-4">
                  <select
                    value={item.location}
                    onChange={(e) => {
                      const updated = [...items];
                      const target = updated.find((i) => i.id === item.id);
                      if (target) target.location = e.target.value as any;
                      setItems(updated);
                    }}
                    className="text-xs bg-white border border-[#E4E7EC] rounded px-2 py-1"
                  >
                    <option value="header">Header</option>
                    <option value="footer_col1">Footer Col 1</option>
                    <option value="footer_col2">Footer Col 2</option>
                    <option value="footer_col3">Footer Col 3</option>
                    <option value="footer_legal">Footer Legal</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={item.isVisible}
                    onChange={(e) => {
                      const updated = [...items];
                      const target = updated.find((i) => i.id === item.id);
                      if (target) target.isVisible = e.target.checked;
                      setItems(updated);
                    }}
                    className="rounded text-[#2F7D78] focus:ring-[#2F7D78]"
                  />
                </td>
                <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSaveItem(item)}
                    disabled={savingId === item.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2F7D78] hover:bg-[#266662] text-[11px] font-semibold text-white transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>{savingId === item.id ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 rounded text-[#B42318] hover:bg-[#FEF3F2] transition-colors"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
