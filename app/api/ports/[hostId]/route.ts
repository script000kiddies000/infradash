import { NextResponse } from 'next/server'
import { getUsedPorts } from '@/lib/port-generator'

// GET /api/ports/[hostId]/used - Get all used ports for a host
export async function GET(
    request: Request,
    { params }: { params: { hostId: string } }
) {
    try {
        const usedPorts = await getUsedPorts(params.hostId)
        return NextResponse.json({ hostId: params.hostId, usedPorts })
    } catch (error) {
        console.error('Error fetching used ports:', error)
        return NextResponse.json(
            { error: 'Failed to fetch used ports' },
            { status: 500 }
        )
    }
}
