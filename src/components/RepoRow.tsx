import React from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, Globe, ExternalLink, Star, GitFork, Clock, Loader2, 
  CheckCircle2, Sparkles, AlertCircle, RefreshCw, Zap, Eye 
} from 'lucide-react'
import { type GitHubRepo } from '../hooks/useRepositories'

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

interface RepoRowProps {
  repo: GitHubRepo
  status: any
  handleAddRepo: (repo: GitHubRepo) => void
  handleGenerateDocs: (repo: GitHubRepo) => void
  navigate: (path: string) => void
}

export const RepoRow: React.FC<RepoRowProps> = ({
  repo,
  status,
  handleAddRepo,
  handleGenerateDocs,
  navigate,
}) => {
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

  const renderRepoAction = () => {
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

  const isActive = status?.status === 'adding' || status?.status === 'generating'

  return (
    <motion.div
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
                  backgroundColor: LANGUAGE_COLORS[repo.language] || 'var(--text-muted)',
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
        {renderRepoAction()}
      </div>
    </motion.div>
  )
}
