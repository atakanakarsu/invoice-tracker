"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
    id: string
    name: string
    email: string
    image: string
    role: string
    departmentId: string | null
    projectId: string | null
    department?: { name: string }
    project?: { name: string }
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // Quick fix: hardcoded options until we fetch deps/projects
    const departments = [{ id: "cl...", name: "IT" }, { id: "cl...", name: "HR" }] // Fetch real ones later
    const projects = [{ id: "cl...", name: "Project Alpha" }] // Fetch real ones later

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users")
            const data = await res.json()
            setUsers(data)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser) return

        await fetch("/api/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedUser.id,
                role: selectedUser.role,
                departmentId: selectedUser.departmentId,
                projectId: selectedUser.projectId
            })
        })

        setSelectedUser(null)
        fetchUsers()
    }

    const UserEditDialog = ({ user }: { user: User }) => {
        // Local state for editing form
        const [role, setRole] = useState(user.role)

        return (
            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User: {user.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Role</Label>
                            <Select value={selectedUser?.role} onValueChange={(val) => setSelectedUser(prev => prev ? { ...prev, role: val } : null)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="MUHASEBE">Muhasebe</SelectItem>
                                    <SelectItem value="OPERASYON">Operasyon</SelectItem>
                                    <SelectItem value="OP_LEADER">Operasyon Lideri</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Dynamic Dept/Project selection requires fetching options. 
                         For MVP step 1, just Roles. Add Dept/Project next. */}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-xs text-gray-500">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        user.role === 'ADMIN' ? 'default' :
                                            user.role === 'MUHASEBE' ? 'secondary' :
                                                user.role === 'OP_LEADER' ? 'destructive' : 'outline'
                                    }>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.department?.name || '-'}</TableCell>
                                <TableCell>{user.project?.name || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {selectedUser && <UserEditDialog user={selectedUser} />}
        </div>
    )
}
