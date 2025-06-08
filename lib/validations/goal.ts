import { z } from "zod"

export const createGoalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  description: z.string().optional(),
  targetAmount: z.number().positive("Target amount must be positive"),
  category: z.string().min(1, "Category is required"),
  deadline: z.string().datetime(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  linkedAccountId: z.string().uuid().optional(),
  autoContribute: z.boolean().default(false),
  contributionAmount: z.number().positive().optional(),
  contributionFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
})

export const updateGoalSchema = createGoalSchema.partial()

export const updateGoalProgressSchema = z.object({
  currentAmount: z.number().min(0, "Amount cannot be negative"),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type UpdateGoalProgressInput = z.infer<typeof updateGoalProgressSchema>
