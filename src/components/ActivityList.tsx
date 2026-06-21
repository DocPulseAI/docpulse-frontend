import React from 'react'
import { Card, EmptyState } from '../design-system'
import { FolderGit2 } from 'lucide-react'
import { SkeletonList } from './Skeleton'

// 1. Published Intelligence Panel
interface PublishedIntelligencePanelProps {
  intelligenceSummary: any[]
  navigate: (path: string) => void
}

export const PublishedIntelligencePanel: React.FC<PublishedIntelligencePanelProps> = ({
  intelligenceSummary,
  navigate
}) => {
  return (
    <Card
      title="Published Intelligence"
      isHoverable={false}
      className="p-0 overflow-hidden"
    >
      <div className="cr-card-body cr-card-body--flush" style={{ padding: 0 }}>
        {intelligenceSummary.length === 0 ? (
          <EmptyState
            title="No published views"
            description="Analyze a repository to generate intelligence views."
            actionLabel="Connect Repository"
            onAction={() => navigate('/repositories')}
          />
        ) : intelligenceSummary.slice(0, 6).map((item) => (
          <button
            key={`${item.projectId}-${item.viewKey}`}
            className="cr-list-item w-full text-left"
            onClick={() => navigate(`/projects/${item.projectId}?tab=intelligence`)}
          >
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: item.runStatus === 'failed' ? 'var(--severity-critical)' :
                item.runStatus === 'partial' ? 'var(--severity-medium)' : 'var(--accent-green)',
            }} />
            <span className="cr-list-primary">{item.projectName}</span>
            <span className="cr-list-secondary">{item.refName}</span>
            <span className={`cr-severity cr-severity--${item.runStatus === 'failed' ? 'high' : item.runStatus === 'partial' ? 'medium' : 'low'}`}>
              {item.viewKey}
            </span>
            <span className="cr-list-meta">{new Date(item.publishedAt).toLocaleDateString()}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

// 2. Recent Commits Panel
interface RecentCommitsPanelProps {
  recentCommits: any[]
  navigate: (path: string) => void
}

export const RecentCommitsPanel: React.FC<RecentCommitsPanelProps> = ({
  recentCommits,
  navigate
}) => {
  return (
    <Card
      title="Recent Commits"
      headerActions={
        <button className="text-xs text-accent hover:underline font-semibold bg-transparent border-none cursor-pointer" onClick={() => navigate('/commits')}>
          View all
        </button>
      }
      isHoverable={false}
      className="p-0 overflow-hidden"
    >
      <div className="cr-card-body cr-card-body--flush" style={{ padding: 0 }}>
        {recentCommits.length === 0 ? (
          <div className="cr-list-empty">No commits yet</div>
        ) : recentCommits.map(c => (
          <button key={c.sha} className="cr-list-item w-full text-left" onClick={() => navigate(`/commits?sha=${encodeURIComponent(c.sha)}`)}>
            <code className="cr-commit-sha">{c.sha}</code>
            <span className="cr-commit-msg">{c.msg}</span>
            <span className={`cr-severity cr-severity--${c.risk}`}>{c.risk}</span>
            <span className="cr-commit-time">{c.time}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

// 3. Drift Findings Panel
interface DriftFindingsPanelProps {
  driftFindings: any[]
}

export const DriftFindingsPanel: React.FC<DriftFindingsPanelProps> = ({ driftFindings }) => {
  return (
    <Card
      title="Drift Findings"
      isHoverable={false}
      className="p-0 overflow-hidden"
    >
      <div className="cr-card-body cr-card-body--flush" style={{ padding: 0 }}>
        {driftFindings.length === 0 ? (
          <div className="cr-list-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ color: 'var(--accent-green)', fontSize: 12 }}>✓</span> No drift findings
          </div>
        ) : driftFindings.map(f => (
          <div key={f.area} className="cr-list-item">
            <span className={`cr-dot cr-dot--${f.severity}`} />
            <span className="cr-drift-area">{f.area}</span>
            <span className={`cr-severity cr-severity--${f.severity}`}>{f.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// 4. Recent Projects Panel
interface RecentProjectsPanelProps {
  recentProjects: any[]
  projLoading: boolean
  navigate: (path: string) => void
}

export const RecentProjectsPanel: React.FC<RecentProjectsPanelProps> = ({
  recentProjects,
  projLoading,
  navigate
}) => {
  return (
    <Card
      title="Projects"
      headerActions={
        <button className="text-xs text-accent hover:underline font-semibold bg-transparent border-none cursor-pointer" onClick={() => navigate('/projects')}>
          View all
        </button>
      }
      isHoverable={false}
      className="p-0 overflow-hidden"
    >
      <div className="cr-card-body cr-card-body--flush" style={{ padding: 0 }}>
        {projLoading ? (
          <SkeletonList rows={3} />
        ) : recentProjects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create a project to start analyzing code."
            actionLabel="Create Project"
            onAction={() => navigate('/projects')}
          />
        ) : (
          recentProjects.map(p => (
            <button
              key={p.id}
              className="cr-list-item w-full text-left"
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)',
              }}>
                <FolderGit2 size={12} />
              </div>
              <span className="cr-list-primary">{p.name}</span>
              <span className="cr-list-secondary">{p.memberRole}</span>
              <span className="cr-list-meta">{new Date(p.updatedAt).toLocaleDateString()}</span>
            </button>
          ))
        )}
      </div>
    </Card>
  )
}
