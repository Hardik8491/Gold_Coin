import { auth, currentUser } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { db, users, gamification } from "@/lib/db"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "User not found in Clerk" }, { status: 404 })
    }

    // Check if user exists in database
    const [existingUser] = await db.select().from(users).where(eq(users.userId, userId))

    if (!existingUser) {
      // Create user in database if doesn't exist
      const [newUser] = await db
        .insert(users)
        .values({
          userId: userId,
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          imageUrl: clerkUser.imageUrl || "",
          preferences: {
            currency: "USD",
            timezone: "UTC",
            notifications: {
              email: true,
              push: true,
              budgetAlerts: true,
              goalReminders: true,
              billReminders: true,
            },
            privacy: {
              shareData: false,
              analytics: true,
            },
          },
          onboardingCompleted: false,
        })
        .returning()

      // Initialize gamification
      await db.insert(gamification).values({
        userId: userId,
        level: 1,
        experience: 0,
        coins: 100,
        badges: [
          {
            id: "welcome",
            name: "Welcome to GoldCoin",
            description: "Joined the GoldCoin community",
            icon: "🎉",
            rarity: "common",
            earnedAt: new Date().toISOString(),
          },
        ],
        streaks: {
          current: 0,
          longest: 0,
          type: "daily",
          lastActivity: new Date().toISOString(),
        },
        challenges: [],
      })

      return NextResponse.json({
        message: "User created and synced successfully",
        user: newUser,
      })
    } else {
      // Update existing user with latest Clerk data
      const [updatedUser] = await db
        .update(users)
        .set({
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          imageUrl: clerkUser.imageUrl || "",
          updatedAt: new Date(),
        })
        .where(eq(users.userId, userId))
        .returning()

      return NextResponse.json({
        message: "User synced successfully",
        user: updatedUser,
      })
    }
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
  }
}
