import type { NextRequest } from "next/server"
import type { RequestMetadata } from "./types"

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return request.ip ?? "127.0.0.1"
}

export function createRequestMetadata(request: NextRequest): RequestMetadata {
  return {
    id: crypto.randomUUID(),
    startTime: Date.now(),
    ip: getClientIP(request),
    userAgent: request.headers.get("user-agent") ?? "Unknown",
    pathname: request.nextUrl.pathname,
    method: request.method,
  }
}

export function isAPIRoute(pathname: string): boolean {
  return pathname.startsWith("/api/")
}

export function isAuthRoute(pathname: string): boolean {
  return pathname.includes("/sign-in") || pathname.includes("/sign-up") || pathname.startsWith("/api/auth/")
}

export function isAIRoute(pathname: string): boolean {
  return pathname.startsWith("/api/ai/")
}

export function isUploadRoute(pathname: string): boolean {
  return pathname.includes("/upload") || pathname.includes("/receipt") || pathname.includes("/scan")
}

export function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/static/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/)
  )
}

export function shouldSkipMiddleware(pathname: string): boolean {
  const skipPatterns = ["/_next/", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/api/health", "/api/webhooks/clerk"]

  return skipPatterns.some((pattern) => pathname.startsWith(pattern))
}

export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {}
  const allowedHeaders = ["content-type", "authorization", "user-agent", "x-forwarded-for", "x-real-ip"]

  allowedHeaders.forEach((header) => {
    const value = headers.get(header)
    if (value) {
      sanitized[header] = value
    }
  })

  return sanitized
}
