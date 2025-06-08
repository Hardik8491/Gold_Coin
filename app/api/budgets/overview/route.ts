import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, budgets, transactions } from "@/lib/db"
import { eq, and, gte, lte, sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current month dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get active budgets
    const activeBudgets = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.status, "active"),
          lte(budgets.startDate, endOfMonth),
          gte(budgets.endDate, startOfMonth),
        ),
      )

    if (activeBudgets.length === 0) {
      return NextResponse.json({
        totalBudgeted: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallUtilization: 0,
        categoriesOverBudget: 0,
        categoriesOnTrack: 0,
        monthlyTrend: 0,
      })
    }

    // Calculate spending for current month
    const currentMonthSpending = await db
      .select({
        category: transactions.category,
        total: sql<number>`sum(abs(${transactions.amount}))`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth),
        ),
      )
      .groupBy(transactions.category)

    // Calculate spending for last month
    const lastMonthSpending = await db
      .select({
        total: sql<number>`sum(abs(${transactions.amount}))`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          gte(transactions.date, startOfLastMonth),
          lte(transactions.date, endOfLastMonth),
        ),
      )

    const spendingMap = currentMonthSpending.reduce(
      (acc, item) => {
        acc[item.category] = Number(item.total)
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate totals and category stats
    let totalBudgeted = 0
    let totalSpent = 0
    let categoriesOverBudget = 0
    let categoriesOnTrack = 0

    activeBudgets.forEach((budget) => {
      budget.categories.forEach((category) => {
        const spent = spendingMap[category.name] || 0
        totalBudgeted += category.budgeted
        totalSpent += spent

        if (spent > category.budgeted) {
          categoriesOverBudget++
        } else {
          categoriesOnTrack++
        }
      })
    })

    const totalRemaining = totalBudgeted - totalSpent
    const overallUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

    // Calculate monthly trend
    const lastMonthTotal = Number(lastMonthSpending[0]?.total || 0)
    const monthlyTrend = lastMonthTotal > 0 ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100 : 0

    return NextResponse.json({
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overallUtilization,
      categoriesOverBudget,
      categoriesOnTrack,
      monthlyTrend,
    })
  } catch (error) {
    console.error("Error fetching budget overview:", error)
    return NextResponse.json({ error: "Failed to fetch budget overview" }, { status: 500 })
  }
}
