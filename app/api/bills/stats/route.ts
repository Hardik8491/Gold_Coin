import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, bills } from "@/lib/db"
import { eq, and, sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get bill statistics
    const [stats] = await db
      .select({
        totalBills: sql<number>`count(*)`,
        pendingBills: sql<number>`sum(case when ${bills.status} = 'pending' then 1 else 0 end)`,
        overdueBills: sql<number>`sum(case when ${bills.status} = 'overdue' then 1 else 0 end)`,
        paidBills: sql<number>`sum(case when ${bills.status} = 'paid' then 1 else 0 end)`,
        totalAmount: sql<number>`sum(${bills.amount})`,
      })
      .from(bills)
      .where(eq(bills.userId, userId))

    // Get upcoming bills amount (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const [upcomingStats] = await db
      .select({
        upcomingAmount: sql<number>`sum(${bills.amount})`,
      })
      .from(bills)
      .where(
        and(
          eq(bills.userId, userId),
          eq(bills.status, "pending"),
          sql`${bills.dueDate} <= ${thirtyDaysFromNow.toISOString()}`,
        ),
      )

    return NextResponse.json({
      totalBills: Number(stats?.totalBills || 0),
      pendingBills: Number(stats?.pendingBills || 0),
      overdueBills: Number(stats?.overdueBills || 0),
      paidBills: Number(stats?.paidBills || 0),
      totalAmount: Number(stats?.totalAmount || 0),
      upcomingAmount: Number(upcomingStats?.upcomingAmount || 0),
    })
  } catch (error) {
    console.error("Error fetching bills stats:", error)
    return NextResponse.json({ error: "Failed to fetch bills stats" }, { status: 500 })
  }
}
