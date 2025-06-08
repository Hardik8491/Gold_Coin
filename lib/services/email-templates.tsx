
import type React from "react"

import type { Transaction, Budget, Goal } from "@/lib/types"

// Base email template with GoldCoin branding
// const BaseEmailTemplate = ({
//   title,
//   preheader,
//   content,
//   footerText = "© 2024 GoldCoin. All rights reserved.",
//   ctaText,
//   ctaUrl,
// }: {
//   title: string
//   preheader: string
//   content: React.ReactNode
//   footerText?: string
//   ctaText?: string
//   ctaUrl?: string
// }) => {
//   return (
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
//         <title>{title}</title>
//         <style>
//           {`
//           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//           body {
//             font-family: 'Inter', sans-serif;
//             -webkit-font-smoothing: antialiased;
//             font-size: 16px;
//             line-height: 1.5;
//             margin: 0;
//             padding: 0;
//             -ms-text-size-adjust: 100%;
//             -webkit-text-size-adjust: 100%;
//             background-color: #f9fafb;
//             color: #111827;
//           }
//           .container {
//             max-width: 600px !important;
//             margin: 0 auto !important;
//             padding: 20px;
//           }
//           .header {
//             padding: 25px 0;
//             text-align: center;
//           }
//           .header img {
//             height: 48px;
//           }
//           .content {
//             background: #ffffff;
//             border-radius: 12px;
//             box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
//             padding: 30px;
//             margin-bottom: 20px;
//           }
//           .footer {
//             text-align: center;
//             color: #6b7280;
//             font-size: 14px;
//             padding: 20px 0;
//           }
//           .button {
//             background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
//             border-radius: 6px;
//             color: white;
//             display: inline-block;
//             font-weight: 600;
//             padding: 12px 24px;
//             text-decoration: none;
//             text-align: center;
//             margin: 25px 0 15px;
//           }
//           .highlight {
//             color: #d97706;
//             font-weight: 600;
//           }
//           .divider {
//             border-top: 1px solid #e5e7eb;
//             margin: 25px 0;
//           }
//           .stat {
//             background-color: #f3f4f6;
//             border-radius: 8px;
//             padding: 15px;
//             margin: 10px 0;
//           }
//           .stat-label {
//             color: #6b7280;
//             font-size: 14px;
//             margin-bottom: 5px;
//           }
//           .stat-value {
//             font-size: 20px;
//             font-weight: 600;
//           }
//           .positive {
//             color: #10b981;
//           }
//           .negative {
//             color: #ef4444;
//           }
//           .neutral {
//             color: #6b7280;
//           }
//           .badge {
//             display: inline-block;
//             padding: 4px 8px;
//             border-radius: 9999px;
//             font-size: 12px;
//             font-weight: 500;
//             margin-right: 5px;
//           }
//           .badge-success {
//             background-color: #d1fae5;
//             color: #065f46;
//           }
//           .badge-warning {
//             background-color: #fef3c7;
//             color: #92400e;
//           }
//           .badge-info {
//             background-color: #dbeafe;
//             color: #1e40af;
//           }
//           .badge-error {
//             background-color: #fee2e2;
//             color: #b91c1c;
//           }
//           .logo-text {
//             font-size: 24px;
//             font-weight: 700;
//             background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
//             -webkit-background-clip: text;
//             -webkit-text-fill-color: transparent;
//             display: inline-block;
//           }
//           `}
//         </style>
//       </head>
//       <body>
//         <div className="container">
//           <div className="header">
//             <span className="logo-text">🪙 GoldCoin</span>
//           </div>
//           <div className="content">
//             <h1 style={{ marginTop: 0, fontSize: "24px" }}>{title}</h1>
//             {content}
//             {ctaText && ctaUrl && (
//               <div style={{ textAlign: "center" }}>
//                 <a href={ctaUrl} className="button">
//                   {ctaText}
//                 </a>
//               </div>
//             )}
//           </div>
//           <div className="footer">
//             <p>{footerText}</p>
//             <p>
//               <a href="#" style={{ color: "#6b7280", textDecoration: "underline" }}>
//                 Unsubscribe
//               </a>{" "}
//               •{" "}
//               <a href="#" style={{ color: "#6b7280", textDecoration: "underline" }}>
//                 Privacy Policy
//               </a>
//             </p>
//           </div>
//         </div>
//       </body>
//     </html>
//   )
// }

import { Html, Head, Body, Container, Section, Text, Button, Tailwind } from "@react-email/components"


export const BaseEmailTemplate = ({
  title,
  preheader,
  content,
  footerText = "© 2024 GoldCoin. All rights reserved.",
  ctaText,
  ctaUrl,
}: {
  title: string
  preheader: string
  content: React.ReactNode
  footerText?: string
  ctaText?: string
  ctaUrl?: string
}) => {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="bg-gray-100 text-gray-900 font-sans">
          <Container className="max-w-xl mx-auto p-4">
            <Section className="text-center py-4">
              <h1 className="text-2xl font-bold text-yellow-600">GoldCoin</h1>
              <Text className="text-sm text-gray-500">{preheader}</Text>
            </Section>

            <Section className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{title}</h2>
              {content}

              {ctaText && ctaUrl && (
                <div className="text-center mt-6">
                  <Button
                    href={ctaUrl}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    {ctaText}
                  </Button>
                </div>
              )}
            </Section>

            <Text className="text-center text-gray-400 text-xs mt-6">{footerText}</Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}


// 1. Welcome Email Template
export const WelcomeEmailTemplate = (user: { firstName: string; email: string }) => {
  const content = (
    <>
      <p>Hi {user.firstName},</p>
      <p>
        Welcome to <span className="highlight">GoldCoin</span>! We're excited to have you join our community of
        financially savvy individuals.
      </p>
      <p>With GoldCoin, you can:</p>
      <ul>
        <li>Track your income and expenses</li>
        <li>Create and manage budgets</li>
        <li>Set and achieve financial goals</li>
        <li>Get AI-powered insights about your spending habits</li>
        <li>Manage recurring bills and avoid late payments</li>
      </ul>
      <p>
        Your account has been created with <span className="highlight">{user.email}</span>. You're all set to start your
        journey to financial wellness!
      </p>
      <p>
        If you have any questions or need assistance, our support team is here to help. Just reply to this email or
        visit our help center.
      </p>
    </>
  )

  return (
    <BaseEmailTemplate
      title="Welcome to GoldCoin!"
      preheader="Start managing your finances smarter"
      content={content}
      ctaText="Go to Dashboard"
      ctaUrl={process.env.NEXT_PUBLIC_APP_URL!}
    />
  )
}

// 2. Budget Setup Email Template
export const BudgetSetupEmailTemplate = (user: { firstName: string }, budget: Budget) => {
  const content = (
    <>
      <p>Hi {user.firstName},</p>
      <p>
        Congratulations on setting up your <span className="highlight">{budget.name}</span> budget! This is a great step
        toward achieving your financial goals.
      </p>

      <div className="stat">
        <div className="stat-label">Total Budget</div>
        <div className="stat-value">${budget.totalAmount.toFixed(2)}</div>
      </div>

      <div className="divider"></div>

      <p>
        <strong>Budget Period:</strong> {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
      </p>
      <p>
        <strong>Start Date:</strong> {new Date(budget.startDate).toLocaleDateString()}
      </p>
      <p>
        <strong>End Date:</strong> {new Date(budget.endDate).toLocaleDateString()}
      </p>

      <div className="divider"></div>

      <p>
        <strong>Budget Categories:</strong>
      </p>
      <ul>
        {budget.categories.map((category) => (
          <li key={category.name}>
            <strong>{category.name}:</strong> ${category.budgeted.toFixed(2)}
          </li>
        ))}
      </ul>

      <p>
        We'll send you notifications to help you stay on track with your budget. You can adjust your notification
        preferences in your account settings at any time.
      </p>
    </>
  )

  return renderToStaticMarkup(
    <BaseEmailTemplate
      title="Budget Created Successfully!"
      preheader={`Your ${budget.name} budget has been set up`}
      content={content}
      ctaText="View Budget"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL}/budgets`}
    />,
  )
}

// 3. Monthly AI Insights Email Template
export const MonthlyInsightsEmailTemplate = (
  user: { firstName: string },
  insights: {
    month: string
    year: number
    totalIncome: number
    totalExpenses: number
    savingsRate: number
    topCategories: { name: string; amount: number }[]
    insights: { title: string; message: string; type: "positive" | "negative" | "neutral" }[]
    recommendations: string[]
  },
) => {
  const content = (
    <>
      <p>Hi {user.firstName},</p>
      <p>
        Here's your financial summary for{" "}
        <span className="highlight">
          {insights.month} {insights.year}
        </span>
        . Let's see how you did!
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div className="stat" style={{ flex: "1 1 30%" }}>
          <div className="stat-label">Income</div>
          <div className="stat-value positive">${insights.totalIncome.toFixed(2)}</div>
        </div>
        <div className="stat" style={{ flex: "1 1 30%" }}>
          <div className="stat-label">Expenses</div>
          <div className="stat-value negative">${insights.totalExpenses.toFixed(2)}</div>
        </div>
        <div className="stat" style={{ flex: "1 1 30%" }}>
          <div className="stat-label">Savings Rate</div>
          <div className="stat-value">{insights.savingsRate}%</div>
        </div>
      </div>

      <div className="divider"></div>

      <h3>Top Spending Categories</h3>
      <ul>
        {insights.topCategories.map((category) => (
          <li key={category.name}>
            <strong>{category.name}:</strong> ${category.amount.toFixed(2)}
          </li>
        ))}
      </ul>

      <div className="divider"></div>

      <h3>AI Insights</h3>
      {insights.insights.map((insight, index) => (
        <div key={index} className={`stat ${insight.type}`}>
          <div className="stat-label">{insight.title}</div>
          <div>{insight.message}</div>
        </div>
      ))}

      <div className="divider"></div>

      <h3>Recommendations</h3>
      <ul>
        {insights.recommendations.map((recommendation, index) => (
          <li key={index}>{recommendation}</li>
        ))}
      </ul>
    </>
  )

  return renderToStaticMarkup(
    <BaseEmailTemplate
      title={`Your ${insights.month} Financial Summary`}
      preheader={`Financial insights for ${insights.month} ${insights.year}`}
      content={content}
      ctaText="View Full Report"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL}/analytics`}
    />,
  )
}

// 4. Transaction Confirmation Email Template
export const TransactionEmailTemplate = (user: { firstName: string }, transaction: Transaction) => {
  const isExpense = transaction.type === "expense"
  const formattedAmount = isExpense
    ? `-$${Math.abs(transaction.amount).toFixed(2)}`
    : `$${transaction.amount.toFixed(2)}`
  const amountClass = isExpense ? "negative" : "positive"
  const transactionType = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)

  const content = (
    <>
      <p>Hi {user.firstName},</p>
      <p>A new {transaction.type} transaction has been recorded in your GoldCoin account.</p>

      <div className="stat">
        <div className="stat-label">Amount</div>
        <div className={`stat-value ${amountClass}`}>{formattedAmount}</div>
      </div>

      <div className="divider"></div>

      <p>
        <strong>Transaction Details:</strong>
      </p>
      <ul>
        <li>
          <strong>Type:</strong> {transactionType}
        </li>
        <li>
          <strong>Category:</strong> {transaction.category}
        </li>
        <li>
          <strong>Merchant:</strong> {transaction.merchant}
        </li>
        <li>
          <strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}
        </li>
        <li>
          <strong>Account:</strong> {transaction.account}
        </li>
        {transaction.description && (
          <li>
            <strong>Description:</strong> {transaction.description}
          </li>
        )}
      </ul>

      <p>
        If you did not make this transaction or notice any errors, please review it in your account and contact support
        if needed.
      </p>
    </>
  )

  return renderToStaticMarkup(
    <BaseEmailTemplate
      title={`${transactionType} Transaction Recorded`}
      preheader={`${transactionType} of ${formattedAmount} at ${transaction.merchant}`}
      content={content}
      ctaText="View Transaction"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL}/transactions`}
    />,
  )
}

// 5. Goal Created Email Template
export const GoalCreatedEmailTemplate = (user: { firstName: string }, goal: Goal) => {
  const progressPercentage = Math.round((goal.currentAmount / goal.targetAmount) * 100)

  const content = (
    <>
      <p>Hi {user.firstName},</p>
      <p>
        Congratulations on setting up your new financial goal: <span className="highlight">{goal.title}</span>!
      </p>

      <div className="stat">
        <div className="stat-label">Target Amount</div>
        <div className="stat-value">${goal.targetAmount.toFixed(2)}</div>
      </div>

      <div className="divider"></div>

      <p>
        <strong>Goal Details:</strong>
      </p>
      <ul>
        <li>
          <strong>Category:</strong> {goal.category}
        </li>
        <li>
          <strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}
        </li>
        <li>
          <strong>Priority:</strong> {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
        </li>
        <li>
          <strong>Current Progress:</strong> ${goal.currentAmount.toFixed(2)} ({progressPercentage}%)
        </li>
      </ul>

      {goal.description && (
        <>
          <p>
            <strong>Your Goal Description:</strong>
          </p>
          <p>{goal.description}</p>
        </>
      )}

      <p>
        We'll help you track your progress and send you updates as you get closer to achieving your goal. You can modify
        your goal or add contributions at any time from your dashboard.
      </p>
    </>
  )

  return renderToStaticMarkup(
    <BaseEmailTemplate
      title="New Financial Goal Created"
      preheader={`Your goal: ${goal.title}`}
      content={content}
      ctaText="View Goal"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL}/goals`}
    />,
  )
}

// 6. Bill Reminder Email Template
export const BillReminderEmailTemplate = (
  user: { firstName: string },
  bill: { name: string; amount: number; dueDate: string; category: string },
  daysRemaining: number,
) => {
  const content = (
    <>
      <p>Hi {user.firstName},</p>
      <p>
        This is a friendly reminder that your <span className="highlight">{bill.name}</span> bill is due in{" "}
        <strong>{daysRemaining} days</strong>.
      </p>

      <div className="stat">
        <div className="stat-label">Amount Due</div>
        <div className="stat-value negative">${bill.amount.toFixed(2)}</div>
      </div>

      <div className="divider"></div>

      <p>
        <strong>Bill Details:</strong>
      </p>
      <ul>
        <li>
          <strong>Category:</strong> {bill.category}
        </li>
        <li>
          <strong>Due Date:</strong> {new Date(bill.dueDate).toLocaleDateString()}
        </li>
      </ul>

      <p>
        Make sure to pay this bill on time to avoid any late fees. You can mark this bill as paid in your GoldCoin
        account once you've made the payment.
      </p>
    </>
  )

  return renderToStaticMarkup(
    <BaseEmailTemplate
      title={`Upcoming Bill: ${bill.name}`}
      preheader={`Your ${bill.name} bill of $${bill.amount.toFixed(2)} is due in ${daysRemaining} days`}
      content={content}
      ctaText="View Bills"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL}/bills`}
    />,
  )
}

// 7. Budget Alert Email Template
export const BudgetAlertEmailTemplate = (
  user: { firstName: string },
  budget: { name: string; period: string },
  category: { name: string; budgeted: number; spent: number; remaining: number },
  percentageUsed: number,
) => {
  const content = (
    <>
      <p>Hi {user.firstName},</p>
      <p>
        You've used <span className="highlight">{percentageUsed}%</span> of your budget for{" "}
        <strong>{category.name}</strong> in your {budget.name} budget.
      </p>

      <div className="stat">
        <div className="stat-label">Budget</div>
        <div className="stat-value">${category.budgeted.toFixed(2)}</div>
      </div>

      <div className="stat">
        <div className="stat-label">Spent</div>
        <div className="stat-value negative">${category.spent.toFixed(2)}</div>
      </div>

      <div className="stat">
        <div className="stat-label">Remaining</div>
        <div className="stat-value">${category.remaining.toFixed(2)}</div>
      </div>

      <div className="divider"></div>

      <p>
        {percentageUsed >= 100 ? (
          <span className="badge badge-error">Over Budget</span>
        ) : percentageUsed >= 90 ? (
          <span className="badge badge-warning">Almost Depleted</span>
        ) : percentageUsed >= 75 ? (
          <span className="badge badge-info">Approaching Limit</span>
        ) : (
          <span className="badge badge-success">On Track</span>
        )}
      </p>

      <p>
        {percentageUsed >= 100
          ? "You've exceeded your budget for this category. Consider adjusting your spending or reallocating funds from other categories."
          : percentageUsed >= 90
            ? "You're very close to exceeding your budget for this category. Try to limit additional spending in this area."
            : percentageUsed >= 75
              ? "You're approaching your budget limit for this category. Keep an eye on your spending."
              : "You're doing well with your budget so far. Keep it up!"}
      </p>
    </>
  )

  return renderToStaticMarkup(
    <BaseEmailTemplate
      title={`Budget Alert: ${category.name}`}
      preheader={`You've used ${percentageUsed}% of your ${category.name} budget`}
      content={content}
      ctaText="View Budget"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL}/budgets`}
    />,
  )
}

// 8. Goal Milestone Email Template
export const GoalMilestoneEmailTemplate = (
  user: { firstName: string },
  goal: Goal,
  milestone: { amount: number; percentage: number },
) => {
  const content = (
    <>
      <p>Hi {user.firstName},</p>
      <p>
        Congratulations! 🎉 You've reached a milestone for your <span className="highlight">{goal.title}</span> goal!
      </p>

      <div className="stat">
        <div className="stat-label">Milestone Reached</div>
        <div className="stat-value positive">${milestone.amount.toFixed(2)}</div>
      </div>

      <div className="stat">
        <div className="stat-label">Progress</div>
        <div className="stat-value">
          {milestone.percentage}% of ${goal.targetAmount.toFixed(2)}
        </div>
      </div>

      <div className="divider"></div>

      <p>
        <strong>Current Status:</strong>
      </p>
      <ul>
        <li>
          <strong>Saved so far:</strong> ${goal.currentAmount.toFixed(2)}
        </li>
        <li>
          <strong>Still needed:</strong> ${(goal.targetAmount - goal.currentAmount).toFixed(2)}
        </li>
        <li>
          <strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}
        </li>
      </ul>

      <p>
        You're making great progress toward your goal! Keep up the good work and you'll reach your target in no time.
      </p>
    </>
  )

  return renderToStaticMarkup(
    <BaseEmailTemplate
      title="Goal Milestone Reached!"
      preheader={`You've reached ${milestone.percentage}% of your ${goal.title} goal`}
      content={content}
      ctaText="View Goal"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL}/goals`}
    />,
  )
}
