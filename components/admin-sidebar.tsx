import Link from "next/link"
import { Users, FileText, Settings, Building2 } from "lucide-react"

export default function AdminSidebar() {
    return (
        <div className="flex h-screen w-64 flex-col border-r bg-gray-100/40 dark:bg-gray-800/40">
            <div className="flex h-14 items-center border-b px-6">
                <Link className="flex items-center gap-2 font-semibold" href="/">
                    <span className="">InvoiceTracker Admin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    <Link
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                        href="/admin/users"
                    >
                        <Users className="h-4 w-4" />
                        Users
                    </Link>
                    <Link
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                        href="/admin/organization"
                    >
                        <Building2 className="h-4 w-4" />
                        Organization
                    </Link>
                    <Link
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                        href="/admin/master-data"
                    >
                        <Settings className="h-4 w-4" />
                        Master Data
                    </Link>
                </nav>
            </div>
        </div>
    )
}
