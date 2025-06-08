import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Initialize Redis for rate limiting
const redis = Redis.fromEnv();

// Rate limiting configurations
const rateLimits = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 h"),
    analytics: true,
  }),
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    analytics: true,
  }),
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 h"),
    analytics: true,
  }),
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "1 h"),
    analytics: true,
  }),
};

// Security headers
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// CORS configuration
const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.NODE_ENV === "production" ? "https://your-domain.com" : "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

// Create route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/clerk",
  "/api/health",
  "/api/cron/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isIgnoredRoute = createRouteMatcher([
  "/api/webhooks/clerk",
  "/_next/(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);


async function applyRateLimit(request: NextRequest) {
  if (isIgnoredRoute(request)) return null;

  const ip = request.ip ?? "127.0.0.1";
  const pathname = request.nextUrl.pathname;

  let rateLimit = rateLimits.general;
  if (pathname.startsWith("/api/ai/")) {
    rateLimit = rateLimits.ai;
  } else if (
    pathname.startsWith("/api/auth/") ||
    pathname.includes("sign-in") ||
    pathname.includes("sign-up")
  ) {
    rateLimit = rateLimits.auth;
  } else if (pathname.includes("upload") || pathname.includes("receipt")) {
    rateLimit = rateLimits.upload;
  } else if (pathname.startsWith("/api/")) {
    rateLimit = rateLimits.api;
  }

  const { success, limit, reset, remaining } = await rateLimit.limit(ip);

  if (!success) {
    return new NextResponse(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        retryAfter: Math.round((reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.round((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  return null;
}


function applySecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

function applyCorsHeaders(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

async function logRequest(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const ip = request.ip ?? "127.0.0.1";
    const userAgent = request.headers.get("user-agent") ?? "Unknown";
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname} - IP: ${ip} - UA: ${userAgent}`
    );
  }
}

function applyCacheHeaders(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname;
  if (pathname.includes("/_next/static/")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  } else if (pathname.includes("/api/")) {
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
  } else {
    response.headers.set("Cache-Control", "public, max-age=3600");
  }
  return response;
}

async function validateApiRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH"].includes(request.method)
  ) {
    const contentType = request.headers.get("content-type");
    if (
      !contentType ||
      (!contentType.includes("application/json") &&
        !contentType.includes("multipart/form-data"))
    ) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid Content-Type",
          message: "API requests must include proper Content-Type header",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  if (pathname.startsWith("/api/webhooks/") && !pathname.includes("/clerk")) {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.WEBHOOK_SECRET) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  return null;
}

export default clerkMiddleware(async (auth, request) => {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  // Skip middleware for ignored routes
  if (isIgnoredRoute(request)) {
    return NextResponse.next();
  }
  if(process.env.NODE_ENV=="production"){
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  }
  
  // Validate API requests
  const validationResponse = await validateApiRequest(request);
  if (validationResponse) return validationResponse;

  // Log the request
  await logRequest(request);

  // Handle public routes
  if (isPublicRoute(request)) {
    const response = NextResponse.next();
    applySecurityHeaders(response);
    if (request.nextUrl.pathname.startsWith("/api/")) {
      applyCorsHeaders(response);
    }
    applyCacheHeaders(request, response);
    return response;
  }

  // Protect non-public routes
  await auth.protect()

  // Redirect authenticated users away from auth pages
  const pathname = request.nextUrl.pathname;
  if (
    (await auth()).userId &&
    (pathname.includes("/sign-in") || pathname.includes("/sign-up"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check if user needs onboarding
  if (
    (await auth()).userId &&
    pathname !== "/onboarding" &&
    !pathname.startsWith("/api/")
  ) {
    try {
      const userResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/user`,
        {
          headers: { Authorization: `Bearer ${(await auth()).sessionId}` },
        }
      );
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (!userData.profileComplete && pathname !== "/onboarding") {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
    }
  }

  // Apply all response modifications
  const response = NextResponse.next();
  applySecurityHeaders(response);
  if (request.nextUrl.pathname.startsWith("/api/")) {
    applyCorsHeaders(response);
  }
  applyCacheHeaders(request, response);
  // response.headers.set("X-Request-ID", crypto.randomUUID());

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
