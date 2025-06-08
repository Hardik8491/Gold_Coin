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
    const identifier = `receipt_scan_${userId}`
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("receipt") as File

    if (!file) {
      return NextResponse.json({ error: "No receipt image provided" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `You are a receipt scanner. Extract transaction details from receipt images and return JSON:
          {
            "merchant": "business name",
            "amount": 25.99,
            "date": "2024-01-15",
            "items": [{"name": "item", "price": 10.99, "quantity": 1}],
            "category": "Food & Dining",
            "tax": 2.08,
            "tip": 5.00,
            "paymentMethod": "Credit Card",
            "confidence": 0.95
          }`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract transaction details from this receipt:",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}")

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error scanning receipt:", error)
    return NextResponse.json({ error: "Failed to scan receipt" }, { status: 500 })
  }
}
