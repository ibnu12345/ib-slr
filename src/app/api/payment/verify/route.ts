import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth/session";
import { checkPaymentStatus, simulatePaymentSuccess } from "../../../../lib/payment/service";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, simulate } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    let order = await checkPaymentStatus(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // In sandbox / testing mode, allow instant payment simulation
    if (simulate && order.status !== "paid") {
      order = await simulatePaymentSuccess(orderId);
    }

    return NextResponse.json({
      success: true,
      status: order?.status || "pending",
      order,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
