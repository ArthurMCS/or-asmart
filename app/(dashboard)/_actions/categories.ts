'use server'
import { CreateCategorySchema, CreateCategorySchemaType, DeleteCategorySchema, DeleteCategorySchemaType } from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
;

export async function CreateCategory(form: CreateCategorySchemaType){
    const parsedBody = CreateCategorySchema.safeParse(form);

    if(!parsedBody.success){
        throw new Error('Bad resquest')
    }

    const user = await currentUser();

    if(!user){
        redirect('/sign-in')
    }

    const { name, icon, type } = parsedBody.data;

    return await prisma.category.create({
        data: {
            createdBy: user.id,
            updatedBy: user.id,
            name,
            icon,
            type
        }
    })
}

export async function DeleteCategory(form: DeleteCategorySchemaType) {
    const parsedBody = DeleteCategorySchema.safeParse(form);

    if(!parsedBody.success){
        throw new Error('Bad resquest')
    }

    const user = await currentUser();

    if(!user){
        redirect('/sign-in')
    }

    return await prisma.category.delete({
        where: {
            name_createdBy_type: {
                createdBy: user.id,
                name: parsedBody.data.name,
                type: parsedBody.data.type,
            }
        }
    })
}