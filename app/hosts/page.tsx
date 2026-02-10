import prisma from '@/lib/db'
import HostsClient from './HostsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HostsPage() {
    const hosts = await prisma.host.findMany({
        include: { services: true },
        orderBy: { order: 'asc' }
    })
    return <HostsClient initialHosts={hosts} />
}
