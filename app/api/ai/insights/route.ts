import { type NextRequest, NextResponse } from "next/server"
import { db, transactions, budgets, goals, accounts } from "@/lib/db"
import { eq, and, gte, desc, sql } from "drizzle-orm"
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import { generateFinancialInsights } from "@/lib/services/openai"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try cache first
    const cacheKey = CACHE_KEYS.AI_INSIGHTS(userId)
    const cached = await redis.get(cacheKey)

    if (cached) {
      return NextResponse.json(cached)
    }

    // Get user's financial data for AI analysis
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), gte(transactions.date, thirtyDaysAgo)))
      .orderBy(desc(transactions.date))
      .limit(50)

    // Get active budgets
    const activeBudgets = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.status, "active")))

    // Get active goals
    const activeGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active")))

    // Get total balance
    const [balanceResult] = await db
      .select({
        totalBalance: sql<number>`sum(${accounts.balance})`,
      })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))

    // Calculate monthly spending
    const [spendingResult] = await db
      .select({
        monthlySpending: sql<number>`sum(abs(${transactions.amount}))`,
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.type, "expense"), gte(transactions.date, thirtyDaysAgo)),
      )

    const userData = {
      transactions: recentTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      budgets: activeBudgets.map((b) => ({
        ...b,
        totalAmount: Number(b.totalAmount),
      })),
      goals: activeGoals.map((g) => ({
        ...g,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
      })),
      totalBalance: Number(balanceResult?.totalBalance || 0),
      monthlySpending: Number(spendingResult?.monthlySpending || 0),
    }

    // Generate AI insights
    const aiResponse = await generateFinancialInsights(userData)

    const response = {
      insights: aiResponse.insights,
      generatedAt: new Date().toISOString(),
      userId,
      dataPoints: {
        transactionCount: recentTransactions.length,
        budgetCount: activeBudgets.length,
        goalCount: activeGoals.length,
        totalBalance: userData.totalBalance,
        monthlySpending: userData.monthlySpending,
      },
    }

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL.AI_INSIGHTS, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error generating AI insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, context } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get user's financial context if not provided
    let financialContext = context
    if (!financialContext) {
      // Fetch recent financial data for context
      const recentTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date))
        .limit(10)

      financialContext = {
        recentTransactions: recentTransactions.map((t) => ({
          category: t.category,
          amount: Number(t.amount),
          type: t.type,
          date: t.date,
        })),
      }
    }

    // Generate AI response with context
    const aiResponse = await generateFinancialInsights({
      transactions: financialContext.recentTransactions || [],
      budgets: [],
      goals: [],
      totalBalance: 0,
      monthlySpending: 0,
    })

    const response = {
      response: `Based on your financial data: ${prompt}. ${aiResponse.insights[0]?.message || "I recommend reviewing your spending patterns and setting clear financial goals."}`,
      confidence: 0.87,
      suggestions: aiResponse.insights[0]?.suggestions || [
        "Review your monthly subscriptions",
        "Set up automatic savings transfers",
        "Consider using the 50/30/20 budgeting rule",
      ],
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error processing AI request:", error)
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 })
  }
}
