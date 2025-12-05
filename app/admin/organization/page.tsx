"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function OrganizationPage() {
    const [departments, setDepartments] = useState<any[]>([])
    const [selectedDeptId, setSelectedDeptId] = useState("")
    const [newDeptName, setNewDeptName] = useState("")
    const [newProjName, setNewProjName] = useState("")

    const [error, setError] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const res = await fetch("/api/organization")
        const data = await res.json()
        setDepartments(data)
    }

    const handleAddDept = async () => {
        if (!newDeptName) return
        await fetch("/api/organization", {
            method: "POST",
            body: JSON.stringify({ type: "department", name: newDeptName })
        })
        setNewDeptName("")
        fetchData()
    }

    const handleAddProject = async () => {
        if (!newProjName || !selectedDeptId) return
        await fetch("/api/organization", {
            method: "POST",
            body: JSON.stringify({ type: "project", name: newProjName, departmentId: selectedDeptId })
        })
        setNewProjName("")
        fetchData()
    }

    const handleDelete = async (id: string, type: 'department' | 'project') => {
        if (!confirm("Are you sure you want to delete this?")) return
        const res = await fetch(`/api/organization?id=${id}&type=${type}`, { method: "DELETE" })
        const data = await res.json()
        if (!res.ok) {
            alert(data.error || "Failed to delete")
        } else {
            fetchData()
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Organization Structure</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Departments</CardTitle>
                        <CardDescription>Manage your main operational units.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="New Department Name"
                                value={newDeptName}
                                onChange={(e) => setNewDeptName(e.target.value)}
                            />
                            <Button onClick={handleAddDept}>Add</Button>
                        </div>
                        <div className="border rounded-md p-2 h-64 overflow-y-auto">
                            {departments.map((dept) => (
                                <div key={dept.id} className="p-2 border-b last:border-0 flex justify-between items-center">
                                    <span>{dept.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{dept.projects?.length || 0} Projects</span>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id, 'department')} className="text-red-500 hover:text-red-700 h-6 w-6 p-0">
                                            X
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>Create projects under departments.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Department</Label>
                            <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="New Project Name"
                                value={newProjName}
                                onChange={(e) => setNewProjName(e.target.value)}
                            />
                            <Button onClick={handleAddProject} disabled={!selectedDeptId}>Add</Button>
                        </div>
                        <div className="border rounded-md p-2 h-44 overflow-y-auto">
                            {departments.find(d => d.id === selectedDeptId)?.projects?.map((proj: any) => (
                                <div key={proj.id} className="p-2 border-b last:border-0 flex justify-between items-center">
                                    <span>{proj.name}</span>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(proj.id, 'project')} className="text-red-500 hover:text-red-700 h-6 w-6 p-0">
                                        X
                                    </Button>
                                </div>
                            )) || <div className="text-gray-400 text-sm p-2">Select a department to view projects</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
