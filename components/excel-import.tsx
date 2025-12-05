"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export function ExcelImport({ onImport }: { onImport: () => void }) {
    const [loading, setLoading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        const reader = new FileReader()

        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: "binary" })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data: any[] = XLSX.utils.sheet_to_json(ws)

                // Expected Format: Amount, Currency, Supplier, Date (YYYY-MM-DD), Description, ProjectName (Optional)
                // Need to map projects effectively or leave empty. 

                // We'll post array to API or loop here. Loop is easier for error handling for now.
                // Mapping:
                // "Fatura No" -> invoiceNo
                // "Fatura Tarihi" -> invoiceDate
                // "Gönderici" -> supplier
                // "Ödenecek Tutar" -> amount
                // "Toplam KDV" -> tax
                // "Vergiler Hariç Toplam Tutar" -> amountExcludingTax
                // "Para Birimi" -> currency
                // "Senaryo Tipi" -> scenario
                // "Fatura Tipi" -> invoiceType
                // "Fatura Durumu" -> status (optional, usually ignored on create)

                for (const row of data) {
                    await fetch("/api/invoices", {
                        method: "POST",
                        body: JSON.stringify({
                            invoiceNo: row["Fatura No"],
                            amount: row["Ödenecek Tutar"],
                            currency: row["Para Birimi"] || "TRY",
                            supplier: row["Gönderici"],
                            invoiceDate: row["Fatura Tarihi"] || new Date(),
                            description: `Imported invoice ${row["Fatura No"] || ''}`,
                            projectId: null,
                            tax: row["Toplam KDV"],
                            amountExcludingTax: row["Vergiler Hariç Toplam Tutar"],
                            scenario: row["Senaryo Tipi"],
                            invoiceType: row["Fatura Tipi"]
                        })
                    })
                }
                onImport()
            } catch (error) {
                console.error("Import failed", error)
                alert("Import failed, check console.")
            } finally {
                setLoading(false)
                // Reset input?
            }
        }

        reader.readAsBinaryString(file)
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
                <a href="/fatura-sablonu.xlsx" download>
                    Download Template
                </a>
            </Button>
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                id="excel-upload"
                onChange={handleFileUpload}
                disabled={loading}
            />
            <label htmlFor="excel-upload">
                <Button variant="outline" size="sm" className="cursor-pointer" asChild disabled={loading}>
                    <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {loading ? "Importing..." : "Import Excel"}
                    </span>
                </Button>
            </label>
        </div>
    )
}
