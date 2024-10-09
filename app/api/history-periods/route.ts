import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const periods = await getHistoryPeriods(user.id)

    return Response.json(periods)
}

export type getHistoryPeriodsResponseType = Awaited<
    ReturnType<typeof getHistoryPeriods>
>

async function getHistoryPeriods(userId: string) {
    const result = await prisma.transaction.findMany({
        where: {
            createdBy: userId,
            paymentDate: {
                not: null
            }
        },
        select: {
            paymentDate: true
        },
        distinct: ['paymentDate'], // Distinct para considerar apenas anos distintos
        orderBy: [
            {
                paymentDate: 'asc'
            }
        ]
    });

    // Mapeia os anos das transações, garantindo que `paymentDate` seja convertido corretamente
    const years = result.map((el) => {
        if (el.paymentDate) { // Verifica se `paymentDate` não é nulo
            const paymentDate = new Date(el.paymentDate);
            return paymentDate.getFullYear();
        }
        return null; // Trata casos de `paymentDate` nulo
    }).filter((year) => year !== null); // Remove valores nulos

    // Remove possíveis duplicatas
    const uniqueYears = Array.from(new Set(years))

    // Se não houver nenhum ano retornado, retorna o ano atual
    if (uniqueYears.length === 0) {
        return [new Date().getFullYear()]; // Retorna o ano atual como fallback
    }

    return uniqueYears;
}
