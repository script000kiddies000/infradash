'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Zap } from 'lucide-react'

interface Host {
  id: string
  name: string
  ipAddress: string
  description: string | null
}

interface HostModalProps {
  host?: Host | null
  onClose: () => void
  onSave: () => void
}

export default function HostModal({ host, onClose, onSave }: HostModalProps) {
  const [name, setName] = useState(host?.name || '')
  const [ipAddress, setIpAddress] = useState(host?.ipAddress || '')
  const [description, setDescription] = useState(host?.description || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestedIp, setSuggestedIp] = useState('')

  const isEdit = !!host

  // Auto-generate next IP on mount for new hosts
  useEffect(() => {
    if (!isEdit) {
      fetchNextIp()
    }
  }, [isEdit])

  const fetchNextIp = async () => {
    try {
      const res = await fetch('/api/hosts')
      const hosts: Host[] = await res.json()

      if (hosts.length === 0) {
        const next = '192.168.1.1'
        setSuggestedIp(next)
        setIpAddress(next)
        return
      }

      // Find the highest IP and increment it
      const ips = hosts.map(h => h.ipAddress).filter(ip => /^\d+\.\d+\.\d+\.\d+$/.test(ip))

      if (ips.length === 0) {
        const next = '192.168.1.1'
        setSuggestedIp(next)
        setIpAddress(next)
        return
      }

      // Sort IPs numerically and take the highest
      ips.sort((a, b) => {
        const partsA = a.split('.').map(Number)
        const partsB = b.split('.').map(Number)
        for (let i = 0; i < 4; i++) {
          if (partsA[i] !== partsB[i]) return partsA[i] - partsB[i]
        }
        return 0
      })

      const lastIp = ips[ips.length - 1]
      const parts = lastIp.split('.').map(Number)

      // Increment last octet
      parts[3] = Math.min(parts[3] + 1, 254)
      const nextIp = parts.join('.')
      setSuggestedIp(nextIp)
      setIpAddress(nextIp)
    } catch (err) {
      console.error('Failed to generate IP:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit ? `/api/hosts/${host.id}` : '/api/hosts'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ipAddress, description })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save host')
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Host' : 'Add New Host'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label className="label">Host Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Proxmox Server"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="label">IP Address</label>
              <div className="ip-row">
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., 192.168.1.100"
                  value={ipAddress}
                  onChange={e => setIpAddress(e.target.value)}
                  required
                />
                {!isEdit && (
                  <button
                    type="button"
                    className="gen-btn"
                    onClick={fetchNextIp}
                    title="Auto-generate next IP"
                  >
                    <Zap size={16} />
                  </button>
                )}
              </div>
              {suggestedIp && !isEdit && (
                <div className="ip-hint">
                  Auto-generated: <code>{suggestedIp}</code>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label">Description (optional)</label>
              <textarea
                className="input"
                placeholder="Brief description of this host"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><Loader2 size={16} className="spinner" /> Saving...</>
              ) : (
                isEdit ? 'Save Changes' : 'Add Host'
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
                .modal-overlay {
                    position:fixed; inset:0;
                    background:rgba(0,0,0,.65);
                    backdrop-filter:blur(6px);
                    display:flex; align-items:center; justify-content:center;
                    z-index:1000; padding:20px;
                    animation: fadeIn .15s ease;
                }
                .modal {
                    background:var(--bg-secondary);
                    border:1px solid var(--border-color);
                    border-radius:var(--radius-xl);
                    width:100%; max-width:480px;
                    box-shadow:var(--shadow-lg);
                    animation: slideUp .2s ease;
                }
                .modal-header {
                    display:flex; align-items:center; justify-content:space-between;
                    padding:20px 24px;
                    border-bottom:1px solid var(--border-color);
                }
                .modal-title { font-size:17px; font-weight:600; }
                .close-btn {
                    width:32px; height:32px;
                    display:flex; align-items:center; justify-content:center;
                    color:var(--text-muted);
                    border-radius:var(--radius-sm);
                    transition:all .15s ease;
                }
                .close-btn:hover { background:var(--bg-tertiary); color:var(--text-primary); }
                .modal-body { padding:24px; }
                .modal-footer {
                    display:flex; justify-content:flex-end; gap:12px;
                    padding:16px 24px;
                    border-top:1px solid var(--border-color);
                }
                .error-message {
                    padding:12px 16px;
                    background:rgba(248,113,113,.1);
                    border:1px solid rgba(248,113,113,.25);
                    border-radius:var(--radius-md);
                    color:var(--error);
                    font-size:14px;
                    margin-bottom:20px;
                }
                .form-group { margin-bottom:20px; }
                textarea.input { resize:vertical; min-height:80px; }

                .ip-row { display:flex; gap:8px; }
                .ip-row .input { flex:1; }
                .gen-btn {
                    width:44px; height:44px;
                    display:flex; align-items:center; justify-content:center;
                    background:var(--accent-gradient);
                    border-radius:var(--radius-md);
                    color:white;
                    flex-shrink:0;
                    transition:all .15s ease;
                }
                .gen-btn:hover { opacity:.9; transform:scale(1.03); }
                .ip-hint {
                    margin-top:6px; font-size:12px; color:var(--text-muted);
                }
                .ip-hint code {
                    font-family:'JetBrains Mono',monospace;
                    color:var(--accent-secondary);
                    background:rgba(56,189,248,.08);
                    padding:2px 6px; border-radius:4px;
                }

                .spinner { animation:spin 1s linear infinite; }
                @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
            `}</style>
    </div>
  )
}
