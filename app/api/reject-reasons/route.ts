import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const reasons = await prisma.rejectReason.findMany()
    return NextResponse.json(reasons)
}

export async function POST(req: Request) {
    const body = await req.json()
    const { description } = body

    if (!description) return NextResponse.json({ error: 'Description required' }, { status: 400 })

    const reason = await prisma.rejectReason.create({ data: { description } })
    return NextResponse.json(reason)
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await prisma.rejectReason.delete({ where: { id } })
    return NextResponse.json({ success: true })
}
