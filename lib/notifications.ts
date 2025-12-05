import { prisma } from "@/lib/prisma"

export async function createNotification(
    userId: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR",
    message: string,
    resourceId?: string
) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                resourceId
            }
        })
    } catch (error) {
        console.error("Failed to create notification", error)
    }
}
