'use client'

import { useState, useEffect } from 'react'
import { Search, Moon, Sun, Plus, Menu } from 'lucide-react'
import { useSidebar } from './SidebarContext'

interface HeaderProps {
  title: string
  subtitle?: string
  onAddClick?: () => void
  addButtonLabel?: string
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export default function Header({
  title,
  subtitle,
  onAddClick,
  addButtonLabel = 'Add New',
  showSearch = true,
  onSearch
}: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [searchQuery, setSearchQuery] = useState('')
  const { toggle } = useSidebar()

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) { setTheme(saved); document.documentElement.setAttribute('data-theme', saved) }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '14px 28px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Left: Menu + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        <button
          onClick={toggle}
          title="Toggle sidebar"
          style={{
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10,
            color: 'var(--text-secondary)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{
            fontSize: 18, fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2, margin: 0,
          }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '1px 0 0' }}>{subtitle}</p>}
        </div>
      </div>

      {/* Right: Search + Theme + Add */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showSearch && (
          <div style={{ position: 'relative', width: 220 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
        )}

        <button
          onClick={toggleTheme}
          title="Toggle theme"
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {onAddClick && (
          <button
            onClick={onAddClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(124, 92, 252, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{addButtonLabel}</span>
          </button>
        )}
      </div>
    </header>
  )
}
