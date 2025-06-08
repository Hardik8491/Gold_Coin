import { auth } from "@clerk/nextjs/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { preferences } = body

    // Update user preferences and mark onboarding as completed
    const [updatedUser] = await db
      .update(users)
      .set({
        preferences: {
          ...preferences,
        },
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, userId))
      .returning()

    return NextResponse.json({
      message: "Profile completed successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error completing profile:", error)
    return NextResponse.json({ error: "Failed to complete profile" }, { status: 500 })
  }
}
