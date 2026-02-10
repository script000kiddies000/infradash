import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Allowed MIME types for image uploads
const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/bmp',
]

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp'
]

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024

// Upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads')

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type: ${file.type}. Only image files are allowed (PNG, JPG, GIF, WebP, SVG, ICO, BMP).` },
                { status: 400 }
            )
        }

        // Validate file extension
        const originalName = file.name.toLowerCase()
        const ext = path.extname(originalName)
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                { error: `Invalid file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
                { status: 400 }
            )
        }

        // Read file bytes and validate magic bytes (file signature)
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        if (!validateMagicBytes(buffer, file.type)) {
            return NextResponse.json(
                { error: 'File content does not match its declared type. Upload rejected.' },
                { status: 400 }
            )
        }

        // Ensure upload directory exists
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true })
        }

        // Generate unique filename
        const uniqueId = crypto.randomBytes(8).toString('hex')
        const safeExt = ext.replace(/[^a-z.]/g, '')
        const filename = `${uniqueId}${safeExt}`
        const filepath = path.join(UPLOAD_DIR, filename)

        // Write file
        fs.writeFileSync(filepath, buffer)

        return NextResponse.json({
            filename,
            originalName: file.name,
            size: file.size,
            mimeType: file.type
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}

/**
 * Validates file magic bytes (file signature) against the declared MIME type.
 * This prevents users from spoofing the Content-Type header.
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 4) return false

    const signatures: Record<string, number[][]> = {
        'image/png': [[0x89, 0x50, 0x4E, 0x47]],
        'image/jpeg': [[0xFF, 0xD8, 0xFF]],
        'image/jpg': [[0xFF, 0xD8, 0xFF]],
        'image/gif': [[0x47, 0x49, 0x46, 0x38]],             // GIF8
        'image/webp': [[0x52, 0x49, 0x46, 0x46]],             // RIFF
        'image/bmp': [[0x42, 0x4D]],                          // BM
        'image/x-icon': [[0x00, 0x00, 0x01, 0x00], [0x00, 0x00, 0x02, 0x00]],
        'image/vnd.microsoft.icon': [[0x00, 0x00, 0x01, 0x00], [0x00, 0x00, 0x02, 0x00]],
    }

    // SVG is text-based, check for XML/SVG start
    if (mimeType === 'image/svg+xml') {
        const head = buffer.slice(0, 256).toString('utf-8').trim().toLowerCase()
        return head.startsWith('<?xml') || head.startsWith('<svg') || head.includes('<svg')
    }

    const expectedSigs = signatures[mimeType]
    if (!expectedSigs) return true  // Unknown type, allow

    return expectedSigs.some(sig =>
        sig.every((byte, i) => buffer[i] === byte)
    )
}
