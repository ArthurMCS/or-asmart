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
        orderDate,
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
        const paymentDateValue = (type === "expense" && !paymentDate)
            ? new Date(orderDate.getFullYear(), orderDate.getMonth() + (1*i), 1) // Primeiro dia do próximo mês
            : paymentDate;

        // Cria a transação e obtém o ID gerado pelo banco de dados
        const transaction = await prisma.transaction.create({
            data: {
                createdBy: user.id,
                updatedBy: user.id,
                name: `${name} - ${i.toString().padStart(2, '0')}/${denominator}`,
                amount: new_amount,
                numerator: i,
                denominator: denominator,
                description: description || null,
                orderDate: orderDate,
                paymentDate: type === "income" ? orderDate : paymentDateValue,
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
                responsibleId: responsibles[j].id,
                transactionId: transaction.id  // Agora você tem o ID da transação
            });
        }

        // Cria as responsabilidades em batch
        await prisma.transactionResponsible.createMany({
            data: transactionResp
        });
    }
}