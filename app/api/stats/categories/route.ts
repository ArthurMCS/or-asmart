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
    interface CategoryStat {
        type: string;
        categoryId: string;
        categoryName: string;
        categoryIcon: string;
        totalAmount: number;
    }

    const stats = await prisma.$queryRaw<CategoryStat[]>`
        SELECT 
            t.type, 
            t.categoryId, 
            c.name AS categoryName, 
            c.icon AS categoryIcon, 
            SUM(t.amount) AS totalAmount
        FROM 
            Transaction t
        JOIN 
            Category c 
        ON 
            t.categoryId = c.id
        WHERE 
            t.createdBy = ${userId}
        AND 
            t.date BETWEEN ${from} AND ${to}
        GROUP BY 
            t.type, t.categoryId, c.name, c.icon
        ORDER BY 
            totalAmount DESC;
    `;

    return stats.map(stat => ({
        type: stat.type,
        categoryId: stat.categoryId,
        totalAmount: stat.totalAmount,
        category: {
            name: stat.categoryName,
            icon: stat.categoryIcon
        }
    }));
}
