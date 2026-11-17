import { describe, it, expect } from "vitest";
import {
  createProjectPassOrder,
  checkPaymentStatus,
  simulatePaymentSuccess,
  generateQrisPayload,
} from "../src/lib/payment/service";
import { getUserQuotaInfo } from "../src/lib/payment/quota";

describe("Payment Gateway (QRIS / Midtrans) & Security Verification", () => {
  it("generates an official QRIS order for Rp 20.000 with valid EMVCo string", async () => {
    const qrisRes = await createProjectPassOrder(
      "usr-researcher-1",
      "researcher@ib-slr.local",
      "Dr. Aris Thorne"
    );

    expect(qrisRes.success).toBe(true);
    expect(qrisRes.order).toBeDefined();
    expect(qrisRes.order.amount).toBe(20000);
    expect(qrisRes.order.currency).toBe("IDR");
    expect(qrisRes.order.status).toBe("pending");
    expect(qrisRes.order.orderId).toContain("INV-SLR-");
    expect(qrisRes.qrisRaw).toContain("ID.GO.BI.QRIS");
    expect(qrisRes.qrCodeUrl).toContain("https://api.qrserver.com");
  });

  it("handles payment polling and sandbox instant payment simulation", async () => {
    const qrisRes = await createProjectPassOrder(
      "usr-researcher-1",
      "researcher@ib-slr.local",
      "Dr. Aris Thorne"
    );

    // Initial status should be pending
    const initialOrder = await checkPaymentStatus(qrisRes.order.orderId);
    expect(initialOrder).toBeDefined();
    expect(initialOrder?.status).toBe("pending");

    // Simulate instant payment
    const paidOrder = await simulatePaymentSuccess(qrisRes.order.orderId);
    expect(paidOrder).toBeDefined();
    expect(paidOrder?.status).toBe("paid");
    expect(paidOrder?.paidAt).toBeDefined();
    expect(paidOrder?.metadata?.simulated).toBe(true);
  });

  it("generates standard Indonesian national QRIS EMVCo compliant payloads", () => {
    const payload = generateQrisPayload("TEST-ORDER-123", 20000);
    expect(payload).toContain("ID.GO.BI.QRIS");
    expect(payload).toContain("360"); // Indonesian Rupiah ISO 4217 code
    expect(payload).toContain("20000");
  });

  it("accurately calculates user account plan, project slot quota and extra QRIS passes", async () => {
    const testUserId = `usr-test-${Date.now()}`;
    const initialQuota = await getUserQuotaInfo(testUserId, "user");

    expect(initialQuota.baseFreeQuota).toBe(1);
    expect(initialQuota.purchasedQuota).toBe(0);
    expect(initialQuota.totalQuota).toBe(1);
    expect(initialQuota.planName).toBe("Academic Free");

    // Purchase 1x project pass
    const orderRes = await createProjectPassOrder(testUserId, "test@ib-slr.local", "Test User");
    await simulatePaymentSuccess(orderRes.order.orderId);

    // Re-check quota
    const updatedQuota = await getUserQuotaInfo(testUserId, "user");
    expect(updatedQuota.purchasedQuota).toBe(1);
    expect(updatedQuota.totalQuota).toBe(2);
    expect(updatedQuota.planName).toBe("Pay-Per-Project Pass");
    expect(updatedQuota.paidOrdersCount).toBe(1);

    // Admin should have unlimited quota
    const adminQuota = await getUserQuotaInfo("usr-admin-1", "admin");
    expect(adminQuota.isAdmin).toBe(true);
    expect(adminQuota.totalQuota).toBe(9999);
    expect(adminQuota.canCreateNewProject).toBe(true);
  });
});
