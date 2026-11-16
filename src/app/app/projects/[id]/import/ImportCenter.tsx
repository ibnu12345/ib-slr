"use client";

import React, { useState } from "react";
import Link from "next/link";
import { importReferencesAction } from "../../../../../lib/research/actions";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CopyCheck,
  Library,
} from "lucide-react";

interface Props {
  projectId: string;
}

const sampleRis = `TY  - JOUR
TI  - Smartphone-based intervention for type 2 diabetes self-management: a randomized controlled trial
AU  - Henderson, J. R.
AU  - Miller, S. T.
AU  - Taylor, B. K.
PY  - 2024
JO  - Journal of Medical Internet Research
VL  - 26
IS  - 3
SP  - e41290
DO  - 10.2196/41290
AB  - Background: Type 2 diabetes requires continuous glucose monitoring. Methods: 210 participants were randomized to a mobile coaching app or routine care. Results: HbA1c dropped 0.65% in intervention vs 0.15% in control.
ER  - 

TY  - JOUR
TI  - Telehealth monitoring in elderly diabetes patients: secondary outcomes from an observational study
AU  - Miller, S. T.
AU  - Taylor, B. K.
PY  - 2023
JO  - BMJ Open Diabetes Research & Care
VL  - 11
IS  - 2
DO  - 10.1136/bmjdrc-2023-003411
AB  - Evaluation of remote glucose transmission among geriatric diabetic cohorts.
ER  - `;

const sampleBibtex = `@article{henderson2024smartphone,
  title={Smartphone-based intervention for type 2 diabetes self-management: a randomized controlled trial},
  author={Henderson, J. R. and Miller, S. T. and Taylor, B. K.},
  journal={Journal of Medical Internet Research},
  volume={26},
  number={3},
  pages={e41290},
  year={2024},
  doi={10.2196/41290},
  abstract={Background: Type 2 diabetes requires continuous glucose monitoring. Results: Significant reduction in HbA1c.}
}

@article{ramirez2023continuous,
  title={Continuous glucose monitoring combined with mobile applications in diabetes management: A systematic appraisal},
  author={Ramirez, Carlos and Smith, Abigail},
  journal={Diabetes Technology & Therapeutics},
  volume={25},
  number={7},
  pages={450-459},
  year={2023},
  doi={10.1089/dia.2023.0112},
  abstract={Meta-synthesis of real-time telemetry versus flash glucose sensing devices.}
}`;

const sampleCsv = `Title,Authors,Year,Journal,DOI,Abstract
"Artificial intelligence coaching for diabetes adherence: A randomized pragmatic trial","Smith, John; Adams, Rebecca",2024,"Lancet Digital Health","10.1016/S2589-7500(24)00088-1","Pragmatic randomized trial assessing algorithmic nutritional recommendations."
"Smartphone-based intervention for type 2 diabetes self-management: a randomized controlled trial","Henderson, J. R.; Miller, S. T.",2024,"J Med Internet Res","10.2196/41290","Duplicate record with slight metadata variations to demonstrate fuzzy matching."`;

export function ImportCenter({ projectId }: Props) {
  const [format, setFormat] = useState<"ris" | "bibtex" | "csv">("ris");
  const [sourceDatabase, setSourceDatabase] = useState("PubMed / MEDLINE");
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    count?: number;
  } | null>(null);

  const handleLoadSample = () => {
    if (format === "ris") setRawText(sampleRis);
    else if (format === "bibtex") setRawText(sampleBibtex);
    else if (format === "csv") setRawText(sampleCsv);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("format", format);
    formData.append("sourceDatabase", sourceDatabase);
    formData.append("rawText", rawText);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const res = await importReferencesAction(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Impor berhasil!",
          count: res.importedCount,
        });
        setRawText("");
        setSelectedFile(null);
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal mengimpor referensi." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan server saat memproses impor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-5 rounded-xl border text-xs space-y-3 ${
            feedback.type === "success"
              ? "bg-[#ECFDF3] border-[#18794E]/30 text-[#18794E]"
              : "bg-[#FEF3F2] border-[#B42318]/30 text-[#B42318]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>

          {feedback.type === "success" && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#18794E]/20">
              <Link
                href={`/app/projects/${projectId}/library`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18794E] text-white font-semibold text-xs hover:bg-[#125D3B] transition-colors"
              >
                <Library className="w-3.5 h-3.5" />
                <span>Lihat di Reference Library</span>
              </Link>
              <Link
                href={`/app/projects/${projectId}/deduplication`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#18794E]/40 text-[#18794E] font-semibold text-xs hover:bg-[#F7F8FA] transition-colors"
              >
                <CopyCheck className="w-3.5 h-3.5" />
                <span>Cek Kandidat Duplikat</span>
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Format Selection & Source Database */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#17212B] mb-1">
              Format File Bibliografis
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("ris")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                  format === "ris"
                    ? "bg-[#17324D] text-white border-[#17324D]"
                    : "bg-white text-[#667085] border-[#E4E7EC] hover:bg-[#F7F8FA]"
                }`}
              >
                RIS (.ris)
              </button>
              <button
                type="button"
                onClick={() => setFormat("bibtex")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                  format === "bibtex"
                    ? "bg-[#17324D] text-white border-[#17324D]"
                    : "bg-white text-[#667085] border-[#E4E7EC] hover:bg-[#F7F8FA]"
                }`}
              >
                BibTeX (.bib)
              </button>
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                  format === "csv"
                    ? "bg-[#17324D] text-white border-[#17324D]"
                    : "bg-white text-[#667085] border-[#E4E7EC] hover:bg-[#F7F8FA]"
                }`}
              >
                CSV (.csv)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17212B] mb-1">
              Sumber Database Asal (Provenance)
            </label>
            <select
              value={sourceDatabase}
              onChange={(e) => setSourceDatabase(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg"
            >
              <option value="PubMed / MEDLINE">PubMed / MEDLINE</option>
              <option value="Scopus (Elsevier)">Scopus (Elsevier)</option>
              <option value="Web of Science (Clarivate)">Web of Science (Clarivate)</option>
              <option value="Crossref Export">Crossref Export</option>
              <option value="OpenAlex Export">OpenAlex Export</option>
              <option value="Cochrane Library">Cochrane Library</option>
              <option value="Manual File Import">Manual File Import</option>
            </select>
          </div>
        </div>

        {/* Upload File Input */}
        <div>
          <label className="block text-xs font-bold text-[#17212B] mb-1">
            Unggah Berkas Ekspor (Opsional jika menempel teks langsung)
          </label>
          <div className="border-2 border-dashed border-[#E4E7EC] hover:border-[#2F7D78] rounded-xl p-6 text-center transition-colors">
            <UploadCloud className="w-8 h-8 text-[#2F7D78] mx-auto mb-2" />
            <div className="text-xs text-[#17212B] font-medium mb-1">
              {selectedFile ? (
                <span className="font-bold text-[#2F7D78]">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              ) : (
                "Pilih berkas RIS, BibTeX, atau CSV dari komputer Anda"
              )}
            </div>
            <input
              type="file"
              accept=".ris,.bib,.txt,.csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-[#667085] file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#EFF7F6] file:text-[#2F7D78] hover:file:bg-[#D8EDE9]"
            />
          </div>
        </div>

        {/* Direct Text Paste Option */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#17212B]">
              Atau Tempel Teks Bibliografis Mentah ({format.toUpperCase()})
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F7D78] hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Muat Contoh Format {format.toUpperCase()}</span>
            </button>
          </div>
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Tempelkan kutipan ${format.toUpperCase()} di sini...`}
            className="w-full p-3 text-xs bg-white border border-[#E4E7EC] rounded-lg font-mono leading-relaxed"
          />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E7EC]">
          <span className="text-xs text-[#667085]">
            Setiap impor otomatis mencatat audit provenance dan menjalankan deteksi duplikat.
          </span>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4 text-[#3E9C96]" />
            <span>{loading ? "Memproses Impor..." : "Impor Referensi ke Library"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
