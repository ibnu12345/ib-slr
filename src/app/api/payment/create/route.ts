import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth/session";
import { createProjectPassOrder } from "../../../../lib/payment/service";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const qrisData = await createProjectPassOrder(
      session.userId,
      session.email,
      session.fullName
    );

    return NextResponse.json(qrisData);
  } catch (err: any) {
    console.error("Payment creation error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create payment order." }, { status: 500 });
  }
}
