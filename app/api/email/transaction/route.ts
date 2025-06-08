import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, users, transactions, accounts } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { sendTransactionEmail } from "@/lib/services/notifications";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await request.json();
    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Rate limiting
    const identifier = `transaction_email_${userId}`;
    const { success } = await rateLimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get transaction data
    const [transaction] = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        category: transactions.category,
        subcategory: transactions.subcategory,
        merchant: transactions.merchant,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(eq(transactions.userId, userId), eq(transactions.id, transactionId))
      );

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Format transaction for email
    const formattedTransaction = {
      id: transaction.id,
      type: transaction.type,
      category: transaction.category,
      merchant: transaction.merchant,
      amount: Number(transaction.amount),
      date: transaction.date.toISOString(),
      description: transaction.description || "",
      account: transaction.accountName,
    };

    // Send transaction email
    await sendTransactionEmail(user, formattedTransaction);

    return NextResponse.json({
      message: "Transaction email sent successfully",
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending transaction email:", error);
    return NextResponse.json(
      { error: "Failed to send transaction email" },
      { status: 500 }
    );
  }
}
