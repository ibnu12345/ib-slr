import { NextResponse } from "next/server";
import { handleMidtransNotification } from "../../../../lib/payment/service";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const result = await handleMidtransNotification(payload);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
