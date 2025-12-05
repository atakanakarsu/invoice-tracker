"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Notification {
    id: string
    type: string
    message: string
    isRead: boolean
    createdAt: string
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Initial fetch
        fetchNotifications()

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const markAsRead = async () => {
        if (unreadCount === 0) return

        try {
            await fetch("/api/notifications", { method: "PUT" })
            setUnreadCount(0)
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Popover open={open} onOpenChange={(val) => {
            setOpen(val)
            if (val) markAsRead()
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 font-medium border-b">Notifications</div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-muted/20' : ''}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === 'SUCCESS' ? 'bg-green-500' :
                                                n.type === 'WARNING' ? 'bg-yellow-500' :
                                                    n.type === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'
                                            }`} />
                                        <div className="space-y-1">
                                            <p className="text-sm leading-none">{n.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
