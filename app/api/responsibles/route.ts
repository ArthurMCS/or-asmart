import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const responsibles = await prisma.responsible.findMany({
        orderBy: {
            name: "asc",
        },
    });

    return Response.json(responsibles);
}
