# 🪙 GoldCoin – AI-Powered Personal Finance Tracker

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/OpenAI-GPT4-412991?style=for-the-badge&logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk" />
</div>

<div align="center">
  <h3>🚀 Modern • 🤖 AI-Powered • 📊 Real-time Analytics • 🎮 Gamified • 🏦 Bank Integration</h3>
  <p>A comprehensive personal finance management platform with AI insights, real-time analytics, gamification, and seamless bank integration.</p>
</div>

---

## 📋 Table of Contents

* [✨ Core Features & Technologies](#-core-features--technologies)
* [🏗️ System Architecture](#️-system-architecture)
* [🛠️ Complete Tech Stack](#️-complete-tech-stack)
* [🗄️ Database Schema & Design](#️-database-schema--design)
* [🤖 AI Integration & Workflows](#-ai-integration--workflows)
* [📧 Email System & Templates](#-email-system--templates)
* [🎮 Gamification Engine](#-gamification-engine)
* [🏦 Banking & Financial Integration](#-banking--financial-integration)
* [📊 Analytics & Reporting Engine](#-analytics--reporting-engine)
* [🔐 Authentication & Security](#-authentication--security)
* [🌐 API Architecture & Endpoints](#-api-architecture--endpoints)
* [⚡ Caching & Performance](#-caching--performance)
* [🚀 Deployment & Infrastructure](#-deployment--infrastructure)
* [🧪 Testing Strategy](#-testing-strategy)
* [📱 Frontend Architecture](#-frontend-architecture)
* [🔧 Configuration & Setup](#-configuration--setup)

---

## ✨ Core Features & Technologies

### 🏦 Financial Management Core

#### Multi-Account Management

* **Technology:** PostgreSQL with Drizzle ORM, Redis caching
* **Description:**
  Users can connect multiple financial accounts such as checking, savings, credit cards, and investments. Balances update in real-time with automatic syncing. Supports multi-currency and institution linking.

```typescript
interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  institution?: string;
  plaidAccessToken?: string; // For bank integration
  isActive: boolean;
}

// Real-time balance updates
const updateAccountBalance = async (
  accountId: string,
  amount: number,
  type: 'income' | 'expense'
) => {
  const balanceChange = type === 'income' ? amount : -amount;
  await db.update(accounts)
    .set({ balance: sql`${accounts.balance} + ${balanceChange}` })
    .where(eq(accounts.id, accountId));
};
```

#### Smart Transaction Management

* **Technology:** Next.js API Routes, OpenAI GPT-4, Plaid API
* **Description:**
  Import transactions automatically from 11,000+ banks via Plaid, categorize them intelligently using GPT-4, and extract data from scanned receipts with OCR. Provides real-time processing and push notifications.

```typescript
const categorizeTransaction = async (
  description: string,
  amount: number,
  merchant: string
) => {
  const prompt = `Categorize this transaction:
    Description: ${description}
    Amount: $${amount}
    Merchant: ${merchant}

Return one of: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Personal Care, Other`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  });

  return completion.choices[0].message.content.trim();
};
```

#### Budget Tracking & Alerts

* **Technology:** PostgreSQL JSONB, Redis pub/sub, Resend email API
* **Description:**
  Create dynamic budgets with category-based allocations. Track spending in real-time, send automated alerts when usage hits 75%, 90%, and 100%, and visualize progress with interactive charts.

```typescript
interface Budget {
  id: string;
  userId: string;
  name: string;
  period: 'weekly' | 'monthly' | 'yearly';
  totalAmount: number;
  categories: BudgetCategory[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'inactive' | 'completed';
}

interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  color?: string;
}

const checkBudgetAlerts = async (
  userId: string,
  categoryName: string,
  newSpending: number
) => {
  const activeBudgets = await getBudgetsByCategory(userId, categoryName);

  for (const budget of activeBudgets) {
    const category = budget.categories.find(c => c.name === categoryName);
    if (category) {
      const newSpent = category.spent + newSpending;
      const percentageUsed = (newSpent / category.budgeted) * 100;

      if (percentageUsed >= 75) {
        await sendBudgetAlert(userId, budget, category, percentageUsed);
      }
    }
  }
};
```

---

### 🤖 AI-Powered Intelligence

#### Financial Insights Engine

* **Technology:** OpenAI GPT-4, PostgreSQL analytics, Redis caching
* **Description:**
  Analyzes user spending patterns and financial habits to generate personalized insights, future spending predictions, and actionable recommendations.

```typescript
const generateFinancialInsights = async (userData: FinancialData) => {
  const prompt = `Analyze this financial data and provide insights:

Monthly Income: $${userData.totalIncome}
Monthly Expenses: $${userData.totalExpenses}
Savings Rate: ${userData.savingsRate}%
Top Spending Categories: ${userData.topCategories
    .map(c => `${c.name}: $${c.amount}`)
    .join(', ')}

Provide 3 specific insights and 3 actionable recommendations in JSON format:
{
  "insights": [
    {"title": "Insight Title", "message": "Detailed insight", "type": "positive|negative|neutral", "impact": "high|medium|low"}
  ],
  "recommendations": [
    {"title": "Recommendation Title", "action": "Detailed action steps", "priority": "high|medium|low"}
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return JSON.parse(completion.choices[0].message.content);
};
```

---



<div align="center">

### 🪙 Built with ❤️ by the GoldCoin Team

<p>
  <a href="https://github.com/goldcoin/finance-tracker" target="_blank" rel="noopener noreferrer">⭐ Star us on GitHub</a> •
  <a href="https://twitter.com/goldcoin_app" target="_blank" rel="noopener noreferrer">🐦 Follow on Twitter</a> •
  <a href="https://goldcoin.app" target="_blank" rel="noopener noreferrer">🌐 Visit Website</a> •
  <a href="https://docs.goldcoin.app" target="_blank" rel="noopener noreferrer">📚 Documentation</a>
</p>

<p>
  <img src="https://img.shields.io/github/stars/goldcoin/finance-tracker?style=social" alt="GitHub stars" />
  <img src="https://img.shields.io/github/forks/goldcoin/finance-tracker?style=social" alt="GitHub forks" />
  <img src="https://img.shields.io/github/watchers/goldcoin/finance-tracker?style=social" alt="GitHub watchers" />
</p>

<p><em>Making personal finance management intelligent, engaging, and accessible for everyone.</em></p>

</div>
