import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
  throw new Error("Plaid environment variables are required")
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

export async function getPlaidTransactions(accessToken: string, startDate: string, endDate: string) {
  try {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    })
    return response.data.transactions
  } catch (error) {
    console.error("Error fetching Plaid transactions:", error)
    throw error
  }
}

export async function getPlaidAccounts(accessToken: string) {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    })
    return response.data.accounts
  } catch (error) {
    console.error("Error fetching Plaid accounts:", error)
    throw error
  }
}

export async function createLinkToken(userId: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "GoldCoin Finance Tracker",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    })
    return response.data.link_token
  } catch (error) {
    console.error("Error creating link token:", error)
    throw error
  }
}

export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })
    return response.data.access_token
  } catch (error) {
    console.error("Error exchanging public token:", error)
    throw error
  }
}
