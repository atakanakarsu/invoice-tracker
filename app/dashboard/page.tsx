"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ArrowRight, Clock, AlertCircle, CheckCircle2, Building2, TrendingUp, DollarSign, BarChart3, Zap } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/analytics")
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="p-8">Loading dashboard analytics...</div>
    if (!data) return <div className="p-8">Failed to load data.</div>

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                <p className="text-muted-foreground">Real-time financial insights and workflow analytics</p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Assignment</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.stats.pending.amountUSD)}</div>
                        <p className="text-xs text-muted-foreground">{data.stats.pending.count} invoices</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Operation</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.stats.assigned.amountUSD)}</div>
                        <p className="text-xs text-muted-foreground">{data.stats.assigned.count} in review</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ready for Approval</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.stats.actionRequired.amountUSD)}</div>
                        <p className="text-xs text-muted-foreground">{data.stats.actionRequired.count} processed</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.metrics.completionRate}%</div>
                        <p className="text-xs text-muted-foreground">{data.stats.totalProcessed.count} completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Processing Time & Total Volume */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-orange-500" />
                            Processing Efficiency
                        </CardTitle>
                        <CardDescription>Average time from assignment to completion</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-orange-600">
                            {data.metrics.avgProcessingTimeHours}h
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Based on {data.stats.totalProcessed.count} processed invoices
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                            Total Volume
                        </CardTitle>
                        <CardDescription>All-time invoice processing value</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-emerald-600">
                            {formatCurrency(data.stats.totalProcessed.amountUSD)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {data.metrics.totalInvoices} total invoices tracked
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trends Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Monthly Trends (Last 6 Months)
                    </CardTitle>
                    <CardDescription>Invoice volume and value over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="month" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip
                                formatter={(value: any, name: string) => {
                                    if (name === 'amountUSD') return [formatCurrency(value), 'Amount']
                                    return [value, 'Count']
                                }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" name="Invoice Count" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Currency Breakdown */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Currency Breakdown</CardTitle>
                        <CardDescription>Distribution by currency type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data.currencyBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props: any) => `${props.currency} ${(props.percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {data.currencyBreakdown.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Projects */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Top Projects by Spending</CardTitle>
                        <CardDescription>Highest value projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.projectStats.map((proj: any, i: number) => (
                                <div key={proj.name} className="flex items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium">{proj.name}</p>
                                            <p className="text-sm font-bold">{formatCurrency(proj.amount)}</p>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(proj.amount / data.projectStats[0].amount) * 100}%`,
                                                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{proj.count} invoices</p>
                                    </div>
                                </div>
                            ))}
                            {data.projectStats.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-4">No project data available</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Oldest Pending Invoices */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>⚠️ Action Required: Oldest Unassigned</CardTitle>
                        <CardDescription>Invoices waiting longest for assignment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.oldestPending.map((inv: any) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono text-xs">{format(new Date(inv.date), "dd/MM/yyyy")}</TableCell>
                                        <TableCell className="font-medium">{inv.supplier}</TableCell>
                                        <TableCell className="font-semibold">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: inv.currency }).format(inv.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline" onClick={() => window.location.href = '/accounting'}>
                                                Assign
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.oldestPending.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            ✅ No pending invoices - great job!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Suppliers */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Suppliers</CardTitle>
                        <CardDescription>By total invoice volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.topSuppliers.map((sup: any) => (
                                <div key={sup.name} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="ml-4 space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">{sup.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(sup.amountUSD)}</p>
                                    </div>
                                </div>
                            ))}
                            {data.topSuppliers.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-4">No supplier data</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
