'use client'

import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Monitor, Database, Shield, Globe } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Header title="Settings" subtitle="Application configuration" showSearch={false} />
                <div className="page-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                <div className="stat-icon purple"><Monitor size={20} /></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>General</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Application preferences</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                Dashboard name, default view, and display settings.
                            </div>
                        </div>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                <div className="stat-icon blue"><Database size={20} /></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>Database</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Storage configuration</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                JSON database path and backup management.
                            </div>
                        </div>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                <div className="stat-icon green"><Shield size={20} /></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>Security</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Access control</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                Authentication and user management settings.
                            </div>
                        </div>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                <div className="stat-icon orange"><Globe size={20} /></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>Network</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Connectivity options</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                Port scanning preferences and health check intervals.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
