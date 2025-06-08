import { auth } from "@clerk/nextjs/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  clerkUserId: string
  preferences: any
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId))
    return user || null
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    return user || null
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }
}
