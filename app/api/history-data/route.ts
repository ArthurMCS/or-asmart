import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Period, Timeframe } from '../../../lib/types';
import prisma from "@/lib/prisma";
import { getDaysInMonth } from "date-fns";
import { Prisma } from "@prisma/client";

const getHistoryDataSchema = z.object({
    timeframe: z.enum(['month', 'year']),
    month: z.coerce.number().min(0).max(11).default(0),
    year: z.coerce.number().min(2000).max(3000),
})

export async function GET(request: Request) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const { searchParams } = new URL(request.url);

    const timeframe = searchParams.get('timeframe');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    const queryParams = getHistoryDataSchema.safeParse({
        year,
        month,
        timeframe
    });

    if (!queryParams.success) {
        return Response.json(queryParams.error.message, {
            status: 400
        });
    }

    const data = await getHistoryData(user.id, queryParams.data.timeframe, {
        month: queryParams.data.month,
        year: queryParams.data.year
    });

    return Response.json(data);
}

export type GetHistoryDataResponseType = Awaited<ReturnType<typeof getHistoryData>>;

async function getHistoryData(userId: string, timeframe: Timeframe, period: Period) {
    switch (timeframe) {
        case "year":
            return await getYearHistoryData(userId, period.year);
        case "month":
            return await getMonthHistoryData(userId, period.year, period.month);
    }
}

type HistoryData = {
    expense: number,
    income: number,
    year: number,
    month: number,
    day?: number,
    monthBalance?: number,
}

async function getYearHistoryData(userId: string, year: number): Promise<HistoryData[]> {
    const startDate = new Date(year, 0, 1); // Início do ano (1º de janeiro)
    const endDate = new Date(year + 1, 0, 1); // Início do próximo ano (1º de janeiro do próximo ano)

    // Query SQL para agrupar por mês e somar receitas e despesas
    const result = await prisma.$queryRaw<{
        month: string;
        expense: number;
        income: number;
    }[]>
    (Prisma.sql`
        SELECT 
            strftime('%m', datetime(paymentDate / 1000, 'unixepoch')) AS month, -- Converte timestamp para datetime e extrai o mês
            SUM(CASE WHEN type like 'expense' THEN amount ELSE 0 END) AS expense, 
            SUM(CASE WHEN type like 'income' THEN amount ELSE 0 END) AS income 
        FROM 
            "Transaction"
        WHERE 
            createdBy = ${userId} 
            AND datetime(paymentDate / 1000, 'unixepoch') >= datetime(${startDate.toISOString()}) 
            AND datetime(paymentDate / 1000, 'unixepoch') < datetime(${endDate.toISOString()}) 
        GROUP BY 
            month
        ORDER BY 
            month ASC;

    `);

    // Inicializa o array de histórico
    const history: HistoryData[] = [];

    // Preenche o histórico para cada mês
    for (let i = 0; i < 12; i++) {
        let expense = 0;
        let income = 0;

        // Procura os dados do mês i (mês começa de 0 no JavaScript)
        const monthData = result.find(row => parseInt(row.month) === i + 1);

        if (monthData) {
            expense = monthData.expense || 0;
            income = monthData.income || 0;
        }

        // Adiciona os dados ao histórico
        history.push({
            year,
            month: i,
            expense,
            income,
        });
    }

    return history;
}


async function getMonthHistoryData(userId: string, year: number, month: number): Promise<HistoryData[]> {
    const startDate = new Date(year, month, 1); // Início do mês
    const endDate = new Date(year, month + 1, 1); // Início do próximo mês

    // Query SQL para agrupar por dia e somar receitas e despesas
    const result = await prisma.$queryRaw<{
        day: string;
        month: string;
        expense: number;
        income: number;
    }[]>(
        Prisma.sql`
            SELECT 
                strftime('%d', datetime(paymentDate / 1000, 'unixepoch')) AS day, -- Extrai o dia
                strftime('%m', datetime(paymentDate / 1000, 'unixepoch')) AS month, -- Extrai o mês
                SUM(CASE WHEN type like 'expense' THEN amount ELSE 0 END) AS expense, 
                SUM(CASE WHEN type like 'income' THEN amount ELSE 0 END) AS income 
            FROM 
                "Transaction"
            WHERE 
                createdBy = ${userId} 
                AND datetime(paymentDate / 1000, 'unixepoch') >= datetime(${startDate.toISOString()}) 
                AND datetime(paymentDate / 1000, 'unixepoch') < datetime(${endDate.toISOString()}) 
            GROUP BY 
                month, day -- Agrupa pelo mês e dia
            ORDER BY 
                month ASC, day ASC;
        `
    );

    // Inicializa o array de histórico
    const history: HistoryData[] = [];
    const daysInMonth = getDaysInMonth(new Date(year, month));
    let accumulatedBalance = 0; // Variável para armazenar o saldo acumulado

    // Preenche o histórico para cada dia do mês
    for (let i = 1; i <= daysInMonth; i++) {
        let expense = 0;
        let income = 0;

        // Procura os dados do dia i
        const dayData = result.find(row => 
        {
            console.log(">>>>>", row, parseInt(row.day), i, parseInt(row.day) === i)
            return parseInt(row.day) === i
        });

        if (dayData) {
            expense = dayData.expense || 0;
            income = dayData.income || 0;
        }

        // Atualiza o saldo acumulado até o dia atual
        accumulatedBalance += income - expense;

        history.push({
            year,
            month,
            day: i,
            expense,
            income,
            monthBalance: accumulatedBalance, // Saldo acumulado do mês até este dia
        });
    }

    return history;
}