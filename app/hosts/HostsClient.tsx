'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import HostModal from '@/components/modals/HostModal'
import { Server, Edit, Trash2, Globe, Plus } from 'lucide-react'

interface Host {
    id: string
    name: string
    ipAddress: string
    description: string | null
    services: any[]
}

export default function HostsClient({ initialHosts }: { initialHosts: Host[] }) {
    const [hosts, setHosts] = useState<Host[]>(initialHosts)
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingHost, setEditingHost] = useState<Host | null>(null)

    const refresh = async () => {
        const res = await fetch('/api/hosts')
        setHosts(await res.json())
    }

    useEffect(() => { refresh() }, [])

    const filtered = hosts.filter(h =>
        !searchQuery ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.ipAddress.includes(searchQuery)
    )

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this host and all its services?')) return
        await fetch(`/api/hosts/${id}`, { method: 'DELETE' })
        await refresh()
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Header
                    title="Hosts"
                    subtitle={`${hosts.length} hosts registered`}
                    onSearch={setSearchQuery}
                    onAddClick={() => { setEditingHost(null); setShowModal(true) }}
                    addButtonLabel="Add Host"
                />
                <div className="page-content">
                    {filtered.length > 0 ? (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Host</th>
                                        <th>IP Address</th>
                                        <th>Services</th>
                                        <th>Status</th>
                                        <th style={{ width: 100 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(host => (
                                        <tr key={host.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 36, height: 36,
                                                        background: 'rgba(124,92,252,.12)',
                                                        borderRadius: 10,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--accent-primary)'
                                                    }}>
                                                        <Server size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{host.name}</div>
                                                        {host.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{host.description}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: 'var(--accent-secondary)' }}>
                                                    {host.ipAddress}
                                                </code>
                                            </td>
                                            <td>
                                                <span className="badge badge-info">{host.services.length} services</span>
                                            </td>
                                            <td><span className="badge badge-success">Online</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingHost(host); setShowModal(true) }}>
                                                        <Edit size={14} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(host.id)} style={{ color: 'var(--error)' }}>
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
                            <div className="empty-icon"><Globe size={36} /></div>
                            <h2>No hosts yet</h2>
                            <p>Add your first host to start managing your infrastructure</p>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={16} /> Add Host
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {showModal && (
                <HostModal
                    host={editingHost}
                    onClose={() => { setShowModal(false); setEditingHost(null) }}
                    onSave={async () => { setShowModal(false); setEditingHost(null); await refresh() }}
                />
            )}
        </div>
    )
}
