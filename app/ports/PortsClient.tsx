'use client'

import { useState, useMemo, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Network, ExternalLink } from 'lucide-react'

interface Service {
    id: string
    name: string
    url: string
    port: number
    isActive: boolean
    host?: { id: string; name: string; ipAddress: string }
}

export default function PortsClient({ initialServices }: { initialServices: Service[] }) {
    const [services, setServices] = useState<Service[]>(initialServices)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const refresh = async () => {
            const res = await fetch('/api/services')
            setServices(await res.json())
        }
        refresh()
    }, [])

    const sorted = useMemo(() => {
        let list = [...services].sort((a, b) => a.port - b.port)
        if (searchQuery) {
            list = list.filter(s =>
                s.port.toString().includes(searchQuery) ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.host?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.host?.ipAddress.includes(searchQuery)
            )
        }
        return list
    }, [services, searchQuery])

    const portRanges = useMemo(() => {
        const ranges = [
            { label: 'Well-known (0-1023)', min: 0, max: 1023, color: 'purple' },
            { label: 'Registered (1024-49151)', min: 1024, max: 49151, color: 'blue' },
            { label: 'Dynamic (49152+)', min: 49152, max: 65535, color: 'green' },
        ]
        return ranges.map(r => ({
            ...r,
            count: services.filter(s => s.port >= r.min && s.port <= r.max).length
        }))
    }, [services])

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Header
                    title="Port Map"
                    subtitle={`${services.length} ports in use`}
                    onSearch={setSearchQuery}
                />
                <div className="page-content">
                    {/* Port Range Stats */}
                    <div className="stats-grid">
                        {portRanges.map(r => (
                            <div className="stat-card" key={r.label}>
                                <div className={`stat-icon ${r.color}`}>
                                    <Network size={20} />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">{r.count}</div>
                                    <div className="stat-label">{r.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sorted.length > 0 ? (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Port</th>
                                        <th>Service</th>
                                        <th>Host</th>
                                        <th>IP Address</th>
                                        <th>Status</th>
                                        <th>Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map(svc => (
                                        <tr key={svc.id}>
                                            <td>
                                                <code style={{
                                                    fontFamily: "'JetBrains Mono',monospace",
                                                    fontSize: 14, fontWeight: 700,
                                                    color: 'var(--accent-primary)',
                                                    background: 'rgba(124,92,252,.08)',
                                                    padding: '4px 10px',
                                                    borderRadius: 8
                                                }}>
                                                    {svc.port}
                                                </code>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{svc.name}</td>
                                            <td style={{ fontSize: 13 }}>{svc.host?.name || '—'}</td>
                                            <td>
                                                <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: 'var(--text-secondary)' }}>
                                                    {svc.host?.ipAddress || '—'}
                                                </code>
                                            </td>
                                            <td>
                                                <span className={`badge ${svc.isActive ? 'badge-success' : 'badge-error'}`}>
                                                    {svc.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <a href={svc.url} target="_blank" rel="noopener noreferrer"
                                                    style={{ color: 'var(--accent-secondary)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    Open <ExternalLink size={12} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon"><Network size={36} /></div>
                            <h2>No ports mapped</h2>
                            <p>Add services to see all ports used across your infrastructure</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
