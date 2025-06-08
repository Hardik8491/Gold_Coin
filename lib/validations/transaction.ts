import { z } from "zod"

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  type: z.enum(["income", "expense", "transfer"]),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  merchant: z.string().min(1, "Merchant is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
    })
    .optional(),
  tags: z.array(z.string()).default([]),
  recurring: z.boolean().default(false),
  recurringPattern: z
    .object({
      frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
      interval: z.number().positive(),
      endDate: z.string().datetime().optional(),
    })
    .optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
