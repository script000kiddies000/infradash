import { NextResponse } from 'next/server'
import { generateUniquePort, isPortAvailable, getUsedPorts } from '@/lib/port-generator'

// GET /api/ports/generate?hostId=xxx - Generate a unique port for a host
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const hostId = searchParams.get('hostId')
        const startRange = parseInt(searchParams.get('start') || '3000')
        const endRange = parseInt(searchParams.get('end') || '65535')

        if (!hostId) {
            return NextResponse.json(
                { error: 'hostId is required' },
                { status: 400 }
            )
        }

        const port = await generateUniquePort(hostId, startRange, endRange)
        return NextResponse.json({ port })
    } catch (error) {
        console.error('Error generating port:', error)
        return NextResponse.json(
            { error: 'Failed to generate unique port' },
            { status: 500 }
        )
    }
}

// POST /api/ports/check - Check if a port is available
export async function POST(request: Request) {
    try {
        const { hostId, port } = await request.json()

        if (!hostId || port === undefined) {
            return NextResponse.json(
                { error: 'hostId and port are required' },
                { status: 400 }
            )
        }

        const available = await isPortAvailable(hostId, port)
        return NextResponse.json({ available, port })
    } catch (error) {
        console.error('Error checking port:', error)
        return NextResponse.json(
            { error: 'Failed to check port availability' },
            { status: 500 }
        )
    }
}
