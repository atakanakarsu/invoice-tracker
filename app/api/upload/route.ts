import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(reg: Request) {
    const data = await reg.formData()
    const files: File[] | null = data.getAll("file") as unknown as File[]

    if (!files || files.length === 0) {
        return NextResponse.json({ success: false, message: "No files found" })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads")
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // ignore exists
        }

        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
        const filepath = path.join(uploadDir, filename)

        await writeFile(filepath, buffer)
        uploadedUrls.push(`/uploads/${filename}`)
    }

    return NextResponse.json({ success: true, urls: uploadedUrls })
}
