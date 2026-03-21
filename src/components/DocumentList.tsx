import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentsApi, DocumentVersion, FiltersResponse, SearchResult } from '../services/api'
import { Search, GitBranch, Tag, Upload, Trash2, Eye, ArrowLeftRight } from 'lucide-react'

interface DocumentListProps { projectId: string; canManage: boolean }

const selectStyle: React.CSSProperties = {
  padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
  background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontSize: 12, outline: 'none',
}
const inputStyle: React.CSSProperties = {
  ...selectStyle, flex: 1, color: 'var(--text-primary)', fontSize: 13,
}

const DocumentList = ({ projectId, canManage }: DocumentListProps) => {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<DocumentVersion[]>([])
  const [filters, setFilters] = useState<FiltersResponse>({ commits: [], branches: [], tags: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedCommit, setSelectedCommit] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({ commitHash: '', title: '', summary: '', branch: 'test', description: '', tags: '' })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deleteCommit, setDeleteCommit] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError(null)
      try {
        const [d, f] = await Promise.all([documentsApi.list(projectId), documentsApi.getFilters(projectId)])
        setDocuments(d.data.documents); setFilters(f.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load')
      } finally { setIsLoading(false) }
    }
    load()
  }, [projectId])

  const filteredDocuments = useMemo(() => documents.filter(doc => {
    if (!doc.metadata) return true
    if (selectedBranch && doc.metadata.branch !== selectedBranch) return false
    if (selectedCommit && doc.commit !== selectedCommit) return false
    if (selectedTags.length > 0) {
      const has = Array.isArray(doc.metadata?.tags) && selectedTags.some(t => doc.metadata?.tags.includes(t))
      if (!has) return false
    }
    return true
  }), [documents, selectedBranch, selectedCommit, selectedTags])

  const latestDoc = useMemo(() => filteredDocuments[0] || null, [filteredDocuments])

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return }
    setIsSearching(true); setError(null)
    try {
      const r = await documentsApi.search(projectId, searchQuery, { branch: selectedBranch || undefined, commit: selectedCommit || undefined, tags: selectedTags.length > 0 ? selectedTags : undefined })
      setSearchResults(r.data.results)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed')
    } finally { setIsSearching(false) }
  }
  const clearSearch = () => { setSearchQuery(''); setSearchResults(null) }
  const toggleCompare = (v: string) => {
    if (selectedForCompare.includes(v)) setSelectedForCompare(selectedForCompare.filter(x => x !== v))
    else if (selectedForCompare.length < 2) setSelectedForCompare([...selectedForCompare, v])
  }
  const startComparison = () => { if (selectedForCompare.length === 2) navigate(`/projects/${projectId}/compare?v1=${encodeURIComponent(selectedForCompare[0])}&v2=${encodeURIComponent(selectedForCompare[1])}`) }
  const clearFilters = () => { setSelectedBranch(''); setSelectedCommit(''); setSelectedTags([]) }
  const handleUploadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setUploadForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleTestUpload = async (e: React.FormEvent) => {
    e.preventDefault(); setUploadError(null)
    if (!uploadForm.commitHash.trim() || !uploadForm.title.trim()) { setUploadError('Commit hash and title required'); return }
    setIsUploading(true)
    try {
      await documentsApi.testUpload(projectId, { commitHash: uploadForm.commitHash, title: uploadForm.title, summary: uploadForm.summary || undefined, branch: uploadForm.branch || 'test', description: uploadForm.description || undefined, tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [] })
      const [d, f] = await Promise.all([documentsApi.list(projectId), documentsApi.getFilters(projectId)])
      setDocuments(d.data.documents); setFilters(f.data)
      setShowUploadModal(false); setUploadForm({ commitHash: '', title: '', summary: '', branch: 'test', description: '', tags: '' })
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Upload failed')
    } finally { setIsUploading(false) }
  }

  const handleDelete = async (commit: string) => {
    setIsDeleting(true)
    try {
      await documentsApi.delete(projectId, commit)
      const [d, f] = await Promise.all([documentsApi.list(projectId), documentsApi.getFilters(projectId)])
      setDocuments(d.data.documents); setFilters(f.data); setDeleteCommit(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Delete failed')
    } finally { setIsDeleting(false) }
  }

  if (isLoading) return <div className="cr-loading"><div className="cr-spinner" /></div>
  if (error) return <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--severity-critical-glow)', border: '1px solid var(--severity-critical)', fontSize: 13, color: 'var(--severity-critical)' }}>{error}</div>

  return (
    <div className="cr-stack">
      {/* Stats row */}
      <div className="cr-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="cr-stat-card"><div className="cr-stat-body"><span className="cr-stat-label">Total</span><span className="cr-stat-value">{documents.length}</span></div></div>
        <div className="cr-stat-card"><div className="cr-stat-body"><span className="cr-stat-label">Visible</span><span className="cr-stat-value">{filteredDocuments.length}</span></div></div>
        <div className="cr-stat-card"><div className="cr-stat-body"><span className="cr-stat-label">Latest</span><span className="cr-stat-value" style={{ fontSize: 14 }}>{latestDoc ? latestDoc.commit.substring(0, 7) : '—'}</span></div></div>
      </div>

      {/* Toolbar */}
      <div className="cr-card">
        <div className="cr-card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}><GitBranch size={10} /> Branch</span>
            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} style={selectStyle}>
              <option value="">All</option>
              {filters.branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Commit</span>
            <select value={selectedCommit} onChange={e => setSelectedCommit(e.target.value)} style={selectStyle}>
              <option value="">All</option>
              {filters.commits.map(c => <option key={c} value={c}>{c.substring(0, 7)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}><Tag size={10} /> Tags</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <select
                value=""
                onChange={e => {
                  const v = e.target.value
                  if (v && !selectedTags.includes(v)) setSelectedTags([...selectedTags, v])
                  e.target.value = ''
                }}
                style={selectStyle}
              >
                <option value="">{selectedTags.length > 0 ? `${selectedTags.length} selected` : 'All'}</option>
                {(filters.tags || []).filter(t => !selectedTags.includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {selectedTags.map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 3, background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {t}
                  <button onClick={() => setSelectedTags(selectedTags.filter(x => x !== t))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 11, padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          </div>
          {(selectedBranch || selectedCommit || selectedTags.length > 0) && <button className="cr-doc-btn" onClick={clearFilters}>Clear</button>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search docs..." style={inputStyle} />
              <button className="cr-doc-btn" onClick={handleSearch} disabled={isSearching}><Search size={12} /> {isSearching ? '...' : 'Go'}</button>
              {searchResults !== null && <button className="cr-doc-btn" onClick={clearSearch}>×</button>}
            </div>
            <button className={`cr-doc-btn ${compareMode ? 'cr-doc-btn--active' : ''}`} onClick={() => { setCompareMode(!compareMode); setSelectedForCompare([]) }}>
              <ArrowLeftRight size={12} /> {compareMode ? 'Cancel' : 'Compare'}
            </button>
            {compareMode && selectedForCompare.length === 2 && <button className="cr-doc-btn" style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none' }} onClick={startComparison}>Compare</button>}
            {canManage && <button className="cr-doc-btn" onClick={() => setShowUploadModal(true)}><Upload size={12} /> Upload</button>}
          </div>
        </div>
        {compareMode && <div style={{ padding: '4px 16px 8px', fontSize: 11, color: 'var(--text-muted)' }}>Select 2 versions to compare ({selectedForCompare.length}/2)</div>}
      </div>

      {/* Search results */}
      {searchResults !== null && (
        <div className="cr-card">
          <div className="cr-card-header"><h3 className="cr-card-title">Results for "{searchQuery}"</h3></div>
          {searchResults.length === 0 ? (
            <div className="cr-doc-empty">No results found</div>
          ) : (
            <div className="cr-settings-list" style={{ border: 'none', borderRadius: 0 }}>
              {searchResults.map((r, i) => (
                <div key={i} className="cr-settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <span className="cr-commit-sha">{r.commit.substring(0, 7)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.metadata?.branch || '-'}</span>
                    <button className="cr-doc-btn" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/projects/${projectId}/docs/${encodeURIComponent(r.commit)}`)}>View</button>
                  </div>
                  <pre style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {highlightMatch(r.snippet || '', searchQuery)}
                  </pre>
                  {r.matchCount > 1 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{r.matchCount - 1} more</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents list */}
      {searchResults === null && (
        filteredDocuments.length === 0 ? (
          <div className="cr-doc-empty">No documents found. {(selectedBranch || selectedCommit || selectedTags.length > 0) && 'Try adjusting filters.'}</div>
        ) : (
          <div className="cr-settings-list">
            {filteredDocuments.map(doc => (
              <div key={doc.commit} className="cr-settings-row" style={{ gap: 12 }}>
                {compareMode && (
                  <input type="checkbox" checked={selectedForCompare.includes(doc.commit)} onChange={() => toggleCompare(doc.commit)}
                    disabled={!selectedForCompare.includes(doc.commit) && selectedForCompare.length >= 2} />
                )}
                <span className="cr-commit-sha">{doc.commit.substring(0, 7)}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>
                  {doc.metadata?.branch ? (
                    <a href={doc.metadata.branchUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-link)', textDecoration: 'none' }}>{doc.metadata.branch}</a>
                  ) : '-'}
                </span>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {(doc.metadata?.tags || []).map(tag => <span key={tag} className="cr-severity cr-severity--info" style={{ fontSize: 9 }}>{tag}</span>)}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{doc.metadata?.createdAt ? new Date(doc.metadata.createdAt).toLocaleDateString() : '-'}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="cr-doc-btn" onClick={() => navigate(`/projects/${projectId}/docs/${encodeURIComponent(doc.commit)}`)}><Eye size={12} /> View</button>
                  {canManage && <button className="cr-token-btn" style={{ color: 'var(--severity-critical)' }} onClick={() => setDeleteCommit(doc.commit)}><Trash2 size={13} /></button>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowUploadModal(false)}>
          <div style={{ background: 'var(--bg-default)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 480, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Upload Test Document</h3>
              <button className="cr-token-btn" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <form onSubmit={handleTestUpload} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'commitHash', label: 'Commit Hash *', placeholder: 'abc123', autoFocus: true },
                { name: 'title', label: 'Title *', placeholder: 'Document Title' },
                { name: 'branch', label: 'Branch', placeholder: 'test' },
                { name: 'description', label: 'Description', placeholder: 'Brief description' },
                { name: 'tags', label: 'Tags (comma-separated)', placeholder: 'test, api, draft' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>{f.label}</label>
                  <input type="text" name={f.name} value={(uploadForm as any)[f.name]} onChange={handleUploadFormChange} placeholder={f.placeholder} autoFocus={f.autoFocus} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>Summary (Markdown)</label>
                <textarea name="summary" value={uploadForm.summary} onChange={handleUploadFormChange} placeholder="# Summary" rows={6}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              </div>
              {uploadError && <div style={{ fontSize: 12, color: 'var(--severity-critical)' }}>{uploadError}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="cr-doc-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="cr-doc-btn" style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none' }} disabled={isUploading}>{isUploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteCommit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setDeleteCommit(null)}>
          <div style={{ background: 'var(--bg-default)', border: '1px solid var(--severity-critical)', borderRadius: 'var(--radius-lg)', maxWidth: 380, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--severity-critical)' }}>Delete Document</h3>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px' }}>Delete <strong>{deleteCommit.substring(0, 7)}</strong>? This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="cr-doc-btn" onClick={() => setDeleteCommit(null)}>Cancel</button>
                <button className="cr-doc-btn" style={{ background: 'var(--severity-critical)', color: '#fff', border: 'none' }} onClick={() => handleDelete(deleteCommit)} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const highlightMatch = (text: string, query: string): JSX.Element => {
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return <>{parts.map((p, i) => p.toLowerCase() === query.toLowerCase() ? <mark key={i} style={{ background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)' }}>{p}</mark> : p)}</>
}

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default DocumentList
