import Link from "next/link"
import { FileText, PlusCircle, Upload } from "lucide-react"

export default function AccountingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="flex h-16 items-center border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
                <Link className="flex items-center gap-2 font-semibold" href="/accounting">
                    <span>Accounting Dashboard</span>
                </Link>
                <nav className="ml-auto flex gap-4">
                    <Link href="/accounting" className="hover:underline">Invoices</Link>
                    <Link href="/accounting/create" className="hover:underline flex items-center gap-1">
                        <PlusCircle className="h-4 w-4" /> Create
                    </Link>
                </nav>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                {children}
            </main>
        </div>
    )
}
