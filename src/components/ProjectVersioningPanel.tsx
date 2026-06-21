import React from 'react'
import { History, GitBranch, Tag, Eye } from 'lucide-react'
import { DocumentVersion } from '../services/api'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)', background: 'var(--bg-subtle)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

interface ProjectVersioningPanelProps {
  docVersions: DocumentVersion[]
  versionsLoading: boolean
  versionFilter: string
  setVersionFilter: (v: string) => void
  filteredVersions: DocumentVersion[]
  currentProject: any
  handleTabChange: (tab: any) => void
  navigate: (path: string) => void
}

export const ProjectVersioningPanel: React.FC<ProjectVersioningPanelProps> = ({
  docVersions,
  versionsLoading,
  versionFilter,
  setVersionFilter,
  filteredVersions,
  currentProject,
  handleTabChange,
  navigate,
}) => {
  return (
    <div className="cr-stack">
      <div className="cr-card">
        <div className="cr-card-header">
          <h3 className="cr-card-title"><History size={14} /> Documentation Versions</h3>
          <span className="cr-card-meta">{docVersions.length} versions</span>
        </div>
        <div className="cr-card-body" style={{ padding: '8px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="text" value={versionFilter} onChange={e => setVersionFilter(e.target.value)} placeholder="Filter by commit, branch, tag..."
              style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filteredVersions.length} shown</span>
          </div>
        </div>
      </div>

      {versionsLoading ? (
        <div className="cr-loading"><div className="cr-spinner" /></div>
      ) : filteredVersions.length === 0 ? (
        <div className="cr-doc-empty">No document versions found.</div>
      ) : (
        <div className="cr-settings-list">
          {filteredVersions.map((doc, idx) => {
            const isLatest = idx === 0
            return (
              <div key={doc.commit} className="cr-settings-row" style={{ gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                  <span className="cr-commit-sha">{doc.commit.substring(0, 7)}</span>
                  {isLatest && <span className="cr-severity cr-severity--low" style={{ fontSize: 9 }}>LATEST</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 120 }}>
                  {doc.metadata?.branch && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                      <GitBranch size={11} />
                      {doc.metadata.branchUrl ? (
                        <a href={doc.metadata.branchUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-link)', textDecoration: 'none' }}>{doc.metadata.branch}</a>
                      ) : doc.metadata.branch}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {doc.metadata?.version && (
                    <span className="cr-severity cr-severity--info" style={{ fontSize: 9 }}>v{doc.metadata.version}</span>
                  )}
                  {(doc.metadata?.tags || []).map(tag => (
                    <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)' }}>
                      <Tag size={8} />{tag}
                    </span>
                  ))}
                </div>

                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {doc.metadata?.createdAt ? new Date(doc.metadata.createdAt).toLocaleDateString() : '—'}
                </span>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="cr-doc-btn" onClick={() => navigate(`/projects/${currentProject.id}/docs/${encodeURIComponent(doc.commit)}`)}>
                    <Eye size={11} /> View
                  </button>
                  {filteredVersions.length >= 2 && idx > 0 && (
                    <button className="cr-doc-btn" onClick={() =>
                      navigate(`/projects/${currentProject.id}/compare?v1=${encodeURIComponent(filteredVersions[0].commit)}&v2=${encodeURIComponent(doc.commit)}`)
                    }>
                      Diff vs Latest
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Version comparison helper */}
      {filteredVersions.length >= 2 && (
        <div className="cr-card">
          <div className="cr-card-header"><h3 className="cr-card-title">Quick Compare</h3></div>
          <div className="cr-card-body" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Compare two versions:</span>
            <button className="cr-doc-btn" onClick={() => handleTabChange('documents')}>
              Open Documents → Compare Mode
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
