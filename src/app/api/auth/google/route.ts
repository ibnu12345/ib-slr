import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SE;
  const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

  // If real Google OAuth Client ID is configured in environment
  if (googleClientId && googleClientSecret) {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", googleClientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // If Google OAuth Client ID is not yet provided, redirect to Google One-Tap / Simulation screen
  const simUrl = new URL("/login/google", request.nextUrl.origin);
  return NextResponse.redirect(simUrl);
}
