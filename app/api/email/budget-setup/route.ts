import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, users, budgets } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { sendBudgetSetupEmail } from "@/lib/services/notifications"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { budgetId } = await request.json()
    if (!budgetId) {
      return NextResponse.json({ error: "Budget ID is required" }, { status: 400 })
    }

    // Rate limiting
    const identifier = `budget_setup_email_${userId}`
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Get user data
    const [user] = await db.select().from(users).where(eq(users?.clerkUserId, userId))
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get budget data
    const [budget] = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.id, budgetId)))

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    // Send budget setup email
    await sendBudgetSetupEmail(user, budget)

    return NextResponse.json({
      message: "Budget setup email sent successfully",
      sentAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error sending budget setup email:", error)
    return NextResponse.json({ error: "Failed to send budget setup email" }, { status: 500 })
  }
}
