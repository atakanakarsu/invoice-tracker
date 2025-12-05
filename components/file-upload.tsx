"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone" // Need to install if not present, or use standard input
import { Upload, X, File as FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
    onChange: (files: File[]) => void
    value?: File[]
}

// Since I cannot install react-dropzone cleanly without user interaction potentially,
// I will build a standard compliant drag-drop area using native events or just a hidden input.
// Let's use standard native input for simplicity and robustness.

export function FileUpload({ onChange, value = [] }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>(value)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const updated = [...files, ...newFiles]
            setFiles(updated)
            onChange(updated)
        }
    }

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index)
        setFiles(updated)
        onChange(updated)
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                </label>
            </div>

            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md border">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm truncate">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
