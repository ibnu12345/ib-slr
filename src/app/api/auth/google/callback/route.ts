import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser, getDb } from "../../../../../lib/db";
import { attachSessionCookie } from "../../../../../lib/auth/session";
import { isSupabaseConfigured, saveStateToSupabase } from "../../../../../lib/db/supabaseSync";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=GoogleAuthFailed", origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SE;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("Failed to exchange Google OAuth code");
      return NextResponse.redirect(new URL("/login?error=GoogleTokenExchangeFailed", origin));
    }

    const tokenData = await tokenRes.json();

    // 2. Fetch Google user profile
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/login?error=GoogleProfileFetchFailed", origin));
    }

    const profile = await userRes.json();
    const email = profile.email.toLowerCase();
    const fullName = profile.name || email.split("@")[0];

    // 3. Find or auto-provision user account
    let user = await findUserByEmail(email);

    // Check if this is the owner email
    const isOwner =
      email.includes("ibnusetiawan1928") ||
      email === "admin@ib-slr.com" ||
      email === "pro@ib-slr.com";

    if (!user) {
      user = await createUser({
        email,
        fullName,
        role: isOwner ? "super_admin" : "user",
        emailVerified: true,
        mfaEnabled: false,
        passwordHash: "OAuthGoogleSecret123!",
      });

      // Synchronize immediately to Supabase
      if (isSupabaseConfigured()) {
        try {
          await saveStateToSupabase(getDb());
        } catch (syncErr) {
          console.warn("Supabase instant sync warning:", syncErr);
        }
      }
    }

    // 4. Construct redirect response and attach session cookie directly
    const targetPath = (user.role === "admin" || user.role === "super_admin" || isOwner) ? "/admin" : "/app";
    const redirectResponse = NextResponse.redirect(new URL(targetPath, origin));

    attachSessionCookie(redirectResponse, {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: isOwner ? "super_admin" : user.role,
      emailVerified: true,
    });

    return redirectResponse;
  } catch (err) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(new URL("/login?error=GoogleAuthException", origin));
  }
}
