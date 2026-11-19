import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth/session";
import { getUserQuotaInfo } from "../../../../lib/payment/quota";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quota = await getUserQuotaInfo(session.userId, session.role, session.email);
  return NextResponse.json({ success: true, quota });
}
