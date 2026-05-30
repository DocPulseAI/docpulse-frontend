import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Server, Cpu, FileText, Scale, Sparkles, Database } from 'lucide-react'
import { API_BASE_URL } from '../services/api'
import './ServerWaker.css'

type ServiceStatus = 'checking' | 'waking_up' | 'ok' | 'error'

interface ServiceEntry {
  name: string
  label: string
  healthUrl: string
  status: ServiceStatus
}

// All service health endpoints — frontend pings each one directly in parallel
const SERVICE_HEALTH_URLS: ServiceEntry[] = [
  {
    name: 'backend',
    label: 'Backend API Gateway',
    healthUrl: `${API_BASE_URL}/health`,
    status: 'checking',
  },
  {
    name: 'database',
    label: 'Database Server',
    healthUrl: `${API_BASE_URL}/api/wake-db`,
    status: 'checking',
  },
  {
    name: 'epic1',
    label: 'Code Change Detector',
    healthUrl: 'https://code-intelligence.onrender.com/health',
    status: 'checking',
  },
  {
    name: 'epic2',
    label: 'Document Generator',
    healthUrl: 'https://documents-generator-32mg.onrender.com/health',
    status: 'checking',
  },
  {
    name: 'epic3',
    label: 'Drift Detector',
    healthUrl: 'https://drift-detection.onrender.com/health',
    status: 'checking',
  },
  {
    name: 'epic4',
    label: 'Change Summarizer',
    healthUrl: 'https://summary-codebase.onrender.com/health',
    status: 'checking',
  },
]

export default function ServerWaker() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [visible, setVisible] = useState(true)
  const [services, setServices] = useState<ServiceEntry[]>(SERVICE_HEALTH_URLS)
  const initialRunRef = useRef(true)
  const mountedRef = useRef(true)

  const allReady = services.every((s) => s.status === 'ok')

  // Keep track of mounted status
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Ping all services directly from the browser in parallel
  useEffect(() => {
    if (allReady) return

    const pingAll = async () => {
      const results = await Promise.all(
        services.map(async (service) => {
          if (service.status === 'ok') return service // already awake, skip
          try {
            if (service.name === 'database') {
              const response = await axios.get(service.healthUrl, {
                timeout: 6000,
                withCredentials: true,
              })
              const isDbReady = Boolean(response.data?.database?.ready)
              return {
                ...service,
                status: (isDbReady ? 'ok' : 'waking_up') as ServiceStatus,
              }
            }

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 6000)

            await fetch(service.healthUrl, {
              mode: 'no-cors',
              signal: controller.signal,
              cache: 'no-store',
            })

            clearTimeout(timeoutId)
            return { ...service, status: 'ok' as ServiceStatus }
          } catch {
            return { ...service, status: 'waking_up' as ServiceStatus }
          }
        })
      )
      if (mountedRef.current) {
        setServices(results)
      }
    }

    if (initialRunRef.current) {
      initialRunRef.current = false
      pingAll()
      return
    }

    const timerId = setTimeout(pingAll, 8000) // gentle 8-second interval to avoid rate limiting (429)

    return () => clearTimeout(timerId)
  }, [services, allReady])

  // Auto-dismiss after all services are ready
  useEffect(() => {
    if (!allReady) return

    const timeoutId = setTimeout(() => {
      setVisible(false)
    }, 4000)

    return () => clearTimeout(timeoutId)
  }, [allReady])

  if (!visible) return null

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'ok':
        return <span className="sw-badge sw-badge-ok">Online</span>
      case 'waking_up':
      case 'checking':
        return (
          <span className="sw-badge sw-badge-waking">
            <span className="sw-spinner-mini" />
            Waking...
          </span>
        )
      case 'error':
        return <span className="sw-badge sw-badge-error">Offline</span>
      default:
        return null
    }
  }

  const getServiceIcon = (name: string) => {
    const props = { size: 16, className: 'sw-service-icon-lucide' }
    switch (name) {
      case 'backend':
        return <Server {...props} />
      case 'database':
        return <Database {...props} />
      case 'epic1':
        return <Cpu {...props} />
      case 'epic2':
        return <FileText {...props} />
      case 'epic3':
        return <Scale {...props} />
      case 'epic4':
        return <Sparkles {...props} />
      default:
        return null
    }
  }

  const onlineCount = services.filter((s) => s.status === 'ok').length
  const wakePhase = allReady ? 'ready' : onlineCount > 0 ? 'waking_services' : 'checking_backend'

  const getOverallStatusText = () => {
    if (allReady) return 'All Systems Operational!'
    return `Waking services... (${onlineCount}/${services.length})`
  }

  return (
    <div className={`server-waker-container ${isCollapsed ? 'collapsed' : ''} ${wakePhase}`}>
      {/* Header */}
      <div className="sw-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="sw-title-area">
          <div className={`sw-pulse-dot ${wakePhase}`} />
          <span className="sw-title">{getOverallStatusText()}</span>
        </div>
        <div className="sw-controls">
          <button
            type="button"
            className="sw-collapse-btn"
            onClick={(e) => {
              e.stopPropagation()
              setIsCollapsed(!isCollapsed)
            }}
            title={isCollapsed ? 'Expand Status' : 'Minimize'}
          >
            {isCollapsed ? '▲' : '▼'}
          </button>
          <button
            type="button"
            className="sw-close-btn"
            onClick={(e) => {
              e.stopPropagation()
              setVisible(false)
            }}
            title="Dismiss Status"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="sw-body">
          <p className="sw-description">
            Waking up Render free-tier containers. This takes 30-50s but ensures a fully operational demo.
          </p>

          <div className="sw-services-list">
            {services.map((service) => (
              <div key={service.name} className={`sw-service-item status-${service.status}`}>
                <div className="sw-service-info">
                  {getServiceIcon(service.name)}
                  <span className="sw-service-name">{service.label}</span>
                </div>
                {getStatusBadge(service.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
