import React, { useEffect, useState, useRef } from 'react'
import { API_BASE_URL } from '../services/api'
import { CheckCircle2, XCircle, Clock, Loader2, Info, AlertTriangle } from 'lucide-react'

export interface TimelineEvent {
  message: string
  level: 'INFO' | 'WARN' | 'ERROR'
  timestamp: string
}

export interface ProgressState {
  runId: string
  status: string
  stage: string
  progress: number
  startedAt: string
  updatedAt: string
  currentTask: string
}

export const useRunEvents = (runId: string | undefined | null) => {
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!runId) return

    const token = localStorage.getItem('access_token')
    const url = `${API_BASE_URL}/api/runs/${runId}/events?token=${token}`
    
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        if (parsed.type === 'PROGRESS_UPDATE') {
          setProgress(parsed.data)
        } else if (parsed.type === 'TIMELINE_EVENT') {
          setEvents(prev => {
            // deduplicate or just append
            const exists = prev.some(ev => ev.timestamp === parsed.data.timestamp && ev.message === parsed.data.message)
            if (exists) return prev
            return [parsed.data, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          })
        }
      } catch (err) {
        console.error('Failed to parse SSE', err)
      }
    }

    es.onerror = () => {
      setError('Connection to event stream lost. Reconnecting...')
      // EventSource auto-reconnects, but we can set an error state
    }

    return () => {
      es.close()
    }
  }, [runId])

  return { progress, events, error }
}

export const AnalysisTimeline = ({ runId }: { runId: string }) => {
  const { events } = useRunEvents(runId)

  return (
    <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Event Timeline</h3>
      {events.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Waiting for events...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto' }}>
          {events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
              <div style={{ marginTop: 2 }}>
                {ev.level === 'INFO' && <Info size={14} color="#60a5fa" />}
                {ev.level === 'WARN' && <AlertTriangle size={14} color="#fbbf24" />}
                {ev.level === 'ERROR' && <XCircle size={14} color="#f87171" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary)' }}>{ev.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
