// import { Resend } from "resend";
// import type { User, Transaction, Budget, Goal, Bill } from "@/lib/types";
// import {
//   WelcomeEmailTemplate,
//   BudgetSetupEmailTemplate,
//   MonthlyInsightsEmailTemplate,
//   TransactionEmailTemplate,
//   GoalCreatedEmailTemplate,
//   BillReminderEmailTemplate,
//   BudgetAlertEmailTemplate,
//   GoalMilestoneEmailTemplate,
// } from "./email-templates";

// if (!process.env.RESEND_API_KEY) {
//   throw new Error("Resend API key is required");
// }

// export const resend = new Resend(process.env.RESEND_API_KEY);

// // Helper to get the correct from address based on environment
// function getSender(name: string, email: string) {
//   return process.env.NODE_ENV === "production"
//     ? `${name} <${email}>`
//     : `${name} <noreply@resend.dev>`;
// }

// // 1. Welcome Email
// export async function sendWelcomeEmail(user: {
//   firstName: string;
//   email: string;
// }) {
//   try {
//     const html = WelcomeEmailTemplate(user);

//     await resend.emails.send({
//       from: getSender("GoldCoin", "welcome@goldcoin.app"),
//       to: user.email,
//       subject: "Welcome to GoldCoin! 🪙",
//       html,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error sending welcome email:", error);
//     return { success: false, error };
//   }
// }

// // 2. Budget Setup Email
// export async function sendBudgetSetupEmail(user: User, budget: Budget) {
//   try {
//     const html = BudgetSetupEmailTemplate(user, budget);

//     await resend.emails.send({
//       from: getSender("GoldCoin", "budgets@goldcoin.app"),
//       to: user.email,
//       subject: `Budget Created: ${budget.name}`,
//       html,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error sending budget setup email:", error);
//     return { success: false, error };
//   }
// }

// // 3. Monthly AI Insights Email
// export async function sendMonthlyInsightsEmail(
//   user: User,
//   insights: {
//     month: string;
//     year: number;
//     totalIncome: number;
//     totalExpenses: number;
//     savingsRate: number;
//     topCategories: { name: string; amount: number }[];
//     insights: {
//       title: string;
//       message: string;
//       type: "positive" | "negative" | "neutral";
//     }[];
//     recommendations: string[];
//   }
// ) {
//   try {
//     const html = MonthlyInsightsEmailTemplate(user, insights);

//     await resend.emails.send({
//       from: getSender("GoldCoin Insights", "insights@goldcoin.app"),
//       to: user.email,
//       subject: `Your ${insights.month} Financial Summary`,
//       html,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error sending monthly insights email:", error);
//     return { success: false, error };
//   }
// }

// // 4. Transaction Confirmation Email
// export async function sendTransactionEmail(
//   user: User,
//   transaction: Transaction
// ) {
//   try {
//     const html = TransactionEmailTemplate(user, transaction);
//     const transactionType =
//       transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);

//     await resend.emails.send({
//       from: getSender("GoldCoin", "transactions@goldcoin.app"),
//       to: user.email,
//       subject: `${transactionType} Transaction: ${transaction.merchant}`,
//       html,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error sending transaction email:", error);
//     return { success: false, error };
//   }
// }

// // 5. Goal Created Email
// export async function sendGoalCreatedEmail(user: User, goal: Goal) {
//   try {
//     const html = GoalCreatedEmailTemplate(user, goal);

//     await resend.emails.send({
//       from: getSender("GoldCoin", "goals@goldcoin.app"),
//       to: user.email,
//       subject: `New Goal Created: ${goal.title}`,
//       html,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error sending goal created email:", error);
//     return { success: false, error };
//   }
// }

// // 6. Bill Reminder Email
// export async function sendBillReminder(
//   user: User,
//   bill: Bill,
//   daysRemaining: number
// ) {
//   try {
//     const html = BillReminderEmailTemplate(user, bill, daysRemaining);

//     await resend.emails.send({
//       from: getSender("GoldCoin", "bills@goldcoin.app"),
//       to: user.email,
//       subject: `Reminder: ${bill.name} Due in ${daysRemaining} Days`,
//       html,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error sending bill reminder:", error);
//     return { success: false, error };
//   }
// }

// // 7. Budget Alert Email
// export async function sendBudgetAlert(
//   user: User,
//   budget: { name: string; period: string },
//   category: {
//     name: string;
//     budgeted: number;
//     spent: number;
//     remaining: number;
//   },
//   percentageUsed: number
// ) {
//   try {
//     const html = BudgetAlertEmailTemplate(
//       user,
//       budget,
//       category,
//       percentageUsed
//     );

//     await resend.emails.send({
//       from: getSender("GoldCoin", "alerts@goldcoin.app"),
//       to: user.email,
//       subject: `Budget Alert: ${category.name} is ${percentageUsed.toFixed(1)}% Used`,
//       html,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error sending budget alert email:", error);
//     return { success: false, error };
//   }
// }

// // 8. Goal Milestone Email (optional)
// export async function sendGoalMilestoneEmail(
//   user: User,
//   goal: Goal,
//   milestone: string
// ) {
//   try {
//     const html = GoalMilestoneEmailTemplate(user, goal, milestone);

//     await resend.emails.send({
//       from: getSender("GoldCoin", "milestones@goldcoin.app"),
//       to: user.email,
//       subject: `Milestone Reached: ${milestone} for ${goal.title}`,
//       html,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error sending goal milestone email:", error);
//     return { success: false, error };
//   }
// }

