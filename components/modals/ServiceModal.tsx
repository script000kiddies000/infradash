'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Loader2, Shuffle, Upload, ChevronDown } from 'lucide-react'
import { serviceTemplates } from '@/lib/templates'

interface Service {
    id: string
    name: string
    description: string | null
    url: string
    port: number
    iconType: string
    iconValue: string | null
    category: string | null
}

interface Host {
    id: string
    name: string
    ipAddress: string
}

interface ServiceModalProps {
    service?: Service | null
    hostId?: string | null
    hosts: Host[]
    onClose: () => void
    onSave: () => void
}

export default function ServiceModal({
    service,
    hostId: initialHostId,
    hosts,
    onClose,
    onSave
}: ServiceModalProps) {
    // Parse existing URL to extract protocol and path
    const parseUrl = (existingUrl: string) => {
        try {
            const u = new URL(existingUrl)
            return {
                protocol: u.protocol === 'https:' ? 'https' : 'http',
                path: u.pathname === '/' ? '' : u.pathname
            }
        } catch {
            return { protocol: 'http', path: '' }
        }
    }
    const parsed = service?.url ? parseUrl(service.url) : { protocol: 'http', path: '' }

    const [name, setName] = useState(service?.name || '')
    const [description, setDescription] = useState(service?.description || '')
    const [protocol, setProtocol] = useState<'http' | 'https'>(parsed.protocol as 'http' | 'https')
    const [port, setPort] = useState(service?.port?.toString() || '')
    const [pathSuffix, setPathSuffix] = useState(parsed.path)
    const [hostId, setHostId] = useState(initialHostId || service?.id || hosts[0]?.id || '')
    const [iconType, setIconType] = useState(service?.iconType || 'preset')
    const [iconValue, setIconValue] = useState(service?.iconValue || '')
    const [category, setCategory] = useState(service?.category || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showTemplates, setShowTemplates] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Build URL from protocol + host IP + port + path
    const selectedHost = hosts.find(h => h.id === hostId)
    const generatedUrl = selectedHost && port
        ? `${protocol}://${selectedHost.ipAddress}:${port}${pathSuffix || '/'}`
        : ''

    const isEdit = !!service

    // Auto-generate port on mount for new services
    useEffect(() => {
        if (!isEdit && hostId) {
            generatePort()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps


    const generatePort = async () => {
        if (!hostId) {
            setError('Please select a host first')
            return
        }

        try {
            const res = await fetch(`/api/ports?hostId=${hostId}`)
            const data = await res.json()
            if (data.port) {
                setPort(data.port.toString())
            }
        } catch (err) {
            console.error('Failed to generate port:', err)
        }
    }

    const applyTemplate = (template: typeof serviceTemplates[0]) => {
        setName(template.name)
        setPort(template.defaultPort.toString())
        setProtocol(template.defaultPort === 443 ? 'https' : 'http')
        setIconType('preset')
        setIconValue(template.icon)
        setCategory(template.category || '')
        setPathSuffix('')
        setShowTemplates(false)
    }

    const ALLOWED_MIME_TYPES = [
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif',
        'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/bmp'
    ]
    const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp']
    const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

    const [uploading, setUploading] = useState(false)
    const [iconPreview, setIconPreview] = useState<string | null>(
        service?.iconType === 'upload' && service?.iconValue ? `/api/uploads/${service.iconValue}` : null
    )

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Reset input so same file can be re-selected
        e.target.value = ''

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setError(`Invalid file type: ${file.type}. Only image files are allowed.`)
            return
        }

        // Validate file extension
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setError(`Invalid file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`)
            return
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 2MB.`)
            return
        }

        setError('')
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Upload failed')
            }

            const data = await res.json()
            setIconType('upload')
            setIconValue(data.filename)
            setIconPreview(`/api/uploads/${data.filename}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const apiUrl = isEdit ? `/api/services/${service.id}` : '/api/services'
            const method = isEdit ? 'PUT' : 'POST'

            const res = await fetch(apiUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    url: generatedUrl,
                    port: parseInt(port),
                    hostId,
                    iconType,
                    iconValue,
                    category
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save service')
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
                    <h2 className="modal-title">{isEdit ? 'Edit Service' : 'Add New Service'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-message">{error}</div>}

                        {/* Template Selector */}
                        {!isEdit && (
                            <div className="template-section">
                                <button
                                    type="button"
                                    className="template-toggle"
                                    onClick={() => setShowTemplates(!showTemplates)}
                                >
                                    <span>Use Template</span>
                                    <ChevronDown size={16} className={showTemplates ? 'rotated' : ''} />
                                </button>

                                {showTemplates && (
                                    <div className="template-grid">
                                        {serviceTemplates.map(template => (
                                            <button
                                                key={template.name}
                                                type="button"
                                                className="template-item"
                                                onClick={() => applyTemplate(template)}
                                            >
                                                <span className="template-name">{template.name}</span>
                                                <span className="template-port">:{template.defaultPort}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="label">Host</label>
                            <select
                                className="input"
                                value={hostId}
                                onChange={e => setHostId(e.target.value)}
                                required
                            >
                                {hosts.map(host => (
                                    <option key={host.id} value={host.id}>
                                        {host.name} ({host.ipAddress})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label">Service Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Portainer"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="label">Protocol</label>
                                <select
                                    className="input"
                                    value={protocol}
                                    onChange={e => setProtocol(e.target.value as 'http' | 'https')}
                                >
                                    <option value="http">HTTP</option>
                                    <option value="https">HTTPS</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="label">Port</label>
                                <div className="port-input-wrapper">
                                    <input
                                        type="number"
                                        className="input port-input"
                                        placeholder="9000"
                                        value={port}
                                        onChange={e => setPort(e.target.value)}
                                        min="0"
                                        max="65535"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="generate-btn"
                                        onClick={generatePort}
                                        title="Auto-generate port"
                                    >
                                        <Shuffle size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Path (optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., /admin"
                                value={pathSuffix}
                                onChange={e => setPathSuffix(e.target.value)}
                            />
                        </div>

                        {generatedUrl && (
                            <div className="url-preview">
                                <span className="url-preview-label">URL Preview:</span>
                                <code className="url-preview-value">{generatedUrl}</code>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="label">Description (optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Brief description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Icon</label>
                            {iconPreview ? (
                                <div className="icon-preview-wrap">
                                    <img src={iconPreview} alt="Icon preview" className="icon-preview-img" />
                                    <div className="icon-preview-info">
                                        <span className="icon-preview-name">{iconValue}</span>
                                        <button
                                            type="button"
                                            className="icon-remove-btn"
                                            onClick={() => {
                                                setIconType('preset')
                                                setIconValue('')
                                                setIconPreview(null)
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`icon-upload ${uploading ? 'uploading' : ''}`}
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 size={24} className="spinner" />
                                            <span className="icon-upload-text">Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={24} />
                                            <span className="icon-upload-text">Click to upload icon</span>
                                            <span className="icon-upload-hint">PNG, JPG, GIF, WebP, SVG, ICO • Max 2MB</span>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.ico,.bmp"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="label">Category (optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Infrastructure, Media"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="spinner" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Save Changes' : 'Add Service'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          background: var(--bg-secondary);
          z-index: 10;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }

        .close-btn:hover {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          position: sticky;
          bottom: 0;
          background: var(--bg-secondary);
        }

        .error-message {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--error);
          font-size: 14px;
          margin-bottom: 20px;
        }

        .template-section {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .template-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .template-toggle:hover {
          border-color: var(--accent-primary);
        }

        .template-toggle :global(.rotated) {
          transform: rotate(180deg);
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
          max-height: 200px;
          overflow-y: auto;
        }

        .template-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .template-item:hover {
          border-color: var(--accent-primary);
          background: var(--bg-card-hover);
        }

        .template-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          text-align: center;
        }

        .template-port {
          font-size: 10px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .port-input-wrapper {
          display: flex;
          gap: 8px;
        }

        .port-input {
          flex: 1;
        }

        .generate-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-gradient);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .generate-btn:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .url-preview {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          margin-bottom: 20px;
        }

        .url-preview-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .url-preview-value {
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--accent-primary);
          word-break: break-all;
        }

        .icon-upload {
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }

        .icon-upload.uploading {
          cursor: wait;
          border-color: var(--accent-primary);
          background: rgba(124, 92, 252, 0.05);
        }

        .icon-upload:hover {
          border-color: var(--accent-primary);
          background: var(--bg-card);
        }

        .icon-upload-text {
          font-size: 13px;
        }

        .icon-upload-hint {
          font-size: 11px;
          color: var(--text-muted);
          opacity: 0.7;
        }

        .icon-preview-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .icon-preview-img {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          object-fit: contain;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .icon-preview-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }

        .icon-preview-name {
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .icon-remove-btn {
          align-self: flex-start;
          font-size: 12px;
          padding: 4px 10px;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.25);
          border-radius: 6px;
          color: var(--error);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .icon-remove-btn:hover {
          background: rgba(248, 113, 113, 0.2);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
