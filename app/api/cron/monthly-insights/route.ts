import { NextResponse } from "next/server"
import { db, users, transactions } from "@/lib/db"
import { eq, and, gte, lt } from "drizzle-orm"
import { openai } from "@/lib/services/openai"
import { sendMonthlyInsightsEmail } from "@/lib/services/notifications"
import { getMonth } from "date-fns"

// This endpoint should be called by a cron job at the beginning of each month
export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure this is called by authorized service
    const { searchParams } = new URL(request.url)
    const cronSecret = searchParams.get("cronSecret")

    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active users
    const activeUsers = await db.select().from(users)

    // Get previous month's date range
    const now = new Date()
    const firstDayLastMonth = new Date(now.getFullYear(), getMonth(now) - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), getMonth(now), 0)

    const monthName = firstDayLastMonth.toLocaleString("default", { month: "long" })
    const year = firstDayLastMonth.getFullYear()

    let emailsSent = 0

    for (const user of activeUsers) {
      try {
        // Get user's transactions for last month
        const userTransactions = await db
          .select()
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, user.id),
              gte(transactions.date, firstDayLastMonth),
              lt(transactions.date, lastDayLastMonth),
            ),
          )

        if (userTransactions.length === 0) {
          continue // Skip users with no transactions
        }

        // Calculate financial metrics
        const income = userTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)

        const expenses = userTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

        const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0

        // Get top spending categories
        const categorySpending = userTransactions
          .filter((t) => t.type === "expense")
          .reduce(
            (acc, t) => {
              const category = t.category
              acc[category] = (acc[category] || 0) + Math.abs(Number(t.amount))
              return acc
            },
            {} as Record<string, number>,
          )

        const topCategories = Object.entries(categorySpending)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, amount]) => ({ name, amount }))

        // Generate AI insights
        const prompt = `
          Analyze this user's financial data for ${monthName} ${year}:
          - Income: $${income.toFixed(2)}
          - Expenses: $${expenses.toFixed(2)}
          - Savings Rate: ${savingsRate}%
          - Top spending categories: ${topCategories.map((c) => `${c.name}: $${c.amount.toFixed(2)}`).join(", ")}
          
          Provide 3 insights and 3 recommendations in JSON format:
          {
            "insights": [
              {"title": "Insight Title", "message": "Insight message", "type": "positive|negative|neutral"}
            ],
            "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
          }
        `

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        })

        const aiResponse = JSON.parse(completion.choices[0].message.content || "{}")

        // Send monthly insights email
        await sendMonthlyInsightsEmail(user, {
          month: monthName,
          year,
          totalIncome: income,
          totalExpenses: expenses,
          savingsRate,
          topCategories,
          insights: aiResponse.insights || [],
          recommendations: aiResponse.recommendations || [],
        })

        emailsSent++

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError)
        continue
      }
    }

    return NextResponse.json({
      message: `Monthly insights emails sent successfully`,
      emailsSent,
      month: monthName,
      year,
    })
  } catch (error) {
    console.error("Error sending monthly insights emails:", error)
    return NextResponse.json({ error: "Failed to send monthly insights emails" }, { status: 500 })
  }
}
