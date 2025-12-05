"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash } from "lucide-react"

export default function MasterDataPage() {
    const [reasons, setReasons] = useState<any[]>([])
    const [newReason, setNewReason] = useState("")

    useEffect(() => {
        fetchReasons()
    }, [])

    const fetchReasons = async () => {
        const res = await fetch("/api/reject-reasons")
        const data = await res.json()
        setReasons(data)
    }

    const handleAddReason = async () => {
        if (!newReason) return
        await fetch("/api/reject-reasons", {
            method: "POST",
            body: JSON.stringify({ description: newReason })
        })
        setNewReason("")
        fetchReasons()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        await fetch(`/api/reject-reasons?id=${id}`, { method: "DELETE" })
        fetchReasons()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Master Data Management</h1>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Invoice Reject Reasons</CardTitle>
                    <CardDescription>Defined reasons available when rejecting an invoice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="New Reason Description"
                            value={newReason}
                            onChange={(e) => setNewReason(e.target.value)}
                        />
                        <Button onClick={handleAddReason}>Add</Button>
                    </div>
                    <div className="border rounded-md">
                        {reasons.map((reason) => (
                            <div key={reason.id} className="p-3 border-b last:border-0 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span>{reason.description}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(reason.id)}>
                                    <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        {reasons.length === 0 && <div className="p-4 text-center text-gray-400">No reasons defined.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
