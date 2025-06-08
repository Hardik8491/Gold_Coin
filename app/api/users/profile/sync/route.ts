import { auth, currentUser } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { db, users, gamification } from "@/lib/db"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { ClerkLoaded } from "@clerk/nextjs"
import { CloudRain } from "lucide-react"

export async function POST() {
  try {
    const clerkUser = await currentUser();
    console.log(clerkUser?.id)

    if (!clerkUser) {
      return NextResponse.json({ error: "User not found in Clerk" }, { status: 404 })
    }

    // Check if user exists in database
    const [existingUser] = await db.select().from(users).where(eq(users.clerkUserId, clerkUser.id))

    const name=clerkUser?.firstName + clerkUser?.lastName || "";
    if (!existingUser) {
      // Create user in database if doesn't exist
      const [newUser] = await db
        .insert(users)
        .values({
          clerkUserId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          // firstName: clerkUser.firstName || "",
          name,
          // lastName: clerkUser.lastName || "",
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
        userId:newUser.id,
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
          name:clerkUser.fullName || "",
          avatar: clerkUser.imageUrl || "",
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId ,clerkUser.id))
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
