import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createProject } from '../store/slices/projectsSlice'
import DashboardLayout from '../components/DashboardLayout'
import { authApi, projectsApi, API_BASE_URL } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Github, Search, Star, GitFork, Lock, Globe, RefreshCw,
    Check, ChevronDown, Filter, ArrowUpDown, Loader2,
    ExternalLink, Zap, ArrowRight, X, Sparkles,
    Eye, BookOpen, CheckCircle2, AlertCircle, Clock
} from 'lucide-react'

interface GitHubRepo {
    id: number
    name: string
    fullName: string
    description: string | null
    htmlUrl: string
    private: boolean
    language: string | null
    stargazersCount: number
    forksCount: number
    updatedAt: string
    pushedAt: string
    defaultBranch: string
    owner: {
        login: string
        avatarUrl: string
        type: string
    }
    isAdded: boolean
}

type SortOption = 'updated' | 'name' | 'stars'
type FilterOption = 'all' | 'public' | 'private'

type RepoStatus = 'idle' | 'adding' | 'generating' | 'done' | 'error'

interface RepoStatusInfo {
    status: RepoStatus
    projectId?: string
    message?: string
}

interface ToastItem {
    id: string
    type: 'success' | 'error' | 'info'
    title: string
    message: string
    repoName: string
    projectId?: string
}

const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Scala: '#c22d40',
}

const Repositories = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    const [repos, setRepos] = useState<GitHubRepo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('updated')
    const [filterBy, setFilterBy] = useState<FilterOption>('all')
    const [showSortMenu, setShowSortMenu] = useState(false)
    const [showFilterMenu, setShowFilterMenu] = useState(false)
    const [hasGithub, setHasGithub] = useState(true)

    // Enhanced status tracking per repo
    const [repoStatuses, setRepoStatuses] = useState<Record<number, RepoStatusInfo>>({})

    // Toast notifications
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const toastTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

    const addToast = (toast: Omit<ToastItem, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
        setToasts(prev => [...prev, { ...toast, id }])
        toastTimeouts.current[id] = setTimeout(() => {
            removeToast(id)
        }, 6000)
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
        if (toastTimeouts.current[id]) {
            clearTimeout(toastTimeouts.current[id])
            delete toastTimeouts.current[id]
        }
    }

    const fetchRepos = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await authApi.getGitHubRepos({ sort: sortBy })
            setRepos(response.data.repos)
            setHasGithub(true)
        } catch (err: any) {
            const status = err.response?.status
            const detail = err.response?.data?.detail || 'Failed to load repositories'
            if (status === 400 || status === 401) {
                setHasGithub(false)
            }
            setError(detail)
        } finally {
            setLoading(false)
        }
    }, [sortBy])

    useEffect(() => {
        fetchRepos()
    }, [fetchRepos])

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(toastTimeouts.current).forEach(clearTimeout)
        }
    }, [])

    const handleAddRepo = async (repo: GitHubRepo) => {
        setRepoStatuses(prev => ({ ...prev, [repo.id]: { status: 'adding' } }))
        try {
            const result = await dispatch(
                createProject({
                    name: repo.name,
                    description: repo.description || undefined,
                    githubUrl: repo.htmlUrl,
                })
            )
            if (createProject.fulfilled.match(result)) {
                const projectId = result.payload.id
                const docTriggered = result.payload.docGenerationTriggered

                setRepos((prev) =>
                    prev.map((r) => (r.id === repo.id ? { ...r, isAdded: true } : r))
                )

                if (docTriggered) {
                    setRepoStatuses(prev => ({
                        ...prev,
                        [repo.id]: { status: 'generating', projectId }
                    }))
                    addToast({
                        type: 'info',
                        title: 'Generating documentation',
                        message: `AI is analyzing ${repo.name} and generating docs...`,
                        repoName: repo.name,
                        projectId,
                    })

                    // Simulate generation tracking — in prod this would poll an endpoint
                    setTimeout(() => {
                        setRepoStatuses(prev => ({
                            ...prev,
                            [repo.id]: { status: 'done', projectId }
                        }))
                        addToast({
                            type: 'success',
                            title: 'Documentation ready',
                            message: `${repo.name} docs generated successfully!`,
                            repoName: repo.name,
                            projectId,
                        })
                    }, 3000)
                } else {
                    setRepoStatuses(prev => ({
                        ...prev,
                        [repo.id]: { status: 'done', projectId }
                    }))
                    addToast({
                        type: 'success',
                        title: 'Project created',
                        message: `${repo.name} added to your projects.`,
                        repoName: repo.name,
                        projectId,
                    })
                }
            } else {
                setRepoStatuses(prev => ({
                    ...prev,
                    [repo.id]: { status: 'error', message: 'Failed to add' }
                }))
                addToast({
                    type: 'error',
                    title: 'Failed to add',
                    message: `Could not add ${repo.name}. Please try again.`,
                    repoName: repo.name,
                })
            }
        } catch {
            setRepoStatuses(prev => ({
                ...prev,
                [repo.id]: { status: 'error', message: 'Failed to add' }
            }))
        }
    }

    const handleGenerateDocs = async (repo: GitHubRepo) => {
        const repoStatus = repoStatuses[repo.id]
        if (!repoStatus?.projectId) return

        setRepoStatuses(prev => ({
            ...prev,
            [repo.id]: { ...prev[repo.id], status: 'generating' }
        }))

        try {
            await projectsApi.triggerDocGeneration(repoStatus.projectId)
            addToast({
                type: 'info',
                title: 'Regenerating docs',
                message: `AI is re-analyzing ${repo.name}...`,
                repoName: repo.name,
                projectId: repoStatus.projectId,
            })

            setTimeout(() => {
                setRepoStatuses(prev => ({
                    ...prev,
                    [repo.id]: { ...prev[repo.id], status: 'done' }
                }))
            }, 3000)
        } catch {
            setRepoStatuses(prev => ({
                ...prev,
                [repo.id]: { ...prev[repo.id], status: 'error', message: 'Generation failed' }
            }))
        }
    }

    const handleConnectGitHub = () => {
        const returnTo = '/repositories'
        window.location.href = `${API_BASE_URL}/auth/github?returnTo=${encodeURIComponent(returnTo)}`
    }

    // Filter & sort
    const filtered = repos
        .filter((r) => {
            if (filterBy === 'public' && r.private) return false
            if (filterBy === 'private' && !r.private) return false
            if (searchQuery) {
                const q = searchQuery.toLowerCase()
                return (
                    r.name.toLowerCase().includes(q) ||
                    r.fullName.toLowerCase().includes(q) ||
                    (r.description && r.description.toLowerCase().includes(q))
                )
            }
            return true
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'stars') return b.stargazersCount - a.stargazersCount
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        })

    const formatTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        if (days < 30) return `${days}d ago`
        const months = Math.floor(days / 30)
        return `${months}mo ago`
    }

    // Group repos by owner (like CodeRabbit)
    const groupedByOwner = filtered.reduce<Record<string, GitHubRepo[]>>((acc, repo) => {
        const key = repo.owner.login
        if (!acc[key]) acc[key] = []
        acc[key].push(repo)
        return acc
    }, {})

    const owners = Object.keys(groupedByOwner).sort((a, b) => {
        // Put user's own repos first
        if (a === user?.username) return -1
        if (b === user?.username) return 1
        return a.localeCompare(b)
    })

    const addedCount = repos.filter(r => r.isAdded).length
    const availableCount = repos.filter(r => !r.isAdded).length

    const renderRepoAction = (repo: GitHubRepo) => {
        const status = repoStatuses[repo.id]

        if (repo.isAdded || status?.status === 'done') {
            return (
                <div className="repo-action-group">
                    <span className="repo-added-badge">
                        <CheckCircle2 size={13} />
                        Added
                    </span>
                    {status?.projectId && (
                        <button
                            className="repo-view-btn"
                            onClick={(e) => { e.stopPropagation(); navigate(`/projects/${status.projectId}`) }}
                            title="View project"
                        >
                            <Eye size={12} />
                            View
                        </button>
                    )}
                    {status?.projectId && (
                        <button
                            className="repo-gen-btn"
                            onClick={(e) => { e.stopPropagation(); handleGenerateDocs(repo) }}
                            disabled={status?.status === 'generating'}
                            title="Regenerate documentation"
                        >
                            {status?.status === 'generating' ? (
                                <Loader2 size={12} className="repo-spin" />
                            ) : (
                                <Sparkles size={12} />
                            )}
                        </button>
                    )}
                </div>
            )
        }

        if (status?.status === 'adding') {
            return (
                <div className="repo-action-group">
                    <span className="repo-status-badge repo-status--adding">
                        <Loader2 size={13} className="repo-spin" />
                        Adding…
                    </span>
                </div>
            )
        }

        if (status?.status === 'generating') {
            return (
                <div className="repo-action-group">
                    <span className="repo-status-badge repo-status--generating">
                        <Sparkles size={13} className="repo-pulse" />
                        Generating docs…
                    </span>
                </div>
            )
        }

        if (status?.status === 'error') {
            return (
                <div className="repo-action-group">
                    <span className="repo-status-badge repo-status--error">
                        <AlertCircle size={13} />
                        Failed
                    </span>
                    <button
                        className="repo-add-btn repo-add-btn--retry"
                        onClick={() => handleAddRepo(repo)}
                    >
                        <RefreshCw size={12} />
                        Retry
                    </button>
                </div>
            )
        }

        return (
            <button
                className="repo-add-btn"
                onClick={() => handleAddRepo(repo)}
            >
                <Zap size={13} />
                Add & Generate
            </button>
        )
    }

    return (
        <DashboardLayout>
            <motion.div
                className="cr-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {/* Header */}
                <div className="cr-page-header">
                    <div>
                        <h1 className="cr-page-title">
                            <Github size={22} style={{ marginRight: 8, opacity: 0.7 }} />
                            Repositories
                        </h1>
                        <p className="cr-page-subtitle">
                            Select repositories to enable AI-powered documentation intelligence.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {addedCount > 0 && (
                            <button
                                className="repo-projects-btn"
                                onClick={() => navigate('/projects')}
                            >
                                <BookOpen size={14} />
                                {addedCount} Projects
                                <ArrowRight size={12} />
                            </button>
                        )}
                        <button
                            className="repo-refresh-btn"
                            onClick={fetchRepos}
                            disabled={loading}
                            title="Refresh repositories"
                        >
                            <RefreshCw size={14} className={loading ? 'repo-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Not connected state */}
                {(!user?.has_github || !hasGithub) && !loading && (
                    <div className="repo-connect-card">
                        <div className="repo-connect-icon">
                            <Github size={40} />
                        </div>
                        <h2>Connect your GitHub account</h2>
                        <p>
                            You've signed in with email/password. To enable AI-powered documentation
                            intelligence, you need to connect your GitHub account first.
                        </p>
                        <button className="repo-connect-btn" onClick={handleConnectGitHub}>
                            <Github size={18} />
                            Connect GitHub
                        </button>
                    </div>
                )}

                {/* Connected state */}
                {user?.has_github && hasGithub && (
                    <>
                        {/* Toolbar */}
                        <div className="repo-toolbar">
                            <div className="repo-search-wrap">
                                <Search size={14} className="repo-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search repositories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="repo-search-input"
                                />
                                {searchQuery && (
                                    <button
                                        className="repo-search-clear"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            <div className="repo-toolbar-actions">
                                {/* Filter dropdown */}
                                <div className="repo-dropdown-wrap">
                                    <button
                                        className="repo-toolbar-btn"
                                        onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false) }}
                                    >
                                        <Filter size={13} />
                                        {filterBy === 'all' ? 'All' : filterBy === 'public' ? 'Public' : 'Private'}
                                        <ChevronDown size={12} />
                                    </button>
                                    {showFilterMenu && (
                                        <div className="repo-dropdown-menu" onMouseLeave={() => setShowFilterMenu(false)}>
                                            {(['all', 'public', 'private'] as FilterOption[]).map((opt) => (
                                                <button
                                                    key={opt}
                                                    className={`repo-dropdown-item ${filterBy === opt ? 'active' : ''}`}
                                                    onClick={() => { setFilterBy(opt); setShowFilterMenu(false) }}
                                                >
                                                    {opt === 'all' ? 'All repos' : opt === 'public' ? 'Public only' : 'Private only'}
                                                    {filterBy === opt && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Sort dropdown */}
                                <div className="repo-dropdown-wrap">
                                    <button
                                        className="repo-toolbar-btn"
                                        onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false) }}
                                    >
                                        <ArrowUpDown size={13} />
                                        {sortBy === 'updated' ? 'Recently updated' : sortBy === 'name' ? 'Name' : 'Stars'}
                                        <ChevronDown size={12} />
                                    </button>
                                    {showSortMenu && (
                                        <div className="repo-dropdown-menu" onMouseLeave={() => setShowSortMenu(false)}>
                                            {([
                                                { key: 'updated', label: 'Recently updated' },
                                                { key: 'name', label: 'Name' },
                                                { key: 'stars', label: 'Most stars' },
                                            ] as { key: SortOption; label: string }[]).map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    className={`repo-dropdown-item ${sortBy === opt.key ? 'active' : ''}`}
                                                    onClick={() => { setSortBy(opt.key); setShowSortMenu(false) }}
                                                >
                                                    {opt.label}
                                                    {sortBy === opt.key && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats bar */}
                        <div className="repo-stats-bar">
                            <span className="repo-stat-pill">
                                <span className="repo-stat-dot repo-stat-dot--total" />
                                {filtered.length} repositories
                            </span>
                            <span className="repo-stats-sep">·</span>
                            <span className="repo-stat-pill">
                                <span className="repo-stat-dot repo-stat-dot--added" />
                                {addedCount} added
                            </span>
                            <span className="repo-stats-sep">·</span>
                            <span className="repo-stat-pill">
                                <span className="repo-stat-dot repo-stat-dot--available" />
                                {availableCount} available
                            </span>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="repo-loading">
                                <div className="repo-loading-anim">
                                    <Loader2 size={24} className="repo-spin" />
                                </div>
                                <span>Fetching your repositories…</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && hasGithub && (
                            <div className="repo-error">
                                <AlertCircle size={16} />
                                <p>{error}</p>
                                <button className="repo-toolbar-btn" onClick={fetchRepos}>Retry</button>
                            </div>
                        )}

                        {/* Repo list grouped by owner */}
                        {!loading && !error && (
                            <div className="repo-list-container">
                                {owners.length === 0 ? (
                                    <div className="repo-empty">
                                        <Search size={24} style={{ opacity: 0.3 }} />
                                        <p>No repositories found matching your search.</p>
                                    </div>
                                ) : (
                                    owners.map((ownerLogin) => (
                                        <div key={ownerLogin} className="repo-owner-group">
                                            <div className="repo-owner-header">
                                                <img
                                                    src={groupedByOwner[ownerLogin][0].owner.avatarUrl}
                                                    alt={ownerLogin}
                                                    className="repo-owner-avatar"
                                                />
                                                <span className="repo-owner-name">{ownerLogin}</span>
                                                <span className="repo-owner-count">
                                                    {groupedByOwner[ownerLogin].length}
                                                </span>
                                                <span className="repo-owner-added-count">
                                                    {groupedByOwner[ownerLogin].filter(r => r.isAdded || repoStatuses[r.id]?.status === 'done').length} added
                                                </span>
                                            </div>

                                            <div className="repo-items">
                                                <AnimatePresence mode="popLayout">
                                                    {groupedByOwner[ownerLogin].map((repo) => {
                                                        const status = repoStatuses[repo.id]
                                                        const isActive = status?.status === 'adding' || status?.status === 'generating'
                                                        return (
                                                            <motion.div
                                                                key={repo.id}
                                                                className={`repo-item ${repo.isAdded || status?.status === 'done' ? 'repo-item--added' : ''} ${isActive ? 'repo-item--active' : ''}`}
                                                                layout
                                                                initial={{ opacity: 0, y: 8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -8 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                {/* Generation progress bar */}
                                                                {status?.status === 'generating' && (
                                                                    <div className="repo-progress-bar">
                                                                        <div className="repo-progress-fill" />
                                                                    </div>
                                                                )}

                                                                <div className="repo-item-left">
                                                                    <div className="repo-item-name-row">
                                                                        {repo.private ? (
                                                                            <Lock size={13} className="repo-vis-icon repo-vis-private" />
                                                                        ) : (
                                                                            <Globe size={13} className="repo-vis-icon repo-vis-public" />
                                                                        )}
                                                                        <a
                                                                            href={repo.htmlUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="repo-item-name"
                                                                        >
                                                                            {repo.name}
                                                                        </a>
                                                                        <ExternalLink size={10} className="repo-external-icon" />
                                                                        {repo.defaultBranch && (
                                                                            <span className="repo-branch-badge">
                                                                                {repo.defaultBranch}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {repo.description && (
                                                                        <p className="repo-item-desc">{repo.description}</p>
                                                                    )}
                                                                    <div className="repo-item-meta">
                                                                        {repo.language && (
                                                                            <span className="repo-meta-lang">
                                                                                <span
                                                                                    className="repo-lang-dot"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            LANGUAGE_COLORS[repo.language] || 'var(--text-muted)',
                                                                                    }}
                                                                                />
                                                                                {repo.language}
                                                                            </span>
                                                                        )}
                                                                        {repo.stargazersCount > 0 && (
                                                                            <span className="repo-meta-stat">
                                                                                <Star size={11} /> {repo.stargazersCount.toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                        {repo.forksCount > 0 && (
                                                                            <span className="repo-meta-stat">
                                                                                <GitFork size={11} /> {repo.forksCount.toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                        <span className="repo-meta-time">
                                                                            <Clock size={10} />
                                                                            Updated {formatTimeAgo(repo.updatedAt)}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="repo-item-right">
                                                                    {renderRepoAction(repo)}
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Toast notifications */}
            <div className="repo-toast-container">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            className={`repo-toast repo-toast--${toast.type}`}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            layout
                        >
                            <div className="repo-toast-icon">
                                {toast.type === 'success' && <CheckCircle2 size={18} />}
                                {toast.type === 'error' && <AlertCircle size={18} />}
                                {toast.type === 'info' && <Sparkles size={18} className="repo-pulse" />}
                            </div>
                            <div className="repo-toast-content">
                                <strong className="repo-toast-title">{toast.title}</strong>
                                <span className="repo-toast-msg">{toast.message}</span>
                            </div>
                            <div className="repo-toast-actions">
                                {toast.projectId && (
                                    <button
                                        className="repo-toast-action-btn"
                                        onClick={() => navigate(`/projects/${toast.projectId}`)}
                                    >
                                        View <ArrowRight size={12} />
                                    </button>
                                )}
                                <button
                                    className="repo-toast-close"
                                    onClick={() => removeToast(toast.id)}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    )
}

export default Repositories
