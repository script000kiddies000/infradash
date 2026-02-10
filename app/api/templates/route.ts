import { NextResponse } from 'next/server'
import { serviceTemplates } from '@/lib/templates'

// GET /api/templates - Get all service templates
export async function GET() {
    return NextResponse.json(serviceTemplates)
}
