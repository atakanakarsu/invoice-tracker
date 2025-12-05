"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Briefcase, Settings, Shield } from "lucide-react"
import { useSession } from "next-auth/react"

export function BottomNav() {
    const pathname = usePathname()
    const { data: session } = useSession()

    if (!session) return null

    const isActive = (path: string) => pathname === path

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2 md:hidden">
            <nav className="flex justify-around items-center">
                <Link
                    href="/dashboard"
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <Home className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Home</span>
                </Link>

                {(session.user.role === "MUHASEBE" || session.user.role === "ADMIN") && (
                    <Link
                        href="/accounting"
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/accounting') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <FileText className="h-5 w-5" />
                        <span className="text-[10px] mt-1">Accounting</span>
                    </Link>
                )}

                {(session.user.role === "OPERASYON" || session.user.role === "OP_LEADER") && (
                    <Link
                        href="/operation"
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/operation') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <Briefcase className="h-5 w-5" />
                        <span className="text-[10px] mt-1">Operation</span>
                    </Link>
                )}

                {session.user.role === "ADMIN" && (
                    <Link
                        href="/admin"
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/admin') ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <Shield className="h-5 w-5" />
                        <span className="text-[10px] mt-1">Admin</span>
                    </Link>
                )}
            </nav>
        </div>
    )
}
