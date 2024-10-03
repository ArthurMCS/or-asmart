"use server"

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Transaction } from '@prisma/client';
import prisma from "@/lib/prisma";

export async function DeleteTransaction(id: string) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in')
    }

    const transaction = await prisma.transaction.findUnique({
        where: {
            id, // Buscando a transação pelo ID
            createdBy: user.id, // Verificando se a transação pertence ao usuário
        }
    })

    console.log('transaction', transaction)

    if (!transaction) {
        throw new Error("Transação não encontrada ou não pertence ao usuário")
    }

    await prisma.$transaction([
        prisma.transaction.delete({
            where: {
                id, // Apenas o ID é necessário para deletar
            }
        }),

        prisma.monthHistory.update({
            where: {
                day_month_year_userID: {
                    userID: user.id,
                    day: transaction.date.getUTCDate(),
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getUTCFullYear(),
                }
            },
            data: {
                ...(transaction.type === 'expense' && {
                    expense: {
                        decrement: transaction.amount
                    }
                }),

                ...(transaction.type === 'income' && {
                    income: {
                        decrement: transaction.amount
                    }
                })
            }
        }),

        prisma.yearHistory.update({
            where: {
                month_year_userID: {
                    userID: user.id,
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getUTCFullYear(),
                }
            },
            data: {
                ...(transaction.type === 'expense' && {
                    expense: {
                        decrement: transaction.amount
                    }
                }),

                ...(transaction.type === 'income' && {
                    income: {
                        decrement: transaction.amount
                    }
                })
            }
        })
    ])
}
