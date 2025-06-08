import OpenAI from "openai"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OpenAI API key is required")
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateFinancialInsights(userData: {
  transactions: any[]
  budgets: any[]
  goals: any[]
  totalBalance: number
  monthlySpending: number
}) {
  try {
    const prompt = `
    Analyze the following financial data and provide personalized insights:
    
    Total Balance: $${userData.totalBalance}
    Monthly Spending: $${userData.monthlySpending}
    Recent Transactions: ${JSON.stringify(userData.transactions.slice(0, 10))}
    Active Budgets: ${JSON.stringify(userData.budgets)}
    Financial Goals: ${JSON.stringify(userData.goals)}
    
    Please provide:
    1. Spending pattern analysis
    2. Budget recommendations
    3. Savings opportunities
    4. Goal progress insights
    5. Risk alerts if any
    
    Format the response as JSON with the following structure:
    {
      "insights": [
        {
          "type": "spending_pattern" | "savings_opportunity" | "goal_progress" | "budget_alert",
          "title": "string",
          "message": "string",
          "severity": "info" | "warning" | "success" | "error",
          "actionable": boolean,
          "suggestions": ["string"],
          "category": "string",
          "impact": "low" | "medium" | "high",
          "confidence": number
        }
      ]
    }
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a financial advisor AI that provides personalized insights based on user financial data. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("No response from OpenAI")
    }

    return JSON.parse(response)
  } catch (error) {
    console.error("Error generating AI insights:", error)
    return {
      insights: [
        {
          type: "info",
          title: "AI Analysis Unavailable",
          message: "Unable to generate AI insights at this time. Please try again later.",
          severity: "info",
          actionable: false,
          suggestions: [],
          category: "System",
          impact: "low",
          confidence: 0,
        },
      ],
    }
  }
}

export async function categorizeTransaction(description: string, amount: number, merchant: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a transaction categorizer. Return JSON with:
          {
            "category": "primary category",
            "subcategory": "specific subcategory", 
            "confidence": 0.95,
            "tags": ["tag1", "tag2"],
            "isRecurring": true/false
          }
          
          Categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Business, Personal Care, Gifts & Donations, Investments, Other`,
        },
        {
          role: "user",
          content: `Categorize: ${description}, $${amount}, ${merchant}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}")
    return result.category || "Other"
  } catch (error) {
    console.error("Error categorizing transaction:", error)
    return "Other"
  }
}
