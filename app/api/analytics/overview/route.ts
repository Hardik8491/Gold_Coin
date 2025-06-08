import { type NextRequest, NextResponse } from "next/server"
import { db, transactions } from "@/lib/db"
import { eq, and, gte, sql } from "drizzle-orm"
import { getCurrentUser, type User } from "@/lib/auth"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const userId = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "6m"

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case "3m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case "1y":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        break
      default: // 6m
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    }

    // Get monthly spending data
    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
        totalExpenses: sql<number>`sum(case when ${transactions.type} = 'expense' then abs(${transactions.amount}) else 0 end)`,
        totalIncome: sql<number>`sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), gte(transactions.date, startDate)))
      .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)

    // Transform monthly data
    const monthlySpending = monthlyData.map((item) => ({
      month: item.month,
      amount: Number(item.totalExpenses),
      income: Number(item.totalIncome),
      savings: Number(item.totalIncome) - Number(item.totalExpenses),
    }))

    // Get category trends (current month vs last month)
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const currentMonthCategories = await db
      .select({
        category: transactions.category,
        total: sql<number>`sum(abs(${transactions.amount}))`,
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.type, "expense"), gte(transactions.date, currentMonth)),
      )
      .groupBy(transactions.category)

    const lastMonthCategories = await db
      .select({
        category: transactions.category,
        total: sql<number>`sum(abs(${transactions.amount}))`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId,userId),
          eq(transactions.type, "expense"),
          gte(transactions.date, lastMonth),
          gte(transactions.date, endOfLastMonth),
        ),
      )
      .groupBy(transactions.category)

    // Combine category data
    const categoryMap = new Map<string, { thisMonth: number; lastMonth: number }>()

    currentMonthCategories.forEach((cat) => {
      categoryMap.set(cat.category, { thisMonth: Number(cat.total), lastMonth: 0 })
    })

    lastMonthCategories.forEach((cat) => {
      const existing = categoryMap.get(cat.category)
      if (existing) {
        existing.lastMonth = Number(cat.total)
      } else {
        categoryMap.set(cat.category, { thisMonth: 0, lastMonth: Number(cat.total) })
      }
    })

    const categoryTrends = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      thisMonth: data.thisMonth,
      lastMonth: data.lastMonth,
      change: data.lastMonth > 0 ? ((data.thisMonth - data.lastMonth) / data.lastMonth) * 100 : 0,
    }))

    // Calculate savings rate
    const totalIncome = monthlySpending.reduce((sum, month) => sum + month.income, 0)
    const totalExpenses = monthlySpending.reduce((sum, month) => sum + month.amount, 0)
    const currentSavingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    // Get daily cash flow for the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dailyCashFlow = await db
      .select({
        date: sql<string>`DATE(${transactions.date})`,
        income: sql<number>`sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end)`,
        expenses: sql<number>`sum(case when ${transactions.type} = 'expense' then abs(${transactions.amount}) else 0 end)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId,userId), gte(transactions.date, thirtyDaysAgo)))
      .groupBy(sql`DATE(${transactions.date})`)
      .orderBy(sql`DATE(${transactions.date})`)

    const cashFlow = dailyCashFlow.map((day) => ({
      date: day.date,
      income: Number(day.income),
      expenses: Number(day.expenses),
      net: Number(day.income) - Number(day.expenses),
    }))

    const response = {
      monthlySpending,
      categoryTrends: categoryTrends.slice(0, 10), // Top 10 categories
      savingsRate: {
        current: currentSavingsRate,
        target: 20, // Default target of 20%
        trend: 5.2, // Mock trend data
      },
      cashFlow,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
