import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import crypto from "crypto";
import { UserSession, UserRole } from "../types/auth";
import { findUserById } from "../db";

const COOKIE_NAME = "ib_slr_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "ib-slr-super-secure-default-session-secret-key-32";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Sign payload to prevent tampering
 */
function signPayload(data: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(data);
  return `${data}.${hmac.digest("hex")}`;
}

/**
 * Verify signed payload and extract original string
 */
function verifyPayload(signed: string): string | null {
  const parts = signed.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return data;
  }
  return null;
}

export function createSignedSessionToken(session: Omit<UserSession, "expiresAt">): string {
  const fullSession: UserSession = {
    ...session,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const serialized = JSON.stringify(fullSession);
  return signPayload(Buffer.from(serialized).toString("base64"));
}

export function attachSessionCookie(response: NextResponse, session: Omit<UserSession, "expiresAt">): NextResponse {
  const signed = createSignedSessionToken(session);

  response.cookies.set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  return response;
}

export async function createSessionCookie(session: Omit<UserSession, "expiresAt">): Promise<void> {
  const cookieStore = await cookies();
  const signed = createSignedSessionToken(session);

  cookieStore.set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie || !cookie.value) return null;

  try {
    const verified = verifyPayload(cookie.value);
    if (!verified) return null;

    const decoded = Buffer.from(verified, "base64").toString("utf-8");
    const session = JSON.parse(decoded) as UserSession;

    // Check expiration
    if (Date.now() > session.expiresAt) {
      await clearSessionCookie();
      return null;
    }

    // Attempt to verify fresh user from database
    const freshUser = await findUserById(session.userId);
    if (freshUser) {
      return {
        userId: freshUser.id,
        email: freshUser.email,
        fullName: freshUser.fullName,
        role: freshUser.role,
        emailVerified: freshUser.emailVerified,
        expiresAt: session.expiresAt,
      };
    }

    // In serverless distributed environment, if freshUser is not yet replicated to this instance,
    // trust the cryptographically HMAC-verified session payload
    if (session.userId && session.email) {
      return session;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Server-side Guard: Requires authenticated user
 */
export async function requireAuth(): Promise<UserSession> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Server-side Guard: Requires admin or super_admin
 */
export async function requireAdmin(): Promise<UserSession> {
  const session = await requireAuth();
  if (session.role !== "admin" && session.role !== "super_admin") {
    throw new Error("FORBIDDEN: Administrative privileges required.");
  }
  return session;
}

/**
 * Server-side Guard: Requires verified email
 */
export async function requireEmailVerified(): Promise<UserSession> {
  const session = await requireAuth();
  if (!session.emailVerified) {
    throw new Error("EMAIL_NOT_VERIFIED: Please verify your email to access research features.");
  }
  return session;
}
