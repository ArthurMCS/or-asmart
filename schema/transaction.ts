import { z } from 'zod';
import { CreateResponsibleSchema } from "@/schema/responsible"


export const CreateTransactionSchema = z.object({
    name: z.string(),
    amount: z.coerce.number().positive().multipleOf(0.01),
    description: z.string().optional(),
    date: z.coerce.date(),
    categoryId: z.string(),
    paymentDate: z.coerce.date().optional(),
    type: z.union([
        z.literal("income"),
        z.literal("expense")
    ]),
    denominator: z.coerce.number().positive().min(1),
    card: z.string().optional(),
    bank: z.string().optional(),
    responsibles: z.array(CreateResponsibleSchema).nonempty("Deve haver pelo menos um responsável"),
})

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>