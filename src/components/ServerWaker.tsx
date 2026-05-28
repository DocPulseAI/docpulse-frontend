import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Server, Cpu, FileText, Scale, Sparkles } from 'lucide-react'
import { API_BASE_URL } from '../services/api'
import './ServerWaker.css'

type ServiceStatus = 'checking' | 'waking_up' | 'ok' | 'error' | 'not_configured'

interface ServiceState {
  name: string
  label: string
  status: ServiceStatus
}

export default function ServerWaker() {
  const [backendAwake, setBackendAwake] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [visible, setVisible] = useState(true)
  const [wakeStatus, setWakeStatus] = useState<'checking_backend' | 'waking_services' | 'ready' | 'hidden'>('checking_backend')
  const [attempts, setAttempts] = useState(0)

  const [services, setServices] = useState<Record<string, ServiceState>>({
    backend: { name: 'backend', label: 'Backend API Gateway', status: 'checking' },
    epic1: { name: 'epic1', label: 'Epic-1: Code Change Detector', status: 'checking' },
    epic2: { name: 'epic2', label: 'Epic-2: Document Generator', status: 'checking' },
    epic3: { name: 'epic3', label: 'Epic-3: Drift Detector', status: 'checking' },
    epic4: { name: 'epic4', label: 'Epic-4: Change Summarizer', status: 'checking' },
  })

  // Phase 1: Check backend health
  useEffect(() => {
    if (wakeStatus !== 'checking_backend') return

    let intervalId: NodeJS.Timeout
    const checkBackend = async () => {
      try {
        setAttempts((prev) => prev + 1)
        const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 })
        if (response.status === 200) {
          setBackendAwake(true)
          setServices((prev) => ({
            ...prev,
            backend: { ...prev.backend, status: 'ok' },
          }))
          setWakeStatus('waking_services')
        }
      } catch (error) {
        // Backend still asleep
        setServices((prev) => ({
          ...prev,
          backend: { ...prev.backend, status: 'waking_up' },
        }))
      }
    }

    checkBackend()
    intervalId = setInterval(checkBackend, 3000)

    return () => clearInterval(intervalId)
  }, [wakeStatus])

  // Phase 2: Wake downstream services
  useEffect(() => {
    if (wakeStatus !== 'waking_services') return

    let intervalId: NodeJS.Timeout
    const wakeServices = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/wake`, { timeout: 9000 })
        if (response.data && response.data.services) {
          const apiServices = response.data.services
          setServices((prev) => {
            const updated = { ...prev }
            Object.keys(apiServices).forEach((key) => {
              if (updated[key]) {
                updated[key] = {
                  ...updated[key],
                  status: apiServices[key].status as ServiceStatus,
                }
              }
            })
            return updated
          })

          if (response.data.status === 'ready') {
            setWakeStatus('ready')
          }
        }
      } catch (error) {
        console.error('Error waking downstream services:', error)
      }
    }

    wakeServices()
    intervalId = setInterval(wakeServices, 4000)

    return () => clearInterval(intervalId)
  }, [wakeStatus])

  // Phase 3: Transition to hidden when ready
  useEffect(() => {
    if (wakeStatus !== 'ready') return

    const timeoutId = setTimeout(() => {
      setVisible(false)
      setWakeStatus('hidden')
    }, 4000)

    return () => clearTimeout(timeoutId)
  }, [wakeStatus])

  if (wakeStatus === 'hidden' || !visible) return null

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
      case 'not_configured':
      default:
        return <span className="sw-badge sw-badge-inactive">Ready</span>
    }
  }

  const getServiceIcon = (name: string) => {
    const props = { size: 16, className: 'sw-service-icon-lucide' }
    switch (name) {
      case 'backend':
        return <Server {...props} />
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

  // Determine overall status text
  const getOverallStatusText = () => {
    if (wakeStatus === 'checking_backend') {
      return `Waking up servers... (Attempt ${attempts})`
    }
    if (wakeStatus === 'waking_services') {
      return 'Spanning Epic pipelines...'
    }
    return 'All Systems Operational!'
  }

  return (
    <div className={`server-waker-container ${isCollapsed ? 'collapsed' : ''} ${wakeStatus}`}>
      {/* Header */}
      <div className="sw-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="sw-title-area">
          <div className={`sw-pulse-dot ${wakeStatus}`} />
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
            We are waking up the Render free-tier containers. This takes 30-50s but ensures a fully operational demo.
          </p>

          <div className="sw-services-list">
            {Object.values(services).map((service) => (
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
