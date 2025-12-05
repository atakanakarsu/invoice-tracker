"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/notification-bell"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon, LayoutDashboard, FileText, Settings, Shield } from "lucide-react"

export function Navbar() {
    const { data: session } = useSession()
    const router = useRouter()

    if (!session) return null

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-lg cursor-pointer" onClick={() => router.push("/dashboard")}>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <span>Invoice Tracker</span>
            </div>

            <nav className="hidden md:flex items-center gap-6 ml-6 text-sm font-medium">
                {/* Dynamic Nav based on Role? For now, simple links */}
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                </Link>
                {(session.user.role === "MUHASEBE" || session.user.role === "ADMIN") && (
                    <Link href="/accounting" className="text-muted-foreground hover:text-foreground transition-colors">
                        Accounting
                    </Link>
                )}
                {(session.user.role === "OPERASYON" || session.user.role === "OP_LEADER") && (
                    <Link href="/operation" className="text-muted-foreground hover:text-foreground transition-colors">
                        Operation
                    </Link>
                )}
                {session.user.role === "ADMIN" && (
                    <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                        Admin
                    </Link>
                )}
            </nav>

            <div className="ml-auto flex items-center gap-4">
                <ModeToggle />
                <NotificationBell />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                                <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {session.user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/profile")}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        {session.user.role === "ADMIN" && (
                            <DropdownMenuItem onClick={() => router.push("/admin")}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Admin Panel</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
