import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/hosts - Get all hosts with services
export async function GET() {
    try {
        const hosts = await prisma.host.findMany({
            include: {
                services: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(hosts)
    } catch (error) {
        console.error('Error fetching hosts:', error)
        return NextResponse.json({ error: 'Failed to fetch hosts' }, { status: 500 })
    }
}

// POST /api/hosts - Create a new host
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, ipAddress, description } = body

        if (!name || !ipAddress) {
            return NextResponse.json(
                { error: 'Name and IP address are required' },
                { status: 400 }
            )
        }

        // Check for duplicate IP
        const existing = await prisma.host.findUnique({
            where: { ipAddress }
        })
        if (existing) {
            return NextResponse.json(
                { error: 'A host with this IP address already exists' },
                { status: 400 }
            )
        }

        const host = await prisma.host.create({
            data: { name, ipAddress, description }
        })

        return NextResponse.json(host, { status: 201 })
    } catch (error) {
        console.error('Error creating host:', error)
        return NextResponse.json({ error: 'Failed to create host' }, { status: 500 })
    }
}
