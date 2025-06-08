import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, goals } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all goals
    const userGoals = await db.select().from(goals).where(eq(goals.userId, userId))

    if (userGoals.length === 0) {
      return NextResponse.json({
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        overallProgress: 0,
        goalsNearDeadline: 0,
        averageProgress: 0,
      })
    }

    // Calculate statistics
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const stats = userGoals.reduce(
      (acc, goal) => {
        const targetAmount = Number(goal.targetAmount)
        const currentAmount = Number(goal.currentAmount)
        const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
        const deadline = new Date(goal.deadline)

        acc.totalTargetAmount += targetAmount
        acc.totalCurrentAmount += currentAmount
        acc.progressSum += progress

        if (goal.status === "active") {
          acc.activeGoals++
        }

        if (goal.status === "completed" || progress >= 100) {
          acc.completedGoals++
        }

        if (deadline <= thirtyDaysFromNow && deadline > now && goal.status === "active") {
          acc.goalsNearDeadline++
        }

        return acc
      },
      {
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        progressSum: 0,
        activeGoals: 0,
        completedGoals: 0,
        goalsNearDeadline: 0,
      },
    )

    const overallProgress = stats.totalTargetAmount > 0 ? (stats.totalCurrentAmount / stats.totalTargetAmount) * 100 : 0

    const averageProgress = userGoals.length > 0 ? stats.progressSum / userGoals.length : 0

    return NextResponse.json({
      totalGoals: userGoals.length,
      activeGoals: stats.activeGoals,
      completedGoals: stats.completedGoals,
      totalTargetAmount: stats.totalTargetAmount,
      totalCurrentAmount: stats.totalCurrentAmount,
      overallProgress,
      goalsNearDeadline: stats.goalsNearDeadline,
      averageProgress,
    })
  } catch (error) {
    console.error("Error fetching goals overview:", error)
    return NextResponse.json({ error: "Failed to fetch goals overview" }, { status: 500 })
  }
}
