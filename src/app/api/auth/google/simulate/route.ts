import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser } from "../../../../../lib/db";
import { createSessionCookie } from "../../../../../lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const fullName = body.fullName || email.split("@")[0];

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if this is the owner email
    const isOwner =
      email.includes("ibnusetiawan1928") ||
      email === "admin@ib-slr.com" ||
      email === "pro@ib-slr.com";

    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({
        email,
        fullName,
        role: isOwner ? "super_admin" : "user",
        emailVerified: true,
        mfaEnabled: false,
        passwordHash: "OAuthGoogleSecret123!",
      });
    }

    // Create session cookie
    await createSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: isOwner ? "super_admin" : user.role,
      emailVerified: true,
    });

    return NextResponse.json({
      success: true,
      user,
      role: isOwner ? "super_admin" : user.role,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Simulation failed" }, { status: 500 });
  }
}
