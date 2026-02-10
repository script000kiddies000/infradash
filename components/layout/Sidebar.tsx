'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarContext'
import {
  LayoutDashboard,
  Server,
  HardDrive,
  Network,
  Settings,
  ChevronRight,
  X,
  Gauge
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hosts', label: 'Hosts', icon: HardDrive },
  { href: '/services', label: 'Services', icon: Server },
  { href: '/ports', label: 'Ports', icon: Network },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 10,
    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    textDecoration: 'none',
    position: 'relative',
    background: active ? 'rgba(124, 92, 252, 0.12)' : 'transparent',
  })

  const iconWrapStyle = (active: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    background: active ? 'rgba(124, 92, 252, 0.15)' : 'var(--bg-tertiary)',
    flexShrink: 0,
    color: active ? 'var(--accent-primary)' : 'inherit',
  })

  const activeBarStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 20,
    background: 'var(--accent-primary)',
    borderRadius: '0 4px 4px 0',
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={toggle}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 199,
          }}
        />
      )}

      <aside style={{
        width: 260,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 200,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .28s cubic-bezier(.4, 0, .2, 1)',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: isOpen ? '8px 0 32px rgba(0, 0, 0, 0.25)' : 'none',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px' }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--accent-gradient)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(124, 92, 252, 0.3)',
          }}>
            <Gauge size={20} strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>InfraDash</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>Management</span>
          </div>
          <button
            onClick={toggle}
            aria-label="Close sidebar"
            style={{
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8,
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-color)', margin: '0 16px' }} />

        {/* Navigation */}
        <div style={{ padding: '16px 12px 8px' }}>
          <span style={{
            display: 'block',
            padding: '0 12px',
            marginBottom: 8,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            opacity: 0.7,
          }}>Navigation</span>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={linkStyle(isActive)}
                  onClick={() => { if (window.innerWidth < 1024) toggle() }}
                >
                  {isActive && <div style={activeBarStyle} />}
                  <span style={iconWrapStyle(isActive)}>
                    <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span style={{ display: 'flex', alignItems: 'center', opacity: 0.5, flexShrink: 0 }}>
                      <ChevronRight size={14} />
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div style={{ padding: '8px 12px 16px' }}>
          <div style={{ height: 1, background: 'var(--border-color)', margin: '0 4px 8px' }} />
          <Link
            href="/settings"
            style={linkStyle(pathname === '/settings')}
            onClick={() => { if (window.innerWidth < 1024) toggle() }}
          >
            {pathname === '/settings' && <div style={activeBarStyle} />}
            <span style={iconWrapStyle(pathname === '/settings')}>
              <Settings size={18} strokeWidth={pathname === '/settings' ? 2.2 : 1.8} />
            </span>
            <span style={{ flex: 1 }}>Settings</span>
          </Link>

          {/* User Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            marginTop: 8,
            background: 'var(--bg-tertiary)',
            borderRadius: 12,
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              width: 34, height: 34,
              background: 'var(--accent-gradient)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>A</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Admin</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administrator</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
