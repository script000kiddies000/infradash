import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/services/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const service = await prisma.service.findUnique({
            where: { id: params.id },
            include: { host: true }
        })

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }

        return NextResponse.json(service)
    } catch (error) {
        console.error('Error fetching service:', error)
        return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
    }
}

// PUT /api/services/[id]
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { name, description, url, port, iconType, iconValue, category, isActive } = body

        // Check for duplicate port if port is being changed
        if (port) {
            const existingService = await prisma.service.findUnique({
                where: { id: params.id }
            })

            if (existingService && existingService.port !== port) {
                const duplicatePort = await prisma.service.findFirst({
                    where: {
                        hostId: existingService.hostId,
                        port,
                        id: { not: params.id }
                    }
                })

                if (duplicatePort) {
                    return NextResponse.json(
                        { error: `Port ${port} is already in use on this host` },
                        { status: 400 }
                    )
                }
            }
        }

        const service = await prisma.service.update({
            where: { id: params.id },
            data: { name, description, url, port, iconType, iconValue, category, isActive }
        })

        return NextResponse.json(service)
    } catch (error) {
        console.error('Error updating service:', error)
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
    }
}

// DELETE /api/services/[id]
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.service.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Service deleted successfully' })
    } catch (error) {
        console.error('Error deleting service:', error)
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
    }
}
