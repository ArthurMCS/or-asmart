import { z } from 'zod';


export const CreateTransactionSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    amount: z.coerce.number().positive().multipleOf(0.01),
    denominator: z.coerce.number().positive().min(1),
    date: z.coerce.date(),
    categoryId: z.string(),
    paymentDate: z.coerce.date().optional(),
    type: z.union([
        z.literal("income"),
        z.literal("expense")
    ]),
    card: z.string().optional(),
    bank: z.string().optional()
})

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>