import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, transactions, bills } from "@/lib/db"
import { eq, and, gte, sql } from "drizzle-orm"
import { openai } from "@/lib/services/openai"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const identifier = `bill_detection_${userId}`
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Get last 3 months of transactions
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), gte(transactions.date, threeMonthsAgo)))

    // Group by merchant and analyze patterns
    const merchantGroups = recentTransactions.reduce(
      (acc, transaction) => {
        const merchant = transaction.merchant
        if (!acc[merchant]) {
          acc[merchant] = []
        }
        acc[merchant].push(transaction)
        return acc
      },
      {} as Record<string, typeof recentTransactions>,
    )

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a bill detection AI. Analyze transaction patterns to identify recurring bills. Return JSON:
          {
            "detectedBills": [
              {
                "merchant": "Electric Company",
                "category": "Bills & Utilities",
                "averageAmount": 125.50,
                "frequency": "monthly",
                "nextDueDate": "2024-02-15",
                "confidence": 0.95,
                "pattern": "Regular monthly payment",
                "shouldCreateBill": true
              }
            ],
            "recommendations": [
              "Set up autopay for Netflix to avoid late fees",
              "Consider switching to annual billing for software subscriptions"
            ]
          }`,
        },
        {
          role: "user",
          content: `Analyze these transaction patterns for recurring bills:
          
          ${Object.entries(merchantGroups)
            .slice(0, 20)
            .map(
              ([merchant, txns]) =>
                `${merchant}: ${txns.length} transactions, amounts: ${txns.map((t) => t.amount).join(", ")}, dates: ${txns.map((t) => t.date).join(", ")}`,
            )
            .join("\n")}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}")

    // Auto-create high-confidence bills
    const autoCreatedBills = []
    for (const detectedBill of result.detectedBills || []) {
      if (detectedBill.confidence > 0.8 && detectedBill.shouldCreateBill) {
        try {
          // Check if bill already exists
          const existingBill = await db
            .select()
            .from(bills)
            .where(and(eq(bills.userId, userId), sql`LOWER(${bills.merchant}) = LOWER(${detectedBill.merchant})`))

          if (existingBill.length === 0) {
            const [newBill] = await db
              .insert(bills)
              .values({
                userId,
                accountId: recentTransactions[0]?.accountId, // Use first account as default
                name: `${detectedBill.merchant} Bill`,
                amount: detectedBill.averageAmount.toString(),
                dueDate: new Date(detectedBill.nextDueDate),
                category: detectedBill.category,
                recurring: true,
                frequency: detectedBill.frequency,
                merchant: detectedBill.merchant,
                reminders: true,
              })
              .returning()

            autoCreatedBills.push(newBill)
          }
        } catch (error) {
          console.error("Error auto-creating bill:", error)
        }
      }
    }

    return NextResponse.json({
      ...result,
      autoCreatedBills,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error detecting bills:", error)
    return NextResponse.json({ error: "Failed to detect bills" }, { status: 500 })
  }
}
