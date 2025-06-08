import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"

interface ExchangeRates {
  [currency: string]: number
}

export async function getExchangeRates(baseCurrency = "USD"): Promise<ExchangeRates> {
  try {
    // Try to get from cache first
    const cached = await redis.get(CACHE_KEYS.EXCHANGE_RATES)
    if (cached) {
      return cached as ExchangeRates
    }

    // Fetch from external API
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, {
      next: { revalidate: CACHE_TTL.EXCHANGE_RATES },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates")
    }

    const data = await response.json()
    const rates = data.rates

    // Cache the result
    await redis.setex(CACHE_KEYS.EXCHANGE_RATES, CACHE_TTL.EXCHANGE_RATES, rates)

    return rates
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    // Return fallback rates
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
    }
  }
}

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = await getExchangeRates(fromCurrency)
  const rate = rates[toCurrency]

  if (!rate) {
    throw new Error(`Exchange rate not found for ${toCurrency}`)
  }

  return amount * rate
}
