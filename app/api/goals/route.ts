import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, goals, users } from "@/lib/db"
import { eq, desc, and } from "drizzle-orm"
import { redis, CACHE_KEYS } from "@/lib/redis"
import { sendGoalCreatedEmail } from "@/lib/services/notifications"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Build query conditions
    const conditions = [eq(goals.userId, userId)]
    if (status) conditions.push(eq(goals.status, status))

    // Fetch goals
    const result = await db
      .select()
      .from(goals)
      .where(and(...conditions))
      .orderBy(desc(goals.createdAt))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } =  await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      targetAmount,
      currentAmount,
      category,
      deadline,
      priority,
      milestones,
      sendEmail = true,
    } = body

    // Validate required fields
    if (!title || !targetAmount || !category || !deadline || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert goal
    const [newGoal] = await db
      .insert(goals)
      .values({
        userId,
        title,
        description,
        targetAmount: targetAmount.toString(),
        currentAmount: (currentAmount || 0).toString(),
        category,
        deadline: new Date(deadline),
        priority,
        status: "active",
        milestones: milestones || [],
      })
      .returning()

    // Invalidate cache
    await redis.del(CACHE_KEYS.USER_DASHBOARD(userId))

    // Send goal created email if requested
    if (sendEmail) {
      try {
        // Get user data
        const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId))

        if (user) {
          // Send email
          await sendGoalCreatedEmail(user, newGoal)
        }
      } catch (emailError) {
        console.error("Error sending goal created email:", emailError)
        // Don't fail the goal creation if email fails
      }
    }

    return NextResponse.json(newGoal, { status: 201 })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { goalId, currentAmount } = body

    if (!goalId || currentAmount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get current goal
    const [currentGoal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))

    if (!currentGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Check for milestone achievements
    const previousAmount = Number(currentGoal.currentAmount)
    const newAmount = Number(currentAmount)

    const updatedMilestones = currentGoal.milestones.map((milestone) => {
      if (!milestone.reached && newAmount >= milestone.amount && previousAmount < milestone.amount) {
        // Milestone just reached - send notification
        // Note: In a real app, you'd get user email from the database
        // sendGoalMilestone(userEmail, userName, currentGoal.title, milestone.amount, (newAmount / Number(currentGoal.targetAmount)) * 100)

        return {
          ...milestone,
          reached: true,
          date: new Date().toISOString(),
        }
      }
      return milestone
    })

    // Update goal
    const [updatedGoal] = await db
      .update(goals)
      .set({
        currentAmount: currentAmount.toString(),
        milestones: updatedMilestones,
        updatedAt: new Date(),
      })
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
      .returning()

    // Invalidate cache
    await redis.del(CACHE_KEYS.USER_GOALS(userId))
    await redis.del(CACHE_KEYS.USER_DASHBOARD(userId))

    return NextResponse.json(updatedGoal)
  } catch (error) {
    console.error("Error updating goal:", error)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}
