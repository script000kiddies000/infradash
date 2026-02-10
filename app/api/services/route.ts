import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/services - Get all services
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const hostId = searchParams.get('hostId')

        const where = hostId ? { hostId } : {}

        const services = await prisma.service.findMany({
            where,
            include: { host: true },
            orderBy: { order: 'asc' }
        })

        return NextResponse.json(services)
    } catch (error) {
        console.error('Error fetching services:', error)
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }
}

// POST /api/services - Create a new service
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            name,
            description,
            url,
            port,
            hostId,
            iconType = 'preset',
            iconValue,
            category
        } = body

        if (!name || !url || !port || !hostId) {
            return NextResponse.json(
                { error: 'Name, URL, port, and hostId are required' },
                { status: 400 }
            )
        }

        // Check for duplicate port on the same host
        const existingPort = await prisma.service.findFirst({
            where: { hostId, port }
        })
        if (existingPort) {
            return NextResponse.json(
                { error: `Port ${port} is already in use on this host` },
                { status: 400 }
            )
        }

        const service = await prisma.service.create({
            data: {
                name,
                description,
                url,
                port,
                hostId,
                iconType,
                iconValue,
                category
            }
        })

        return NextResponse.json(service, { status: 201 })
    } catch (error) {
        console.error('Error creating service:', error)
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
    }
}
