import crypto from "crypto";
import { PaymentOrder, QrisGenerateResponse } from "../types/payment";
import {
  createPaymentOrderDb,
  getPaymentOrderById,
  updatePaymentOrderStatus,
  getUserPaymentOrders,
} from "../db";

// Server Key from environment variables (No hardcoded secrets)
const MIDTRANS_WORKING_SERVER_KEY = process.env.MIDTRANS_API_KEY || process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_SIGNATURE_KEY = process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_API_KEY || "";
const MIDTRANS_SERVER_KEY = MIDTRANS_WORKING_SERVER_KEY;
const MIDTRANS_API_KEY = MIDTRANS_SIGNATURE_KEY;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION !== "false";

const MIDTRANS_SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

/**
 * Generate standard Indonesian National QRIS payload (EMVCo QR Code standard)
 */
export function generateQrisPayload(orderId: string, amount: number): string {
  const merchantName = "IB-SLR Research SaaS";
  const merchantCity = "JAKARTA";
  const postalCode = "10110";
  const currencyCode = "360"; // IDR
  const countryCode = "ID";

  return `00020101021226670014ID.GO.BI.QRIS01189360091800000000000215${orderId}0303UMI51440014ID.LINKAJA.WWW01189360091800000000000215${orderId}0303UMI520458125303${currencyCode}540${amount.toString().length}${amount}5802${countryCode}59${merchantName.length.toString().padStart(2, "0")}${merchantName}60${merchantCity.length.toString().padStart(2, "0")}${merchantCity}6105${postalCode}622401${orderId.length.toString().padStart(2, "0")}${orderId}6304`;
}

/**
 * Create a new Pay-Per-Project Pass or Plan Subscription Order
 */
export async function createProjectPassOrder(
  userId: string,
  userEmail: string,
  userName: string,
  planKey: string = "pay_per_project"
): Promise<QrisGenerateResponse> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const orderId = `INV-SLR-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}-${randomSuffix}`;

  let amount = 20000; // Rp 20.000 (~$1.30)
  let itemName = "1X Active Systematic Review Project Pass";
  let itemType: "project_pass" | "plan_subscription" = "project_pass";
  let usdEquivalent = "$1.30";

  if (planKey === "pro_researcher" || planKey === "plan-researcher") {
    amount = 450000;
    itemName = "Professional Researcher Plan (1 Bulan - Unlimited Review Projects)";
    itemType = "plan_subscription";
    usdEquivalent = "$29.00";
  } else if (planKey === "institutional" || planKey === "plan-institution") {
    amount = 1500000;
    itemName = "Institutional & Lab Plan (1 Bulan - Unlimited Workspaces & Seats)";
    itemType = "plan_subscription";
    usdEquivalent = "$99.00";
  }

  const qrisRaw = generateQrisPayload(orderId, amount);

  let snapToken: string | undefined = undefined;
  let snapRedirectUrl: string | undefined = undefined;

  // Try real Midtrans API using validated server keys
  const candidateKeys = [
    MIDTRANS_WORKING_SERVER_KEY,
    MIDTRANS_SIGNATURE_KEY,
  ].filter(Boolean);

  for (const key of candidateKeys) {
    try {
      const authHeader = Buffer.from(`${key}:`).toString("base64");
      const midtransPayload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        item_details: [
          {
            id: planKey,
            price: amount,
            quantity: 1,
            name: itemName.substring(0, 50),
            brand: "IB-SLR",
            category: "Research Software",
          },
        ],
        customer_details: {
          first_name: userName || "Researcher",
          email: userEmail || "researcher@ib-slr.com",
        },
      };

      const res = await fetch(MIDTRANS_SNAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify(midtransPayload),
      });

      if (res.ok) {
        const data = await res.json();
        snapToken = data.token;
        snapRedirectUrl = data.redirect_url;
        break;
      }
    } catch (err) {
      console.warn("Midtrans API call attempt skipped:", err);
    }
  }

  // QR Code URL: If Midtrans Snap redirect URL is available, encode the checkout portal so camera scanners directly open Midtrans mobile pay!
  const qrTarget = snapRedirectUrl || qrisRaw;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrTarget)}&color=17-50-77`;

  const expiresAt = new Date(timestamp + 15 * 60 * 1000).toISOString(); // 15 mins expiry

  const newOrder: PaymentOrder = {
    id: `ord-${timestamp}-${randomSuffix.toLowerCase()}`,
    orderId,
    userId,
    userEmail,
    userName,
    amount,
    currency: "IDR",
    itemType,
    itemDescription: itemName,
    status: "pending",
    paymentType: "qris",
    qrisString: qrisRaw,
    snapToken,
    snapRedirectUrl,
    invoiceUrl: `/api/payment/invoice/${orderId}`,
    createdAt: new Date().toISOString(),
    metadata: {
      planKey,
      usdEquivalent,
      expiresAt,
      provider: snapToken ? "midtrans_production" : "qris_sandbox",
    },
  };

  await createPaymentOrderDb(newOrder);

  return {
    success: true,
    order: newOrder,
    qrCodeUrl,
    qrisRaw,
    expiresAt,
    instructions: [
      "Buka aplikasi m-Banking (BCA Mobile, Livin' by Mandiri, BRImo, BNI Mobile) atau e-Wallet (GoPay, OVO, Dana, ShopeePay, LinkAja).",
      "Pilih menu 'Scan' atau 'Bayar dengan QRIS'.",
      "Arahkan kamera smartphone Anda ke kode QRIS di layar ini.",
      "Periksa nama penerima: 'IB-SLR Research SaaS' dan nominal: Rp 20.000.",
      "Konfirmasi dan masukkan PIN transaksi Anda.",
      "Kuota proyek baru akan otomatis aktif seketika setelah pembayaran berhasil dikonfirmasi.",
    ],
  };
}

/**
 * Verify payment status (Polled by frontend or called by webhook)
 */
export async function checkPaymentStatus(orderId: string): Promise<PaymentOrder | null> {
  const order = await getPaymentOrderById(orderId);
  if (!order) return null;

  // Proactively sync status directly from Midtrans if still pending
  if (order.status === "pending" && MIDTRANS_SERVER_KEY) {
    try {
      const keysToTry = [MIDTRANS_SERVER_KEY, MIDTRANS_API_KEY].filter(Boolean);
      for (const key of keysToTry) {
        const authHeader = Buffer.from(`${key}:`).toString("base64");
        const statusUrl = IS_PRODUCTION
          ? `https://api.midtrans.com/v2/${orderId}/status`
          : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

        const res = await fetch(statusUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${authHeader}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const { transaction_status, fraud_status } = data;
          if (
            transaction_status === "settlement" ||
            (transaction_status === "capture" && fraud_status !== "challenge")
          ) {
            const updated = await updatePaymentOrderStatus(orderId, "paid", {
              midtransStatus: data,
              verifiedVia: "MIDTRANS_ACTIVE_STATUS_POLL",
              paidAt: data.settlement_time || new Date().toISOString(),
            });
            return updated || order;
          } else if (
            transaction_status === "cancel" ||
            transaction_status === "deny" ||
            transaction_status === "expire"
          ) {
            const updated = await updatePaymentOrderStatus(orderId, "failed", {
              midtransStatus: data,
            });
            return updated || order;
          }
          break;
        }
      }
    } catch {
      // Non-blocking catch
    }
  }

  return order;
}

/**
 * Simulate payment completion (Useful in development, demo, and sandbox testing)
 */
export async function simulatePaymentSuccess(orderId: string): Promise<PaymentOrder | null> {
  const updated = await updatePaymentOrderStatus(orderId, "paid", {
    simulated: true,
    simulatedAt: new Date().toISOString(),
    verificationMethod: "INSTANT_SANDBOX_SIMULATION",
  });
  return updated;
}

/**
 * Midtrans Webhook Notification Handler with SHA512 signature verification
 */
export async function handleMidtransNotification(payload: any): Promise<{ success: boolean; message: string }> {
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
  } = payload;

  if (signature_key) {
    const keysToTry = [MIDTRANS_SERVER_KEY, MIDTRANS_API_KEY].filter(Boolean);
    let signatureValid = false;
    for (const key of keysToTry) {
      const rawString = `${order_id}${status_code}${gross_amount}${key}`;
      const expectedSignature = crypto.createHash("sha512").update(rawString).digest("hex");
      if (signature_key === expectedSignature) {
        signatureValid = true;
        break;
      }
    }

    if (!signatureValid && keysToTry.length > 0) {
      return { success: false, message: "Invalid Midtrans signature key." };
    }
  }

  let finalStatus: PaymentOrder["status"] = "pending";

  if (transaction_status === "capture" || transaction_status === "settlement") {
    if (fraud_status === "challenge") {
      finalStatus = "pending";
    } else {
      finalStatus = "paid";
    }
  } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
    finalStatus = "failed";
  } else if (transaction_status === "pending") {
    finalStatus = "pending";
  }

  await updatePaymentOrderStatus(order_id, finalStatus, {
    midtransTransactionStatus: transaction_status,
    midtransPaymentType: payload.payment_type,
    midtransTransactionTime: payload.transaction_time,
  });

  return { success: true, message: `Order ${order_id} updated to ${finalStatus}` };
}
