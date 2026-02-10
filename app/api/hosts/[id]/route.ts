import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/hosts/[id] - Get a specific host
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const host = await prisma.host.findUnique({
            where: { id: params.id },
            include: { services: true }
        })

        if (!host) {
            return NextResponse.json({ error: 'Host not found' }, { status: 404 })
        }

        return NextResponse.json(host)
    } catch (error) {
        console.error('Error fetching host:', error)
        return NextResponse.json({ error: 'Failed to fetch host' }, { status: 500 })
    }
}

// PUT /api/hosts/[id] - Update a host
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { name, ipAddress, description } = body

        const host = await prisma.host.update({
            where: { id: params.id },
            data: { name, ipAddress, description }
        })

        return NextResponse.json(host)
    } catch (error) {
        console.error('Error updating host:', error)
        return NextResponse.json({ error: 'Failed to update host' }, { status: 500 })
    }
}

// DELETE /api/hosts/[id] - Delete a host
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.host.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Host deleted successfully' })
    } catch (error) {
        console.error('Error deleting host:', error)
        return NextResponse.json({ error: 'Failed to delete host' }, { status: 500 })
    }
}
