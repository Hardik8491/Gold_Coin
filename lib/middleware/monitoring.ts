import type { RequestMetadata } from "./types"

export class MiddlewareMonitoring {
  private static instance: MiddlewareMonitoring
  private metrics: Map<string, any> = new Map()

  static getInstance(): MiddlewareMonitoring {
    if (!MiddlewareMonitoring.instance) {
      MiddlewareMonitoring.instance = new MiddlewareMonitoring()
    }
    return MiddlewareMonitoring.instance
  }

  recordRequest(metadata: RequestMetadata) {
    const key = `${metadata.method}:${metadata.pathname}`
    const existing = this.metrics.get(key) || { count: 0, totalTime: 0 }

    this.metrics.set(key, {
      count: existing.count + 1,
      totalTime: existing.totalTime,
      lastAccess: Date.now(),
      ip: metadata.ip,
    })
  }

  recordResponse(metadata: RequestMetadata, statusCode: number) {
    const key = `${metadata.method}:${metadata.pathname}`
    const existing = this.metrics.get(key)

    if (existing) {
      const responseTime = Date.now() - metadata.startTime
      existing.totalTime += responseTime
      existing.avgResponseTime = existing.totalTime / existing.count
      existing.lastStatusCode = statusCode
    }
  }

  recordError(metadata: RequestMetadata, error: Error) {
    const key = `error:${metadata.pathname}`
    const existing = this.metrics.get(key) || { count: 0, errors: [] }

    existing.count += 1
    existing.errors.push({
      message: error.message,
      timestamp: Date.now(),
      ip: metadata.ip,
    })

    // Keep only last 10 errors
    if (existing.errors.length > 10) {
      existing.errors = existing.errors.slice(-10)
    }

    this.metrics.set(key, existing)
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  clearMetrics() {
    this.metrics.clear()
  }
}

// Health check endpoint data
export function getHealthMetrics() {
  const monitoring = MiddlewareMonitoring.getInstance()
  const metrics = monitoring.getMetrics()

  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    requests: metrics,
    environment: process.env.NODE_ENV,
  }
}
