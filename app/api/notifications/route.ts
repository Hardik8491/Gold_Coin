import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, bills, goals, budgets, users } from "@/lib/db"
import { eq, and, lte, gte } from "drizzle-orm"
import { sendBillReminder, sendGoalMilestone, sendBudgetAlert } from "@/lib/services/notifications"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = []

    // Check for upcoming bills
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    const upcomingBills = await db
      .select()
      .from(bills)
      .where(
        and(
          eq(bills.userId, userId),
          eq(bills.status, "pending"),
          eq(bills.reminders, true),
          lte(bills.dueDate, threeDaysFromNow),
          gte(bills.dueDate, now),
        ),
      )

    upcomingBills.forEach((bill) => {
      const daysUntilDue = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `bill_${bill.id}`,
        type: "bill_reminder",
        title: `Bill Due ${daysUntilDue === 0 ? "Today" : `in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`}`,
        message: `${bill.name} - $${Number(bill.amount).toFixed(2)}`,
        severity: daysUntilDue === 0 ? "error" : daysUntilDue === 1 ? "warning" : "info",
        actionUrl: "/bills",
        createdAt: new Date().toISOString(),
      })
    })

    // Check for goal milestones
    const activeGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active")))

    activeGoals.forEach((goal) => {
      const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
      const unlockedMilestones = goal.milestones.filter((m) => !m.reached && Number(goal.currentAmount) >= m.amount)

      unlockedMilestones.forEach((milestone) => {
        notifications.push({
          id: `goal_milestone_${goal.id}_${milestone.amount}`,
          type: "goal_milestone",
          title: "Goal Milestone Reached! 🎉",
          message: `You've reached $${milestone.amount} for "${goal.title}"`,
          severity: "success",
          actionUrl: "/goals",
          createdAt: new Date().toISOString(),
        })
      })

      // Check if goal deadline is approaching
      const deadline = new Date(goal.deadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDeadline <= 30 && daysUntilDeadline > 0 && progress < 100) {
        notifications.push({
          id: `goal_deadline_${goal.id}`,
          type: "goal_deadline",
          title: "Goal Deadline Approaching",
          message: `"${goal.title}" is due in ${daysUntilDeadline} days (${Math.round(progress)}% complete)`,
          severity: daysUntilDeadline <= 7 ? "warning" : "info",
          actionUrl: "/goals",
          createdAt: new Date().toISOString(),
        })
      }
    })

    // Check for budget alerts
    const activeBudgets = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.status, "active")))

    activeBudgets.forEach((budget) => {
      budget.categories.forEach((category) => {
        const utilization = (category.spent / category.budgeted) * 100

        if (utilization >= 100) {
          notifications.push({
            id: `budget_exceeded_${budget.id}_${category.name}`,
            type: "budget_alert",
            title: "Budget Exceeded! ⚠️",
            message: `You've exceeded your ${category.name} budget by $${(category.spent - category.budgeted).toFixed(2)}`,
            severity: "error",
            actionUrl: "/budgets",
            createdAt: new Date().toISOString(),
          })
        } else if (utilization >= 80) {
          notifications.push({
            id: `budget_warning_${budget.id}_${category.name}`,
            type: "budget_warning",
            title: "Budget Warning",
            message: `You've used ${Math.round(utilization)}% of your ${category.name} budget`,
            severity: "warning",
            actionUrl: "/budgets",
            createdAt: new Date().toISOString(),
          })
        }
      })
    })

    return NextResponse.json({
      notifications: notifications.slice(0, 10), // Limit to 10 most recent
      total: notifications.length,
      unreadCount: notifications.length,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, data } = await request.json()

    // Get user data
    const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId))
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let result = null

    switch (type) {
      case "send_bill_reminder":
        if (data.billId) {
          const [bill] = await db.select().from(bills).where(eq(bills.id, data.billId))
          if (bill) {
            await sendBillReminder(
              user.email,
              user.firstName || "User",
              bill.name,
              Number(bill.amount),
              bill.dueDate.toISOString(),
            )
            result = { message: "Bill reminder sent" }
          }
        }
        break

      case "send_goal_milestone":
        if (data.goalId && data.milestoneAmount) {
          const [goal] = await db.select().from(goals).where(eq(goals.id, data.goalId))
          if (goal) {
            const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
            await sendGoalMilestone(user.email, user.firstName || "User", goal.title, data.milestoneAmount, progress)
            result = { message: "Goal milestone notification sent" }
          }
        }
        break

      case "send_budget_alert":
        if (data.budgetId && data.category) {
          const [budget] = await db.select().from(budgets).where(eq(budgets.id, data.budgetId))
          if (budget) {
            const category = budget.categories.find((c) => c.name === data.category)
            if (category) {
              const percentageOver = ((category.spent - category.budgeted) / category.budgeted) * 100
              await sendBudgetAlert(
                user.email,
                user.firstName || "User",
                category.name,
                percentageOver,
                category.spent - category.budgeted,
              )
              result = { message: "Budget alert sent" }
            }
          }
        }
        break

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ error: "Failed to send notification" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
