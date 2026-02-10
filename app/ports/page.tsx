import prisma from '@/lib/db'
import PortsClient from './PortsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PortsPage() {
    const services = await prisma.service.findMany({
        include: { host: true },
        orderBy: { order: 'asc' }
    })
    return <PortsClient initialServices={services} />
}
