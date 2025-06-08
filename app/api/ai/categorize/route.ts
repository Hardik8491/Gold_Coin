import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { openai } from "@/lib/services/openai"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const identifier = `categorize_${userId}`
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const { description, amount, merchant } = await request.json()

    if (!description || !amount || !merchant) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a financial transaction categorizer. Analyze the transaction and return a JSON response with:
          {
            "category": "primary category",
            "subcategory": "specific subcategory",
            "confidence": 0.95,
            "tags": ["tag1", "tag2"],
            "isRecurring": true/false,
            "merchantType": "type of business"
          }
          
          Categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Business, Personal Care, Gifts & Donations, Investments, Other`,
        },
        {
          role: "user",
          content: `Categorize this transaction:
          Description: ${description}
          Amount: $${amount}
          Merchant: ${merchant}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}")

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error categorizing transaction:", error)
    return NextResponse.json({ error: "Failed to categorize transaction" }, { status: 500 })
  }
}
