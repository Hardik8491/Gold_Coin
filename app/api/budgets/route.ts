import { type NextRequest, NextResponse } from "next/server"
import { db, budgets, transactions, users } from "@/lib/db"
import { eq, desc, and, gte, lte, sql } from "drizzle-orm"
import { redis, CACHE_KEYS } from "@/lib/redis"
import { auth } from "@clerk/nextjs/server"
import { sendBudgetSetupEmail } from "@/lib/services/notifications"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period")
    const status = searchParams.get("status")

    // Build query conditions
    const conditions = [eq(budgets.userId, userId)]
    if (period) conditions.push(eq(budgets.period, period))
    if (status) conditions.push(eq(budgets.status, status))

    // Fetch budgets
    const userBudgets = await db
      .select()
      .from(budgets)
      .where(and(...conditions))
      .orderBy(desc(budgets.createdAt))

    // Calculate actual spending for each budget
    const budgetsWithSpending = await Promise.all(
      userBudgets.map(async (budget) => {
        // Get spending by category for this budget period
        const categorySpending = await db
          .select({
            category: transactions.category,
            total: sql<number>`sum(abs(${transactions.amount}))`,
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, userId),
              eq(transactions.type, "expense"),
              gte(transactions.date, budget.startDate),
              lte(transactions.date, budget.endDate),
            ),
          )
          .groupBy(transactions.category)

        // Update budget categories with actual spending
        const updatedCategories = budget.categories.map((category) => {
          const spending = categorySpending.find((s) => s.category === category.name)
          const spent = spending ? Number(spending.total) : 0
          const remaining = category.budgeted - spent

          return {
            ...category,
            spent,
            remaining,
          }
        })

        return {
          ...budget,
          categories: updatedCategories,
          totalSpent: updatedCategories.reduce((sum, cat) => sum + cat.spent, 0),
          totalRemaining: updatedCategories.reduce((sum, cat) => sum + cat.remaining, 0),
        }
      }),
    )

    const response = {
      budgets: budgetsWithSpending,
      total: budgetsWithSpending.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, period, totalAmount, categories, startDate, endDate, sendEmail = true } = body

    // Validate required fields
    if (!name || !period || !totalAmount || !categories || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert budget
    const [newBudget] = await db
      .insert(budgets)
      .values({
        userId,
        name,
        period,
        totalAmount: totalAmount.toString(),
        categories,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "active",
      })
      .returning()

    // Invalidate cache
    await redis.del(CACHE_KEYS.USER_DASHBOARD(userId))

    // Send budget setup email if requested
    if (sendEmail) {
      try {
        // Get user data
        const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId))

        if (user) {
          // Send email
          await sendBudgetSetupEmail(user, newBudget)
        }
      } catch (emailError) {
        console.error("Error sending budget setup email:", emailError)
        // Don't fail the budget creation if email fails
      }
    }

    return NextResponse.json(newBudget, { status: 201 })
  } catch (error) {
    console.error("Error creating budget:", error)
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}
