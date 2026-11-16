"use client";

import React, { useState } from "react";
import { Protocol, EligibilityCriterion, ProtocolFramework } from "../../../../../lib/types/research";
import {
  saveProtocolAction,
  lockProtocolAction,
  saveCriterionAction,
  deleteCriterionAction,
} from "../../../../../lib/research/actions";
import {
  Save,
  Lock,
  Unlock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface Props {
  projectId: string;
  initialProtocol: Protocol | null;
  initialCriteria: EligibilityCriterion[];
}

export function ProtocolEditor({ projectId, initialProtocol, initialCriteria }: Props) {
  const [protocol, setProtocol] = useState<Protocol | null>(initialProtocol);
  const [criteria, setCriteria] = useState<EligibilityCriterion[]>(initialCriteria);
  const [framework, setFramework] = useState<ProtocolFramework>(
    initialProtocol?.framework || "PICO"
  );
  const [isLocked, setIsLocked] = useState(initialProtocol?.isLocked || false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // New criterion state
  const [critType, setCritType] = useState<"inclusion" | "exclusion">("inclusion");
  const [critCategory, setCritCategory] = useState("Population");
  const [critDesc, setCritDesc] = useState("");

  const handleSaveProtocol = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) {
      alert("Protokol saat ini terkunci demi menjaga reproduktifitas penelitian.");
      return;
    }

    setSaving(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.append("projectId", projectId);
    formData.append("framework", framework);

    try {
      const res = await saveProtocolAction(formData);
      if (res.success && res.protocol) {
        setProtocol(res.protocol);
        setFeedback({ type: "success", message: res.message || "Protokol berhasil disimpan." });
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal menyimpan protokol." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan server saat menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  const handleLockProtocol = async () => {
    if (!confirm("Kunci protokol ini? Setelah dikunci, kriteria metodologi tidak dapat diubah sembarangan tanpa membuat versi baru.")) {
      return;
    }

    try {
      const res = await lockProtocolAction(projectId);
      if (res.success && res.protocol) {
        setProtocol(res.protocol);
        setIsLocked(true);
        setFeedback({
          type: "success",
          message: "Protokol berhasil dikunci. Anda siap melanjutkan ke tahap screening literatur.",
        });
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal mengunci protokol." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan saat mengunci protokol." });
    }
  };

  const handleAddCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!critDesc.trim()) return;

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("criterionType", critType);
    formData.append("category", critCategory);
    formData.append("description", critDesc.trim());
    formData.append("sortOrder", (criteria.length + 1).toString());

    try {
      const res = await saveCriterionAction(formData);
      if (res.success) {
        const newCriterion: EligibilityCriterion = {
          id: `crit-${Date.now()}`,
          projectId,
          criterionType: critType,
          category: critCategory,
          description: critDesc.trim(),
          sortOrder: criteria.length + 1,
        };
        setCriteria([...criteria, newCriterion]);
        setCritDesc("");
        setFeedback({ type: "success", message: "Kriteria kelayakan berhasil ditambahkan." });
      }
    } catch {
      setFeedback({ type: "error", message: "Gagal menyimpan kriteria kelayakan." });
    }
  };

  const handleDeleteCriterion = async (id: string) => {
    if (isLocked) {
      alert("Protokol sedang dikunci.");
      return;
    }

    try {
      await deleteCriterionAction(id, projectId);
      setCriteria(criteria.filter((c) => c.id !== id));
      setFeedback({ type: "success", message: "Kriteria dihapus." });
    } catch {
      setFeedback({ type: "error", message: "Gagal menghapus kriteria." });
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

      {/* Lock Protocol Banner */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isLocked ? "bg-[#ECFDF3] text-[#18794E]" : "bg-[#FEF7EC] text-[#B7791F]"
            }`}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#17324D]">
                Protokol Versi {protocol?.version || 1}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  isLocked ? "bg-[#ECFDF3] text-[#18794E]" : "bg-[#FEF7EC] text-[#B7791F]"
                }`}
              >
                {isLocked ? "Locked (Terkunci)" : "Draft Editable"}
              </span>
            </div>
            <p className="text-[11px] text-[#667085] mt-0.5">
              {isLocked
                ? `Protokol dikunci oleh ${protocol?.lockedBy || "Peneliti"} pada ${new Date(protocol?.lockedAt || "").toLocaleDateString()}`
                : "Kunci protokol setelah kriteria disepakati bersama tim sebelum screening dimulai."}
            </p>
          </div>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={handleLockProtocol}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18794E] hover:bg-[#125D3B] text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kunci Protokol Ini</span>
          </button>
        )}
      </div>

      {/* Main Protocol Form */}
      <form onSubmit={handleSaveProtocol} className="space-y-6">
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
            <h3 className="text-sm font-bold text-[#17324D]">
              Spesifikasi Framework Pertanyaan ({framework})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#667085]">Pilih Framework:</span>
              <select
                disabled={isLocked}
                value={framework}
                onChange={(e) => setFramework(e.target.value as ProtocolFramework)}
                className="text-xs bg-white border border-[#E4E7EC] rounded-lg px-2.5 py-1 font-semibold text-[#17324D]"
              >
                <option value="PICO">PICO (Kuantitatif / Uji Klinis)</option>
                <option value="PICo">PICo (Kualitatif / Studi Fenomena)</option>
                <option value="SPIDER">SPIDER (Mixed Methods / Sosial)</option>
                <option value="PEO">PEO (Epidemiologi / Paparan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17212B] mb-1">
              Latar Belakang Metodologis (Background)
            </label>
            <textarea
              name="background"
              rows={3}
              disabled={isLocked}
              defaultValue={protocol?.background || ""}
              placeholder="Jelaskan rasionalisasi ilmiah mengapa systematic review ini dilakukan..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg disabled:bg-[#F7F8FA]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17212B] mb-1">
              Tujuan Penelitian (Review Objectives)
            </label>
            <textarea
              name="objectives"
              rows={2}
              disabled={isLocked}
              defaultValue={protocol?.objectives || ""}
              placeholder="Contoh: Menilai efikasi klinis intervensi digital terhadap penurunan HbA1c..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg disabled:bg-[#F7F8FA]"
            />
          </div>

          {/* Conditional Framework Fields */}
          {framework === "PICO" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E4E7EC]">
              <div>
                <label className="block text-xs font-bold text-[#17324D] mb-1">
                  [P] Population / Participants
                </label>
                <textarea
                  name="picoPopulation"
                  rows={2}
                  disabled={isLocked}
                  defaultValue={protocol?.picoPopulation || ""}
                  placeholder="Karakteristik populasi, diagnosis klinis, batasan usia..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg disabled:bg-[#F7F8FA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17324D] mb-1">
                  [I] Intervention / Exposure
                </label>
                <textarea
                  name="picoIntervention"
                  rows={2}
                  disabled={isLocked}
                  defaultValue={protocol?.picoIntervention || ""}
                  placeholder="Jenis intervensi, modalitas teknologi, dosis atau durasi..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg disabled:bg-[#F7F8FA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17324D] mb-1">
                  [C] Comparator / Control
                </label>
                <textarea
                  name="picoComparator"
                  rows={2}
                  disabled={isLocked}
                  defaultValue={protocol?.picoComparator || ""}
                  placeholder="Grup pembanding: Usual care, placebo, terapi standar..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg disabled:bg-[#F7F8FA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17324D] mb-1">
                  [O] Outcomes of Interest
                </label>
                <textarea
                  name="picoOutcome"
                  rows={2}
                  disabled={isLocked}
                  defaultValue={protocol?.picoOutcome || ""}
                  placeholder="Hasil luaran primer & sekunder (misal: HbA1c, kepatuhan pasien)..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg disabled:bg-[#F7F8FA]"
                />
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-[#3E9C96]" />
                <span>{saving ? "Menyimpan..." : "Simpan Spesifikasi Protokol"}</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Eligibility Criteria (Inclusion & Exclusion) Section */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 space-y-6 shadow-sm">
        <div className="border-b border-[#E4E7EC] pb-3">
          <h3 className="text-sm font-bold text-[#17324D]">
            Kriteria Kelayakan Studi (Eligibility Criteria)
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Kriteria ini akan ditampilkan kepada reviewer saat tahap screening title/abstract dan full-text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inclusion Criteria Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <span className="text-xs font-bold text-[#18794E] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Kriteria Inklusi ({criteria.filter((c) => c.criterionType === "inclusion").length})
              </span>
            </div>

            <div className="space-y-2">
              {criteria
                .filter((c) => c.criterionType === "inclusion")
                .map((crit) => (
                  <div
                    key={crit.id}
                    className="p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      {crit.category && (
                        <span className="px-1.5 py-0.5 bg-[#EFF7F6] text-[#2F7D78] font-semibold text-[10px] rounded uppercase tracking-wider block w-fit mb-1">
                          {crit.category}
                        </span>
                      )}
                      <p className="text-[#17212B] leading-relaxed">{crit.description}</p>
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCriterion(crit.id)}
                        className="text-gray-400 hover:text-[#B42318] p-1 transition-colors"
                        title="Hapus kriteria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Exclusion Criteria Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <span className="text-xs font-bold text-[#B42318] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Kriteria Eksklusi ({criteria.filter((c) => c.criterionType === "exclusion").length})
              </span>
            </div>

            <div className="space-y-2">
              {criteria
                .filter((c) => c.criterionType === "exclusion")
                .map((crit) => (
                  <div
                    key={crit.id}
                    className="p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      {crit.category && (
                        <span className="px-1.5 py-0.5 bg-[#FEF3F2] text-[#B42318] font-semibold text-[10px] rounded uppercase tracking-wider block w-fit mb-1">
                          {crit.category}
                        </span>
                      )}
                      <p className="text-[#17212B] leading-relaxed">{crit.description}</p>
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCriterion(crit.id)}
                        className="text-gray-400 hover:text-[#B42318] p-1 transition-colors"
                        title="Hapus kriteria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Add New Criterion Form (if not locked) */}
        {!isLocked && (
          <form
            onSubmit={handleAddCriterion}
            className="p-4 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl space-y-3"
          >
            <span className="text-xs font-bold text-[#17324D] block">
              + Tambah Kriteria Baru
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                  Tipe Kriteria
                </label>
                <select
                  value={critType}
                  onChange={(e) => setCritType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E4E7EC] rounded-lg font-semibold"
                >
                  <option value="inclusion">Inklusi (Termasuk)</option>
                  <option value="exclusion">Eksklusi (Dikeluarkan)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={critCategory}
                  onChange={(e) => setCritCategory(e.target.value)}
                  placeholder="Misal: Population, Study Design, Language"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E4E7EC] rounded-lg"
                />
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 bg-[#2F7D78] hover:bg-[#266662] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan</span>
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                required
                value={critDesc}
                onChange={(e) => setCritDesc(e.target.value)}
                placeholder="Tuliskan deskripsi kriteria secara spesifik..."
                className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
