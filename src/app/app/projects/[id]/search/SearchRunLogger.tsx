"use client";

import React, { useState } from "react";
import { SearchRun } from "../../../../../lib/types/research";
import { createSearchRunAction } from "../../../../../lib/research/actions";
import { Plus, Database, Calendar, Hash, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  projectId: string;
  initialRuns: SearchRun[];
}

export function SearchRunLogger({ projectId, initialRuns }: Props) {
  const [runs, setRuns] = useState<SearchRun[]>(initialRuns);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sourceDatabase, setSourceDatabase] = useState("PubMed / MEDLINE");
  const [queryString, setQueryString] = useState("");
  const [resultsCount, setResultsCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const handleAddSearchRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("sourceDatabase", sourceDatabase);
    formData.append("queryString", queryString);
    formData.append("resultsCount", resultsCount.toString());

    try {
      const res = await createSearchRunAction(formData);
      if (res.success && res.run) {
        setRuns([res.run, ...runs]);
        setQueryString("");
        setResultsCount(0);
        setShowAddForm(false);
        setFeedback({
          type: "success",
          message: "Strategi dan hasil pencarian database berhasil direkam.",
        });
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal mencatat pencarian." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan server saat menyimpan." });
    } finally {
      setSaving(false);
    }
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

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#2F7D78]" />
          <span className="text-xs font-bold text-[#17324D]">
            Riwayat Pencarian ({runs.length} Eksekusi Database Tercatat)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#3E9C96]" />
          <span>{showAddForm ? "Tutup Form" : "Catat Eksekusi Pencarian"}</span>
        </button>
      </div>

      {/* Add Search Run Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSearchRun}
          className="bg-[#FFFFFF] border-2 border-[#2F7D78] rounded-xl p-6 space-y-4 shadow-sm"
        >
          <h3 className="text-sm font-bold text-[#17324D] border-b border-[#E4E7EC] pb-2">
            Dokumentasi Eksekusi Query Database
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1">
                Database Sumber (Source Database)
              </label>
              <select
                value={sourceDatabase}
                onChange={(e) => setSourceDatabase(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
              >
                <option value="PubMed / MEDLINE">PubMed / MEDLINE (NLM)</option>
                <option value="Scopus (Elsevier)">Scopus (Elsevier)</option>
                <option value="Web of Science (Clarivate)">Web of Science (Clarivate)</option>
                <option value="Crossref Metadata">Crossref Metadata</option>
                <option value="OpenAlex Database">OpenAlex Database</option>
                <option value="Cochrane Central (CENTRAL)">Cochrane Central (CENTRAL)</option>
                <option value="IEEE Xplore">IEEE Xplore</option>
                <option value="Google Scholar (Manual Export)">Google Scholar (Manual Export)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1">
                Jumlah Catatan Ditemukan (Records Count)
              </label>
              <input
                type="number"
                min="0"
                required
                value={resultsCount}
                onChange={(e) => setResultsCount(parseInt(e.target.value, 10) || 0)}
                placeholder="Misal: 428"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17212B] mb-1">
              Exact Query String (Sintaks Query Persis Termasuk Operator Boolean)
            </label>
            <textarea
              rows={4}
              required
              value={queryString}
              onChange={(e) => setQueryString(e.target.value)}
              placeholder='Contoh: ("Diabetes Mellitus, Type 2"[Mesh] OR "type 2 diabetes"[tiab]) AND ("Digital Health"[tiab] OR "Mobile Applications"[Mesh])...'
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E7EC]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Menyimpan..." : "Simpan Log Pencarian"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Log Entries List */}
      <div className="space-y-4">
        {runs.length === 0 ? (
          <div className="p-8 text-center bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl text-xs text-[#667085]">
            Belum ada eksekusi pencarian yang dicatat. Klik &quot;Catat Eksekusi Pencarian&quot; untuk mendokumentasikan query pertama Anda.
          </div>
        ) : (
          runs.map((run) => (
            <div
              key={run.id}
              className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 space-y-3 shadow-sm hover:border-[#2F7D78]/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E7EC] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#17324D]">{run.sourceDatabase}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFF7F6] text-[#2F7D78]">
                    {run.resultsCount} Hits
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#667085]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(run.searchDate).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-1">
                  Query String:
                </span>
                <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E4E7EC] font-mono text-xs text-[#17212B] overflow-x-auto leading-relaxed">
                  {run.queryString}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
