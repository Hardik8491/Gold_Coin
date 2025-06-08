import { z } from "zod"

export const budgetCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  budgeted: z.number().positive("Budget amount must be positive"),
  color: z.string().optional(),
})

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  period: z.enum(["weekly", "monthly", "yearly"]),
  totalAmount: z.number().positive("Total amount must be positive"),
  categories: z.array(budgetCategorySchema).min(1, "At least one category is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  autoAdjust: z.boolean().default(false),
})

export const updateBudgetSchema = createBudgetSchema.partial()

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type BudgetCategoryInput = z.infer<typeof budgetCategorySchema>
