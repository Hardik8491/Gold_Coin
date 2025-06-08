import { type NextRequest, NextResponse } from "next/server"
import { db, transactions } from "@/lib/db"
import { eq, and, gte, lte, sql } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get last 12 months of data
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 11)
    startDate.setDate(1)

    // Get monthly spending data
    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
        type: transactions.type,
        total: sql<number>`sum(abs(${transactions.amount}))`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          sql`${transactions.type} IN ('income', 'expense')`,
        ),
      )
      .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`, transactions.type)
      .orderBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)

    // Transform data for chart
    const chartData: Record<string, { month: string; spending: number; income: number }> = {}

    monthlyData.forEach((row) => {
      const month = row.month
      if (!chartData[month]) {
        chartData[month] = { month, spending: 0, income: 0 }
      }
      if (row.type === "expense") {
        chartData[month].spending = Number(row.total)
      } else if (row.type === "income") {
        chartData[month].income = Number(row.total)
      }
    })

    const result = Object.values(chartData).map((data) => ({
      ...data,
      month: new Date(data.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching spending analytics:", error)
    return NextResponse.json({ error: "Failed to fetch spending analytics" }, { status: 500 })
  }
}
