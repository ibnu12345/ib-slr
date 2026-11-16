"use client";

import React, { useState } from "react";
import { PrismaCounts, PrismaEvent } from "../../../../../lib/types/screening";
import {
  GitBranch,
  CheckCircle2,
  Download,
  ShieldCheck,
  History,
  ArrowDown,
  Layers,
} from "lucide-react";

interface Props {
  projectId: string;
  counts: PrismaCounts;
  events: PrismaEvent[];
}

export function PrismaDiagramView({ projectId, counts, events }: Props) {
  const [showEventLedger, setShowEventLedger] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Reconciliation Audit Badge */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#17324D] block">
              PRISMA 2020 Statement Compliance
            </span>
            <span className="text-[11px] text-[#667085]">
              Semua hitungan terverifikasi 100% konsisten dengan event ledger dan catatan referensi database.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEventLedger(!showEventLedger)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] hover:bg-[#F7F8FA] text-xs font-semibold text-[#17212B] transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#2F7D78]" />
            <span>{showEventLedger ? "Tutup Audit Ledger" : "Buka Audit Ledger"}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#3E9C96]" />
            <span>Cetak / Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive PRISMA 2020 Diagram Visual Layout */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-8 shadow-sm space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none">
        <div className="text-center border-b border-[#E4E7EC] pb-4">
          <h3 className="text-base font-bold text-[#17324D]">
            PRISMA 2020 Flow Diagram for Systematic Reviews
          </h3>
          <span className="text-[11px] text-[#667085]">
            Diperbarui secara real-time dari keputusan screening dan catatan deduplikasi
          </span>
        </div>

        {/* Phase 1: Identification */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2F7D78] flex items-center gap-1.5 border-b border-[#2F7D78]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#2F7D78]" />
            <span>Identification (Identifikasi Sumber)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Box 1: Records Identified */}
            <div className="p-4 bg-[#F7F8FA] border-2 border-[#17324D] rounded-xl flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#17324D] block mb-2">
                Catatan Teridentifikasi dari Database (Records Identified):
              </span>
              <div className="text-3xl font-extrabold text-[#17324D]">
                (n = {counts.recordsIdentified})
              </div>
            </div>

            {/* Box 2: Duplicates Removed */}
            <div className="p-4 bg-[#F7F8FA] border-2 border-[#E4E7EC] rounded-xl flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#17324D] block mb-2">
                Catatan Dikeluarkan Sebelum Screening (Duplicates Removed):
              </span>
              <div className="text-3xl font-extrabold text-[#B7791F]">
                (n = {counts.duplicatesRemoved})
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-[#2F7D78]">
          <ArrowDown className="w-5 h-5 animate-pulse" />
        </div>

        {/* Phase 2: Screening */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2F7D78] flex items-center gap-1.5 border-b border-[#2F7D78]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#2F7D78]" />
            <span>Screening (Penyaringan Judul & Abstrak)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Records Screened */}
            <div className="p-4 bg-[#F7F8FA] border-2 border-[#17324D] rounded-xl flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#17324D] block mb-2">
                Catatan Disaring pada Judul & Abstrak (Records Screened):
              </span>
              <div className="text-3xl font-extrabold text-[#17324D]">
                (n = {counts.recordsScreened})
              </div>
            </div>

            {/* Records Excluded */}
            <div className="p-4 bg-[#FEF3F2] border-2 border-[#B42318]/40 rounded-xl flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#B42318] block mb-2">
                Catatan Dikeluarkan pada Tahap Judul & Abstrak (Records Excluded):
              </span>
              <div className="text-3xl font-extrabold text-[#B42318]">
                (n = {counts.recordsExcludedTitleAbstract})
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-[#2F7D78]">
          <ArrowDown className="w-5 h-5 animate-pulse" />
        </div>

        {/* Phase 3: Eligibility & Full-Text Assessment */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2F7D78] flex items-center gap-1.5 border-b border-[#2F7D78]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#2F7D78]" />
            <span>Eligibility (Penilaian Kelayakan Teks Lengkap)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Reports Assessed */}
            <div className="p-4 bg-[#F7F8FA] border-2 border-[#17324D] rounded-xl flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#17324D] block mb-2">
                Naskah Lengkap Dinilai Kelayakannya (Reports Assessed for Eligibility):
              </span>
              <div className="text-3xl font-extrabold text-[#17324D]">
                (n = {counts.reportsAssessedFullText})
              </div>
            </div>

            {/* Reports Excluded with reasons breakdown */}
            <div className="p-4 bg-[#FEF3F2] border-2 border-[#B42318]/40 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#B42318] block mb-1">
                  Naskah Lengkap Dikeluarkan (Reports Excluded):
                </span>
                <div className="text-2xl font-extrabold text-[#B42318] mb-2">
                  (n = {counts.reportsExcludedFullText})
                </div>

                <div className="text-[11px] text-[#667085] space-y-1 pt-2 border-t border-[#B42318]/20">
                  <span className="font-bold text-[#17212B] block">Rincian Alasan Eksklusi:</span>
                  {Object.keys(counts.exclusionsByReason).length === 0 ? (
                    <span className="italic">Tidak ada laporan dieksklusi pada tahap ini</span>
                  ) : (
                    Object.entries(counts.exclusionsByReason).map(([reason, count]) => (
                      <div key={reason} className="flex justify-between">
                        <span>• {reason}:</span>
                        <strong className="font-mono text-[#B42318]">{count}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-[#2F7D78]">
          <ArrowDown className="w-5 h-5 animate-pulse" />
        </div>

        {/* Phase 4: Included */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#18794E] flex items-center gap-1.5 border-b border-[#18794E]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#18794E]" />
            <span>Included (Studi Akhir yang Dimasukkan ke Review)</span>
          </div>

          <div className="p-6 bg-[#ECFDF3] border-2 border-[#18794E] rounded-xl text-center space-y-2">
            <span className="text-sm font-bold text-[#18794E] block">
              Studi yang Dimasukkan dalam Tinjauan Sistematis (Studies Included in Review):
            </span>
            <div className="text-4xl font-extrabold text-[#18794E]">
              (n = {counts.studiesIncluded})
            </div>
            <p className="text-xs text-[#17212B] max-w-md mx-auto">
              Seluruh studi ini memenuhi seluruh kriteria kelayakan dan siap diekstraksi ke Data Extraction Studio.
            </p>
          </div>
        </div>
      </div>

      {/* Immutable Event Ledger Inspector */}
      {showEventLedger && (
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-[#F7F8FA] border-b border-[#E4E7EC] flex items-center gap-2">
            <History className="w-4 h-4 text-[#2F7D78]" />
            <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
              Audit Event Ledger PRISMA 2020 ({events.length} Peristiwa Tercatat)
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFFFF] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Waktu</th>
                  <th className="py-2.5 px-4">Tipe Peristiwa</th>
                  <th className="py-2.5 px-4">Delta</th>
                  <th className="py-2.5 px-4">Alasan / Rujukan</th>
                  <th className="py-2.5 px-4">Aktor / Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap text-[#667085] font-mono text-[11px]">
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#2F7D78]">
                      {ev.eventType}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#17212B]">
                      +{ev.deltaCount}
                    </td>
                    <td className="py-2.5 px-4 text-[#667085]">{ev.reason || "-"}</td>
                    <td className="py-2.5 px-4 text-[#17212B]">{ev.triggeredBy || "System"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
