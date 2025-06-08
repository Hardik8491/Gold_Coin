import { type NextRequest, NextResponse } from "next/server"
import { db, accounts } from "@/lib/db"
import { eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId))

    return NextResponse.json({
      accounts: userAccounts.map((account) => ({
        ...account,
        balance: Number(account.balance),
      })),
      total: userAccounts.length,
    })
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, balance, currency, institution } = body

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newAccount] = await db
      .insert(accounts)
      .values({
        userId,
        name,
        type,
        balance: (balance || 0).toString(),
        currency: currency || "USD",
        institution,
      })
      .returning()

    return NextResponse.json(
      {
        ...newAccount,
        balance: Number(newAccount.balance),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
