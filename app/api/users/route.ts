import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const users = await prisma.user.findMany({
        include: {
            department: true,
            project: true,
        },
        orderBy: { email: 'asc' } // Handle null emails? email is optional but auth makes it required effectively.
    })
    return NextResponse.json(users)
}

export async function PUT(req: Request) {
    const body = await req.json()
    const { id, role, departmentId, projectId } = body

    const user = await prisma.user.update({
        where: { id },
        data: {
            role,
            departmentId: departmentId || null,
            projectId: projectId || null,
        },
    })

    return NextResponse.json(user)
}
