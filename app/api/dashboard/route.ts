import { type NextRequest, NextResponse } from "next/server"
import { db, transactions, accounts, budgets, goals } from "@/lib/db"
import { eq, and, gte, desc, sql } from "drizzle-orm"
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try cache first
    const cacheKey = CACHE_KEYS.USER_DASHBOARD(userId)
    const cached = await redis.get(cacheKey)

    if (cached) {
      return NextResponse.json(cached)
    }

    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get total balance across all accounts
    const [balanceResult] = await db
      .select({
        totalBalance: sql<number>`sum(${accounts.balance})`,
        accountCount: sql<number>`count(*)`,
      })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))

    // Get monthly spending (current month)
    const [currentMonthSpending] = await db
      .select({
        totalSpending: sql<number>`sum(abs(${transactions.amount}))`,
        transactionCount: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.type, "expense"), gte(transactions.date, startOfMonth)),
      )

    // Get last month spending for comparison
    const [lastMonthSpending] = await db
      .select({
        totalSpending: sql<number>`sum(abs(${transactions.amount}))`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          gte(transactions.date, startOfLastMonth),
          gte(transactions.date, endOfLastMonth),
        ),
      )

    // Calculate spending change percentage
    const currentSpending = Number(currentMonthSpending?.totalSpending || 0)
    const lastSpending = Number(lastMonthSpending?.totalSpending || 0)
    const spendingChange = lastSpending > 0 ? ((currentSpending - lastSpending) / lastSpending) * 100 : 0

    // Get active budgets and calculate remaining
    const activeBudgets = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.status, "active")))

    let totalBudgetRemaining = 0
    let budgetUtilization = 0

    if (activeBudgets.length > 0) {
      // Calculate budget utilization
      for (const budget of activeBudgets) {
        const budgetSpending = await db
          .select({
            spent: sql<number>`sum(abs(${transactions.amount}))`,
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, userId),
              eq(transactions.type, "expense"),
              gte(transactions.date, budget.startDate),
              gte(transactions.date, budget.endDate),
            ),
          )

        const spent = Number(budgetSpending[0]?.spent || 0)
        const budgetTotal = Number(budget.totalAmount)
        totalBudgetRemaining += Math.max(budgetTotal - spent, 0)
        budgetUtilization += (spent / budgetTotal) * 100
      }
      budgetUtilization = budgetUtilization / activeBudgets.length
    }

    // Get savings goals progress
    const activeGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active")))

    const totalGoalTarget = activeGoals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0)
    const totalGoalCurrent = activeGoals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0)
    const goalsProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0

    // Get recent transactions
    const recentTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        category: transactions.category,
        merchant: transactions.merchant,
        amount: transactions.amount,
        date: transactions.date,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(10)

    // Get spending by category (current month)
    const categorySpending = await db
      .select({
        category: transactions.category,
        total: sql<number>`sum(abs(${transactions.amount}))`,
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.type, "expense"), gte(transactions.date, startOfMonth)),
      )
      .groupBy(transactions.category)
      .orderBy(desc(sql`sum(abs(${transactions.amount}))`))
      .limit(5)

    const dashboardData = {
      overview: {
        totalBalance: Number(balanceResult?.totalBalance || 0),
        accountCount: Number(balanceResult?.accountCount || 0),
        monthlySpending: currentSpending,
        spendingChange: spendingChange,
        budgetRemaining: totalBudgetRemaining,
        budgetUtilization: budgetUtilization,
        goalsProgress: goalsProgress,
        transactionCount: Number(currentMonthSpending?.transactionCount || 0),
      },
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      categorySpending: categorySpending.map((c) => ({
        category: c.category,
        amount: Number(c.total),
        count: Number(c.count),
      })),
      goals: activeGoals.map((g) => ({
        id: g.id,
        title: g.title,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
        progress: (Number(g.currentAmount) / Number(g.targetAmount)) * 100,
        category: g.category,
        deadline: g.deadline,
      })),
      generatedAt: new Date().toISOString(),
    }

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL.DASHBOARD, dashboardData)

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
