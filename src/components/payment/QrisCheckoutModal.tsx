"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Zap,
  Download,
} from "lucide-react";
import { QrisGenerateResponse, PaymentOrder } from "../../lib/types/payment";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: PaymentOrder) => void;
}

export function QrisCheckoutModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<QrisGenerateResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize payment when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus("pending");
      setError(null);
      setTimeLeft(15 * 60);
      initializeOrder();
    }
  }, [isOpen]);

  const initializeOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create", { method: "POST" });
      const data = await res.json();
      if (data.success && data.order) {
        setOrderData(data);
      } else {
        setError(data.error || "Gagal menginisiasi pembayaran QRIS.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat menyiapkan QRIS.");
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status every 3 seconds while pending
  useEffect(() => {
    if (!orderData || paymentStatus === "paid") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderData.order.orderId }),
        });
        const data = await res.json();
        if (data.success && data.status === "paid") {
          setPaymentStatus("paid");
          if (onSuccess && data.order) {
            onSuccess(data.order);
          }
        }
      } catch (err) {
        // Polling silent catch
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderData, paymentStatus, onSuccess]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || paymentStatus === "paid") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, paymentStatus]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Simulate payment for demo & instant testing
  const handleSimulatePayment = async () => {
    if (!orderData) return;
    setSimulating(true);
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.order.orderId,
          simulate: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.status === "paid") {
        setPaymentStatus("paid");
        if (onSuccess && data.order) {
          onSuccess(data.order);
        }
      }
    } catch {
      setError("Gagal melakukan simulasi pembayaran.");
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E4E7EC] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#17324D] text-[#3E9C96] flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17324D]">
                Pembayaran Resmi QRIS — Top-Up 1X Proyek
              </h3>
              <p className="text-[11px] text-[#667085]">
                Konfirmasi otomatis seketika melalui Bank Indonesia & Midtrans
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#2F7D78] animate-spin mx-auto" />
              <p className="text-xs text-[#667085] font-medium">
                Menghubungkan ke Gateway QRIS & Menyiapkan Kode Pembayaran...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-[#FEF3F2] border border-[#B42318]/30 rounded-xl text-center space-y-3">
              <p className="text-xs font-semibold text-[#B42318]">{error}</p>
              <button
                onClick={initializeOrder}
                className="px-4 py-2 bg-[#17324D] text-white rounded-lg text-xs font-semibold hover:bg-[#12273D]"
              >
                Coba Lagi
              </button>
            </div>
          ) : paymentStatus === "paid" ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF3] border-4 border-[#18794E]/20 text-[#18794E] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#ECFDF3] text-[#18794E] font-bold uppercase tracking-wider">
                  Pembayaran Berhasil!
                </span>
                <h2 className="text-xl font-extrabold text-[#17324D] mt-2">
                  Rp 20.000 Terverifikasi
                </h2>
                <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                  Selamat! Kuota +1 Active Systematic Review Project telah berhasil ditambahkan ke akun Anda.
                </p>
              </div>

              <div className="p-3.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs space-y-1.5 text-left max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#667085]">No. Invoice:</span>
                  <span className="font-mono font-bold text-[#17324D]">{orderData?.order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Item:</span>
                  <span className="font-medium text-[#17212B]">1X Active Project Pass</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Metode:</span>
                  <span className="font-medium text-[#2F7D78] uppercase">QRIS Instant</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="/app/projects/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Proyek Baru Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA]"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            /* Pending QRIS Scan State */
            <div className="space-y-5">
              {/* Price Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#17324D] to-[#244A70] text-white flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider block">Total Tagihan</span>
                  <span className="text-xl font-extrabold tracking-tight">Rp 20.000</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono font-semibold">
                  <Clock className="w-3.5 h-3.5 text-[#3E9C96]" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="p-5 bg-white border-2 border-dashed border-[#2F7D78]/40 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                {/* QRIS Header */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="font-black text-sm tracking-wider text-black">QRIS</span>
                  <span className="text-[10px] text-gray-400">|</span>
                  <span className="text-[10px] font-semibold text-gray-500">QR Code Standar Pembayaran Nasional</span>
                </div>

                {/* The QR Image */}
                {orderData && (
                  <div className="p-2 bg-white rounded-xl shadow-md border border-[#E4E7EC]">
                    <img
                      src={orderData.qrCodeUrl}
                      alt="QRIS Payment QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                )}

                {/* Supported Wallets Icons */}
                <p className="text-[11px] text-[#667085] mt-3">
                  Dapat di-scan dengan: <strong>BCA Mobile, Livin' Mandiri, BRImo, BNI, GoPay, OVO, Dana, ShopeePay, LinkAja</strong>
                </p>
              </div>

              {/* Sandbox Simulation / Instant Test Button */}
              <div className="p-3 bg-[#EFF7F6] border border-[#2F7D78]/25 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#17324D]">
                  <Zap className="w-4 h-4 text-[#2F7D78] shrink-0" />
                  <span>
                    <strong>Uji Coba Langsung:</strong> Uji alur verifikasi instan tanpa memotong saldo bank Anda.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{simulating ? "Memverifikasi..." : "Simulasi Bayar Sekarang"}</span>
                </button>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-1.5 text-xs text-[#667085] border-t border-[#E4E7EC] pt-4">
                <span className="font-bold text-[#17324D] block text-xs">Petunjuk Pembayaran QRIS:</span>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>Buka aplikasi m-Banking atau e-Wallet favorit Anda.</li>
                  <li>Pilih menu <strong>Bayar / QRIS</strong> lalu arahkan kamera ke kode di atas.</li>
                  <li>Pastikan nama merchant adalah <strong>IB-SLR Research SaaS</strong> dan nominal <strong>Rp 20.000</strong>.</li>
                  <li>Masukkan PIN Anda. Halaman ini akan otomatis berganti sukses begitu dana diterima.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
