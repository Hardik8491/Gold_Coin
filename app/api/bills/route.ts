import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, bills, accounts } from "@/lib/db"
import { eq, and, desc } from "drizzle-orm"
import { redis, CACHE_TTL } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const upcoming = searchParams.get("upcoming") === "true"

    // Try cache first
    const cacheKey = `bills_${userId}_${status || "all"}_${upcoming}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      return NextResponse.json(cached)
    }

    // Build query conditions
    const conditions = [eq(bills.userId, userId)]
    if (status) conditions.push(eq(bills.status, status))

    // Get bills with account info
    const userBills = await db
      .select({
        id: bills.id,
        name: bills.name,
        amount: bills.amount,
        dueDate: bills.dueDate,
        category: bills.category,
        recurring: bills.recurring,
        frequency: bills.frequency,
        status: bills.status,
        reminders: bills.reminders,
        reminderDays: bills.reminderDays,
        autopay: bills.autopay,
        merchant: bills.merchant,
        website: bills.website,
        notes: bills.notes,
        accountName: accounts.name,
        createdAt: bills.createdAt,
      })
      .from(bills)
      .leftJoin(accounts, eq(bills.accountId, accounts.id))
      .where(and(...conditions))
      .orderBy(desc(bills.dueDate))

    // Filter upcoming bills if requested
    let filteredBills = userBills
    if (upcoming) {
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      filteredBills = userBills.filter(
        (bill) => new Date(bill.dueDate) >= now && new Date(bill.dueDate) <= thirtyDaysFromNow,
      )
    }

    const response = {
      bills: filteredBills.map((bill) => ({
        ...bill,
        amount: Number(bill.amount),
      })),
      total: filteredBills.length,
    }

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL.BILLS || 300, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      accountId,
      name,
      amount,
      dueDate,
      category,
      recurring,
      frequency,
      reminders,
      reminderDays,
      autopay,
      merchant,
      website,
      notes,
    } = body

    if (!accountId || !name || !amount || !dueDate || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newBill] = await db
      .insert(bills)
      .values({
        userId,
        accountId,
        name,
        amount: amount.toString(),
        dueDate: new Date(dueDate),
        category,
        recurring: recurring || false,
        frequency,
        reminders: reminders !== undefined ? reminders : true,
        reminderDays: reminderDays || 3,
        autopay: autopay || false,
        merchant,
        website,
        notes,
      })
      .returning()

    // Invalidate cache
    await redis.del(`bills_${userId}_all_false`)
    await redis.del(`bills_${userId}_all_true`)

    return NextResponse.json(
      {
        ...newBill,
        amount: Number(newBill.amount),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 })
  }
}
