'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ServiceModal from '@/components/modals/ServiceModal'
import { ExternalLink, Edit, Trash2, Plus, Layers } from 'lucide-react'

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
    host?: { id: string; name: string; ipAddress: string }
}

interface Host {
    id: string
    name: string
    ipAddress: string
    description: string | null
}

export default function ServicesClient({ initialServices, hosts }: { initialServices: Service[]; hosts: Host[] }) {
    const [services, setServices] = useState<Service[]>(initialServices)
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)

    const refresh = async () => {
        const res = await fetch('/api/services')
        setServices(await res.json())
    }

    useEffect(() => { refresh() }, [])

    const filtered = services.filter(s =>
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.port.toString().includes(searchQuery) ||
        s.host?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this service?')) return
        await fetch(`/api/services/${id}`, { method: 'DELETE' })
        await refresh()
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Header
                    title="Services"
                    subtitle={`${services.length} services configured`}
                    onSearch={setSearchQuery}
                    onAddClick={() => { setEditingService(null); setShowModal(true) }}
                    addButtonLabel="Add Service"
                />
                <div className="page-content">
                    {filtered.length > 0 ? (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Host</th>
                                        <th>Port</th>
                                        <th>Status</th>
                                        <th>URL</th>
                                        <th style={{ width: 100 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(svc => (
                                        <tr key={svc.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 36, height: 36,
                                                        background: 'rgba(56,189,248,.1)',
                                                        borderRadius: 10,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--accent-secondary)',
                                                        fontSize: 15, fontWeight: 700
                                                    }}>
                                                        {svc.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{svc.name}</div>
                                                        {svc.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{svc.description}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 13 }}>{svc.host?.name || '—'}</td>
                                            <td>
                                                <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: 'var(--accent-primary)' }}>
                                                    :{svc.port}
                                                </code>
                                            </td>
                                            <td>
                                                <span className={`badge ${svc.isActive ? 'badge-success' : 'badge-error'}`}>
                                                    {svc.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <a href={svc.url} target="_blank" rel="noopener noreferrer"
                                                    style={{ color: 'var(--accent-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    Open <ExternalLink size={12} />
                                                </a>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingService(svc); setShowModal(true) }}>
                                                        <Edit size={14} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(svc.id)} style={{ color: 'var(--error)' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon"><Layers size={36} /></div>
                            <h2>No services yet</h2>
                            <p>Add a service to start monitoring your infrastructure</p>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={16} /> Add Service
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {showModal && (
                <ServiceModal
                    service={editingService}
                    hostId={null}
                    hosts={hosts.map(h => ({ ...h, services: [] }))}
                    onClose={() => { setShowModal(false); setEditingService(null) }}
                    onSave={async () => { setShowModal(false); setEditingService(null); await refresh() }}
                />
            )}
        </div>
    )
}
