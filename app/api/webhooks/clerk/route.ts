import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { db, users, gamification } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local")
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      // Create user in database
      const [newUser] = await db
        .insert(users)
        .values({
          id,
          clerkUserId: id,
          email: email_addresses[0]?.email_address || "",
          firstName: first_name || "",
          lastName: last_name || "",
          imageUrl: image_url || "",
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

      // Initialize gamification for new user
      await db.insert(gamification).values({
        userId: id,
        level: 1,
        experience: 0,
        coins: 100, // Welcome bonus
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
        challenges: [
          {
            id: "first-transaction",
            title: "First Transaction",
            description: "Add your first transaction",
            type: "spending",
            target: 1,
            progress: 0,
            reward: {
              coins: 50,
              experience: 100,
              badge: "first-transaction",
            },
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            status: "active",
          },
          {
            id: "first-budget",
            title: "Budget Master",
            description: "Create your first budget",
            type: "budget",
            target: 1,
            progress: 0,
            reward: {
              coins: 75,
              experience: 150,
              badge: "budget-master",
            },
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active",
          },
        ],
      })

      console.log("User created in database:", id)
      console.log("Gamification initialized for user:", id)
    } catch (error) {
      console.error("Error creating user:", error)
      return new Response("Error creating user", { status: 500 })
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      await db
        .update(users)
        .set({
          email: email_addresses[0]?.email_address || "",
          firstName: first_name || "",
          lastName: last_name || "",
          imageUrl: image_url || "",
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, id))

      console.log("User updated in database:", id)
    } catch (error) {
      console.error("Error updating user:", error)
      return new Response("Error updating user", { status: 500 })
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    try {
      // Delete user and all related data (cascade)
      await db.delete(users).where(eq(users.clerkUserId, id || ""))
      console.log("User deleted from database:", id)
    } catch (error) {
      console.error("Error deleting user:", error)
      return new Response("Error deleting user", { status: 500 })
    }
  }

  return new Response("", { status: 200 })
}
