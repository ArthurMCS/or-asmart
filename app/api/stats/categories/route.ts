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
    const stats = await prisma.transaction.groupBy({
        by: ['type', 'categoryId'],
        where: {
            createdBy: userId,
            date: {
                gte: from,
                lte: to,
            },
        },
        _sum: {
            amount: true,
        },
        orderBy: {
            _sum: {
                amount: 'desc'
            }
        }
    })

    const categoryIds = stats.map(stat => stat.categoryId);
    const categories = await prisma.category.findMany({
        where: {
            id: {
                in: categoryIds,
            },
        },
    });

    // Crie um mapa para fácil acesso às categorias
    const categoryMap = Object.fromEntries(categories.map(category => [category.id, category]));

    // Combine os resultados do groupBy com os detalhes da categoria
    const detailedStats = stats.map(stat => ({
        type: stat.type,
        categoryId: stat.categoryId,
        totalAmount: stat._sum.amount,
        category: categoryMap[stat.categoryId], // Adiciona a categoria completa
    }));

    return detailedStats
}