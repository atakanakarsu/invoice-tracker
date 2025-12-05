
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getExchangeRates } from "@/lib/currency"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Fetch all invoices with workflow logs for processing time
    const invoices = await prisma.invoice.findMany({
        include: {
            project: { include: { department: true } },
            logs: { orderBy: { timestamp: 'asc' } }
        }
    })

    const rates = await getExchangeRates()

    const getBaseValue = (amount: number, currency: string) => {
        if (currency === "USD") return amount

        const usdRate = rates.find(r => r.currency === "USD")?.buying || 1

        if (currency === "TRY") return amount / usdRate

        const rate = rates.find(r => r.currency === currency)?.buying || 0
        const valInTry = amount * rate
        return valInTry / usdRate
    }

    const stats = {
        pending: { count: 0, amountUSD: 0 },
        assigned: { count: 0, amountUSD: 0 },
        actionRequired: { count: 0, amountUSD: 0 },
        totalProcessed: { count: 0, amountUSD: 0 },
    }

    const supplierMap: Record<string, number> = {}
    const currencyMap: Record<string, { count: number, amount: number }> = {}
    const projectMap: Record<string, { name: string, amount: number, count: number }> = {}

    // Monthly trends (last 6 months)
    const now = new Date()
    const monthlyData: Record<string, { count: number, amountUSD: number }> = {}
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        monthlyData[key] = { count: 0, amountUSD: 0 }
    }

    // Processing time tracking
    let totalProcessingTimeMs = 0
    let processedWithTimeCount = 0

    invoices.forEach(inv => {
        const valUSD = getBaseValue(inv.amount, inv.currency)

        // Stats by status
        if (inv.status === "PENDING") {
            stats.pending.count++
            stats.pending.amountUSD += valUSD
        } else if (inv.status === "ASSIGNED") {
            stats.assigned.count++
            stats.assigned.amountUSD += valUSD
        } else if (inv.status === "PROCESSED" || inv.status === "RETURNED") {
            stats.actionRequired.count++
            stats.actionRequired.amountUSD += valUSD
        }

        if (inv.status === "PROCESSED" || inv.status === "ARCHIVED") {
            stats.totalProcessed.count++
            stats.totalProcessed.amountUSD += valUSD
        }

        // Supplier aggregation
        if (!supplierMap[inv.supplier]) supplierMap[inv.supplier] = 0
        supplierMap[inv.supplier] += valUSD

        // Currency breakdown
        if (!currencyMap[inv.currency]) currencyMap[inv.currency] = { count: 0, amount: 0 }
        currencyMap[inv.currency].count++
        currencyMap[inv.currency].amount += inv.amount

        // Project aggregation
        if (inv.project) {
            const projKey = inv.project.id
            if (!projectMap[projKey]) {
                projectMap[projKey] = { name: inv.project.name, amount: 0, count: 0 }
            }
            projectMap[projKey].amount += valUSD
            projectMap[projKey].count++
        }

        // Monthly trends
        const invMonth = new Date(inv.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        if (monthlyData[invMonth]) {
            monthlyData[invMonth].count++
            monthlyData[invMonth].amountUSD += valUSD
        }

        // Processing time calculation (from creation to PROCESSED status)
        if (inv.status === "PROCESSED" || inv.status === "ARCHIVED") {
            const assignLog = inv.logs.find(l => l.action === "ASSIGN")
            const processLog = inv.logs.find(l => l.action === "PROCESS")

            if (assignLog && processLog) {
                const timeMs = new Date(processLog.timestamp).getTime() - new Date(assignLog.timestamp).getTime()
                totalProcessingTimeMs += timeMs
                processedWithTimeCount++
            }
        }
    })

    const oldestPending = invoices
        .filter(inv => inv.status === "PENDING")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5)

    const topSuppliers = Object.entries(supplierMap)
        .map(([name, amountUSD]) => ({ name, amountUSD }))
        .sort((a, b) => b.amountUSD - a.amountUSD)
        .slice(0, 5)

    const departmentMap: Record<string, number> = {}
    invoices.forEach(inv => {
        if (inv.project?.department) {
            const deptName = inv.project.department.name
            const valUSD = getBaseValue(inv.amount, inv.currency)
            if (!departmentMap[deptName]) departmentMap[deptName] = 0
            departmentMap[deptName] += valUSD
        } else if (!inv.projectId) {
            if (!departmentMap["Unassigned"]) departmentMap["Unassigned"] = 0
            departmentMap["Unassigned"] += getBaseValue(inv.amount, inv.currency)
        }
    })

    const departmentStats = Object.entries(departmentMap)
        .map(([name, amountUSD]) => ({ name, amountUSD }))
        .sort((a, b) => b.amountUSD - a.amountUSD)

    const currencyBreakdown = Object.entries(currencyMap)
        .map(([currency, data]) => ({ currency, ...data }))
        .sort((a, b) => b.count - a.count)

    const projectStats = Object.values(projectMap)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data
    }))

    // Average processing time in hours
    const avgProcessingTimeHours = processedWithTimeCount > 0
        ? totalProcessingTimeMs / processedWithTimeCount / (1000 * 60 * 60)
        : 0

    return NextResponse.json({
        stats,
        oldestPending,
        topSuppliers,
        departmentStats,
        currencyBreakdown,
        projectStats,
        monthlyTrends,
        metrics: {
            avgProcessingTimeHours: Math.round(avgProcessingTimeHours * 10) / 10,
            totalInvoices: invoices.length,
            completionRate: invoices.length > 0
                ? Math.round((stats.totalProcessed.count / invoices.length) * 100)
                : 0
        }
    })
}
