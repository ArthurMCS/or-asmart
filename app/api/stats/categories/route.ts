import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request){
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const queryParams = OverviewQuerySchema.safeParse({from, to})

    if(!queryParams.success) {
        return Response.json(queryParams.error.message, {
            status: 400,
        })
    }


    const stats = await getCategoryStats(
        user.id,
        queryParams.data.from,
        queryParams.data.to,
    )

    return Response.json(stats)
}

export type GetCategoryStatsResponseType = Awaited<ReturnType<typeof getCategoryStats>>

async function getCategoryStats(userId: string, from: Date, to: Date) {
    console.log("From:", from, "To:", to);

    const transactions = await prisma.transaction.findMany({
        where: {
            createdBy: userId,
            date: {
                gte: from,
                lte: to,
            },
        },
        select: {
            type: true,
            categoryId: true,
            amount: true,
            category: {
                select: {
                    name: true,
                    icon: true,
                },
            },
        },
    });

    // Agora agregamos os dados manualmente
    const stats = transactions.reduce((acc, transaction) => {
        const key = `${transaction.type}-${transaction.categoryId}`;
        
        if (!acc[key]) {
            acc[key] = {
                type: transaction.type,
                categoryId: transaction.categoryId,
                totalAmount: 0,
                category: {
                    name: transaction.category?.name,
                    icon: transaction.category?.icon,
                },
            };
        }

        acc[key].totalAmount += transaction.amount;
        return acc;
    }, {} as Record<string, { type: string, categoryId: string, totalAmount: number, category: { name?: string, icon?: string } }>);

    // Converte o resultado em um array
    return Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount);
}

