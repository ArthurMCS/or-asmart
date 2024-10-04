import { z } from 'zod';


export const CreateTransactionSchema = z.object({
    name: z.string(),
    amount: z.coerce.number().positive().multipleOf(0.01),
    description: z.string().optional(),
    date: z.coerce.date(),
    category: z.string(),
    type: z.union([
        z.literal("income"),
        z.literal("expense")
    ]),
    paymentDate: z.coerce.date().optional(),
    card: z.string().optional(),
    bank: z.string().optional()
})

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>