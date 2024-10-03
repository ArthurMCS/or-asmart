"use server";

import prisma from "@/lib/prisma";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
    const parsedBody = CreateTransactionSchema.safeParse(form);

    if (!parsedBody.success) {
        throw new Error(parsedBody.error.message);
    }

    const user = await currentUser();

    if (!user) {
        redirect('/sign-in')
    }

    const { 
        name,
        amount,
        description,
        category,
        date,
        paymentDate,
        type,
        card,
        bank
    } = parsedBody.data


    const categoryRow = await prisma.category.findFirst({
        where: {
            createdBy: user.id,
            name: category
        }
    })


    if (!categoryRow) {
        throw new Error("category not found")
    }

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                createdBy: user.id,
                updatedBy: user.id,
                name: name,
                amount: amount,
                description: description || null,
                date: date,
                paymentDate: paymentDate || date,
                type: type,
                card: card || null,
                bank: bank || null,
                categoryId: categoryRow.id
            }
        }),

        prisma.monthHistory.upsert({
            where: {
                day_month_year_userID: {
                    userID: user.id,
                    day: date.getUTCDate(),
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear()
                }
            },

            create: {
                userID: user.id,
                day: date.getUTCDate(),
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === 'expense' ? amount : 0,
                income: type === 'income' ? amount : 0,
            },


            update: {
                expense: {
                    increment: type === 'expense' ? amount : 0,
                },

                income: {
                    increment: type === 'income' ? amount : 0,
                }
            }
        }),

        prisma.yearHistory.upsert({
            where: {
                month_year_userID: {
                    userID: user.id,
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear()
                }
            },

            create: {
                userID: user.id,
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === 'expense' ? amount : 0,
                income: type === 'income' ? amount : 0,
            },


            update: {
                expense: {
                    increment: type === 'expense' ? amount : 0,
                },

                income: {
                    increment: type === 'income' ? amount : 0,
                }
            }
        })
    ])
}