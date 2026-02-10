'use client'

import { useState, useMemo, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import HostGroup from '@/components/dashboard/HostGroup'
import ServiceModal from '@/components/modals/ServiceModal'
import HostModal from '@/components/modals/HostModal'
import { Plus, Server, HardDrive, Layers, Network } from 'lucide-react'

interface Service {
    id: string
    name: string
    description: string | null
    url: string
    port: number
    iconType: string
    iconValue: string | null
    isActive: boolean
    category: string | null
}

interface Host {
    id: string
    name: string
    ipAddress: string
    description: string | null
    services: Service[]
}

interface DashboardClientProps {
    initialHosts: Host[]
}

export default function DashboardClient({ initialHosts }: DashboardClientProps) {
    const [hosts, setHosts] = useState<Host[]>(initialHosts)
    const [searchQuery, setSearchQuery] = useState('')
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [showHostModal, setShowHostModal] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [editingHost, setEditingHost] = useState<Host | null>(null)
    const [selectedHostId, setSelectedHostId] = useState<string | null>(null)

    // Always refresh from API on mount to avoid stale server-rendered data
    useEffect(() => {
        refreshHosts()
    }, [])

    const filteredHosts = useMemo(() => {
        if (!searchQuery) return hosts
        return hosts.map(host => ({
            ...host,
            services: host.services.filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.port.toString().includes(searchQuery)
            )
        })).filter(host =>
            host.services.length > 0 ||
            host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            host.ipAddress.includes(searchQuery)
        )
    }, [hosts, searchQuery])

    const refreshHosts = async () => {
        try {
            const res = await fetch('/api/hosts')
            setHosts(await res.json())
        } catch (e) {
            console.error('Failed to refresh:', e)
        }
    }

    const handleAddService = (hostId?: string) => {
        setSelectedHostId(hostId || null)
        setEditingService(null)
        setShowServiceModal(true)
    }

    const handleEditService = (service: Service) => {
        setEditingService(service)
        setShowServiceModal(true)
    }

    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('Delete this service?')) return
        await fetch(`/api/services/${serviceId}`, { method: 'DELETE' })
        await refreshHosts()
    }

    const handleEditHost = (host: Host) => {
        setEditingHost(host)
        setShowHostModal(true)
    }

    const handleDeleteHost = async (hostId: string) => {
        if (!confirm('Delete this host and all its services?')) return
        await fetch(`/api/hosts/${hostId}`, { method: 'DELETE' })
        await refreshHosts()
    }

    const totalServices = hosts.reduce((acc, h) => acc + h.services.length, 0)
    const activeServices = hosts.reduce((acc, h) => acc + h.services.filter(s => s.isActive).length, 0)
    const uniquePorts = new Set(hosts.flatMap(h => h.services.map(s => s.port))).size

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Header
                    title="Dashboard"
                    subtitle="Infrastructure overview"
                    showSearch
                    onSearch={setSearchQuery}
                    onAddClick={() => setShowHostModal(true)}
                    addButtonLabel="Add Host"
                />
                <div className="page-content">
                    {/* Stats Row */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple"><HardDrive size={20} /></div>
                            <div className="stat-info">
                                <div className="stat-value">{hosts.length}</div>
                                <div className="stat-label">Hosts</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue"><Layers size={20} /></div>
                            <div className="stat-info">
                                <div className="stat-value">{totalServices}</div>
                                <div className="stat-label">Total Services</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green"><Server size={20} /></div>
                            <div className="stat-info">
                                <div className="stat-value">{activeServices}</div>
                                <div className="stat-label">Active</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange"><Network size={20} /></div>
                            <div className="stat-info">
                                <div className="stat-value">{uniquePorts}</div>
                                <div className="stat-label">Ports</div>
                            </div>
                        </div>
                    </div>

                    {/* Host Groups */}
                    {filteredHosts.length > 0 ? (
                        filteredHosts.map(host => (
                            <HostGroup
                                key={host.id}
                                host={host}
                                onEditHost={handleEditHost}
                                onDeleteHost={handleDeleteHost}
                                onAddService={handleAddService}
                                onEditService={handleEditService}
                                onDeleteService={handleDeleteService}
                            />
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon"><Server size={40} /></div>
                            <h2>No hosts configured</h2>
                            <p>Add your first host to start managing services</p>
                            <button className="btn btn-primary" onClick={() => setShowHostModal(true)}>
                                <Plus size={16} /> Add Host
                            </button>
                        </div>
                    )}

                    {hosts.length > 0 && (
                        <button className="fab" onClick={() => handleAddService()} title="Add Service">
                            <Plus size={22} />
                        </button>
                    )}
                </div>
            </main>

            {showServiceModal && (
                <ServiceModal
                    service={editingService}
                    hostId={selectedHostId}
                    hosts={hosts}
                    onClose={() => setShowServiceModal(false)}
                    onSave={async () => { setShowServiceModal(false); setEditingService(null); await refreshHosts() }}
                />
            )}

            {showHostModal && (
                <HostModal
                    host={editingHost}
                    onClose={() => { setShowHostModal(false); setEditingHost(null) }}
                    onSave={async () => { setShowHostModal(false); setEditingHost(null); await refreshHosts() }}
                />
            )}
        </div>
    )
}
