import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Filter based on Role
    let where = {}
    if (session.user.role === "OPERASYON") {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } })

        where = {
            OR: [
                { assignedToId: session.user.id },
                { projectId: user?.projectId },
            ]
        }
        // Clean up undefined in OR if user has no project
        if (!user?.projectId) {
            where = { assignedToId: session.user.id }
        }
    }

    const invoices = await prisma.invoice.findMany({
        where,
        include: {
            project: true,
            assignedTo: true,
            logs: {
                include: { actor: true }
            },
            attachments: true // Include attachments in list
        },
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(invoices)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    // Only Muhasebe or Admin can create
    if (session?.user.role === "OPERASYON") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
        amount,
        currency,
        supplier,
        description,
        projectId,
        invoiceNo,
        tax,
        amountExcludingTax,
        invoiceDate,
        scenario,
        invoiceType,
        attachments // Array of { url, name, type }
    } = body

    try {
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNo,
                amount: parseFloat(amount),
                currency,
                supplier,
                description,
                tax: tax ? parseFloat(tax) : undefined,
                amountExcludingTax: amountExcludingTax ? parseFloat(amountExcludingTax) : undefined,
                invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
                date: invoiceDate ? new Date(invoiceDate) : new Date(),
                scenario,
                invoiceType,
                projectId: projectId || null,
                status: "PENDING",
                logs: {
                    create: {
                        action: "CREATE",
                        actorId: session!.user.id,
                        note: "Invoice Created"
                    }
                },
                attachments: attachments && attachments.length > 0 ? {
                    create: attachments.map((att: any) => ({
                        name: att.name,
                        url: att.url,
                        type: att.type || 'application/pdf'
                    }))
                } : undefined
            }
        })

        return NextResponse.json(invoice)
    } catch (error) {
        console.error("Error creating invoice:", error)
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    }
}
