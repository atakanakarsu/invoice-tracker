import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { convertToUSD } from "@/lib/currency"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const dateFilter: any = {}
    if (start && end) {
        dateFilter.date = {
            gte: new Date(start),
            lte: new Date(end)
        }
    }

    // Fetch all invoices matching filter
    // Stats: Total Spend (USD), By Dept, By Project
    const invoices = await prisma.invoice.findMany({
        where: {
            ...dateFilter,
            status: { not: "RETURNED" } // Exclude returned? Or include all? Usually valid spend is APPROVED/ARCHIVED or PROCESSED. PENDING is projected.
            // Let's include everything except RETURNED for now, or maybe just ARCHIVED for "Actual Spend".
            // Requirement: "Global Dashboard... Butun faturaların toplam tutarlarını..." -> All invoices?
            // Let's assume all non-rejected ones.
        },
        include: {
            project: {
                include: { department: true }
            }
        }
    })

    let totalUSD = 0
    const byDept: Record<string, number> = {}
    const byProject: Record<string, number> = {}

    for (const inv of invoices) {
        const amountUSD = await convertToUSD(inv.amount, inv.currency)
        totalUSD += amountUSD

        if (inv.project) {
            const deptName = inv.project.department.name
            const projName = inv.project.name

            byDept[deptName] = (byDept[deptName] || 0) + amountUSD
            byProject[projName] = (byProject[projName] || 0) + amountUSD
        } else {
            // Unassigned
            byDept['Unassigned'] = (byDept['Unassigned'] || 0) + amountUSD
            byProject['Unassigned'] = (byProject['Unassigned'] || 0) + amountUSD
        }
    }

    // Format for Chart/Display
    return NextResponse.json({
        totalUSD,
        byDept: Object.entries(byDept).map(([name, value]) => ({ name, value })),
        byProject: Object.entries(byProject).map(([name, value]) => ({ name, value }))
    })
}
