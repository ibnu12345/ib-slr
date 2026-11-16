"use client";

import React, { useState } from "react";
import { FAQItem } from "../../../../lib/types/cms";
import { saveFaqAction, deleteFaqAction } from "../../../../lib/cms/actions";
import { Plus, Trash2, Save, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface Props {
  initialFaqs: FAQItem[];
}

export function FAQEditor({ initialFaqs }: Props) {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSaveFaq = async (faq: FAQItem) => {
    setSavingId(faq.id);
    setFeedback(null);

    const formData = new FormData();
    formData.append("id", faq.id);
    formData.append("category", faq.category);
    formData.append("question", faq.question);
    formData.append("answer", faq.answer);
    formData.append("sortOrder", faq.sortOrder.toString());
    formData.append("isPublished", faq.isPublished ? "true" : "false");

    try {
      const res = await saveFaqAction(formData);
      if (res.success) {
        setFeedback({ type: "success", message: `FAQ "${faq.question.substring(0, 30)}..." saved.` });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to save FAQ." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to persist FAQ." });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ item?")) return;

    try {
      await deleteFaqAction(id);
      setFaqs(faqs.filter((f) => f.id !== id));
      setFeedback({ type: "success", message: "FAQ item deleted." });
    } catch {
      setFeedback({ type: "error", message: "Failed to delete FAQ." });
    }
  };

  const handleAddNew = () => {
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      category: "General",
      question: "New Frequently Asked Question",
      answer: "Provide a clear, evidence-based answer here.",
      sortOrder: faqs.length + 1,
      isPublished: true,
    };
    setFaqs([...faqs, newFaq]);
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#3E9C96]" />
          <span>Add New FAQ</span>
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 space-y-3 shadow-sm hover:border-[#2F7D78]/40 transition-colors"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-[#17212B] mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[index].question = e.target.value;
                    setFaqs(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E4E7EC] rounded-lg font-semibold text-[#17212B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#17212B] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={faq.category}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[index].category = e.target.value;
                    setFaqs(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#17212B] mb-1">
                Answer Content
              </label>
              <textarea
                rows={3}
                value={faq.answer}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[index].answer = e.target.value;
                  setFaqs(updated);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#E4E7EC] rounded-lg leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E4E7EC]">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-[#17212B]">
                  <input
                    type="checkbox"
                    checked={faq.isPublished}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[index].isPublished = e.target.checked;
                      setFaqs(updated);
                    }}
                    className="rounded text-[#2F7D78] focus:ring-[#2F7D78]"
                  />
                  <span>Published on Public FAQ</span>
                </label>

                <div className="flex items-center gap-1 text-xs text-[#667085]">
                  <span>Order:</span>
                  <input
                    type="number"
                    value={faq.sortOrder}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[index].sortOrder = parseInt(e.target.value, 10) || 0;
                      setFaqs(updated);
                    }}
                    className="w-12 px-1.5 py-0.5 text-xs bg-white border border-[#E4E7EC] rounded text-center"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="p-1.5 rounded text-[#B42318] hover:bg-[#FEF3F2] transition-colors"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveFaq(faq)}
                  disabled={savingId === faq.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingId === faq.id ? "Saving..." : "Save"}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
