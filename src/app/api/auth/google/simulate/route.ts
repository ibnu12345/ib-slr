import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../../../../../lib/db";
import { createSessionCookie } from "../../../../../lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const fullName = body.fullName || email.split("@")[0];
    const password = body.password || "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if this is the owner email
    const isOwner =
      email.includes("ibnusetiawan1928") ||
      email === "admin@ib-slr.com" ||
      email === "pro@ib-slr.com";

    // Protect owner accounts from unauthorized takeover
    if (isOwner) {
      if (!password) {
        return NextResponse.json(
          { error: "Kata sandi verifikasi diperlukan untuk akun Owner / Super Admin." },
          { status: 400 }
        );
      }
      const existingUser = await findUserByEmail(email);
      if (existingUser && existingUser.passwordHash) {
        const match = bcrypt.compareSync(password, existingUser.passwordHash);
        if (!match) {
          return NextResponse.json(
            { error: "Kata sandi akun Owner salah. Silakan periksa kembali." },
            { status: 401 }
          );
        }
      }
    }

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

