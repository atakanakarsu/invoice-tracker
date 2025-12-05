import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const params = await props.params
    const { id } = params
    const body = await req.json()
    const { action, departmentId, projectId, reason, description } = body

    // Workflow Logic
    // ASSIGN: Muhasebe -> Operasyon (Project/Dept)
    // PROCESS: Operasyon -> Muhasebe (PROCESSED)
    // RETURN: Muhasebe -> Operasyon (RETURNED)
    // ARCHIVE: Muhasebe -> Archive (ARCHIVED)

    let updateData: any = {}
    let logAction = ""

    if (action === "ASSIGN") {
        updateData = {
            status: "ASSIGNED",
            projectId: projectId || null,
            // departmentId removed as it doesn't exist on Invoice model
            description: description ? description : undefined,
        }
        logAction = "ASSIGN"
    } else if (action === "PROCESS") {
        updateData = { status: "PROCESSED" }
        logAction = "PROCESS"
    } else if (action === "ARCHIVE") {
        updateData = { status: "ARCHIVED" }
        logAction = "ARCHIVE"
    } else if (action === "RETURN") {
        updateData = { status: "RETURNED" } // or ASSIGNED back? "Return" usually means reject back to prev step.
        logAction = "RETURN"
    }

    // Check Schema for ReasonId
    if (projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } })
        if (project) {
            const userDetail = session.user.name || session.user.email
            // Enrich Description for ASSIGN action
            if (action === "ASSIGN") {
                updateData.description = description // Keep original clean description in field if needed, or we can append.
                // Actually relying on Log Note is better for history.
            }

            // Prepare rich note for Log
            if (action === "ASSIGN") {
                const assignNote = `Assigned to Project: ${project.name} by ${session.user.name}. Note: ${description || "No note"}`
                // Override the specific log creation below or just set a variable.
                // let's use a variable for the note.
                logAction = "ASSIGN"
                // function scope variable for Note
                var customLogNote = assignNote
            }
        }
    }

    // For Process/Return, we can also add details if needed.
    let customLogNote = ""
    if (action === "PROCESS") {
        customLogNote = `Processed by Operation. Note: ${description || ""}`
    }
    if (action === "RETURN") {
        customLogNote = `Returned to Accounting. Reason: ${description || ""}`
    }

    const invoice = await prisma.invoice.update({
        where: { id },
        data: {
            ...updateData,
            logs: {
                create: {
                    action: logAction,
                    actorId: session.user.id,
                    note: customLogNote || description || reason,
                }
            }
        },
        include: { logs: true, project: { include: { users: true } } }
    })

    // --- Notifications ---
    try {
        if (action === "ASSIGN" && invoice.projectId) {
            // Notify all Operation users in the project
            // Or if specific assignee logic existed. For now, notify all users in project with OPERASYON role.
            const projectUsers = invoice.project?.users.filter(u => u.role === "OPERASYON" || u.role === "OP_LEADER") || []

            for (const user of projectUsers) {
                await createNotification(
                    user.id,
                    "INFO",
                    `Yeni fatura atandı: ${invoice.amount} ${invoice.currency} - ${invoice.supplier}`,
                    invoice.id
                )
            }
        } else if (action === "PROCESS" || action === "RETURN") {
            // Notify Accounting. 
            // Ideally, notify the Creator. Let's find the creator from logs.
            // Assuming the first log is CREATE.
            const createLog = await prisma.workflowLog.findFirst({
                where: { invoiceId: invoice.id, action: "CREATE" }
            })

            if (createLog) {
                await createNotification(
                    createLog.actorId,
                    action === "PROCESS" ? "SUCCESS" : "WARNING",
                    `Fatura ${action === "PROCESS" ? "onaylandı" : "iade edildi"}: ${invoice.supplier}`,
                    invoice.id
                )
            }
        }
    } catch (err) {
        console.error("Notification trigger failed", err)
    }
    // ---------------------

    return NextResponse.json(invoice)
}
