import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'departments' or 'projects'

    if (type === 'projects') {
        const projects = await prisma.project.findMany({ include: { department: true } })
        return NextResponse.json(projects)
    }

    const departments = await prisma.department.findMany({ include: { projects: true } })
    return NextResponse.json(departments)
}

export async function POST(req: Request) {
    const body = await req.json()
    const { type, name, departmentId } = body // type: 'department' | 'project'

    if (type === 'department') {
        const dept = await prisma.department.create({ data: { name } })
        return NextResponse.json(dept)
    }

    if (type === 'project') {
        const project = await prisma.project.create({ data: { name, departmentId } })
        return NextResponse.json(project)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') // 'department' | 'project'

    if (!id || !type) {
        return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
    }

    if (type === 'department') {
        // Check for existing projects
        const projects = await prisma.project.findFirst({ where: { departmentId: id } })
        if (projects) {
            return NextResponse.json({ error: 'Cannot delete department with existing projects' }, { status: 400 })
        }
        // Check for existing users
        const users = await prisma.user.findFirst({ where: { departmentId: id } })
        if (users) {
            return NextResponse.json({ error: 'Cannot delete department with assigned users' }, { status: 400 })
        }

        await prisma.department.delete({ where: { id } })
        return NextResponse.json({ success: true })
    }

    if (type === 'project') {
        // Check for invoices or users
        const invoices = await prisma.invoice.findFirst({ where: { projectId: id } })
        if (invoices) {
            return NextResponse.json({ error: 'Cannot delete project with existing invoices' }, { status: 400 })
        }
        await prisma.project.delete({ where: { id } })
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
