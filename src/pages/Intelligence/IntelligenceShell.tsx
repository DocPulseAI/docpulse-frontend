import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { fetchProjects } from '../../store/slices/projectsSlice'
import { useIntelligenceViewResolver } from '../../hooks/useIntelligenceViewResolver'
import {
    BarChart3, Layers, GitFork, Globe, Workflow,
    GitCommit, BookOpen, ChevronLeft, Sparkles, Hash
} from 'lucide-react'
import { portalApi } from '../../services/portalApi'
import './IntelligenceShell.css'

interface NavItem {
    id: string
    label: string
    icon: React.ReactNode
    badge?: string
    badgeColor?: 'red' | 'yellow' | 'blue'
}

const NAV_ITEMS: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'architecture', label: 'Architecture', icon: <Layers size={16} /> },
    { id: 'dependencies', label: 'Dependencies', icon: <GitFork size={16} /> },
    { id: 'apis', label: 'APIs', icon: <Globe size={16} /> },
    { id: 'callflow', label: 'Call Flow', icon: <Workflow size={16} /> },
    { id: 'changes', label: 'Changes', icon: <GitCommit size={16} /> },
    { id: 'docs', label: 'Documentation', icon: <BookOpen size={16} /> },
]

const IntelligenceShell: React.FC = () => {
    const { id: routeId } = useParams<{ id?: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()

    const { currentProject, projects } = useAppSelector((s: any) => s.projects)
    const projectId = routeId || currentProject?.id || searchParams.get('projectId') || ''

    const {
        loading: viewLoading,
        state: viewState,
        activeView,
        availableViews,
        commitHash,
        resolveView,
    } = useIntelligenceViewResolver(projectId)

    const [breakingCount, setBreakingCount] = useState<number | null>(null)
    const [cycleCount, setCycleCount] = useState<number | null>(null)

    useEffect(() => {
        if (projects.length === 0) dispatch(fetchProjects())
    }, [dispatch, projects.length])

    useEffect(() => {
        if (viewState === 'published_ok' && projectId && commitHash) {
            portalApi.getOverview(projectId, commitHash)
                .then(r => setBreakingCount(r.data.metrics.breakingChangesCount))
                .catch(() => setBreakingCount(null))
            portalApi.getDependencies(projectId, commitHash)
                .then(r => setCycleCount(r.data.circularDependencies?.length ?? 0))
                .catch(() => setCycleCount(null))
        } else {
            setBreakingCount(null)
            setCycleCount(null)
        }
    }, [projectId, commitHash, viewState])

    // Determine active section from URL
    const pathSegments = location.pathname.split('/')
    const lastSeg = pathSegments[pathSegments.length - 1]
    const activeSection = NAV_ITEMS.find(n => n.id === lastSeg)?.id ?? 'overview'

    const project = projects.find((p: any) => p.id === projectId) || currentProject

    const navigateTo = (section: string) => {
        const base = routeId
            ? `/projects/${routeId}/intelligence`
            : `/intelligence`
        navigate(`${base}/${section}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)
    }

    // If no projectId, redirect to overview which handles project selection
    if (!projectId) {
        return (
            <div className="intel-shell-no-project">
                <Sparkles size={32} className="text-blue-500 mb-4" />
                <h2>No project selected</h2>
                <p>Go to your projects and open Intelligence from there.</p>
                <button onClick={() => navigate('/projects')} className="intel-shell-btn-primary">
                    View Projects
                </button>
            </div>
        )
    }

    return (
        <div className="intel-shell">
            {/* ── Sidebar ── */}
            <aside className="intel-sidebar">
                {/* Back */}
                <button
                    className="intel-sidebar-back"
                    onClick={() => navigate(routeId ? `/projects/${routeId}` : '/projects')}
                >
                    <ChevronLeft size={14} />
                    <span>Back to Project</span>
                </button>

                {/* Project context */}
                <div className="intel-sidebar-project">
                    <div className="intel-sidebar-project-icon">
                        <Sparkles size={14} />
                    </div>
                    <div className="intel-sidebar-project-info">
                        <div className="intel-sidebar-project-name">
                            {project?.name ?? 'Project'}
                        </div>
                        {commitHash && (
                            <div className="intel-sidebar-commit">
                                <Hash size={10} />
                                {commitHash.slice(0, 7)}
                            </div>
                        )}
                    </div>
                </div>

                {/* View selector */}
                {availableViews.length > 1 && (
                    <div className="intel-sidebar-view-selector">
                        <label className="intel-sidebar-label">Branch / View</label>
                        <select
                            value={activeView?.viewKey ?? 'default'}
                            onChange={e => resolveView(e.target.value)}
                            className="intel-sidebar-select"
                        >
                            {availableViews.map((v: any) => (
                                <option key={v.viewKey} value={v.viewKey}>
                                    {v.viewKey === 'default' ? 'Default' : v.refName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Intelligence status */}
                <div className="intel-sidebar-status-row">
                    <span className={`intel-sidebar-status intel-sidebar-status--${viewState}`}>
                        {viewState === 'published_ok' ? '✅ Published' :
                            viewState === 'preview' ? '🟡 Preview' :
                                viewState === 'no_view' ? '⚪ No Data' : '⚪ ' + viewState}
                    </span>
                </div>

                {/* Nav */}
                <nav className="intel-sidebar-nav">
                    <div className="intel-sidebar-nav-label">INTELLIGENCE</div>
                    {NAV_ITEMS.map(item => {
                        let badgeText = item.badge
                        let badgeColor = item.badgeColor

                        if (item.id === 'changes' && breakingCount != null && breakingCount > 0) {
                            badgeText = `Breaking: ${breakingCount}`
                            badgeColor = 'red'
                        } else if (item.id === 'dependencies' && cycleCount != null && cycleCount > 0) {
                            badgeText = `${cycleCount} cycles`
                            badgeColor = 'yellow'
                        }

                        return (
                            <button
                                key={item.id}
                                className={`intel-sidebar-nav-item ${activeSection === item.id ? 'intel-sidebar-nav-item--active' : ''}`}
                                onClick={() => navigateTo(item.id)}
                            >
                                <span className="intel-sidebar-nav-icon">{item.icon}</span>
                                <span className="intel-sidebar-nav-label-text">{item.label}</span>
                                {badgeText && (
                                    <span className={`intel-sidebar-badge intel-sidebar-badge--${badgeColor ?? 'blue'}`}>
                                        {badgeText}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>
            </aside>

            {/* ── Main Content ── */}
            <main className="intel-shell-content">
                {viewLoading ? (
                    <div className="intel-shell-loading">
                        <div className="intel-shell-spinner" />
                        <p>Resolving intelligence view…</p>
                    </div>
                ) : (
                    <Outlet context={{ projectId, commitHash, viewState }} />
                )}
            </main>
        </div>
    )
}

export default IntelligenceShell
