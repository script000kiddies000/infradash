import prisma from '@/lib/db'
import ServicesClient from './ServicesClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ServicesPage() {
    const services = await prisma.service.findMany({
        include: { host: true },
        orderBy: { order: 'asc' }
    })
    const hosts = await prisma.host.findMany({ orderBy: { order: 'asc' } })
    return <ServicesClient initialServices={services} hosts={hosts} />
}
