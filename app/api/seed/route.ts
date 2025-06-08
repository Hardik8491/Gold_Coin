// app/api/seed/route.ts
import { accounts, budgets, db, goals, transactions, users } from '@/lib/db'
import { NextResponse } from 'next/server'

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // (Reuse your existing seed logic here, unchanged)
    const [user] = await db
      .insert(users)
      .values({
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          currency: 'USD',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            budgetAlerts: true,
            goalReminders: true,
            billReminders: true,
          },
          privacy: {
            shareData: false,
            analytics: true,
          },
        },
      })
      .onConflictDoNothing()
      .returning()

    console.log('✅ Created test user')

    const [checkingAccount] = await db
      .insert(accounts)
      .values({
        userId: 'user_test_123',
        name: 'Main Checking',
        type: 'checking',
        balance: '5000.00',
        currency: 'USD',
        institution: 'Test Bank',
      })
      .onConflictDoNothing()
      .returning()

    const [savingsAccount] = await db
      .insert(accounts)
      .values({
        userId: 'user_test_123',
        name: 'Emergency Savings',
        type: 'savings',
        balance: '15000.00',
        currency: 'USD',
        institution: 'Test Bank',
      })
      .onConflictDoNothing()
      .returning()

    console.log('✅ Created test accounts')

    const sampleTransactions = [
      {
        userId: 'e93471cb-5382-4c1c-81e9-45487c9113fe',
        accountId: checkingAccount.id,
        type: 'expense' as const,
        category: 'Food & Dining',
        merchant: 'Starbucks',
        amount: '-4.95',
        description: 'Morning coffee',
        date: new Date('2024-01-15T10:30:00Z'),
      },
      {
        userId: 'user_test_123',
        accountId: checkingAccount.id,
        type: 'income' as const,
        category: 'Salary',
        merchant: 'Tech Corp Inc.',
        amount: '3500.00',
        description: 'Monthly salary',
        date: new Date('2024-01-15T00:00:00Z'),
      },
      {
        userId: 'user_test_123',
        accountId: checkingAccount.id,
        type: 'expense' as const,
        category: 'Transportation',
        merchant: 'Shell Gas Station',
        amount: '-45.20',
        description: 'Gas fill-up',
        date: new Date('2024-01-14T16:45:00Z'),
      },
      {
        userId: 'user_test_123',
        accountId: checkingAccount.id,
        type: 'expense' as const,
        category: 'Shopping',
        merchant: 'Amazon',
        amount: '-89.99',
        description: 'Electronics purchase',
        date: new Date('2024-01-13T14:20:00Z'),
      },
    ]

    await db.insert(transactions).values(sampleTransactions).onConflictDoNothing()
    console.log('✅ Created sample transactions')

    await db
      .insert(budgets)
      .values({
        userId: 'user_test_123',
        name: 'Monthly Budget',
        period: 'monthly',
        totalAmount: '4000.00',
        categories: [
          { name: 'Food & Dining', budgeted: 600, spent: 0, remaining: 600 },
          { name: 'Transportation', budgeted: 400, spent: 0, remaining: 400 },
          { name: 'Shopping', budgeted: 300, spent: 0, remaining: 300 },
          { name: 'Entertainment', budgeted: 200, spent: 0, remaining: 200 },
          { name: 'Bills & Utilities', budgeted: 800, spent: 0, remaining: 800 },
          { name: 'Healthcare', budgeted: 300, spent: 0, remaining: 300 },
          { name: 'Other', budgeted: 1400, spent: 0, remaining: 1400 },
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: 'active',
      })
      .onConflictDoNothing()

    console.log('✅ Created sample budget')

    const sampleGoals = [
      {
     
        title: 'Emergency Fund',
        description: 'Build 6 months of expenses',
        targetAmount: '20000.00',
        currentAmount: '15000.00',
        category: 'Savings',
        deadline: new Date('2024-12-31'),
        priority: 'high' as const,
        milestones: [
          { amount: 5000, reached: true, date: '2024-02-15T00:00:00Z' },
          { amount: 10000, reached: true, date: '2024-05-20T00:00:00Z' },
          { amount: 15000, reached: true, date: '2024-08-10T00:00:00Z' },
          { amount: 20000, reached: false, date: null },
        ],
      },
      {
      
        title: 'Vacation Fund',
        description: 'Summer trip to Europe',
        targetAmount: '5000.00',
        currentAmount: '2500.00',
        category: 'Travel',
        deadline: new Date('2024-06-15'),
        priority: 'medium' as const,
        milestones: [
          { amount: 1000, reached: true, date: '2024-03-10T00:00:00Z' },
          { amount: 2500, reached: true, date: '2024-04-15T00:00:00Z' },
          { amount: 5000, reached: false, date: null },
        ],
      },
    ]

    await db.insert(goals).values(sampleGoals).onConflictDoNothing()
    console.log('✅ Created sample goals')

    console.log('🎉 Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

export async function GET() {
  try {
    await seedDatabase()
    return NextResponse.json({ message: 'Database seeded successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to seed database', error: String(error) },
      { status: 500 }
    )
  }
}
