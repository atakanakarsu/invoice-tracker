"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AssignmentDialogProps {
    invoice: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function AssignmentDialog({ invoice, open, onOpenChange, onSuccess }: AssignmentDialogProps) {
    const [departments, setDepartments] = useState<any[]>([])
    const [reasons, setReasons] = useState<any[]>([])
    const [selectedDeptId, setSelectedDeptId] = useState("")
    const [selectedProjectId, setSelectedProjectId] = useState("")
    const [selectedReason, setSelectedReason] = useState("")
    const [description, setDescription] = useState("")

    // Logic: Select Dept -> Select Project (or Dept only? Requirement says Dept or Project).
    // Ideally assign to Project directly or User. 
    // Requirement: "operasyon bir departman yada departmanın altında bir proje tanımlanabilir."
    // Assignment target: Ideally a Project. Let's enforce Project selection if Dept has projects.

    useEffect(() => {
        if (open) {
            fetch("/api/organization").then(res => res.json()).then(setDepartments)
            fetch("/api/reject-reasons").then(res => res.json()).then(setReasons)
        }
    }, [open])

    const handleAssign = async () => {
        if (!selectedDeptId) {
            alert("Please select a Department.")
            return
        }
        if (!selectedProjectId) {
            alert("Project selection is mandatory. If the department has no projects, please create one in the Admin panel.")
            return
        }

        const res = await fetch(`/api/invoices/${invoice.id}`, {
            method: "PUT",
            body: JSON.stringify({
                action: "ASSIGN",
                departmentId: selectedDeptId,
                projectId: selectedProjectId,
                reason: selectedReason,
                description
            })
        })

        if (!res.ok) {
            alert("Failed to assign invoice. Please try again.")
            return
        }

        onSuccess()
        onOpenChange(false)
    }

    const selectedDept = departments.find(d => d.id === selectedDeptId)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Invoice #{invoice?.id.slice(-4)}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedDept && (
                        <div className="space-y-2">
                            <Label className="text-red-500">Project (Required)</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedDept.projects.length > 0 ? (
                                        selectedDept.projects.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-center text-gray-500">
                                            No projects found. Please create a project for this department in Admin settings.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Select value={selectedReason} onValueChange={setSelectedReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {reasons.map((r) => (
                                    <SelectItem key={r.id} value={r.description}>{r.description}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Note / Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description for assignment..."
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleAssign}>Assign</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
