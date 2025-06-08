import { NextResponse } from "next/server"
import { db, users, bills } from "@/lib/db"
import { eq, and, gte, lte } from "drizzle-orm"
import { sendBillReminder } from "@/lib/services/notifications"

// This endpoint should be called daily by a cron job
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const cronSecret = searchParams.get("cronSecret")

    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get bills due in the next 3 days
    const today = new Date()
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)

    const upcomingBills = await db
      .select({
        bill: bills,
        user: users,
      })
      .from(bills)
      .innerJoin(users, eq(bills.userId, users.id))
      .where(and(gte(bills.dueDate, today), lte(bills.dueDate, threeDaysFromNow), eq(bills.status, "pending")))

    let remindersSent = 0

    for (const { bill, user } of upcomingBills) {
      try {
        const daysRemaining = Math.ceil((bill.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        await sendBillReminder(user, bill, daysRemaining)
        remindersSent++

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (billError) {
        console.error(`Error sending reminder for bill ${bill.id}:`, billError)
        continue
      }
    }

    return NextResponse.json({
      message: "Bill reminders sent successfully",
      remindersSent,
      date: today.toISOString(),
    })
  } catch (error) {
    console.error("Error sending bill reminders:", error)
    return NextResponse.json({ error: "Failed to send bill reminders" }, { status: 500 })
  }
}
