import { z } from "zod";

export const CreateResponsibleSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(20),
    color: z.string().max(20)
});

export type CreateResponsibleSchemaType = z.infer<typeof CreateResponsibleSchema>

export const DeleteResponsibleSchema = z.object({
    id: z.string().min(3).max(20),
    name: z.string().min(3).max(20),
})

export type  DeleteResponsibleSchemaType = z.infer<typeof DeleteResponsibleSchema>


