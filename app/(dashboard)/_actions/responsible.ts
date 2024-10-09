'use server'
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CreateResponsibleSchema, CreateResponsibleSchemaType } from "@/schema/responsible";
;

export async function CreateResponsible(form: CreateResponsibleSchemaType){
    const parsedBody = CreateResponsibleSchema.safeParse(form);

    if(!parsedBody.success){
        throw new Error('Bad resquest')
    }

    const user = await currentUser();

    if(!user){
        redirect('/sign-in')
    }

    const { name, color } = parsedBody.data;

    return await prisma.responsible.create({
        data: {
            name: name,
            color: color
        }
    })
}