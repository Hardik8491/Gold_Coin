import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { sendWelcomeEmail } from "@/lib/services/notifications"
import { rateLimit } from "@/lib/rate-limit"
import { getMaxListeners } from "events"
import { connect } from "http2"

export async function POST(request: NextRequest) {
  try {


    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const identifier = `welcome_email_${userId}`
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Get user data
    const [user] = await db.select().from(users).where(eq(users.userId, userId))
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    // Send welcome email
  //  const res= await sendWelcomeEmail({
  //     firstName: user.firstName || " ",
  //     email: user.email,
  //   })
  //   if(res.success){
  //     console.log("res",res)
  //   }else{
  //     console.log(res.error,"error occer--?")
  //   }

    return NextResponse.json({
      message: "Welcome email sent successfully",
      sentAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
  }
}
