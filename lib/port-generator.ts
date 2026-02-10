import prisma from './db'

export async function generateUniquePort(hostId: string, startRange = 3000, endRange = 65535): Promise<number> {
    // Get all used ports on this host
    const usedPorts = await prisma.service.findMany({
        where: { hostId },
        select: { port: true }
    })

    const usedPortSet = new Set(usedPorts.map((s: { port: number }) => s.port))

    // Common ports to avoid by default (can be overridden)
    const reservedPorts = new Set([
        22, 80, 443, 3306, 5432, 6379, 8080, 8443
    ])

    // Find first available port in range
    for (let port = startRange; port <= endRange; port++) {
        if (!usedPortSet.has(port) && !reservedPorts.has(port)) {
            return port
        }
    }

    throw new Error('No available ports in the specified range')
}

export async function isPortAvailable(hostId: string, port: number): Promise<boolean> {
    const existing = await prisma.service.findFirst({
        where: { hostId, port }
    })
    return !existing
}

export async function getUsedPorts(hostId: string): Promise<number[]> {
    const services = await prisma.service.findMany({
        where: { hostId },
        select: { port: true },
        orderBy: { port: 'asc' }
    })
    return services.map((s: { port: number }) => s.port)
}
