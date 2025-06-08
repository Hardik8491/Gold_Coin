import {
  pgTable,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  uuid,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  userId: varchar("user_id", { length: 255 }).primaryKey(), // Clerk user ID
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  imageUrl: text("image_url"),
  preferences: jsonb("preferences")
    .$type<{
      currency: string;
      timezone: string;
      notifications: {
        email: boolean;
        push: boolean;
        budgetAlerts: boolean;
        goalReminders: boolean;
        billReminders: boolean;
      };
      privacy: {
        shareData: boolean;
        analytics: boolean;
      };
    }>()
    .default({
      currency: "USD",
      timezone: "UTC",
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
    }),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.userId)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // checking, savings, credit, investment
  balance: decimal("balance", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  institution: varchar("institution", { length: 255 }),
  accountNumber: varchar("account_number", { length: 255 }),
  routingNumber: varchar("routing_number", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  lastSynced: timestamp("last_synced"),
  plaidAccessToken: text("plaid_access_token"),
  plaidAccountId: varchar("plaid_account_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.userId)
    .notNull(),
  accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(), // income, expense, transfer
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  merchant: varchar("merchant", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: jsonb("location").$type<{
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  }>(),
  tags: jsonb("tags").$type<string[]>().default([]),
  recurring: boolean("recurring").default(false),
  recurringPattern: jsonb("recurring_pattern").$type<{
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: string;
  }>(),
  plaidTransactionId: varchar("plaid_transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.userId)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(), // weekly, monthly, yearly
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  categories: jsonb("categories")
    .$type<
      Array<{
        name: string;
        budgeted: number;
        spent: number;
        remaining: number;
        color?: string;
      }>
    >()
    .notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, inactive, completed
  autoAdjust: boolean("auto_adjust").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.userId)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  category: varchar("category", { length: 100 }).notNull(),
  deadline: timestamp("deadline").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, completed, paused
  milestones: jsonb("milestones")
    .$type<
      Array<{
        amount: number;
        reached: boolean;
        date: string | null;
      }>
    >()
    .default([]),
  linkedAccountId: uuid("linked_account_id").references(() => accounts.id),
  autoContribute: boolean("auto_contribute").default(false),
  contributionAmount: decimal("contribution_amount", {
    precision: 12,
    scale: 2,
  }),
  contributionFrequency: varchar("contribution_frequency", { length: 20 }), // daily, weekly, monthly
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.userId)
    .notNull(),
    accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  recurring: boolean("recurring").notNull().default(false),
  frequency: varchar("frequency", { length: 20 }), // weekly, monthly, quarterly, yearly
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, paid, overdue
  reminders: boolean("reminders").notNull().default(true),
  reminderDays: integer("reminder_days").default(3),
  autopay: boolean("autopay").default(false),
  merchant: varchar("merchant", { length: 255 }),
  website: varchar("website", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gamification = pgTable("gamification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.userId)
    .notNull()
    .unique(),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  badges: jsonb("badges")
    .$type<
      Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        rarity: "common" | "rare" | "epic" | "legendary";
        earnedAt: string;
      }>
    >()
    .default([]),
  streaks: jsonb("streaks")
    .$type<{
      current: number;
      longest: number;
      type: "daily" | "weekly" | "monthly";
      lastActivity: string;
    }>()
    .default({
      current: 0,
      longest: 0,
      type: "daily",
      lastActivity: new Date().toISOString(),
    }),
  challenges: jsonb("challenges")
    .$type<
      Array<{
        id: string;
        title: string;
        description: string;
        type: "savings" | "spending" | "budget" | "goal";
        target: number;
        progress: number;
        reward: {
          coins: number;
          experience: number;
          badge?: string;
        };
        startDate: string;
        endDate: string;
        status: "active" | "completed" | "failed";
      }>
    >()
    .default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  budgets: many(budgets),
  goals: many(goals),
  bills: many(bills),
  gamification: many(gamification),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.userId],
  }),
  transactions: many(transactions),
  bills: many(bills),
}));
export const billsRelations = relations(bills, ({ one }) => ({
  account: one(accounts, {
    fields: [bills.accountId],
    references: [accounts.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.userId],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));
