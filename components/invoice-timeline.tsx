"use client"

import { format } from "date-fns"
import { CheckCircle2, Circle, Clock, ArrowRight, User as UserIcon, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface WorkflowLog {
    id: string
    action: string
    note?: string
    timestamp: string
    actor?: {
        name: string | null
        image: string | null
    }
}

interface InvoiceTimelineProps {
    logs: WorkflowLog[]
    createdAt: string
}

export function InvoiceTimeline({ logs, createdAt }: InvoiceTimelineProps) {
    // Sort logs by timestamp ascending
    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Initial Event (Created) - if not in logs or to explicit start
    // Usually logs start with CREATE.

    const getIcon = (action: string) => {
        switch (action) {
            case "CREATE": return <Clock className="h-4 w-4 text-blue-500" />
            case "ASSIGN": return <ArrowRight className="h-4 w-4 text-purple-500" />
            case "PROCESS": return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "RETURN": return <AlertCircle className="h-4 w-4 text-red-500" />
            case "ARCHIVE": return <CheckCircle2 className="h-4 w-4 text-gray-500" />
            default: return <Circle className="h-4 w-4 text-gray-300" />
        }
    }

    const getLabel = (action: string) => {
        switch (action) {
            case "CREATE": return "Created"
            case "ASSIGN": return "Assigned"
            case "PROCESS": return "Processed"
            case "RETURN": return "Returned"
            case "ARCHIVE": return "Archived"
            default: return action
        }
    }

    return (
        <div className="space-y-6">
            <div className="relative pl-6 border-l-2 border-muted pb-1 last:border-0 last:pb-0">
                <div className="absolute top-0 -left-[9px] bg-background p-0.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-sm font-medium">Invoice Created</div>
                <div className="text-xs text-muted-foreground">{format(new Date(createdAt), "PP p")}</div>
            </div>

            {sortedLogs.map((log) => (
                <div key={log.id} className="relative pl-6 border-l-2 border-muted pb-6 last:border-0 last:pb-0">
                    <div className="absolute top-0 -left-[9px] bg-background p-0.5">
                        {getIcon(log.action)}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{getLabel(log.action)}</span>
                            {log.actor && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                    <Avatar className="h-4 w-4">
                                        <AvatarImage src={log.actor.image || ""} />
                                        <AvatarFallback className="text-[9px]">{log.actor.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{log.actor.name}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "PP p")}</div>
                        {log.note && (
                            <div className="mt-1 text-xs bg-muted/50 p-2 rounded-md italic">
                                "{log.note}"
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
