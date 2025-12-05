"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { Label } from "@/components/ui/label"

export default function CreateInvoicePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState<any>({
        amount: "",
        currency: "TRY",
        supplier: "",
        invoiceDate: new Date(),
        description: "",
        projectId: "",
        invoiceNo: "",
        vkn: "",
        tax: "",
        amountExcludingTax: "",
        scenario: "",
        invoiceType: "",
        files: []
    })

    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        fetch("/api/organization?type=projects").then(res => res.json()).then(setProjects)
    }, [])

    const handleFilesSelected = (files: File[]) => {
        setFormData({ ...formData, files: files })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Upload Files
            const uploadedAttachments: any[] = []
            if (formData.files && formData.files.length > 0) {
                const uploadData = new FormData()
                formData.files.forEach((file: File) => {
                    uploadData.append("file", file)
                })

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData
                })
                const result = await res.json()

                if (result.success) {
                    // Match urls with filenames to create attachment objects
                    result.urls.forEach((url: string, index: number) => {
                        uploadedAttachments.push({
                            url: url,
                            name: (formData.files as File[])[index].name,
                            type: (formData.files as File[])[index].type
                        })
                    })
                }
            }

            // 2. Create Invoice
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    attachments: uploadedAttachments
                })
            })

            if (res.ok) {
                router.push("/accounting")
            } else {
                console.error("Failed to create invoice")
            }
        } catch (error) {
            console.error("Error", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Create New Invoice</h1>

            <form onSubmit={handleSubmit} className="space-y-8 border p-8 rounded-xl bg-white dark:bg-gray-900 shadow-lg">

                {/* Section 1: Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Invoice No</Label>
                        <Input
                            placeholder="INV-2023-001"
                            value={formData.invoiceNo}
                            onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label>Invoice Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("pl-3 text-left font-normal", !formData.invoiceDate && "text-muted-foreground")}>
                                    {formData.invoiceDate ? format(formData.invoiceDate, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.invoiceDate}
                                    onSelect={(d) => d && setFormData({ ...formData, invoiceDate: d })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Section 2: Supplier & Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Supplier</Label>
                        <Input
                            required
                            placeholder="Supplier Name"
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Scenario</Label>
                        <Select value={formData.scenario} onValueChange={(val) => setFormData({ ...formData, scenario: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Scenario" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TEMELFATURA">TEMELFATURA</SelectItem>
                                <SelectItem value="TICARIFATURA">TICARIFATURA</SelectItem>
                                <SelectItem value="KAMU">KAMU</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Invoice Type</Label>
                        <Select value={formData.invoiceType} onValueChange={(val) => setFormData({ ...formData, invoiceType: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SATIS">SATIS</SelectItem>
                                <SelectItem value="IADE">IADE</SelectItem>
                                <SelectItem value="TEVKIFAT">TEVKIFAT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Section 3: Financials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select value={formData.currency} onValueChange={(val) => setFormData({ ...formData, currency: val })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TRY">TRY</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Total Amount (Payable)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Tax Amount</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.tax}
                            onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                        placeholder="Invoice details..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Initial Project Assignment (Optional)</Label>
                    <Select value={formData.projectId} onValueChange={(val) => setFormData({ ...formData, projectId: val })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name} <span className="text-xs text-gray-400">({p.department?.name})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 border-t pt-4">
                    <Label className="text-lg font-semibold">Attachments</Label>
                    <p className="text-sm text-gray-500 mb-2">Upload invoice files (PDF, Image)</p>
                    <FileUpload
                        onChange={handleFilesSelected}
                        value={formData.files}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Invoice"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
