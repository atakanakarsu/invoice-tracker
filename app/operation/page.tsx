"use client"

import { useEffect, useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InvoiceDetailsSheet } from "@/components/invoice-details-sheet"
import { DataTable } from "@/components/data-table"
import { ExcelExport } from "@/components/excel-export"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

export default function OperationDashboard() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [note, setNote] = useState("")
    const [rates, setRates] = useState<any[]>([])

    // Detail View
    const [viewInvoice, setViewInvoice] = useState<any>(null)
    const [viewOpen, setViewOpen] = useState(false)

    const handleViewClick = (inv: any) => {
        setViewInvoice(inv)
        setViewOpen(true)
    }

    // UI States
    const [groupBySupplier, setGroupBySupplier] = useState(false)
    const [sortBy, setSortBy] = useState("date-desc") // date-desc, date-asc, amount-desc, amount-asc

    useEffect(() => {
        fetchInvoices()
        fetchRates()
    }, [])

    const fetchInvoices = () => {
        fetch("/api/invoices").then(res => res.json()).then(setInvoices)
    }

    const fetchRates = () => {
        fetch("/api/rates").then(res => res.json()).then(setRates)
    }

    const handleProcess = async () => {
        if (!selectedInvoice) return

        await fetch(`/api/invoices/${selectedInvoice.id}`, {
            method: "PUT",
            body: JSON.stringify({
                action: "PROCESS", // Send back to Accounting
                description: note
            })
        })

        setSelectedInvoice(null)
        setNote("")
        fetchInvoices()
    }

    // Currency Helper
    const getBaseAmount = (amount: number, currency: string) => {
        if (currency === "TRY") return amount
        const rate = rates.find(r => r.currency === currency)?.buying || 0
        return amount * rate
    }

    // Process Data: Filter, Sort, Group
    const processData = (data: any[]) => {
        // 1. Sort
        const sorted = [...data].sort((a, b) => {
            if (sortBy === "date-desc") return new Date(b.invoiceDate || b.date).getTime() - new Date(a.invoiceDate || a.date).getTime()
            if (sortBy === "date-asc") return new Date(a.invoiceDate || a.date).getTime() - new Date(b.invoiceDate || b.date).getTime()

            if (sortBy.startsWith("amount")) {
                const amountA = getBaseAmount(a.amount, a.currency)
                const amountB = getBaseAmount(b.amount, b.currency)
                if (sortBy === "amount-desc") return amountB - amountA
                return amountA - amountB
            }
            return 0
        })

        return sorted
    }

    // Derived Lists
    const pendingInvoices = invoices.filter(inv => inv.status === "ASSIGNED")
    const completedInvoices = invoices.filter(inv => inv.status === "PROCESSED" || inv.status === "RETURNED")

    const pendingProcessed = useMemo(() => processData(pendingInvoices), [pendingInvoices, sortBy, rates])
    const completedProcessed = useMemo(() => processData(completedInvoices), [completedInvoices, sortBy, rates])

    // Columns Definition
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "invoiceNo",
            header: "Invoice No",
            cell: ({ row }) => <div className="font-medium">{row.getValue("invoiceNo") || '-'}</div>
        },
        {
            accessorKey: "date",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = row.original.invoiceDate || row.original.date
                return <div>{format(new Date(date), "dd/MM/yyyy")}</div>
            }
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
        },
        {
            accessorKey: "description",
            header: "Desc",
            cell: ({ row }) => <div className="truncate max-w-[200px]">{row.getValue("description")}</div>
        },
        {
            accessorKey: "amount",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("amount"))
                const currency = row.original.currency

                return (
                    <div className="font-medium">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(amount)}
                    </div>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={status === "ASSIGNED" ? "default" : "secondary"}>
                        {status}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const inv = row.original
                return (
                    <div className="text-right flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleViewClick(inv)}>View</Button>
                        <Button size="sm" onClick={() => setSelectedInvoice(inv)}>Process</Button>
                    </div>
                )
            }
        }
    ]

    // Mobile Card Logic
    const MobileCardList = ({ items, showAction }: { items: any[], showAction: boolean }) => (
        <div className="divide-y border rounded-md">
            {items.map((inv) => (
                <div key={inv.id} className="p-4 space-y-3 bg-white dark:bg-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-semibold text-sm">{inv.invoiceNo || "No ID"}</div>
                            <div className="text-xs text-muted-foreground">{format(new Date(inv.invoiceDate || inv.date), "dd/MM/yyyy")}</div>
                        </div>
                        <Badge variant={inv.status === "ASSIGNED" ? "default" : "secondary"}>
                            {inv.status}
                        </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="font-bold text-lg">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: inv.currency }).format(inv.amount)}
                        </div>
                        <div className="text-sm font-medium">{inv.supplier}</div>
                    </div>

                    {inv.description && (
                        <div className="text-xs bg-muted p-2 rounded-md truncate">
                            {inv.description}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button className="flex-1" variant="outline" size="sm" onClick={() => handleViewClick(inv)}>View</Button>
                        {showAction && (
                            <Button className="flex-1" size="sm" onClick={() => setSelectedInvoice(inv)}>Process</Button>
                        )}
                    </div>
                </div>
            ))}
            {items.length === 0 && <div className="p-8 text-center text-gray-500">No tasks found.</div>}
        </div>
    )

    // Render Helper
    const InvoiceList = ({ data, showAction }: { data: any[], showAction: boolean }) => {
        const tableColumns = showAction ? columns : columns.filter(c => c.id !== "actions")

        if (groupBySupplier) {
            const groups: Record<string, any[]> = {}
            data.forEach(inv => {
                if (!groups[inv.supplier]) groups[inv.supplier] = []
                groups[inv.supplier].push(inv)
            })

            return (
                <div className="space-y-6">
                    {Object.entries(groups).map(([supplier, items]) => (
                        <div key={supplier} className="border rounded-md overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 font-semibold border-b flex justify-between">
                                <span>{supplier}</span>
                                <Badge variant="secondary">{items.length}</Badge>
                            </div>
                            <div className="hidden md:block p-2">
                                <DataTable columns={tableColumns} data={items} searchKey="description" />
                            </div>
                            <div className="md:hidden">
                                <MobileCardList items={items} showAction={showAction} />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <div className="">
                <div className="hidden md:block">
                    <DataTable columns={tableColumns} data={data} searchKey="supplier" />
                </div>
                <div className="md:hidden">
                    <MobileCardList items={data} showAction={showAction} />
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">My Tasks</h1>

                <div className="flex flex-wrap items-center gap-4">
                    <ExcelExport data={invoices} filename="My_Tasks" />
                    <div className="flex items-center space-x-2">
                        <Switch id="group-mode" checked={groupBySupplier} onCheckedChange={setGroupBySupplier} />
                        <Label htmlFor="group-mode">Group by Supplier</Label>
                    </div>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date-desc">Date (Newest)</SelectItem>
                            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                            <SelectItem value="amount-desc">Amount (Highest)</SelectItem>
                            <SelectItem value="amount-asc">Amount (Lowest)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingInvoices.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedInvoices.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <InvoiceList data={pendingProcessed} showAction={true} />
                </TabsContent>

                <TabsContent value="completed">
                    <InvoiceList data={completedProcessed} showAction={false} />
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-gray-500">
                            Mark this invoice as processed? It will be sent back to Accounting for final review.
                        </p>
                        <div className="space-y-2">
                            <Label>Note (Optional)</Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add compilation details or notes..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleProcess}>Complete & Send</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <InvoiceDetailsSheet
                invoice={viewInvoice}
                open={viewOpen}
                onOpenChange={setViewOpen}
            />
        </div>
    )
}
