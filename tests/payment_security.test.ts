import { describe, it, expect } from "vitest";
import {
  createProjectPassOrder,
  checkPaymentStatus,
  simulatePaymentSuccess,
  generateQrisPayload,
} from "../src/lib/payment/service";

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
});
