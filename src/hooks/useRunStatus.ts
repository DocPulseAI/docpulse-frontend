import { useState, useEffect, useRef, useCallback } from 'react'
import { projectsApi, type RunStatusResponse } from '../services/api'

interface UseRunStatusResult {
  data: RunStatusResponse | null
  loading: boolean
  error: string | null
  isTerminal: boolean
  /** Manually trigger a single poll without waiting for the interval */
  refresh: () => void
}

const POLL_INTERVAL_MS = 3_000
const MAX_POLLS = 300 // ~15 minutes of polling before giving up

/**
 * Polls GET /projects/:projectId/runs/:runId/status every 3 seconds.
 * Automatically stops when the run reaches a terminal state (completed/failed/cancelled).
 * Also stops after MAX_POLLS to prevent infinite polling.
 */
export const useRunStatus = (
  projectId: string | null | undefined,
  runId: string | null | undefined,
): UseRunStatusResult => {
  const [data, setData] = useState<RunStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTerminal, setIsTerminal] = useState(false)

  const pollCountRef = useRef(0)
  const activeRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(async () => {
    if (!projectId || !runId) return
    if (!activeRef.current) return

    try {
      const response = await projectsApi.getRunStatus(projectId, runId)
      if (!activeRef.current) return

      setData(response.data)
      setError(null)

      if (response.data.isTerminal) {
        setIsTerminal(true)
        // Stop polling on terminal state
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        activeRef.current = false
      }
    } catch (err: any) {
      if (!activeRef.current) return
      const message = err?.response?.data?.detail || err?.message || 'Failed to fetch run status'
      setError(message)
    }

    pollCountRef.current += 1
    if (pollCountRef.current >= MAX_POLLS && !isTerminal) {
      // Safety: stop polling after max duration
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      activeRef.current = false
      setError('Polling timeout reached. The run may still be in progress in the background.')
    }
  }, [projectId, runId, isTerminal])

  const refresh = useCallback(() => {
    void fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!projectId || !runId) {
      setData(null)
      setLoading(false)
      setError(null)
      setIsTerminal(false)
      return
    }

    // Reset state for new run
    setData(null)
    setLoading(true)
    setIsTerminal(false)
    setError(null)
    pollCountRef.current = 0
    activeRef.current = true

    // Initial fetch immediately
    fetchStatus().finally(() => {
      if (activeRef.current) setLoading(false)
    })

    // Set up polling interval
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS)

    return () => {
      activeRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [projectId, runId]) // intentionally not including fetchStatus to avoid re-creating interval

  return { data, loading, error, isTerminal, refresh }
}
