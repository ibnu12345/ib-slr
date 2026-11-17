"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Receipt,
  QrCode,
} from "lucide-react";
import { PaymentOrder } from "../../../../../lib/types/payment";

interface Props {
  order: PaymentOrder;
  isId?: boolean;
}

export function InvoicePrintView({ order, isId = true }: Props) {
  const isPaid = order.status === "paid";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-8 sm:py-12 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top Action Bar (Hidden on Print) */}
        <div className="no-print flex items-center justify-between mb-6">
          <Link
            href="/app/billing"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F7D78] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isId ? "Kembali ke Billing & Kuota" : "Back to Billing & Quota"}</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-[#3E9C96]" />
            <span>{isId ? "Cetak / Simpan PDF Kuitansi" : "Print / Save PDF Receipt"}</span>
          </button>
        </div>

        {/* Invoice Paper Document */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-md p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-[#E4E7EC] gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E4E7EC] p-1.5 flex items-center justify-center shadow-sm shrink-0">
                <img
                  src="/logo-icon.png"
                  alt="IB-SLR Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#17324D] tracking-tight">IB-SLR</h1>
                <p className="text-[11px] text-[#667085] font-medium uppercase tracking-wider">
                  From Literature to Evidence • SaaS Platform
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EFF7F6] text-[#2F7D78] border border-[#2F7D78]/20">
                {isId ? "Faktur Pembayaran Resmi" : "Official Tax Invoice"}
              </span>
              <p className="font-mono text-xs font-bold text-[#17324D] mt-2">{order.orderId}</p>
            </div>
          </div>

          {/* Status Banner */}
          <div className="my-6 p-4 rounded-xl flex items-center justify-between border" style={{
            backgroundColor: isPaid ? "#ECFDF3" : "#FEF7EC",
            borderColor: isPaid ? "#A6F4C5" : "#FEDF89",
          }}>
            <div className="flex items-center gap-3">
              {isPaid ? (
                <CheckCircle2 className="w-6 h-6 text-[#18794E]" />
              ) : (
                <Clock className="w-6 h-6 text-[#B7791F]" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block" style={{
                  color: isPaid ? "#18794E" : "#B7791F",
                }}>
                  {isPaid ? (isId ? "Status: LUNAS / TERVERIFIKASI" : "Status: PAID & VERIFIED") : (isId ? "Status: MENUNGGU PEMBAYARAN" : "Status: PENDING PAYMENT")}
                </span>
                <span className="text-[11px] text-[#667085]">
                  {isPaid
                    ? (isId
                        ? `Diterima pada ${new Date(order.paidAt || order.createdAt).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "medium" })}`
                        : `Received on ${new Date(order.paidAt || order.createdAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "medium" })}`)
                    : (isId ? "Menunggu pelunasan via QRIS" : "Awaiting QRIS settlement")}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-extrabold text-[#17324D]">
                Rp {order.amount.toLocaleString("id-ID")}
              </span>
              <span className="block text-[10px] text-[#667085] uppercase">IDR • Lunas</span>
            </div>
          </div>

          {/* Customer & Merchant Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">
                {isId ? "Diterbitkan Untuk (Customer):" : "Billed To (Customer):"}
              </span>
              <p className="font-bold text-[#17324D] text-sm">{order.userName}</p>
              <p className="text-[#667085]">{order.userEmail}</p>
              <p className="text-[11px] text-[#667085] font-mono mt-0.5">User ID: {order.userId}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">
                {isId ? "Penerima Pembayaran (Merchant):" : "Issued By (Merchant):"}
              </span>
              <p className="font-bold text-[#17324D] text-sm">IB-SLR Research Technologies</p>
              <p className="text-[#667085]">Gateway: QRIS Bank Indonesia (EMVCo) / Midtrans</p>
              <p className="text-[11px] text-[#667085]">Jakarta, Indonesia</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-[#E4E7EC] rounded-xl overflow-hidden my-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FB] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Item / Layanan</th>
                  <th className="px-5 py-3 text-center">Jumlah</th>
                  <th className="px-5 py-3 text-right">Harga Satuan</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                <tr>
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#17324D]">{order.itemDescription}</p>
                    <p className="text-[11px] text-[#667085] mt-0.5">
                      {isId
                        ? "Penambahan kuota 1x proyek aktif Systematic Literature Review (PRISMA 2020 & VOSviewer export included)"
                        : "Quota unlock for +1 active systematic literature review project slot"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-[#17324D]">1</td>
                  <td className="px-5 py-4 text-right text-[#667085]">Rp {order.amount.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-4 text-right font-bold text-[#17324D]">Rp {order.amount.toLocaleString("id-ID")}</td>
                </tr>
              </tbody>
              <tfoot className="bg-[#F8F9FB] border-t border-[#E4E7EC] font-bold">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-right text-[#667085]">Subtotal:</td>
                  <td className="px-5 py-3 text-right text-[#17324D]">Rp {order.amount.toLocaleString("id-ID")}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-5 py-2 text-right text-[#667085]">PPN / Biaya Transaksi:</td>
                  <td className="px-5 py-2 text-right text-[#18794E]">Rp 0 (Termasuk)</td>
                </tr>
                <tr className="border-t border-[#E4E7EC] text-sm">
                  <td colSpan={3} className="px-5 py-3.5 text-right text-[#17324D]">Total Pelunasan:</td>
                  <td className="px-5 py-3.5 text-right text-[#2F7D78]">Rp {order.amount.toLocaleString("id-ID")}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Paid Stamp & Security Guarantee */}
          <div className="pt-6 border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667085]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2F7D78]" />
              <span>
                {isId
                  ? "Transaksi ini diproses secara deterministik dan dilindungi enkripsi SHA-512."
                  : "Transaction processed deterministically with SHA-512 cryptographic verification."}
              </span>
            </div>

            {isPaid && (
              <div className="px-4 py-1.5 rounded-lg border-2 border-[#18794E] text-[#18794E] font-black tracking-widest uppercase text-xs rotate-[-2deg]">
                ✓ OFFICIAL PAID RECEIPT
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
