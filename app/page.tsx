import prisma from '@/lib/db'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
    const hosts = await prisma.host.findMany({
        include: {
            services: {
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { order: 'asc' }
    })

    return (
        <DashboardClient initialHosts={hosts} />
    )
}
