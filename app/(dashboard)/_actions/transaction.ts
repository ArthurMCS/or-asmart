"use server";

import prisma from "@/lib/prisma";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { TransactionResponsible } from "@prisma/client";
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
        denominator,
        description,
        categoryId,
        date,
        paymentDate,
        type,
        card,
        bank,
        responsibles
    } = parsedBody.data


    const categoryRow = await prisma.category.findFirst({
        where: {
            id: categoryId,
            createdBy: user.id
        }
    })


    if (!categoryRow) {
        throw new Error("category not found")
    }

    const new_amount = amount / denominator;

    for (let i = 1; i <= denominator; i++) {
        // Cria a transação e obtém o ID gerado pelo banco de dados
        const transaction = await prisma.transaction.create({
            data: {
                createdBy: user.id,
                updatedBy: user.id,
                name: `${name} - ${i}/${denominator}`,
                amount: new_amount,
                numerator: i,
                denominator: denominator,
                description: description || null,
                date: date,
                paymentDate: paymentDate || date,
                type: type,
                card: card || null,
                bank: bank || null,
                categoryId: categoryRow.id
            }
        });

        // Cria as responsabilidades associadas à transação
        let transactionResp = [];
        for (let j = 0; j < responsibles.length; j++) {
            transactionResp.push({
                responsibleId: responsibles[j],
                transactionId: transaction.id  // Agora você tem o ID da transação
            });
        }

        // Cria as responsabilidades em batch
        await prisma.transactionResponsible.createMany({
            data: transactionResp
        });
    }

    // await prisma.$transaction([
    //     prisma.transaction.create({
    //         data: {
    //             createdBy: user.id,
    //             updatedBy: user.id,
    //             name: name,
    //             amount: amount,
    //             numerator: 1,
    //             denominator: denominator,
    //             description: description || null,
    //             date: date,
    //             paymentDate: paymentDate || date,
    //             type: type,
    //             card: card || null,
    //             bank: bank || null,
    //             categoryId: categoryRow.id
    //         }
    //     }),

    //     prisma.monthHistory.upsert({
    //         where: {
    //             day_month_year_userID: {
    //                 userID: user.id,
    //                 day: date.getUTCDate(),
    //                 month: date.getUTCMonth(),
    //                 year: date.getUTCFullYear()
    //             }
    //         },

    //         create: {
    //             userID: user.id,
    //             day: date.getUTCDate(),
    //             month: date.getUTCMonth(),
    //             year: date.getUTCFullYear(),
    //             expense: type === 'expense' ? amount : 0,
    //             income: type === 'income' ? amount : 0,
    //         },


    //         update: {
    //             expense: {
    //                 increment: type === 'expense' ? amount : 0,
    //             },

    //             income: {
    //                 increment: type === 'income' ? amount : 0,
    //             }
    //         }
    //     }),

    //     prisma.yearHistory.upsert({
    //         where: {
    //             month_year_userID: {
    //                 userID: user.id,
    //                 month: date.getUTCMonth(),
    //                 year: date.getUTCFullYear()
    //             }
    //         },

    //         create: {
    //             userID: user.id,
    //             month: date.getUTCMonth(),
    //             year: date.getUTCFullYear(),
    //             expense: type === 'expense' ? amount : 0,
    //             income: type === 'income' ? amount : 0,
    //         },


    //         update: {
    //             expense: {
    //                 increment: type === 'expense' ? amount : 0,
    //             },

    //             income: {
    //                 increment: type === 'income' ? amount : 0,
    //             }
    //         }
    //     })
    // ])
}