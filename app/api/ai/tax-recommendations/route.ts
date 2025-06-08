import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, transactions } from "@/lib/db"
import { eq, and, gte } from "drizzle-orm"
import { openai } from "@/lib/services/openai"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const identifier = `tax_recommendations_${userId}`
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Get current tax year transactions
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), gte(transactions.date, startOfYear)))

    // Categorize transactions for tax purposes
    const businessExpenses = userTransactions.filter((t) =>
      ["Business", "Education", "Healthcare"].includes(t.category),
    )

    const charitableDonations = userTransactions.filter((t) => t.category === "Gifts & Donations")

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a tax advisor AI. Analyze financial transactions and provide tax recommendations. Return JSON:
          {
            "deductibleExpenses": [
              {
                "category": "Business Expenses",
                "amount": 5000,
                "description": "Office supplies and equipment",
                "deductionType": "Business Expense",
                "confidence": 0.9
              }
            ],
            "taxSavings": 1200,
            "recommendations": [
              "Consider maximizing retirement contributions",
              "Track business mileage for additional deductions"
            ],
            "missingDocuments": ["Receipt for $500 office equipment"],
            "quarterlyEstimates": {
              "q1": 2500,
              "q2": 2500,
              "q3": 2500,
              "q4": 2500
            }
          }`,
        },
        {
          role: "user",
          content: `Analyze these transactions for tax optimization:
          
          Business Expenses: ${JSON.stringify(businessExpenses.slice(0, 20))}
          Charitable Donations: ${JSON.stringify(charitableDonations)}
          
          Total Business Expenses: $${businessExpenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)}
          Total Donations: $${charitableDonations.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}")

    return NextResponse.json({
      ...result,
      generatedAt: new Date().toISOString(),
      taxYear: currentYear,
    })
  } catch (error) {
    console.error("Error generating tax recommendations:", error)
    return NextResponse.json({ error: "Failed to generate tax recommendations" }, { status: 500 })
  }
}
