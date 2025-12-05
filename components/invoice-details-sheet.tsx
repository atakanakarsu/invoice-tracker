"use client"

import { format } from "date-fns"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { InvoiceTimeline } from "@/components/invoice-timeline"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InvoiceDetailsSheetProps {
    invoice: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InvoiceDetailsSheet({ invoice, open, onOpenChange }: InvoiceDetailsSheetProps) {
    if (!invoice) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* Added padding directly to the content container */}
            <SheetContent className="w-full sm:w-[540px] overflow-y-auto px-6 sm:px-8">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle>Invoice Details</SheetTitle>
                    <SheetDescription>
                        {invoice.invoiceNo ? `Invoice #${invoice.invoiceNo}` : `ID: ${invoice.id}`}
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Hero Section: Amount & Status */}
                    <div className="flex flex-col gap-3 bg-muted/40 p-5 rounded-lg border">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Total Amount</p>
                                <h3 className="text-2xl font-bold tracking-tight text-primary">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                                </h3>
                            </div>
                            <Badge variant={
                                invoice.status === "PENDING" ? "secondary" :
                                    invoice.status === "ASSIGNED" ? "outline" :
                                        invoice.status === "PROCESSED" ? "default" :
                                            invoice.status === "RETURNED" ? "destructive" : "outline"
                            } className="uppercase">
                                {invoice.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-semibold">{invoice.supplier}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{format(new Date(invoice.invoiceDate || invoice.date), "dd MMM yyyy")}</span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="pl-2">
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">General Information</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                            <div>
                                <span className="block text-muted-foreground text-xs mb-1">Project</span>
                                <span className="font-medium">{invoice.project?.name || "Unassigned"}</span>
                            </div>
                            {invoice.invoiceNo && (
                                <div>
                                    <span className="block text-muted-foreground text-xs mb-1">Invoice Number</span>
                                    <span className="font-medium">{invoice.invoiceNo}</span>
                                </div>
                            )}
                            {invoice.tax && (
                                <div>
                                    <span className="block text-muted-foreground text-xs mb-1">Tax Amount</span>
                                    <span className="font-medium">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format(invoice.tax)}</span>
                                </div>
                            )}
                            <div className="col-span-2">
                                <span className="block text-muted-foreground text-xs mb-1">Description</span>
                                <div className="bg-muted/50 p-3 rounded-md text-gray-700 dark:text-gray-300 italic text-sm">
                                    {invoice.description || "No description provided."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Attachments Section */}
                    <div className="pl-2">
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Attachments</h4>
                        {invoice.attachments && invoice.attachments.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                                {invoice.attachments.map((att: any) => (
                                    <div key={att.id} className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full">
                                                <FileIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm truncate max-w-[180px]">{att.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{att.type?.split('/')[1] || 'FILE'}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild className="h-8">
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs">
                                                View <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-xs italic">No attachments found.</p>
                        )}
                    </div>

                    <Separator />

                    {/* Timeline */}
                    <div className="pl-2">
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">History</h4>
                        <InvoiceTimeline logs={invoice.logs || []} createdAt={invoice.createdAt} />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
