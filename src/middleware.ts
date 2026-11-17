import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory IP rate limiting state
const ipRateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired records every 60 seconds to prevent memory leaks
let lastCleanup = Date.now();
function cleanupExpiredRecords() {
  const now = Date.now();
  if (now - lastCleanup > 60000) {
    for (const [key, record] of ipRateLimitMap.entries()) {
      if (now > record.resetAt) {
        ipRateLimitMap.delete(key);
      }
    }
    lastCleanup = now;
  }
}

/**
 * Check if a client IP has exceeded the allowed rate threshold
 */
function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInSec: number } {
  cleanupExpiredRecords();
  const now = Date.now();
  const record = ipRateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    ipRateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, next internal chunks, and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Extract client IP (supports Cloudflare, Reverse Proxies, ngrok, and direct connection)
  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "127.0.0.1";

  // 1. Anti-Brute Force Protection on Auth Endpoints (Max 12 requests / 60s per IP)
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-email";

  if (isAuthRoute && request.method === "POST") {
    const authLimit = checkRateLimit(`auth:${clientIp}`, 12, 60000);
    if (!authLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Terlalu banyak percobaan autentikasi. Demi keamanan, silakan tunggu beberapa saat.",
          retryAfter: authLimit.resetInSec,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": authLimit.resetInSec.toString(),
            "X-RateLimit-Limit": "12",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // 2. Anti-DDoS & Compute Flooding on API Endpoints (Max 60 requests / 60s per IP)
  const isApiRoute = pathname.startsWith("/api/");
  if (isApiRoute) {
    const apiLimit = checkRateLimit(`api:${clientIp}`, 60, 60000);
    if (!apiLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "API rate limit exceeded. Please throttle your requests.",
          retryAfter: apiLimit.resetInSec,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": apiLimit.resetInSec.toString(),
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // 3. Global Burst Rate Limiter (Max 150 requests per 10s per IP to block HTTP flood attacks)
  const burstLimit = checkRateLimit(`burst:${clientIp}`, 150, 10000);
  if (!burstLimit.allowed) {
    return new NextResponse(
      "DDoS Protection: Too many requests detected. Please slow down.",
      {
        status: 429,
        headers: {
          "Retry-After": burstLimit.resetInSec.toString(),
        },
      }
    );
  }

  // Proceed with request and attach strict OWASP security headers
  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Content Security Policy (Allows Google AdSense, Midtrans, Fonts, and Next.js inline scripts)
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://adservice.google.com https://app.midtrans.com https://app.sandbox.midtrans.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://pagead2.googlesyndication.com https://app.midtrans.com https://app.sandbox.midtrans.com https://api.qrserver.com; " +
    "frame-src 'self' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://app.midtrans.com https://app.sandbox.midtrans.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
