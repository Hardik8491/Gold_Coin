import { type NextRequest, NextResponse } from "next/server"
import { db, transactions } from "@/lib/db"
import { eq, and, gte, sql } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current month start
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get income stats
    const [incomeStats] = await db
      .select({
        totalIncome: sql<number>`COALESCE(sum(${transactions.amount}), 0)`,
        incomeCount: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.type, "income"), gte(transactions.date, startOfMonth)),
      )

    // Get expense stats
    const [expenseStats] = await db
      .select({
        totalExpenses: sql<number>`COALESCE(sum(abs(${transactions.amount})), 0)`,
        expenseCount: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.type, "expense"), gte(transactions.date, startOfMonth)),
      )

    // Get total transaction count and average
    const [totalStats] = await db
      .select({
        transactionCount: sql<number>`count(*)`,
        avgAmount: sql<number>`COALESCE(avg(abs(${transactions.amount})), 0)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), gte(transactions.date, startOfMonth)))

    const totalIncome = Number(incomeStats?.totalIncome || 0)
    const totalExpenses = Number(expenseStats?.totalExpenses || 0)
    const netIncome = totalIncome - totalExpenses

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netIncome,
      transactionCount: Number(totalStats?.transactionCount || 0),
      avgTransactionAmount: Number(totalStats?.avgAmount || 0),
      monthlyChange: 0, // TODO: Calculate month-over-month change
    })
  } catch (error) {
    console.error("Error fetching transaction stats:", error)
    return NextResponse.json({ error: "Failed to fetch transaction stats" }, { status: 500 })
  }
}
