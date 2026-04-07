import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, FolderGit2, Settings,
    AlertTriangle, Search, Command, User,
    LogOut, PanelLeft, Github, Sparkles
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'
import { dashboardApi, DashboardOverviewResponse, documentsApi } from '../services/api'


interface SidebarItem {
    to: string
    icon: React.ElementType
    label: string
    badge?: string
    adminOnly?: boolean
}

interface DashboardLayoutProps {
    children: React.ReactNode
}

const sidebarSections: SidebarItem[][] = [
    [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/projects', icon: FolderGit2, label: 'Projects' },
        { to: '/repositories', icon: Github, label: 'Repositories' },
    ],
    [
        { to: '/settings', icon: Settings, label: 'Settings', adminOnly: true },
        { to: '/profile', icon: User, label: 'Profile' },
    ],
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false)
    const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null)
    const { user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [docMetrics, setDocMetrics] = useState<{ drift: number; risk: number } | null>(null)

    const handleLogout = async () => {
        await dispatch(logout())
        navigate('/login')
    }

    useEffect(() => {
        const loadOverview = async () => {
            if (!user) return
            try {
                const response = await dashboardApi.getOverview()
                setOverview(response.data)
            } catch (error) {
                // Keep static layout behavior if metrics request fails.
            }
        }
        loadOverview()
    }, [user])

    useEffect(() => {
        const loadDocMetrics = async () => {
            const m = location.pathname.match(/^\/projects\/([^/]+)\/docs\/([^/]+)$/)
            if (!m) {
                setDocMetrics(null)
                return
            }
            const projectId = decodeURIComponent(m[1])
            const commit = decodeURIComponent(m[2])
            try {
                const response = await documentsApi.getDrift(projectId, commit)
                const drift = response.data?.drift || {}
                const total = Number(drift?.statistics?.total_issues || 0)
                const major = Number(drift?.statistics?.major || 0)
                const minor = Number(drift?.statistics?.minor || 0)
                const patch = Number(drift?.statistics?.patch || 0)
                const weighted = major * 12 + minor * 6 + patch * 2
                const driftScore = Math.max(0, Math.min(100, weighted))
                const riskScore = Math.max(0, Math.min(100, major * 20 + minor * 10 + patch * 4 + (total > 0 ? 10 : 0)))
                setDocMetrics({ drift: driftScore, risk: riskScore })
            } catch {
                setDocMetrics(null)
            }
        }
        loadDocMetrics()
    }, [location.pathname])

    const driftAlertCount = (overview?.driftFindings || [])
        .filter((item) => item.severity === 'critical' || item.severity === 'high')
        .length

    // Extract projectId for contextual navigation
    const projectPathMatch = location.pathname.match(/\/projects\/([^/]+)/)
    const projectId = projectPathMatch ? decodeURIComponent(projectPathMatch[1]) : null
    const isInProject = !!projectId && !location.pathname.startsWith('/repositories')
    const activeProjectTab = new URLSearchParams(location.search).get('tab')

    const projectSections: SidebarItem[][] = isInProject ? [
        [
            { to: `/projects/${projectId}`, icon: LayoutDashboard, label: 'Project Home' },
            { to: `/projects/${projectId}?tab=intelligence`, icon: Sparkles, label: 'Intelligence' },
            { to: `/projects/${projectId}/team`, icon: User, label: 'Team' },
        ]
    ] : []

    const combinedSections = [...projectSections, ...sidebarSections]

    return (
        <div className="cr-shell">
            {/* ── Top Navigation Bar ── */}
            <header className="cr-topbar">
                <div className="cr-topbar-left">
                    <button
                        className="cr-topbar-collapse"
                        onClick={() => setCollapsed(p => !p)}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <PanelLeft size={16} />
                    </button>
                    <Link to="/dashboard" className="cr-topbar-brand">
                        <Logo size={28} />
                        <span className="cr-brand-text">DocPulse</span>
                    </Link>

                    <span className="cr-topbar-sep" />
                    <span className="cr-topbar-project">{user?.username ?? 'Workspace'}</span>
                </div>

                <div className="cr-topbar-center">
                    <button className="cr-search-trigger" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
                        <Search size={14} />
                        <span>Search...</span>
                        <kbd><Command size={10} />K</kbd>
                    </button>
                </div>

                <div className="cr-topbar-right">
                    {docMetrics && (
                        <div className="cr-status-badges">
                            <span className="cr-badge cr-badge--warn">
                                <AlertTriangle size={11} />
                                Drift {docMetrics.drift}
                            </span>
                            <span className="cr-badge cr-badge--danger">
                                Risk {docMetrics.risk}
                            </span>
                        </div>
                    )}
                    <ThemeToggle size="sm" />
                    <div className="cr-avatar-menu">
                        <button className="cr-avatar" title={user?.email ?? ''}>
                            {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Sidebar ── */}
            <motion.aside
                className="cr-sidebar"
                animate={{ width: collapsed ? 52 : 200 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
                <nav className="cr-sidebar-nav">
                    {combinedSections.map((section, si) => (
                        <div key={si} className="cr-sidebar-section">
                            {section
                                .filter(item => !item.adminOnly || user?.role === 'admin')
                                .map(item => (
                                    <NavLink
                                        key={item.to + item.label}
                                        to={item.to}
                                        end={item.to.endsWith(projectId || '')}
                                        className={({ isActive }) => {
                                            const isProjectHomeLink = item.label === 'Project Home'
                                            const isIntelligenceLink = item.label === 'Intelligence'
                                            const linkActive = isIntelligenceLink
                                                ? isActive && activeProjectTab === 'intelligence'
                                                : isProjectHomeLink
                                                    ? isActive && activeProjectTab !== 'intelligence'
                                                    : isActive
                                            return `cr-sidebar-link ${linkActive ? 'cr-sidebar-link--active' : ''}`
                                        }}
                                        title={item.label}
                                    >
                                        <item.icon size={16} />
                                        {!collapsed && <span className="cr-sidebar-label">{item.label}</span>}
                                        {!collapsed && (item.badge || item.label === 'Drift') && (
                                            <span className="cr-sidebar-badge">{item.badge || String(driftAlertCount)}</span>
                                        )}
                                    </NavLink>
                                ))}
                        </div>
                    ))}
                </nav>

                <div className="cr-sidebar-bottom">
                    {!collapsed && (
                        <button className="cr-sidebar-link cr-sidebar-logout" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span className="cr-sidebar-label">Log out</span>
                        </button>
                    )}
                </div>
            </motion.aside>

            {/* ── Main Content ── */}
            <main
                className="cr-main"
                style={{ marginLeft: collapsed ? 52 : 200 }}
            >
                {children}
            </main>
        </div>
    )
}
