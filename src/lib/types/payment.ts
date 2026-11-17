export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export type PaymentMethodType = "qris" | "bank_transfer" | "credit_card" | "gopay" | "shopeepay";

export interface PaymentOrder {
  id: string; // e.g. "order-1731800000"
  orderId: string; // e.g. "INV-SLR-2026-XXXXX"
  userId: string;
  userEmail: string;
  userName: string;
  amount: number; // 20000
  currency: string; // "IDR"
  itemType: "project_pass" | "plan_subscription";
  itemDescription: string;
  status: PaymentStatus;
  paymentType: PaymentMethodType;
  qrisString?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  invoiceUrl?: string;
  createdAt: string;
  paidAt?: string;
  metadata?: Record<string, any>;
}

export interface QrisGenerateResponse {
  success: boolean;
  order: PaymentOrder;
  qrCodeUrl: string;
  qrisRaw: string;
  expiresAt: string;
  instructions: string[];
}

export interface UserQuotaInfo {
  userId: string;
  planName: string;
  planBadge: string;
  baseFreeQuota: number;
  purchasedQuota: number;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  canCreateNewProject: boolean;
  isAdmin: boolean;
  paidOrdersCount: number;
}
