import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, users, transactions, budgets, goals } from "@/lib/db"
import { eq, and, gte, desc } from "drizzle-orm"
import { openai } from "@/lib/services/openai"
import { resend } from "@/lib/services/notifications"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const identifier = `insights_email_${userId}`
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Get user data
    const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId))
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get financial data for insights
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [recentTransactions, activeBudgets, activeGoals] = await Promise.all([
      db
        .select()
        .from(transactions)
        .where(and(eq(transactions.userId, userId), gte(transactions.date, lastMonth)))
        .orderBy(desc(transactions.date))
        .limit(50),

      db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.status, "active"))),

      db
        .select()
        .from(goals)
        .where(and(eq(goals.userId, userId), eq(goals.status, "active"))),
    ])

    // Generate AI insights
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a personal finance advisor. Create a personalized monthly financial insights email. Return JSON:
          {
            "subject": "Your Monthly Financial Insights - January 2024",
            "insights": [
              {
                "title": "Spending Highlights",
                "content": "You spent 15% less on dining out this month!",
                "type": "positive"
              }
            ],
            "recommendations": [
              "Consider increasing your emergency fund contribution",
              "You're on track to meet your vacation savings goal"
            ],
            "achievements": [
              "Stayed under budget in 4 out of 5 categories",
              "Saved $200 more than last month"
            ],
            "alerts": [
              "Your grocery spending increased by 25% this month"
            ],
            "nextMonthGoals": [
              "Reduce subscription spending by $50",
              "Increase retirement contribution by 1%"
            ]
          }`,
        },
        {
          role: "user",
          content: `Generate monthly insights for ${user.firstName}:
          
          Recent Transactions: ${JSON.stringify(recentTransactions.slice(0, 20))}
          Active Budgets: ${JSON.stringify(activeBudgets)}
          Active Goals: ${JSON.stringify(activeGoals)}
          
          Total Spending: $${recentTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)}
          Total Income: $${recentTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const insights = JSON.parse(completion.choices[0]?.message?.content || "{}")

    // Generate HTML email
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${insights.subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .insight { margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background: #f8f9ff; }
            .positive { border-left-color: #10b981; background: #f0fdf4; }
            .negative { border-left-color: #ef4444; background: #fef2f2; }
            .achievement { background: #10b981; color: white; padding: 10px; margin: 5px 0; border-radius: 5px; }
            .alert { background: #ef4444; color: white; padding: 10px; margin: 5px 0; border-radius: 5px; }
            .recommendation { background: #3b82f6; color: white; padding: 10px; margin: 5px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🪙 GoldCoin Financial Insights</h1>
                <p>Hi ${user.firstName}, here's your monthly financial summary!</p>
            </div>
            <div class="content">
                ${
                  insights.insights
                    ?.map(
                      (insight: any) => `
                    <div class="insight ${insight.type}">
                        <h3>${insight.title}</h3>
                        <p>${insight.content}</p>
                    </div>
                `,
                    )
                    .join("") || ""
                }
                
                ${
                  insights.achievements?.length > 0
                    ? `
                    <h3>🏆 This Month's Achievements</h3>
                    ${insights.achievements
                      .map(
                        (achievement: string) => `
                        <div class="achievement">✅ ${achievement}</div>
                    `,
                      )
                      .join("")}
                `
                    : ""
                }
                
                ${
                  insights.alerts?.length > 0
                    ? `
                    <h3>⚠️ Alerts</h3>
                    ${insights.alerts
                      .map(
                        (alert: string) => `
                        <div class="alert">⚠️ ${alert}</div>
                    `,
                      )
                      .join("")}
                `
                    : ""
                }
                
                ${
                  insights.recommendations?.length > 0
                    ? `
                    <h3>💡 Recommendations</h3>
                    ${insights.recommendations
                      .map(
                        (rec: string) => `
                        <div class="recommendation">💡 ${rec}</div>
                    `,
                      )
                      .join("")}
                `
                    : ""
                }
                
                ${
                  insights.nextMonthGoals?.length > 0
                    ? `
                    <h3>🎯 Goals for Next Month</h3>
                    ${insights.nextMonthGoals
                      .map(
                        (goal: string) => `
                        <div class="insight">🎯 ${goal}</div>
                    `,
                      )
                      .join("")}
                `
                    : ""
                }
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                    <p>Keep up the great work! 💪</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `

    // Send email
    await resend.emails.send({
      from: "GoldCoin Insights <insights@goldcoin.app>",
      to: user.email,
      subject: insights.subject,
      html: emailHtml,
    })

    return NextResponse.json({
      message: "Insights email sent successfully",
      insights,
      sentAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error sending insights email:", error)
    return NextResponse.json({ error: "Failed to send insights email" }, { status: 500 })
  }
}
