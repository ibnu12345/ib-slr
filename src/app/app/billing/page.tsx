import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCurrentSession } from "../../../lib/auth/session";
import { getUserQuotaInfo } from "../../../lib/payment/quota";
import { getUserPaymentOrders, getProjects } from "../../../lib/db";
import { LanguageSwitcher } from "../../../components/i18n/LanguageSwitcher";
import { TopUpBannerClient } from "../../../components/payment/TopUpBannerClient";
import { AdSenseBanner } from "../../../components/ads/AdSenseBanner";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Layers,
  Calendar,
  ExternalLink,
  ArrowLeft,
  QrCode,
  FileText,
  Clock,
  User,
  Zap,
} from "lucide-react";

export default async function BillingPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("ib_slr_lang")?.value || "en";
  const isId = lang === "id";

  const quota = await getUserQuotaInfo(session.userId, session.role, session.email);
  const orders = await getUserPaymentOrders(session.userId);
  const projects = await getProjects(session.userId);

  const usagePercent = quota.isAdmin
    ? 10
    : Math.min(100, Math.round((quota.usedQuota / Math.max(1, quota.totalQuota)) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E4E7EC] mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F7D78] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isId ? "Kembali ke Workspace" : "Back to Workspace"}</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-[#2F7D78]" />
            <span>{isId ? "Status Akun & Kuota Langganan" : "Account Plan & Subscription Quota"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            {isId
              ? "Kelola paket aktif, kuota proyek Systematic Review, dan riwayat faktur pembayaran QRIS."
              : "Manage your active plan, systematic review project slot quotas, and official QRIS payment invoices."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="header" />
        </div>
      </div>

      {/* Grid: Account Overview & Quota Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile & Current Plan Card */}
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                {isId ? "Informasi Akun" : "Account Profile"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18794E] bg-[#ECFDF3] px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {session.emailVerified ? (isId ? "Terverifikasi" : "Verified") : (isId ? "Belum Verifikasi" : "Unverified")}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#17324D] text-[#3E9C96] flex items-center justify-center font-bold text-lg shadow-sm">
                {session.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17324D]">{session.fullName}</h3>
                <p className="text-xs text-[#667085]">{session.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#F2F4F7] text-[#344054]">
                  {session.role}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E7EC]">
            <div className="text-xs text-[#667085] mb-1">{isId ? "Paket Berlangganan Saat Ini:" : "Current Active Plan:"}</div>
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-[#17324D]">{quota.planName}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#2F7D78] text-white">
                {quota.planBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Quota Slot Gauge Card */}
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-2xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#2F7D78]" />
                {isId ? "Alokasi Kuota Proyek Aktif" : "Active Project Slot Quota"}
              </span>
              <span className="text-xs font-bold text-[#17324D]">
                {quota.isAdmin
                  ? (isId ? "Tak Terbatas (Administrator)" : "Unlimited (Admin)")
                  : `${quota.usedQuota} / ${quota.totalQuota} ${isId ? "Slot Digunakan" : "Slots Used"}`}
              </span>
            </div>

            {/* Visual Progress Bar */}
            {!quota.isAdmin && (
              <div className="w-full bg-[#F2F4F7] h-3.5 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    !quota.canCreateNewProject
                      ? "bg-[#D92D20]"
                      : usagePercent > 70
                      ? "bg-[#B7791F]"
                      : "bg-[#18794E]"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[#EFF7F6] border border-[#2F7D78]/20">
                <span className="text-[10px] text-[#2F7D78] uppercase font-bold block">
                  {isId ? "Slot Gratis Bawaan" : "Base Free Slot"}
                </span>
                <span className="text-lg font-bold text-[#17324D]">1 Proyek</span>
                <span className="text-[10px] text-[#667085] block mt-0.5">
                  {isId ? "Termasuk di paket awal" : "Included in initial tier"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#18794E]/20">
                <span className="text-[10px] text-[#18794E] uppercase font-bold block">
                  {isId ? "Slot Tambahan (QRIS)" : "Extra Paid Slots"}
                </span>
                <span className="text-lg font-bold text-[#18794E]">
                  +{quota.purchasedQuota} Proyek
                </span>
                <span className="text-[10px] text-[#667085] block mt-0.5">
                  {isId ? "Rp 20.000 / transaksi" : "Rp 20,000 / transaction"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F0F9FF] border border-[#026AA2]/20">
                <span className="text-[10px] text-[#026AA2] uppercase font-bold block">
                  {isId ? "Sisa Slot Tersedia" : "Remaining Slots"}
                </span>
                <span className="text-lg font-bold text-[#026AA2]">
                  {quota.isAdmin ? "∞" : quota.remainingQuota} Slot
                </span>
                <span className="text-[10px] text-[#667085] block mt-0.5">
                  {quota.canCreateNewProject
                    ? (isId ? "Siap membuat proyek baru" : "Ready for new project")
                    : (isId ? "Kuota telah penuh" : "Quota full")}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#667085] pt-3 border-t border-[#E4E7EC]">
            {isId
              ? "💡 Tip: Setiap pembelian 1X Project Pass seharga Rp 20.000 via QRIS akan otomatis menambahkan +1 kuota proyek aktif secara instan dan berlaku permanen."
              : "💡 Tip: Each 1X Project Pass purchase of Rp 20,000 via QRIS adds +1 active project slot permanently with no expiration."}
          </p>
        </div>
      </div>

      {/* Top Up Banner Client */}
      <TopUpBannerClient isId={isId} />

      {/* Payment Orders & Official Invoices Section */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-2xl overflow-hidden shadow-sm my-8">
        <div className="px-6 py-4 border-b border-[#E4E7EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#17324D] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#2F7D78]" />
              <span>{isId ? "Riwayat Transaksi & Bukti Pembayaran Resmi" : "Payment History & Official Invoices"}</span>
            </h2>
            <p className="text-xs text-[#667085]">
              {isId
                ? "Daftar invoice dan faktur resmi untuk setiap transaksi top-up kuota proyek QRIS."
                : "Official invoice receipts and proof of payment for all QRIS project pass top-ups."}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF7F6] text-[#2F7D78]">
            {orders.length} {isId ? "Transaksi Tercatat" : "Transactions"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#17324D]">
              {isId ? "Belum Ada Riwayat Transaksi" : "No Payment History Yet"}
            </h3>
            <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
              {isId
                ? "Anda sedang menggunakan kuota gratis bawaan (1 proyek). Riwayat faktur pembayaran QRIS akan tercatat di sini setelah Anda melakukan top-up."
                : "You are currently using your base free quota (1 project). Paid QRIS invoices will be recorded here once you top-up."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FB] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">{isId ? "No. Faktur / Order ID" : "Invoice / Order ID"}</th>
                  <th className="px-6 py-3.5">{isId ? "Deskripsi Item" : "Item Description"}</th>
                  <th className="px-6 py-3.5">{isId ? "Tanggal & Waktu" : "Date & Time"}</th>
                  <th className="px-6 py-3.5">{isId ? "Nominal" : "Amount"}</th>
                  <th className="px-6 py-3.5">{isId ? "Metode" : "Method"}</th>
                  <th className="px-6 py-3.5">{isId ? "Status" : "Status"}</th>
                  <th className="px-6 py-3.5 text-right">{isId ? "Bukti Bayar" : "Receipt"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {orders.map((order) => {
                  const isPaid = order.status === "paid";
                  const isPending = order.status === "pending";

                  return (
                    <tr key={order.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#17324D]">
                        {order.orderId}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#17212B]">
                        {order.itemDescription}
                      </td>
                      <td className="px-6 py-4 text-[#667085]">
                        {new Date(order.createdAt).toLocaleString(isId ? "id-ID" : "en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#17324D]">
                        Rp {order.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#2F7D78] uppercase text-[11px]">
                          <QrCode className="w-3.5 h-3.5" />
                          {order.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF3] text-[#18794E]">
                            <CheckCircle2 className="w-3 h-3" />
                            {isId ? "LUNAS" : "PAID"}
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF7EC] text-[#B7791F]">
                            <Clock className="w-3 h-3" />
                            {isId ? "MENUNGGU" : "PENDING"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3F2] text-[#B42318]">
                            <AlertCircle className="w-3 h-3" />
                            {order.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/billing/invoice/${order.orderId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-white hover:bg-[#F2F4F7] text-[#17324D] text-xs font-semibold shadow-sm transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#2F7D78]" />
                          <span>{isId ? "Lihat Faktur" : "View Invoice"}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Projects Currently Consuming Quota */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E4E7EC]">
          <h2 className="text-base font-bold text-[#17324D]">
            {isId ? "Proyek Anda yang Sedang Menggunakan Kuota" : "Projects Currently Using Your Quota"}
          </h2>
          <p className="text-xs text-[#667085]">
            {isId
              ? "Daftar Systematic Review aktif yang terhubung dengan akun Anda."
              : "Active systematic reviews associated with your workspace."}
          </p>
        </div>

        <div className="divide-y divide-[#E4E7EC]">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#667085]">
              {isId ? "Belum ada proyek aktif." : "No active projects yet."}
            </div>
          ) : (
            projects.map((prj, idx) => (
              <div key={prj.id} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF7F6] text-[#2F7D78] font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#17324D]">{prj.title}</h4>
                    <p className="text-[11px] text-[#667085] mt-0.5">
                      {isId ? "Dibuat pada: " : "Created on: "}
                      {new Date(prj.createdAt).toLocaleDateString(isId ? "id-ID" : "en-US")}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/app/projects/${prj.id}/overview`}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-xs font-semibold text-[#17324D] hover:bg-[#F7F8FA] transition-colors"
                >
                  {isId ? "Buka Proyek" : "Open Project"}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Non-intrusive Billing Ad Placement */}
      <div className="mt-8">
        <AdSenseBanner
          clientId="ca-pub-4685484644548395"
          slotId="1234567890"
          format="horizontal"
          className="my-0"
        />
      </div>
    </div>
  );
}
