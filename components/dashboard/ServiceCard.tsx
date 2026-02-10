'use client'

import { ExternalLink, Edit, Trash2 } from 'lucide-react'

interface ServiceCardProps {
  id: string
  name: string
  description: string | null
  url: string
  port: number
  iconType: string
  iconValue: string | null
  isActive?: boolean
  category: string | null
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function ServiceCard({
  id,
  name,
  description,
  url,
  port,
  iconType,
  iconValue,
  isActive = true,
  onEdit,
  onDelete
}: ServiceCardProps) {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getIconContent = () => {
    if (iconType === 'upload' && iconValue) {
      return (
        <img
          src={`/api/uploads/${iconValue}`}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )
    }

    // Default icon based on service name
    const initial = name.charAt(0).toUpperCase()
    return <span style={{ fontSize: '20px', fontWeight: 600 }}>{initial}</span>
  }

  return (
    <div className="service-card" onClick={handleClick}>
      <div className={`service-status ${isActive ? 'online' : 'offline'}`} />

      {/* Action buttons */}
      <div className="service-actions">
        {onEdit && (
          <button
            className="svc-action-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(id) }}
            title="Edit service"
          >
            <Edit size={14} />
          </button>
        )}
        {onDelete && (
          <button
            className="svc-action-btn svc-delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(id) }}
            title="Delete service"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="service-icon">
        {getIconContent()}
      </div>

      <h3 className="service-name">{name}</h3>
      {description && <p className="service-desc">{description}</p>}
      <span className="service-port">:{port}</span>

      <div className="service-link">
        <ExternalLink size={14} />
      </div>

      <style jsx>{`
        .service-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-gradient);
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .service-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.3);
        }

        .service-card:hover::before {
          opacity: 1;
        }

        .service-status {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .service-status.online {
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }

        .service-status.offline {
          background: var(--error);
        }

        /* Action buttons */
        .service-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .service-card:hover .service-actions {
          opacity: 1;
        }

        .svc-action-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .svc-action-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .svc-delete-btn:hover {
          background: rgba(248, 113, 113, 0.12);
          color: var(--error);
          border-color: rgba(248, 113, 113, 0.3);
        }

        .service-icon {
          width: 56px;
          height: 56px;
          margin-bottom: 12px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          color: var(--accent-primary);
        }

        .service-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .service-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .service-port {
          font-size: 12px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .service-link {
          position: absolute;
          bottom: 12px;
          right: 12px;
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .service-card:hover .service-link {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
