import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import IntelligencePage from './IntelligencePage'
import DeveloperIntelligencePortal from './DeveloperIntelligencePortal'

const mocks = vi.hoisted(() => ({
  resolver: vi.fn(),
  appSelector: vi.fn(),
  appDispatch: vi.fn(() => vi.fn()),
  getReport: vi.fn(),
}))

vi.mock('../hooks/useIntelligenceViewResolver', () => ({
  useIntelligenceViewResolver: (...args: any[]) => mocks.resolver(...args),
}))

vi.mock('../store/hooks', () => ({
  useAppSelector: (...args: any[]) => mocks.appSelector(...args),
  useAppDispatch: () => mocks.appDispatch(),
}))

vi.mock('../services/api', () => ({
  intelligenceApi: {
    getReport: (...args: any[]) => mocks.getReport(...args),
    getDocs: vi.fn().mockResolvedValue({ data: 'ok' }),
    getDependencies: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

vi.mock('../store/slices/projectsSlice', () => ({ fetchProjects: () => ({ type: 'projects/fetch' }) }))

vi.mock('../components/DashboardLayout', () => ({ default: ({ children }: any) => <div>{children}</div> }))
vi.mock('../components/SearchBar', () => ({ default: () => <div>search</div> }))
vi.mock('../components/ExecutionFlow', () => ({ default: () => <div>flow</div> }))
vi.mock('../components/MarkdownViewer', () => ({ default: ({ content }: any) => <div>{String(content)}</div> }))
vi.mock('../components/CodeSearchPanel', () => ({ default: () => <div>code-search</div> }))
vi.mock('../components/DependencyGraphViewer', () => ({ default: () => <div>dep-graph</div> }))
vi.mock('../components/CallGraphViewer', () => ({ default: () => <div>call-graph</div> }))
vi.mock('../components/ArchitectureGraphViewer', () => ({ default: () => <div>arch-graph</div> }))
vi.mock('../components/SequenceDiagramViewer', () => ({ default: () => <div>sequence</div> }))

describe('intelligence pages resolver wiring', () => {
  beforeEach(() => {
    mocks.appSelector.mockImplementation((selector: any) => selector({ projects: { currentProject: { id: 'p1' }, projects: [], isLoading: false } }))
    mocks.getReport.mockResolvedValue({ data: { status: 'ok' } })
  })

  it('IntelligencePage shows resolved ref + commit with normalized badge', async () => {
    mocks.resolver.mockReturnValue({
      commitHash: 'deadbeef',
      activeView: { refName: 'main', commitHash: 'deadbeef' },
      state: 'published_partial',
      loading: false,
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/projects/p1/intelligence/overview']}>
        <Routes>
          <Route path="/projects/:id/intelligence/overview" element={<IntelligencePage type="overview" />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Published (Partial)')).toBeTruthy()
    expect(screen.getByText('main at deadbee')).toBeTruthy()
  })

  it('DeveloperIntelligencePortal renders status badge and resolved short SHA', async () => {
    mocks.resolver.mockReturnValue({
      loading: false,
      error: null,
      state: 'preview',
      activeView: { viewKey: 'branch/feature-x' },
      availableViews: [{ viewKey: 'branch/feature-x', refName: 'feature-x' }],
      commitHash: 'cafebabe',
      resolveView: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/projects/p1/intelligence']}>
        <Routes>
          <Route path="/projects/:id/intelligence" element={<DeveloperIntelligencePortal />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeTruthy()
      expect(screen.getByText('cafebab')).toBeTruthy()
    })
  })
})
