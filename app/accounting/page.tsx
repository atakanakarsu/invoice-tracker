"use client"

import { useEffect, useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { AssignmentDialog } from "@/components/assignment-dialog"
import { ExcelImport } from "@/components/excel-import"
import { ExcelExport } from "@/components/excel-export"
import { ReviewDialog } from "@/components/review-dialog"
import { InvoiceDetailsSheet } from "@/components/invoice-details-sheet"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

export default function AccountingDashboard() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [assignOpen, setAssignOpen] = useState(false)
    const [reviewOpen, setReviewOpen] = useState(false)
    const [viewInvoice, setViewInvoice] = useState<any>(null)
    const [viewOpen, setViewOpen] = useState(false)

    useEffect(() => {
        fetchInvoices()
    }, [])

    const fetchInvoices = () => {
        fetch("/api/invoices").then(res => res.json()).then(setInvoices)
    }

    const handleAssignClick = (inv: any) => {
        setSelectedInvoice(inv)
        setAssignOpen(true)
    }

    const handleReviewClick = (inv: any) => {
        setSelectedInvoice(inv)
        setReviewOpen(true)
    }

    const handleViewClick = (inv: any) => {
        setViewInvoice(inv)
        setViewOpen(true)
    }

    // Define Columns
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
                    <Badge variant={
                        status === "PENDING" ? "secondary" :
                            status === "ASSIGNED" ? "outline" :
                                status === "PROCESSED" ? "default" :
                                    status === "RETURNED" ? "destructive" : "outline"
                    }>
                        {status}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "project.name",
            header: "Project",
            cell: ({ row }) => <div>{row.original.project?.name || '-'}</div>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const inv = row.original
                return (
                    <div className="text-right flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleViewClick(inv)}>View</Button>
                        {(inv.status === "PENDING" || inv.status === "RETURNED") && (
                            <Button size="sm" onClick={() => handleAssignClick(inv)}>
                                {inv.status === "RETURNED" ? "Re-Assign" : "Assign"}
                            </Button>
                        )}
                        {inv.status === "PROCESSED" && (
                            <Button size="sm" variant="default" onClick={() => handleReviewClick(inv)}>Review</Button>
                        )}
                    </div>
                )
            }
        }
    ]

    const drafts = useMemo(() => invoices.filter(inv => inv.status === "PENDING"), [invoices])
    const assigned = useMemo(() => invoices.filter(inv => inv.status === "ASSIGNED"), [invoices])
    const actionRequired = useMemo(() => invoices.filter(inv => inv.status === "PROCESSED" || inv.status === "RETURNED"), [invoices])

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
                    <p className="text-gray-500">Manage invoices and track status.</p>
                </div>
                <div className="flex gap-2">
                    <ExcelExport data={invoices} filename="Accounting_Invoices" />
                    <Button onClick={() => window.location.href = '/accounting/create'}>
                        + New Invoice
                    </Button>
                    <ExcelImport onImport={fetchInvoices} />
                </div>
            </div>

            <Tabs defaultValue="drafts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
                    <TabsTrigger value="assigned">Awaiting ({assigned.length})</TabsTrigger>
                    <TabsTrigger value="action">Action Required ({actionRequired.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="drafts" className="space-y-4">
                    <DataTable columns={columns} data={drafts} searchKey="supplier" />
                </TabsContent>
                <TabsContent value="assigned" className="space-y-4">
                    <DataTable columns={columns} data={assigned} searchKey="supplier" />
                </TabsContent>
                <TabsContent value="action" className="space-y-4">
                    <DataTable columns={columns} data={actionRequired} searchKey="supplier" />
                </TabsContent>
            </Tabs>

            <AssignmentDialog
                invoice={selectedInvoice}
                open={assignOpen}
                onOpenChange={setAssignOpen}
                onSuccess={fetchInvoices}
            />

            <ReviewDialog
                invoice={selectedInvoice}
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                onSuccess={fetchInvoices}
            />

            <InvoiceDetailsSheet
                invoice={viewInvoice}
                open={viewOpen}
                onOpenChange={setViewOpen}
            />
        </div>
    )
}
