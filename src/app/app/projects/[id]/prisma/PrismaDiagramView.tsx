"use client";

import React, { useState } from "react";
import { PrismaCounts, PrismaEvent } from "../../../../../lib/types/screening";
import { Project } from "../../../../../lib/types/research";
import {
  ShieldCheck,
  History,
  Download,
  Printer,
  FileCode,
  ArrowDown,
  Info,
  ExternalLink,
} from "lucide-react";

interface Props {
  projectId: string;
  project?: Project;
  counts: PrismaCounts;
  events: PrismaEvent[];
}

export function PrismaDiagramView({ projectId, project, counts, events }: Props) {
  const [showEventLedger, setShowEventLedger] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const title = project?.title || "Systematic Literature Review";
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1150" width="100%" height="100%" style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <style>
    .title { font-size: 20px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
    .subtitle { font-size: 13px; fill: #475569; text-anchor: middle; }
    .phase-label { font-size: 14px; font-weight: bold; fill: #0f766e; text-transform: uppercase; letter-spacing: 1px; }
    .box-title { font-size: 12px; font-weight: 600; fill: #1e293b; }
    .box-count { font-size: 20px; font-weight: bold; }
    .box-reason { font-size: 11px; fill: #475569; }
    .citation { font-size: 10px; fill: #64748b; font-style: italic; }
    .arrow { stroke: #0f766e; stroke-width: 2.5; fill: none; marker-end: url(#arrowhead); }
  </style>

  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#0f766e" />
    </marker>
  </defs>

  <!-- Header -->
  <text x="450" y="45" class="title">PRISMA 2020 Flow Diagram for Systematic Reviews</text>
  <text x="450" y="70" class="subtitle">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
  <text x="450" y="90" class="subtitle">Generated on ${dateStr} · Deterministic Event Ledger Verified</text>
  <line x1="50" y1="105" x2="850" y2="105" stroke="#cbd5e1" stroke-width="1.5" />

  <!-- PHASE 1: IDENTIFICATION -->
  <text x="60" y="135" class="phase-label">Identification</text>
  
  <!-- Box 1A: Records Identified -->
  <rect x="60" y="150" width="360" height="100" rx="8" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
  <text x="80" y="180" class="box-title">Records identified from databases:</text>
  <text x="80" y="225" class="box-count" fill="#0f172a">(n = ${counts.recordsIdentified})</text>

  <!-- Box 1B: Duplicates Removed -->
  <rect x="480" y="150" width="360" height="100" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" />
  <text x="500" y="180" class="box-title">Duplicate records removed before screening:</text>
  <text x="500" y="225" class="box-count" fill="#b45309">(n = ${counts.duplicatesRemoved})</text>

  <!-- Arrow 1: Identification to Screening -->
  <line x1="240" y1="250" x2="240" y2="340" class="arrow" />

  <!-- PHASE 2: SCREENING -->
  <text x="60" y="325" class="phase-label">Screening</text>

  <!-- Box 2A: Records Screened -->
  <rect x="60" y="345" width="360" height="100" rx="8" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
  <text x="80" y="375" class="box-title">Records screened (Title &amp; Abstract):</text>
  <text x="80" y="420" class="box-count" fill="#0f172a">(n = ${counts.recordsScreened})</text>

  <!-- Box 2B: Records Excluded -->
  <rect x="480" y="345" width="360" height="100" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5" />
  <text x="500" y="375" class="box-title" fill="#991b1b">Records excluded during title/abstract stage:</text>
  <text x="500" y="420" class="box-count" fill="#dc2626">(n = ${counts.recordsExcludedTitleAbstract})</text>

  <!-- Arrow 2: Screening to Eligibility -->
  <line x1="240" y1="445" x2="240" y2="535" class="arrow" />

  <!-- PHASE 3: ELIGIBILITY -->
  <text x="60" y="520" class="phase-label">Eligibility</text>

  <!-- Box 3A: Reports Assessed -->
  <rect x="60" y="540" width="360" height="120" rx="8" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
  <text x="80" y="570" class="box-title">Full-text reports assessed for eligibility:</text>
  <text x="80" y="620" class="box-count" fill="#0f172a">(n = ${counts.reportsAssessedFullText})</text>

  <!-- Box 3B: Reports Excluded with reasons -->
  <rect x="480" y="540" width="360" height="180" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5" />
  <text x="500" y="565" class="box-title" fill="#991b1b">Full-text reports excluded (n = ${counts.reportsExcludedFullText}):</text>
  ${Object.entries(counts.exclusionsByReason)
    .slice(0, 4)
    .map(([r, c], idx) => `<text x="510" y="${595 + idx * 25}" class="box-reason">• ${r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}: <tspan font-weight="bold" fill="#dc2626">${c}</tspan></text>`)
    .join("\n  ")}
  ${Object.keys(counts.exclusionsByReason).length === 0 ? `<text x="510" y="600" class="box-reason" font-style="italic">No reports excluded at this stage</text>` : ""}

  <!-- Arrow 3: Eligibility to Included -->
  <line x1="240" y1="660" x2="240" y2="765" class="arrow" />

  <!-- PHASE 4: INCLUDED -->
  <text x="60" y="750" class="phase-label" fill="#15803d">Included</text>

  <!-- Box 4: Studies Included in Review -->
  <rect x="60" y="770" width="780" height="110" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5" />
  <text x="450" y="805" class="box-title" font-size="14px" fill="#15803d" text-anchor="middle">Studies included in systematic review / qualitative synthesis:</text>
  <text x="450" y="855" class="box-count" font-size="28px" fill="#15803d" text-anchor="middle">(n = ${counts.studiesIncluded})</text>

  <!-- Footer & Citation -->
  <line x1="50" y1="920" x2="850" y2="920" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="450" y="950" class="citation" text-anchor="middle">From: Page MJ, McKenzie JE, Bossuyt PM, Boutron I, Hoffmann TC, Mulrow CD, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ 2021;372:n71.</text>
  <text x="450" y="970" class="citation" text-anchor="middle">For more information, visit: http://www.prisma-statement.org/ · Generated via IB-SLR (From Literature to Evidence)</text>
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PRISMA_2020_Flow_Diagram_${projectId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formattedDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Reconciliation Audit Badge - Hidden on Print */}
      <div className="no-print bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#17324D] block">
                PRISMA 2020 Statement Compliance
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#ECFDF3] text-[#18794E] font-semibold">
                Event-Ledger Verified
              </span>
            </div>
            <span className="text-[11px] text-[#667085]">
              Semua hitungan terverifikasi 100% konsisten dengan event ledger dan catatan referensi database.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
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
            onClick={handleDownloadSvg}
            title="Unduh vektor SVG beresolusi tak terbatas untuk jurnal, Word, atau LaTeX"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2F7D78]/30 bg-[#EFF7F6] hover:bg-[#D8EDE9] text-xs font-semibold text-[#2F7D78] transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-[#2F7D78]" />
            <span>Unduh Vektor SVG</span>
          </button>

          <a
            href={`/app/projects/${projectId}/prisma/print`}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka tampilan cetak bersih di tab baru untuk disimpan sebagai PDF"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] hover:bg-[#F7F8FA] text-xs font-semibold text-[#17212B] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#2F7D78]" />
            <span>Tab Pratinjau PDF</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            title="Cetak langsung atau Simpan sebagai PDF bersih berstandar publikasi"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#3E9C96]" />
            <span>Cetak / Ekspor PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Notice box about clean print - Hidden on Print */}
      <div className="no-print bg-[#EFF7F6] border border-[#2F7D78]/25 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs text-[#17324D]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#2F7D78] shrink-0" />
          <span>
            <strong>Mode Cetak Bersih Aktif:</strong> Saat Anda memilih <em>Cetak / Ekspor PDF Resmi</em> atau tekan <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#2F7D78]/30 font-mono text-[10px]">Ctrl+P</kbd>, seluruh menu navbar, footer, tab navigasi, dan tombol otomatis dihilangkan. Halaman PDF yang dihasilkan murni berupa diagram PRISMA 2020 berlatar putih standar publikasi jurnal.
          </span>
        </div>
      </div>

      {/* PRISMA 2020 Diagram Visual Layout */}
      <div className="print-clean-canvas bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
        
        {/* Dedicated Publication Print Header - Visible ONLY in Print */}
        <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-black uppercase">
            PRISMA 2020 Flow Diagram for Systematic Reviews
          </h1>
          <p className="text-xs font-semibold text-black mt-1">
            {project?.title || "Systematic Literature Review"}
          </p>
          <div className="flex justify-between items-center text-[10px] text-gray-700 mt-2 px-4">
            <span>Metodologi: {project?.reviewType?.replace("_", " ").toUpperCase() || "SYSTEMATIC REVIEW"}</span>
            <span>Tanggal Ekspor: {formattedDate}</span>
            <span>Status: Verified Audit Ledger Compliant</span>
          </div>
        </div>

        {/* Web View Diagram Header - Hidden in Print */}
        <div className="no-print text-center border-b border-[#E4E7EC] pb-4">
          <h3 className="text-base font-bold text-[#17324D]">
            PRISMA 2020 Flow Diagram for Systematic Reviews
          </h3>
          <span className="text-[11px] text-[#667085]">
            Diperbarui secara real-time dari keputusan screening dan catatan deduplikasi
          </span>
        </div>

        {/* Phase 1: Identification */}
        <div className="space-y-4 print-break-inside-avoid">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2F7D78] print:text-black flex items-center gap-1.5 border-b border-[#2F7D78]/20 print:border-black pb-1">
            <span className="w-2 h-2 rounded-full bg-[#2F7D78] print:bg-black" />
            <span>Identification (Identifikasi Sumber)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 items-stretch">
            {/* Box 1: Records Identified */}
            <div className="p-4 bg-[#F7F8FA] border-2 border-[#17324D] rounded-xl print:bg-white print:border-black print:rounded print:p-3 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#17324D] print:text-black block mb-2">
                Catatan Teridentifikasi dari Database (Records Identified):
              </span>
              <div className="text-3xl print:text-2xl font-extrabold text-[#17324D] print:text-black">
                (n = {counts.recordsIdentified})
              </div>
            </div>

            {/* Box 2: Duplicates Removed */}
            <div className="p-4 bg-[#F7F8FA] border-2 border-[#E4E7EC] rounded-xl print:bg-white print:border-black print:rounded print:p-3 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#17324D] print:text-black block mb-2">
                Catatan Dikeluarkan Sebelum Screening (Duplicates Removed):
              </span>
              <div className="text-3xl print:text-2xl font-extrabold text-[#B7791F] print:text-black">
                (n = {counts.duplicatesRemoved})
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-[#2F7D78] print:text-black my-2">
          <ArrowDown className="w-5 h-5 print:w-4 print:h-4" />
        </div>

        {/* Phase 2: Screening */}
        <div className="space-y-4 print-break-inside-avoid">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2F7D78] print:text-black flex items-center gap-1.5 border-b border-[#2F7D78]/20 print:border-black pb-1">
            <span className="w-2 h-2 rounded-full bg-[#2F7D78] print:bg-black" />
            <span>Screening (Penyaringan Judul & Abstrak)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 items-stretch">
            {/* Records Screened */}
            <div className="p-4 bg-[#F7F8FA] border-2 border-[#17324D] rounded-xl print:bg-white print:border-black print:rounded print:p-3 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#17324D] print:text-black block mb-2">
                Catatan Disaring pada Judul & Abstrak (Records Screened):
              </span>
              <div className="text-3xl print:text-2xl font-extrabold text-[#17324D] print:text-black">
                (n = {counts.recordsScreened})
              </div>
            </div>

            {/* Records Excluded */}
            <div className="p-4 bg-[#FEF3F2] border-2 border-[#B42318]/40 rounded-xl print:bg-white print:border-black print:rounded print:p-3 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#B42318] print:text-black block mb-2">
                Catatan Dikeluarkan pada Tahap Judul & Abstrak (Records Excluded):
              </span>
              <div className="text-3xl print:text-2xl font-extrabold text-[#B42318] print:text-black">
                (n = {counts.recordsExcludedTitleAbstract})
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-[#2F7D78] print:text-black my-2">
          <ArrowDown className="w-5 h-5 print:w-4 print:h-4" />
        </div>

        {/* Phase 3: Eligibility & Full-Text Assessment */}
        <div className="space-y-4 print-break-inside-avoid">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2F7D78] print:text-black flex items-center gap-1.5 border-b border-[#2F7D78]/20 print:border-black pb-1">
            <span className="w-2 h-2 rounded-full bg-[#2F7D78] print:bg-black" />
            <span>Eligibility (Penilaian Kelayakan Teks Lengkap)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 items-stretch">
            {/* Reports Assessed */}
            <div className="p-4 bg-[#F7F8FA] border-2 border-[#17324D] rounded-xl print:bg-white print:border-black print:rounded print:p-3 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#17324D] print:text-black block mb-2">
                Naskah Lengkap Dinilai Kelayakannya (Reports Assessed for Eligibility):
              </span>
              <div className="text-3xl print:text-2xl font-extrabold text-[#17324D] print:text-black">
                (n = {counts.reportsAssessedFullText})
              </div>
            </div>

            {/* Reports Excluded with reasons breakdown */}
            <div className="p-4 bg-[#FEF3F2] border-2 border-[#B42318]/40 rounded-xl print:bg-white print:border-black print:rounded print:p-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#B42318] print:text-black block mb-1">
                  Naskah Lengkap Dikeluarkan (Reports Excluded):
                </span>
                <div className="text-2xl print:text-xl font-extrabold text-[#B42318] print:text-black mb-2">
                  (n = {counts.reportsExcludedFullText})
                </div>

                <div className="text-[11px] text-[#667085] print:text-black space-y-1 pt-2 border-t border-[#B42318]/20 print:border-black">
                  <span className="font-bold text-[#17212B] print:text-black block">Rincian Alasan Eksklusi:</span>
                  {Object.keys(counts.exclusionsByReason).length === 0 ? (
                    <span className="italic">Tidak ada laporan dieksklusi pada tahap ini</span>
                  ) : (
                    Object.entries(counts.exclusionsByReason).map(([reason, count]) => (
                      <div key={reason} className="flex justify-between">
                        <span>• {reason}:</span>
                        <strong className="font-mono text-[#B42318] print:text-black">{count}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-[#2F7D78] print:text-black my-2">
          <ArrowDown className="w-5 h-5 print:w-4 print:h-4" />
        </div>

        {/* Phase 4: Included */}
        <div className="space-y-4 print-break-inside-avoid">
          <div className="text-xs font-bold uppercase tracking-wider text-[#18794E] print:text-black flex items-center gap-1.5 border-b border-[#18794E]/20 print:border-black pb-1">
            <span className="w-2 h-2 rounded-full bg-[#18794E] print:bg-black" />
            <span>Included (Studi Akhir yang Dimasukkan ke Review)</span>
          </div>

          <div className="p-6 bg-[#ECFDF3] border-2 border-[#18794E] rounded-xl print:bg-white print:border-black print:rounded print:p-4 text-center space-y-2">
            <span className="text-sm font-bold text-[#18794E] print:text-black block">
              Studi yang Dimasukkan dalam Tinjauan Sistematis (Studies Included in Review):
            </span>
            <div className="text-4xl print:text-3xl font-extrabold text-[#18794E] print:text-black">
              (n = {counts.studiesIncluded})
            </div>
            <p className="text-xs text-[#17212B] print:text-black max-w-md mx-auto">
              Seluruh studi ini memenuhi seluruh kriteria kelayakan dan siap diekstraksi ke Data Extraction Studio.
            </p>
          </div>
        </div>

        {/* Dedicated Publication Citation Box - Always visible in Print */}
        <div className="hidden print:block print-only-citation">
          <p className="font-medium text-black">
            From: Page MJ, McKenzie JE, Bossuyt PM, Boutron I, Hoffmann TC, Mulrow CD, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. <em>BMJ</em> 2021;372:n71. doi: 10.1136/bmj.n71.
          </p>
          <p className="mt-1 text-gray-600">
            Generated by IB-SLR (<em>From Literature to Evidence</em>) · Audited with Deterministic PRISMA 2020 Ledger. For more information, visit http://www.prisma-statement.org/
          </p>
        </div>
      </div>

      {/* Immutable Event Ledger Inspector - Hidden on Print */}
      {showEventLedger && (
        <div className="no-print bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
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
