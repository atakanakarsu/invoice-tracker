"use client"

import { FileDown } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver" // Install file-saver if needed or use basic blob logic
import { Button } from "@/components/ui/button"

interface ExcelExportProps {
    data: any[]
    filename?: string
}

export function ExcelExport({ data, filename = "export" }: ExcelExportProps) {
    const handleExport = () => {
        // Flatten data if needed or just dump
        // Assuming data is flat enough or we want raw dump
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

        // Write to buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })

        // Save
        // use simple anchor tag if file-saver fails, but assuming we installed it or can basic JS it.
        // Actually, let's use a simple distinct function to avoid dependency if possible, but I installed file-saver.
        import('file-saver').then(module => {
            module.saveAs(dataBlob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
        })
    }

    return (
        <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
        </Button>
    )
}
