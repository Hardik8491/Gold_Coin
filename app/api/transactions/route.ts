import { type NextRequest, NextResponse } from "next/server"
import { db, transactions, accounts } from "@/lib/db"
import { eq, desc, and, gte, lte, sql } from "drizzle-orm"
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import { categorizeTransaction } from "@/lib/services/openai"
import { sendTransactionEmail } from "@/lib/services/notifications"
import { getCurrentUser, type User } from "@/lib/auth"
import { auth } from "@clerk/nextjs/server"
import { AwardIcon } from "lucide-react"

export async function GET(request: NextRequest) {
  try {
    const {userId} = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const category = searchParams.get("category")
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const accountId = searchParams.get("accountId")

    // Try cache first
    const cacheKey = CACHE_KEYS.USER_TRANSACTIONS(userId, Math.floor(offset / limit))
    console.log(cacheKey)
    const cached = await redis.get(cacheKey);
    console.log(cached)
    if (cached && !category && !type && !startDate && !endDate && !accountId) {
      if (typeof cached === 'string') {
        return NextResponse.json(JSON.parse(cached));
      } else {
        // If cached is already an object, return it directly
        return NextResponse.json(cached);
      }
    }
    
    // Build query conditions
    const conditions = [eq(transactions.userId, userId)]

    if (category) conditions.push(eq(transactions.category, category))
    if (type) conditions.push(eq(transactions.type, type))
    if (startDate) conditions.push(gte(transactions.date, new Date(startDate)))
    if (endDate) conditions.push(lte(transactions.date, new Date(endDate)))
    if (accountId) conditions.push(eq(transactions.accountId, accountId))

    // Fetch transactions with account info
    const result = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        category: transactions.category,
        subcategory: transactions.subcategory,
        merchant: transactions.merchant,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        location: transactions.location,
        tags: transactions.tags,
        recurring: transactions.recurring,
        accountName: accounts.name,
        accountType: accounts.type,
        accountId: transactions.accountId,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset)

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(and(...conditions))

    const response = {
      transactions: result,
      total: count,
      hasMore: offset + limit < count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(count / limit),
    }

    // Cache if no filters applied
    if (!category && !type && !startDate && !endDate && !accountId) {
      await redis.setex(cacheKey, CACHE_TTL.TRANSACTIONS, JSON.stringify(response));
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
   const {userId}= await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      accountId,
      type,
      merchant,
      amount,
      date,
      description,
      category,
      subcategory,
      location,
      tags,
      recurring,
      recurringPattern,
      sendEmail = true,
    } = body

    // Validate required fields
    if (!accountId || !type || !merchant || !amount || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Auto-categorize if not provided
    let finalCategory = category
    if (!finalCategory) {
      finalCategory = await categorizeTransaction(description || merchant, amount, merchant)
    }

    // Insert transaction
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        userId: userId,
        accountId,
        type,
        category: finalCategory,
        subcategory,
        merchant,
        amount: amount.toString(),
        description,
        date: new Date(date),
        location,
        tags: tags || [],
        recurring: recurring || false,
        recurringPattern,
      })
      .returning()

    // Update account balance
    const balanceChange = type === "income" ? amount : -amount
    await db
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${balanceChange}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId))

    // Invalidate cache
    await redis.del(CACHE_KEYS.USER_TRANSACTIONS(userId, 0))
    await redis.del(CACHE_KEYS.USER_DASHBOARD(userId))

    // Send transaction email if requested
    if (sendEmail) {
      try {
        // Get account name
        const [accountData] = await db.select().from(accounts).where(eq(accounts.id, accountId))

        // Format transaction for email
        const transactionForEmail = {
          id: newTransaction.id,
          type: newTransaction.type,
          category: newTransaction.category,
          merchant: newTransaction.merchant,
          amount: Number(newTransaction.amount),
          date: newTransaction.date.toISOString(),
          description: newTransaction.description || "",
          account: accountData?.name || "Unknown Account",
        }

        // Send email
        // await sendTransactionEmail(user, transactionrooForEmail)
      } catch (emailError) {
        console.error("Error sending transaction email:", emailError)
        // Don't fail the transaction creation if email fails
      }
    }

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
