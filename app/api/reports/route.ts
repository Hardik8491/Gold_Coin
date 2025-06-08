import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, transactions, budgets, goals, accounts } from "@/lib/db"
import { eq, and, gte, lte, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "monthly"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Default date ranges
    let start: Date, end: Date
    const now = new Date()

    switch (reportType) {
      case "weekly":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        end = now
        break
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "yearly":
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31)
        break
      case "custom":
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        end = endDate ? new Date(endDate) : now
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = now
    }

    // Get transactions for the period
    const periodTransactions = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), gte(transactions.date, start), lte(transactions.date, end)))
      .orderBy(desc(transactions.date))

    // Calculate summary statistics
    const income = periodTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    const netIncome = income - expenses

    // Category breakdown
    const categoryBreakdown = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          const category = t.category
          if (!acc[category]) {
            acc[category] = { total: 0, count: 0, transactions: [] }
          }
          acc[category].total += Math.abs(Number(t.amount))
          acc[category].count += 1
          acc[category].transactions.push(t)
          return acc
        },
        {} as Record<string, { total: number; count: number; transactions: any[] }>,
      )

    // Top merchants
    const merchantBreakdown = periodTransactions.reduce(
      (acc, t) => {
        const merchant = t.merchant
        if (!acc[merchant]) {
          acc[merchant] = { total: 0, count: 0 }
        }
        acc[merchant].total += Math.abs(Number(t.amount))
        acc[merchant].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>,
    )

    const topMerchants = Object.entries(merchantBreakdown)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10)
      .map(([merchant, data]) => ({ merchant, ...data }))

    // Daily spending trend
    const dailySpending = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          const date = new Date(t.date).toISOString().split("T")[0]
          if (!acc[date]) {
            acc[date] = 0
          }
          acc[date] += Math.abs(Number(t.amount))
          return acc
        },
        {} as Record<string, number>,
      )

    // Get account balances
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))

    const totalBalance = userAccounts.reduce((sum, account) => sum + Number(account.balance), 0)

    // Get budget performance
    const activeBudgets = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.status, "active"),
          lte(budgets.startDate, end),
          gte(budgets.endDate, start),
        ),
      )

    const budgetPerformance = activeBudgets.map((budget) => {
      const budgetSpending = periodTransactions
        .filter(
          (t) =>
            t.type === "expense" &&
            new Date(t.date) >= new Date(budget.startDate) &&
            new Date(t.date) <= new Date(budget.endDate),
        )
        .reduce(
          (acc, t) => {
            const category = t.category
            if (!acc[category]) {
              acc[category] = 0
            }
            acc[category] += Math.abs(Number(t.amount))
            return acc
          },
          {} as Record<string, number>,
        )

      const updatedCategories = budget.categories.map((category) => ({
        ...category,
        spent: budgetSpending[category.name] || 0,
        remaining: category.budgeted - (budgetSpending[category.name] || 0),
        utilization: ((budgetSpending[category.name] || 0) / category.budgeted) * 100,
      }))

      return {
        ...budget,
        categories: updatedCategories,
        totalSpent: Object.values(budgetSpending).reduce((sum, amount) => sum + amount, 0),
        totalBudgeted: Number(budget.totalAmount),
        overallUtilization:
          (Object.values(budgetSpending).reduce((sum, amount) => sum + amount, 0) / Number(budget.totalAmount)) * 100,
      }
    })

    // Get goal progress
    const activeGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active")))

    const goalProgress = activeGoals.map((goal) => {
      const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
      const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)
      const daysUntilDeadline = Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...goal,
        progress: Math.min(progress, 100),
        remaining: Math.max(remaining, 0),
        daysUntilDeadline,
        onTrack:
          progress >=
          ((now.getTime() - new Date(goal.createdAt).getTime()) /
            (new Date(goal.deadline).getTime() - new Date(goal.createdAt).getTime())) *
            100,
      }
    })

    const report = {
      period: {
        type: reportType,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome,
        totalBalance,
        transactionCount: periodTransactions.length,
        averageTransactionAmount: periodTransactions.length > 0 ? (income + expenses) / periodTransactions.length : 0,
      },
      categoryBreakdown: Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b.total - a.total)
        .map(([category, data]) => ({
          category,
          total: data.total,
          count: data.count,
          percentage: expenses > 0 ? (data.total / expenses) * 100 : 0,
        })),
      topMerchants,
      dailySpending: Object.entries(dailySpending)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date, amount })),
      budgetPerformance,
      goalProgress,
      accounts: userAccounts.map((account) => ({
        ...account,
        balance: Number(account.balance),
      })),
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
