import { useCallback, useEffect, useMemo, useState } from 'react'
import { projectsApi, type IntelligenceView } from '../services/api'

interface ResolverState {
  loading: boolean
  error: string | null
  activeView: IntelligenceView | null
  availableViews: IntelligenceView[]
}

export const useIntelligenceViewResolver = (projectId?: string | null) => {
  const [state, setState] = useState<ResolverState>({
    loading: false,
    error: null,
    activeView: null,
    availableViews: [],
  })

  const reload = useCallback(async () => {
    if (!projectId) {
      setState({ loading: false, error: null, activeView: null, availableViews: [] })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const [defaultRes, viewsRes] = await Promise.all([
        projectsApi.getDefaultIntelligenceView(projectId),
        projectsApi.getIntelligenceViews(projectId),
      ])

      const activeView = defaultRes.data.view || null
      const availableViews = viewsRes.data.views || []

      setState({
        loading: false,
        error: activeView ? null : 'No published intelligence view is available for this project yet.',
        activeView,
        availableViews,
      })
    } catch (err: any) {
      setState({
        loading: false,
        error: err?.response?.data?.detail || err?.message || 'Failed to resolve intelligence view',
        activeView: null,
        availableViews: [],
      })
    }
  }, [projectId])

  const resolveView = useCallback(async (viewKey: string) => {
    if (!projectId) return null

    setState((prev) => ({ ...prev, loading: true }))
    try {
      const response = await projectsApi.getIntelligenceView(projectId, viewKey)
      const nextView = response.data.view || null
      setState((prev) => ({
        ...prev,
        loading: false,
        activeView: nextView,
        error: nextView ? null : 'Selected intelligence view is not available.',
      }))
      return nextView
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.detail || err?.message || 'Failed to switch intelligence view',
      }))
      return null
    }
  }, [projectId])

  useEffect(() => {
    void reload()
  }, [reload])

  return useMemo(() => ({
    state:
      !state.activeView
        ? 'no_view'
        : state.activeView.published && state.activeView.runStatus === 'failed'
          ? 'published_failed'
          : state.activeView.published && state.activeView.runStatus === 'partial'
            ? 'published_partial'
            : state.activeView.published && state.activeView.runStatus === 'succeeded'
              ? ((state.activeView.publishedAt && ((Date.now() - new Date(state.activeView.publishedAt).getTime()) > 1000 * 60 * 60 * 24 * 14)) ? 'stale' : 'published_ok')
              : 'preview',
    ...state,
    commitHash: state.activeView?.commitHash || '',
    refName: state.activeView?.refName || '',
    refType: state.activeView?.refType || null,
    published: !!state.activeView?.published,
    runStatus: state.activeView?.runStatus || null,
    resolveView,
    reload,
  }), [state, resolveView, reload])
}
