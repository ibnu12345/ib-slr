import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const url = new URL(`/app/billing/invoice/${orderId}`, request.url);
  return NextResponse.redirect(url);
}
