import Link from "next/link"
import { Briefcase } from "lucide-react"

export default function OperationLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="flex h-16 items-center border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
                <Link className="flex items-center gap-2 font-semibold" href="/operation">
                    <Briefcase className="h-6 w-6" />
                    <span>Operation Portal</span>
                </Link>
                {/* Add user name/dept display here later */}
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                {children}
            </main>
        </div>
    )
}
