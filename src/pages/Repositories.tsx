import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { SkeletonRepoGroup } from '../components/Skeleton'
import { useRepositories } from '../hooks/useRepositories'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Search, RefreshCw, AlertCircle, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { RepoConnectCard } from '../components/RepoConnectCard'
import { RepoToolbar } from '../components/RepoToolbar'
import { RepoRow } from '../components/RepoRow'

const Repositories = () => {
    const navigate = useNavigate()
    const {
        loading,
        error,
        hasGithub,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        filterBy,
        setFilterBy,
        repoStatuses,
        toasts,
        removeToast,
        fetchRepos,
        handleAddRepo,
        handleGenerateDocs,
        handleConnectGitHub,
        groupedByOwner,
        owners,
        addedCount,
        availableCount,
        user,
    } = useRepositories()

    const [showSortMenu, setShowSortMenu] = useState(false)
    const [showFilterMenu, setShowFilterMenu] = useState(false)

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
                                <Github size={14} />
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
                    <RepoConnectCard handleConnectGitHub={handleConnectGitHub} />
                )}

                {/* Connected state */}
                {user?.has_github && hasGithub && (
                    <>
                        {/* Toolbar */}
                        <RepoToolbar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            filterBy={filterBy}
                            setFilterBy={setFilterBy}
                            showSortMenu={showSortMenu}
                            setShowSortMenu={setShowSortMenu}
                            showFilterMenu={showFilterMenu}
                            setShowFilterMenu={setShowFilterMenu}
                        />

                        {/* Stats bar */}
                        <div className="repo-stats-bar">
                            <span className="repo-stat-pill">
                                <span className="repo-stat-dot repo-stat-dot--total" />
                                {availableCount + addedCount} repositories
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

                        {/* Loading — skeleton cards */}
                        {loading && (
                            <div style={{ marginTop: 4 }}>
                                {[0, 1].map((i) => (
                                    <SkeletonRepoGroup key={i} count={3} />
                                ))}
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
                                    <div className="cr-empty" style={{ paddingTop: 64 }}>
                                        <div className="cr-empty-icon"><Search size={22} /></div>
                                        <p className="cr-empty-title">No repositories found</p>
                                        <p className="cr-empty-body">Try adjusting your search or filter settings.</p>
                                        {searchQuery && (
                                            <div className="cr-empty-cta">
                                                <button className="cr-doc-btn" style={{ padding: '6px 14px' }} onClick={() => setSearchQuery('')}>
                                                    Clear search
                                                </button>
                                            </div>
                                        )}
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
                                                        return (
                                                            <RepoRow
                                                                key={repo.id}
                                                                repo={repo}
                                                                status={status}
                                                                handleAddRepo={handleAddRepo}
                                                                handleGenerateDocs={handleGenerateDocs}
                                                                navigate={navigate}
                                                            />
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
