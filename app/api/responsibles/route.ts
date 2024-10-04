import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const { searchParams } = new URL(request.url);

    const paramType = searchParams.get('id');

    const validator = z.string()

    const queryParams = validator.safeParse(paramType);

    if (!queryParams.success) {
        return new Response(JSON.stringify(queryParams.error), {
            status: 400,
        });
    }

    const id = queryParams.data;

    const responsibles = await prisma.responsible.findMany({
        where: {
            // id: id
        },
        orderBy: {
            name: "asc",
        },
    });

    console.log("ajsdijasijpd", responsibles)

    return Response.json(responsibles);
}
