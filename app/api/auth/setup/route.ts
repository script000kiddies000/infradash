import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/db'

// POST /api/auth/setup - Create initial admin user
export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        // Check if any user exists
        const existingUsers = await prisma.user.count()
        if (existingUsers > 0) {
            return NextResponse.json(
                { error: 'Setup already completed' },
                { status: 400 }
            )
        }

        // Hash password and create user
        const hashedPassword = await hash(password, 12)
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        })

        return NextResponse.json({
            message: 'Admin user created successfully',
            user: { id: user.id, username: user.username }
        })
    } catch (error) {
        console.error('Setup error:', error)
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
}

// GET /api/auth/setup - Check if setup is needed
export async function GET() {
    try {
        const userCount = await prisma.user.count()
        return NextResponse.json({ needsSetup: userCount === 0 })
    } catch {
        return NextResponse.json({ needsSetup: true })
    }
}
