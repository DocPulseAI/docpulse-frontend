import { renderHook, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useIntelligenceViewResolver } from './useIntelligenceViewResolver'

const mocks = vi.hoisted(() => ({
  getDefaultIntelligenceView: vi.fn(),
  getIntelligenceViews: vi.fn(),
  getIntelligenceView: vi.fn(),
}))

vi.mock('../services/api', () => ({
  projectsApi: {
    getDefaultIntelligenceView: mocks.getDefaultIntelligenceView,
    getIntelligenceViews: mocks.getIntelligenceViews,
    getIntelligenceView: mocks.getIntelligenceView,
  },
}))

const baseView = {
  projectId: 'p1',
  viewKey: 'default',
  commitHash: 'abc123',
  refName: 'main',
  refType: 'default_branch' as const,
  published: true,
  publishedAt: new Date().toISOString(),
  generatedAt: new Date().toISOString(),
  runStatus: 'succeeded' as const,
  source: 'published' as const,
}

describe('useIntelligenceViewResolver', () => {
  beforeEach(() => {
    mocks.getDefaultIntelligenceView.mockReset()
    mocks.getIntelligenceViews.mockReset()
    mocks.getIntelligenceView.mockReset()
  })

  it('first load resolves default intelligence view (no commit guessing)', async () => {
    mocks.getDefaultIntelligenceView.mockResolvedValue({ data: { view: baseView } })
    mocks.getIntelligenceViews.mockResolvedValue({ data: { views: [baseView] } })

    const { result } = renderHook(() => useIntelligenceViewResolver('p1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mocks.getDefaultIntelligenceView).toHaveBeenCalledWith('p1')
    expect(mocks.getIntelligenceViews).toHaveBeenCalledWith('p1')
    expect(result.current.activeView?.commitHash).toBe('abc123')
    expect(result.current.state).toBe('published_ok')
  })

  it('switching views updates ref/commit/status consistently', async () => {
    const branchView = {
      ...baseView,
      viewKey: 'branch/develop',
      commitHash: 'def456',
      refName: 'develop',
      refType: 'tracked_branch' as const,
      runStatus: 'partial' as const,
    }

    mocks.getDefaultIntelligenceView.mockResolvedValue({ data: { view: baseView } })
    mocks.getIntelligenceViews.mockResolvedValue({ data: { views: [baseView, branchView] } })
    mocks.getIntelligenceView.mockResolvedValue({ data: { view: branchView } })

    const { result } = renderHook(() => useIntelligenceViewResolver('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.resolveView('branch/develop')
    })

    expect(mocks.getIntelligenceView).toHaveBeenCalledWith('p1', 'branch/develop')
    expect(result.current.commitHash).toBe('def456')
    expect(result.current.refName).toBe('develop')
    expect(result.current.refType).toBe('tracked_branch')
    expect(result.current.runStatus).toBe('partial')
    expect(result.current.state).toBe('published_partial')
  })

  it('derives no_view when no default view exists', async () => {
    mocks.getDefaultIntelligenceView.mockResolvedValue({ data: { view: null } })
    mocks.getIntelligenceViews.mockResolvedValue({ data: { views: [] } })

    const { result } = renderHook(() => useIntelligenceViewResolver('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.state).toBe('no_view')
    expect(result.current.error).toContain('No published intelligence view')
  })

  it('derives preview for non-published active view', async () => {
    const previewView = { ...baseView, published: false, runStatus: 'running' as const, publishedAt: null }
    mocks.getDefaultIntelligenceView.mockResolvedValue({ data: { view: previewView } })
    mocks.getIntelligenceViews.mockResolvedValue({ data: { views: [previewView] } })

    const { result } = renderHook(() => useIntelligenceViewResolver('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.state).toBe('preview')
  })

  it('derives published_failed for failed durable run', async () => {
    const failedView = { ...baseView, runStatus: 'failed' as const }
    mocks.getDefaultIntelligenceView.mockResolvedValue({ data: { view: failedView } })
    mocks.getIntelligenceViews.mockResolvedValue({ data: { views: [failedView] } })

    const { result } = renderHook(() => useIntelligenceViewResolver('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.state).toBe('published_failed')
  })

  it('derives stale for old successful published view', async () => {
    const oldDate = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
    const staleView = { ...baseView, publishedAt: oldDate }
    mocks.getDefaultIntelligenceView.mockResolvedValue({ data: { view: staleView } })
    mocks.getIntelligenceViews.mockResolvedValue({ data: { views: [staleView] } })

    const { result } = renderHook(() => useIntelligenceViewResolver('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.state).toBe('stale')
  })
})
