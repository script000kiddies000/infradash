'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Server, Edit, Trash2, Plus } from 'lucide-react'
import ServiceCard from './ServiceCard'

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

interface HostGroupProps {
  host: Host
  onEditHost?: (host: Host) => void
  onDeleteHost?: (hostId: string) => void
  onAddService?: (hostId: string) => void
  onEditService?: (service: Service) => void
  onDeleteService?: (serviceId: string) => void
}

export default function HostGroup({ host, onEditHost, onDeleteHost, onAddService, onEditService, onDeleteService }: HostGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="host-group">
      <div
        className="host-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="host-icon">
          <Server size={20} />
        </div>

        <div className="host-info">
          <h2 className="host-name">{host.name}</h2>
          <span className="host-ip">{host.ipAddress}</span>
        </div>

        <span className="host-count">
          {host.services.length} service{host.services.length !== 1 ? 's' : ''}
        </span>

        <div className="host-actions">
          {onAddService && (
            <button
              className="action-btn add"
              onClick={(e) => { e.stopPropagation(); onAddService(host.id); }}
              title="Add service to this host"
            >
              <Plus size={16} />
            </button>
          )}
          {onEditHost && (
            <button
              className="action-btn"
              onClick={(e) => { e.stopPropagation(); onEditHost(host); }}
              title="Edit host"
            >
              <Edit size={16} />
            </button>
          )}
          {onDeleteHost && (
            <button
              className="action-btn delete"
              onClick={(e) => { e.stopPropagation(); onDeleteHost(host.id); }}
              title="Delete host"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="expand-icon">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="service-grid">
          {host.services.length > 0 ? (
            host.services.map((service) => (
              <ServiceCard
                key={service.id}
                {...service}
                onEdit={onEditService ? () => onEditService(service) : undefined}
                onDelete={onDeleteService ? () => onDeleteService(service.id) : undefined}
              />
            ))
          ) : (
            <div className="empty-services">
              <p>No services configured</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .host-group {
          margin-bottom: 32px;
        }

        .host-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .host-header:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.2);
        }

        .host-icon {
          width: 40px;
          height: 40px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .host-info {
          flex: 1;
        }

        .host-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .host-ip {
          font-size: 13px;
          color: var(--text-secondary);
          font-family: 'JetBrains Mono', monospace;
        }

        .host-count {
          font-size: 13px;
          color: var(--text-muted);
          padding: 4px 12px;
          background: var(--bg-tertiary);
          border-radius: 20px;
        }

        .host-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .host-header:hover .host-actions {
          opacity: 1;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .action-btn.add:hover {
          background: rgba(124, 92, 252, 0.15);
          color: var(--accent-primary);
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        .expand-icon {
          color: var(--text-muted);
        }

        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          padding-left: 24px;
          animation: fadeIn 0.2s ease;
        }

        .empty-services {
          grid-column: 1 / -1;
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--border-color);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
