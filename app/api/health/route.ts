import { NextResponse } from "next/server"
import { getHealthMetrics } from "@/lib/middleware/monitoring"

export async function GET() {
  try {
    const health = getHealthMetrics()

    return NextResponse.json({
      status: "healthy",
      ...health,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
