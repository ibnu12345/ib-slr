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
  ExternalLink,
  CreditCard,
  Building2,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { QrisGenerateResponse, PaymentOrder } from "../../lib/types/payment";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: PaymentOrder) => void;
  planKey?: string; // "pay_per_project" | "pro_researcher" | "institutional"
}

type PaymentMethodTab = "qris" | "va" | "ewallet" | "card";

export function QrisCheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  planKey = "pay_per_project",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<QrisGenerateResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodTab>("qris");

  // Determine item display metadata
  const planInfo = (() => {
    switch (planKey) {
      case "pro_researcher":
      case "plan-researcher":
        return {
          title: "Professional Researcher Plan",
          usd: "$29.00 USD",
          idr: "Rp 450.000",
          period: "/ bulan",
          desc: "Unlimited SLR projects, AI-assisted screening, dual-blinded reviewer arbitration, and JBI/CASP quality appraisal.",
        };
      case "institutional":
      case "plan-institution":
        return {
          title: "Institutional & Lab Plan",
          usd: "$99.00 USD",
          idr: "Rp 1.500.000",
          period: "/ bulan",
          desc: "Unlimited team workspaces, SAML SSO, centralized licenses, and institutional data isolation.",
        };
      default:
        return {
          title: "1X Active Project Pass",
          usd: "$1.30 USD",
          idr: "Rp 20.000",
          period: "/ 1x proyek aktif",
          desc: "Buka +1 slot active systematic review project permanen tanpa komitmen bulanan.",
        };
    }
  })();

  // Initialize payment when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus("pending");
      setError(null);
      setTimeLeft(15 * 60);
      initializeOrder();
    }
  }, [isOpen, planKey]);

  const initializeOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrderData(data);
      } else {
        setError(data.error || "Gagal menginisiasi gateway pembayaran Midtrans.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat menyiapkan pembayaran.");
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
      } catch {
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

  // Open Midtrans Snap Popup or Redirect
  const handleOpenMidtrans = () => {
    if (orderData?.order?.snapToken && typeof window !== "undefined" && (window as any).snap) {
      (window as any).snap.pay(orderData.order.snapToken, {
        onSuccess: (result: any) => {
          setPaymentStatus("paid");
          if (onSuccess && orderData.order) onSuccess(orderData.order);
        },
        onPending: () => {
          // Polling will detect automatically
        },
        onError: (err: any) => {
          console.warn("Midtrans Snap error:", err);
        },
        onClose: () => {},
      });
    } else if (orderData?.order?.snapRedirectUrl) {
      window.open(orderData.order.snapRedirectUrl, "_blank");
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#E4E7EC] flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#17324D] text-[#3E9C96] flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#3E9C96]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17324D]">
                Checkout Resmi IB-SLR — Gateway Midtrans
              </h3>
              <p className="text-[11px] text-[#667085]">
                Enkripsi 256-bit &bull; Terverifikasi Standar Bank Indonesia
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#2F7D78] animate-spin mx-auto" />
              <p className="text-xs text-[#667085] font-medium">
                Menghubungkan ke Gateway Pembayaran & Menyiapkan Invoice...
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
                  Pembayaran Berhasil Diverifikasi!
                </span>
                <h2 className="text-xl font-extrabold text-[#17324D] mt-2">
                  {planInfo.idr} Berhasil Diterima
                </h2>
                <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                  Akses Anda telah aktif seketika. Selamat meneliti dengan Systematic Literature Review terbaik!
                </p>
              </div>

              <div className="p-3.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs space-y-1.5 text-left max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#667085]">No. Invoice:</span>
                  <span className="font-mono font-bold text-[#17324D]">{orderData?.order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Item:</span>
                  <span className="font-medium text-[#17212B]">{orderData?.order.itemDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Nominal:</span>
                  <span className="font-medium text-[#18794E] font-mono font-bold">{planInfo.idr}</span>
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
            /* Pending Payment State */
            <div className="space-y-4">
              {/* Dual-Currency Pricing Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#17324D] via-[#1E3F61] to-[#244A70] text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">
                      Item Pembelian
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3E9C96] text-white">
                      {planInfo.usd}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">{planInfo.title}</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black tracking-tight text-[#3E9C96]">
                      {planInfo.idr}
                    </span>
                    <span className="text-xs text-gray-300">{planInfo.period}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#3E9C96]" />
                    <span>{formatTimer(timeLeft)}</span>
                  </div>
                  <span className="text-[10px] text-gray-300 mt-1">
                    Kurs Resmi Bank Indonesia
                  </span>
                </div>
              </div>

              {/* Step 1: Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#17324D] mb-2">
                  1. Pilih Metode Pembayaran Favorit Anda:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("qris")}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedMethod === "qris"
                        ? "border-[#2F7D78] bg-[#EFF7F6] ring-1 ring-[#2F7D78]"
                        : "border-[#E4E7EC] bg-white hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <QrCode className="w-4 h-4 text-[#2F7D78]" />
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#18794E]/10 text-[#18794E]">
                        Instan
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#17324D] block">QRIS</span>
                    <span className="text-[10px] text-[#667085]">Semua Bank/E-Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("va")}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedMethod === "va"
                        ? "border-[#2F7D78] bg-[#EFF7F6] ring-1 ring-[#2F7D78]"
                        : "border-[#E4E7EC] bg-white hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Building2 className="w-4 h-4 text-[#026AA2]" />
                    </div>
                    <span className="text-xs font-bold text-[#17324D] block">Virtual Account</span>
                    <span className="text-[10px] text-[#667085]">BCA, BRI, BNI, Mandiri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("ewallet")}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedMethod === "ewallet"
                        ? "border-[#2F7D78] bg-[#EFF7F6] ring-1 ring-[#2F7D78]"
                        : "border-[#E4E7EC] bg-white hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Smartphone className="w-4 h-4 text-[#B7791F]" />
                    </div>
                    <span className="text-xs font-bold text-[#17324D] block">E-Wallet</span>
                    <span className="text-[10px] text-[#667085]">GoPay & ShopeePay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("card")}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedMethod === "card"
                        ? "border-[#2F7D78] bg-[#EFF7F6] ring-1 ring-[#2F7D78]"
                        : "border-[#E4E7EC] bg-white hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <CreditCard className="w-4 h-4 text-[#5925DC]" />
                    </div>
                    <span className="text-xs font-bold text-[#17324D] block">Kartu Kredit</span>
                    <span className="text-[10px] text-[#667085]">Visa, Mastercard</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Main Action & Gateway Trigger */}
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17324D]">
                    2. Selesaikan Pembayaran Resmi
                  </span>
                  <span className="text-[10px] text-[#667085]">Gateway Midtrans</span>
                </div>

                {/* Primary Button to Open Midtrans Gateway */}
                <button
                  type="button"
                  onClick={handleOpenMidtrans}
                  className="w-full py-3 px-4 rounded-xl bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Zap className="w-4 h-4 text-[#3E9C96]" />
                  <span>Bayar Sekarang via Midtrans Portal ({planInfo.idr})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {orderData?.order?.snapRedirectUrl && (
                  <div className="text-center">
                    <a
                      href={orderData.order.snapRedirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#2F7D78] hover:underline font-semibold"
                    >
                      <span>Atau buka portal pembayaran Midtrans di tab baru</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* QR Code Container (Responsive & Validated) */}
              <div className="p-4 bg-white border border-[#E4E7EC] rounded-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                {orderData && (
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-[#E4E7EC] shrink-0">
                    <img
                      src={orderData.qrCodeUrl}
                      alt="Payment Portal QR Code"
                      className="w-28 h-28 object-contain"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="font-bold text-xs text-[#17324D]">Scan dengan Kamera Smartphone</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFF7F6] text-[#2F7D78] font-bold">
                      Mobile Pay
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085] leading-relaxed">
                    Arahkan kamera HP Anda ke kode di samping untuk langsung membuka halaman pembayaran resmi di ponsel Anda (mendukung GoPay, ShopeePay, m-Banking BCA/Mandiri/BRI, dan QRIS).
                  </p>
                </div>
              </div>

              {/* Sandbox Simulation / Instant Test Button */}
              <div className="p-3 bg-[#EFF7F6] border border-[#2F7D78]/25 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#17324D]">
                  <Sparkles className="w-4 h-4 text-[#2F7D78] shrink-0" />
                  <span>
                    <strong>Uji Coba Sandbox:</strong> Ingin menguji verifikasi tanpa memotong saldo bank Anda?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  <span>{simulating ? "Memverifikasi..." : "Simulasi Bayar Instan"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
