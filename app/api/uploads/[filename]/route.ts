import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads')

const MIME_MAP: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
}

export async function GET(
    request: Request,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename

        // Sanitize filename to prevent directory traversal
        const sanitized = path.basename(filename)
        if (sanitized !== filename || filename.includes('..')) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        const filepath = path.join(UPLOAD_DIR, sanitized)

        if (!fs.existsSync(filepath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        const ext = path.extname(sanitized).toLowerCase()
        const contentType = MIME_MAP[ext] || 'application/octet-stream'

        const fileBuffer = fs.readFileSync(filepath)

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
                'Content-Length': fileBuffer.length.toString(),
            }
        })
    } catch (error) {
        console.error('Error serving upload:', error)
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
    }
}
