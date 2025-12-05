"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ReviewDialogProps {
    invoice: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function ReviewDialog({ invoice, open, onOpenChange, onSuccess }: ReviewDialogProps) {
    const [note, setNote] = useState("")

    const handleAction = async (action: "ARCHIVE" | "RETURN") => {
        await fetch(`/api/invoices/${invoice.id}`, {
            method: "PUT",
            body: JSON.stringify({
                action,
                description: note
            })
        })
        onSuccess()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Review Invoice #{invoice?.id.slice(-4)}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Note (Optional)</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Reason for return or approval note..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">
                            If approved, invoice will be archived. If returned, it will be assigned back to Operation.
                        </p>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="destructive" onClick={() => handleAction("RETURN")}>Return (Reject)</Button>
                    <Button variant="default" onClick={() => handleAction("ARCHIVE")}>Approve (Archive)</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
