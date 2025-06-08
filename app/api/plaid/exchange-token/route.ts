import { type NextRequest, NextResponse } from "next/server"
import { exchangePublicToken, getPlaidAccounts, getPlaidTransactions } from "@/lib/services/plaid"
import { db, accounts, transactions } from "@/lib/db"
import { auth } from "@clerk/nextjs/server" // Updated import
import { categorizeTransaction } from "@/lib/services/openai"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { publicToken } = await request.json()

    if (!publicToken) {
      return NextResponse.json({ error: "Public token is required" }, { status: 400 })
    }

    // Exchange public token for access token
    const accessToken = await exchangePublicToken(publicToken)

    // Get accounts from Plaid
    const plaidAccounts = await getPlaidAccounts(accessToken)

    // Save accounts to database
    const savedAccounts = []
    for (const plaidAccount of plaidAccounts) {
      const [savedAccount] = await db
        .insert(accounts)
        .values({
          userId,
          name: plaidAccount.name,
          type: plaidAccount.type as any,
          balance: plaidAccount.balances.current?.toString() || "0",
          currency: plaidAccount.balances.iso_currency_code || "USD",
          institution: plaidAccount.institution_id,
          accountNumber: plaidAccount.account_id,
        })
        .returning()

      savedAccounts.push(savedAccount)
    }

    // Get recent transactions (last 30 days)
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const plaidTransactions = await getPlaidTransactions(accessToken, startDate, endDate)

    // Save transactions to database
    for (const plaidTransaction of plaidTransactions) {
      // Find matching account
      const account = savedAccounts.find((acc) => acc.accountNumber === plaidTransaction.account_id)
      if (!account) continue

      // Categorize transaction using AI
      const category = await categorizeTransaction(
        plaidTransaction.name,
        plaidTransaction.amount,
        plaidTransaction.merchant_name || plaidTransaction.name,
      )

      await db
        .insert(transactions)
        .values({
          userId,
          accountId: account.id,
          type: plaidTransaction.amount > 0 ? "expense" : "income",
          category,
          merchant: plaidTransaction.merchant_name || plaidTransaction.name,
          amount: Math.abs(plaidTransaction.amount).toString(),
          description: plaidTransaction.name,
          date: new Date(plaidTransaction.date),
          location: plaidTransaction.location
            ? {
                address: plaidTransaction.location.address,
                city: plaidTransaction.location.city,
                state: plaidTransaction.location.region,
                country: plaidTransaction.location.country,
              }
            : undefined,
          plaidTransactionId: plaidTransaction.transaction_id,
        })
        .onConflictDoNothing()
    }

    return NextResponse.json({
      message: "Accounts and transactions synced successfully",
      accountsCount: savedAccounts.length,
      transactionsCount: plaidTransactions.length,
    })
  } catch (error) {
    console.error("Error exchanging token:", error)
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 })
  }
}
