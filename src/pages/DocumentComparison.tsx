import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { documentsApi, DocumentMetadata } from '../services/api'
import DashboardLayout from '../components/DashboardLayout'

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed'
  content: string
  lineNumber: { left?: number; right?: number }
}

// API Endpoint structure (matching DocumentViewer.tsx)
interface ApiEndpoint {
  key: string
  method: string
  path: string
  source_file: string
  summary: string
  parameters: string
  responses: string
}

interface ApiDocs {
  total_endpoints: number
  endpoints: ApiEndpoint[]
}

interface ApiDiff {
  added: ApiEndpoint[]
  removed: ApiEndpoint[]
  modified: Array<{
    key: string
    old: ApiEndpoint
    new: ApiEndpoint
    changes: string[]
  }>
  unchanged: ApiEndpoint[]
}

const DocumentComparison = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const version1 = searchParams.get('v1') || ''
  const version2 = searchParams.get('v2') || ''

  // State
  const [content1, setContent1] = useState<string | null>(null)
  const [content2, setContent2] = useState<string | null>(null)
  const [metadata1, setMetadata1] = useState<DocumentMetadata | null>(null)
  const [metadata2, setMetadata2] = useState<DocumentMetadata | null>(null)
  const [projectName, setProjectName] = useState<string>('')
  const [contentSource, setContentSource] = useState<'api' | 'api-reference' | 'summary' | 'readme' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedApis, setExpandedApis] = useState<Set<string>>(new Set())

  // Load both documents
  useEffect(() => {
    const loadDocuments = async () => {
      if (!id || !version1 || !version2) {
        setError('Missing version parameters')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const loadVersion = async (commit: string) => {
          const [apiRes, apiRefRes, summaryRes, readmeRes, metaRes] = await Promise.allSettled([
            documentsApi.get(id, commit),
            documentsApi.getApiReference(id, commit),
            documentsApi.getSummary(id, commit),
            documentsApi.getReadme(id, commit),
            documentsApi.getMetadata(id, commit),
          ])

          const apiContent = apiRes.status === 'fulfilled'
            ? (typeof apiRes.value.data.content === 'string'
              ? apiRes.value.data.content
              : JSON.stringify(apiRes.value.data.content, null, 2))
            : null
          const apiRefContent = apiRefRes.status === 'fulfilled' ? apiRefRes.value.data.content : null
          const summaryContent = summaryRes.status === 'fulfilled' ? summaryRes.value.data.content : null
          const readmeContent = readmeRes.status === 'fulfilled' ? readmeRes.value.data.content : null
          const metadata = metaRes.status === 'fulfilled'
            ? metaRes.value.data
            : (apiRes.status === 'fulfilled' ? apiRes.value.data.metadata : null)
          const project = apiRes.status === 'fulfilled' ? apiRes.value.data.projectName : ''

          return { apiContent, apiRefContent, summaryContent, readmeContent, metadata, project }
        }

        const [v1, v2] = await Promise.all([loadVersion(version1), loadVersion(version2)])

        const sourcePriority: Array<{ key: 'apiContent' | 'apiRefContent' | 'summaryContent' | 'readmeContent'; source: 'api' | 'api-reference' | 'summary' | 'readme' }> = [
          { key: 'apiContent', source: 'api' },
          { key: 'apiRefContent', source: 'api-reference' },
          { key: 'summaryContent', source: 'summary' },
          { key: 'readmeContent', source: 'readme' },
        ]

        // Compare the best common artifact type across both versions.
        const common = sourcePriority.find(({ key }) => Boolean(v1[key] && v2[key]))
        if (!common) {
          throw new Error('No comparable documentation artifact found between selected versions.')
        }

        setContentSource(common.source)
        setContent1(v1[common.key] as string)
        setContent2(v2[common.key] as string)
        setMetadata1(v1.metadata)
        setMetadata2(v2.metadata)
        setProjectName(v1.project || v2.project || '')

        if (!v1.metadata || !v2.metadata) {
          console.warn('Comparison loaded with partial metadata')
        }
      } catch (err: any) {
        const msg = err?.response?.data?.detail || err?.message || 'Failed to load documents'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [id, version1, version2])

  // Try to parse content as JSON
  const parsedDocs = useMemo(() => {
    let docs1: ApiDocs | null = null
    let docs2: ApiDocs | null = null

    try {
      if (content1) docs1 = JSON.parse(content1)
    } catch {
      docs1 = null
    }

    try {
      if (content2) docs2 = JSON.parse(content2)
    } catch {
      docs2 = null
    }

    // Only treat as API JSON diff when both versions are from API artifact source.
    const isJson = contentSource === 'api' && docs1 && Array.isArray(docs1.endpoints) && docs2 && Array.isArray(docs2.endpoints)

    return { docs1, docs2, isJson }
  }, [content1, content2, contentSource])

  // Compute API diff for JSON docs
  const apiDiff = useMemo<ApiDiff | null>(() => {
    if (!parsedDocs.isJson || !parsedDocs.docs1 || !parsedDocs.docs2) return null

    // Create maps for easier comparison by key
    const endpoints1 = new Map(parsedDocs.docs1.endpoints.map(e => [e.key, e]))
    const endpoints2 = new Map(parsedDocs.docs2.endpoints.map(e => [e.key, e]))

    const added: ApiEndpoint[] = []
    const removed: ApiEndpoint[] = []
    const modified: ApiDiff['modified'] = []
    const unchanged: ApiEndpoint[] = []

    // Find added endpoints (in docs2 but not in docs1)
    for (const [key, endpoint] of endpoints2.entries()) {
      if (!endpoints1.has(key)) {
        added.push(endpoint)
      }
    }

    // Find removed endpoints (in docs1 but not in docs2)
    for (const [key, endpoint] of endpoints1.entries()) {
      if (!endpoints2.has(key)) {
        removed.push(endpoint)
      }
    }

    // Find modified/unchanged endpoints
    for (const [key, oldEndpoint] of endpoints1.entries()) {
      if (endpoints2.has(key)) {
        const newEndpoint = endpoints2.get(key)!
        const changes = compareEndpoints(oldEndpoint, newEndpoint)

        if (changes.length > 0) {
          modified.push({ key, old: oldEndpoint, new: newEndpoint, changes })
        } else {
          unchanged.push(newEndpoint)
        }
      }
    }

    return { added, removed, modified, unchanged }
  }, [parsedDocs])

  // Compute line diff for markdown (fallback)
  const diffLines = useMemo(() => {
    if (!content1 || !content2 || parsedDocs.isJson) return []

    const lines1 = content1.split('\n')
    const lines2 = content2.split('\n')

    // Simple diff algorithm (LCS-based)
    return computeDiff(lines1, lines2)
  }, [content1, content2, parsedDocs.isJson])

  // Stats
  const stats = useMemo(() => {
    if (apiDiff) {
      return {
        added: apiDiff.added.length,
        removed: apiDiff.removed.length,
        modified: apiDiff.modified.length,
        unchanged: apiDiff.unchanged.length,
      }
    }
    const added = diffLines.filter(l => l.type === 'added').length
    const removed = diffLines.filter(l => l.type === 'removed').length
    const unchanged = diffLines.filter(l => l.type === 'unchanged').length
    return { added, removed, modified: 0, unchanged }
  }, [apiDiff, diffLines])

  // Toggle expanded API
  const toggleApi = (path: string) => {
    setExpandedApis(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }



  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET': return 'method-get'
      case 'POST': return 'method-post'
      case 'PUT': return 'method-put'
      case 'DELETE': return 'method-delete'
      case 'PATCH': return 'method-patch'
      default: return 'method-get'
    }
  }

  if (isLoading) return <DashboardLayout><div className="cr-page"><div className="cr-loading"><div className="cr-spinner" /></div></div></DashboardLayout>

  if (error) return (
    <DashboardLayout><div className="cr-page">
      <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--severity-critical-glow)', border: '1px solid var(--severity-critical)', fontSize: 13, color: 'var(--severity-critical)', marginBottom: 12 }}>{error}</div>
      <button className="cr-doc-btn" onClick={() => navigate(`/projects/${id}`)}>Back to Project</button>
    </div></DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="cr-page">
        {/* Breadcrumb */}
        <div className="cr-doc-breadcrumb" style={{ marginBottom: 16 }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-link)', cursor: 'pointer', fontSize: 12, padding: 0 }} onClick={() => navigate('/projects')}>Projects</button>
          <span>/</span>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-link)', cursor: 'pointer', fontSize: 12, padding: 0 }} onClick={() => navigate(`/projects/${id}`)}>{projectName}</button>
          <span>/</span>
          <strong>Compare</strong>
        </div>

        {/* Comparison header */}
        <div style={{ marginBottom: 16 }}>
          <h1 className="cr-page-title" style={{ marginBottom: 12 }}>Comparing Versions</h1>
          {contentSource && (
            <div style={{ marginBottom: 8 }}>
              <span className="cr-severity cr-severity--info">Comparing: {contentSource}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <span className="cr-commit-sha">{version1}</span>
              {metadata1 && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{metadata1.branch} · {metadata1.commit.substring(0, 7)}</span>}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>vs</span>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <span className="cr-commit-sha">{version2}</span>
              {metadata2 && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 8 }}>{metadata2.branch} · {metadata2.commit.substring(0, 7)}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stats.added > 0 && <span className="cr-severity cr-severity--low">+{stats.added} added</span>}
            {stats.removed > 0 && <span className="cr-severity cr-severity--critical">-{stats.removed} removed</span>}
            {stats.modified > 0 && <span className="cr-severity cr-severity--medium">~{stats.modified} modified</span>}
            {stats.unchanged > 0 && <span className="cr-severity cr-severity--info">{stats.unchanged} unchanged</span>}
            {stats.added === 0 && stats.removed === 0 && stats.modified === 0 && (
              <span className="cr-severity cr-severity--info">No changes detected</span>
            )}
          </div>
        </div>

        {/* API Diff */}
        {apiDiff && (
          <div className="cr-stack">
            {apiDiff.added.length > 0 && (
              <div className="cr-analysis-card cr-analysis-card--success">
                <div className="cr-analysis-card-header"><h4>Added ({apiDiff.added.length})</h4></div>
                <div style={{ padding: 8 }}>
                  {apiDiff.added.map(ep => (
                    <div key={ep.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }} className={getMethodColor(ep.method)}>{ep.method}</span>
                      <code style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{ep.path}</code>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{ep.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {apiDiff.removed.length > 0 && (
              <div className="cr-analysis-card cr-analysis-card--danger">
                <div className="cr-analysis-card-header"><h4>Removed ({apiDiff.removed.length})</h4></div>
                <div style={{ padding: 8 }}>
                  {apiDiff.removed.map(ep => (
                    <div key={ep.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }} className={getMethodColor(ep.method)}>{ep.method}</span>
                      <code style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{ep.path}</code>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{ep.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {apiDiff.modified.length > 0 && (
              <div className="cr-analysis-card">
                <div className="cr-analysis-card-header" style={{ background: 'var(--severity-medium-glow)', color: 'var(--severity-medium)' }}><h4>Modified ({apiDiff.modified.length})</h4></div>
                <div style={{ padding: 8 }}>
                  {apiDiff.modified.map(({ key, old, new: newEp, changes }) => {
                    const isExpanded = expandedApis.has(key)
                    return (
                      <div key={key} style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                        <div onClick={() => toggleApi(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer' }}>
                          <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }} className={getMethodColor(newEp.method)}>{newEp.method}</span>
                          <code style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', flex: 1 }}>{newEp.path}</code>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{isExpanded ? '▼' : '▶'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 4, padding: '0 8px 6px', flexWrap: 'wrap' }}>
                          {changes.map((c, i) => <span key={i} className="cr-severity cr-severity--medium" style={{ fontSize: 9 }}>{c}</span>)}
                        </div>
                        {isExpanded && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'var(--severity-critical-glow)' }}>
                              <h5 style={{ fontSize: 11, fontWeight: 700, color: 'var(--severity-critical)', marginBottom: 4 }}>Before</h5>
                              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{old.summary}</p>
                              {old.parameters && <pre style={{ fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', color: 'var(--text-muted)', margin: '4px 0' }}>{old.parameters}</pre>}
                              {old.responses && <pre style={{ fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', color: 'var(--text-muted)', margin: '4px 0' }}>{old.responses}</pre>}
                            </div>
                            <div style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'var(--accent-green-soft)' }}>
                              <h5 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 4 }}>After</h5>
                              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{newEp.summary}</p>
                              {newEp.parameters && <pre style={{ fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', color: 'var(--text-muted)', margin: '4px 0' }}>{newEp.parameters}</pre>}
                              {newEp.responses && <pre style={{ fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', color: 'var(--text-muted)', margin: '4px 0' }}>{newEp.responses}</pre>}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {apiDiff.unchanged.length > 0 && (
              <div className="cr-analysis-card">
                <div className="cr-analysis-card-header"><h4>Unchanged ({apiDiff.unchanged.length})</h4></div>
                <div style={{ padding: 8, opacity: 0.6 }}>
                  {apiDiff.unchanged.map(ep => (
                    <div key={ep.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
                      <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }} className={getMethodColor(ep.method)}>{ep.method}</span>
                      <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{ep.path}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Line diff */}
        {!apiDiff && (
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ flex: 1, borderRight: '1px solid var(--border-default)' }}>
              <div style={{ padding: '6px 12px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span className="cr-commit-sha">{version1}</span>
                {metadata1 && <span style={{ color: 'var(--text-muted)' }}>{new Date(metadata1.createdAt).toLocaleDateString()}</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: '20px' }}>
                {diffLines.map((line, i) => (
                  <div key={`l-${i}`} style={{ display: 'flex', background: line.type === 'removed' ? 'var(--severity-critical-glow)' : line.type === 'added' ? 'transparent' : 'transparent', minHeight: 20 }}>
                    <span style={{ width: 40, textAlign: 'right', padding: '0 8px', color: 'var(--text-muted)', userSelect: 'none', flexShrink: 0 }}>{line.lineNumber.left || ''}</span>
                    <span style={{ flex: 1, padding: '0 8px', color: line.type === 'removed' ? 'var(--severity-critical)' : 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {line.type !== 'added' ? line.content : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ padding: '6px 12px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span className="cr-commit-sha">{version2}</span>
                {metadata2 && <span style={{ color: 'var(--text-muted)' }}>{new Date(metadata2.createdAt).toLocaleDateString()}</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: '20px' }}>
                {diffLines.map((line, i) => (
                  <div key={`r-${i}`} style={{ display: 'flex', background: line.type === 'added' ? 'var(--accent-green-soft)' : line.type === 'removed' ? 'transparent' : 'transparent', minHeight: 20 }}>
                    <span style={{ width: 40, textAlign: 'right', padding: '0 8px', color: 'var(--text-muted)', userSelect: 'none', flexShrink: 0 }}>{line.lineNumber.right || ''}</span>
                    <span style={{ flex: 1, padding: '0 8px', color: line.type === 'added' ? 'var(--accent-green)' : 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {line.type !== 'removed' ? line.content : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="cr-doc-btn" onClick={() => navigate(`/projects/${id}`)}>Back to Project</button>
          <button className="cr-doc-btn" style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none' }}
            onClick={() => navigate(`/projects/${id}/docs/${encodeURIComponent(version1)}`)}>View {version1}</button>
          <button className="cr-doc-btn" style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none' }}
            onClick={() => navigate(`/projects/${id}/docs/${encodeURIComponent(version2)}`)}>View {version2}</button>
        </div>
      </div>
    </DashboardLayout>
  )
}

/**
 * Compare two API endpoints and return list of changes
 */
function compareEndpoints(old: ApiEndpoint, newEndpoint: ApiEndpoint): string[] {
  const changes: string[] = []

  // Check summary change
  if (old.summary !== newEndpoint.summary) {
    changes.push('Summary changed')
  }

  // Check params changes (string comparison)
  if ((old.parameters || '') !== (newEndpoint.parameters || '')) {
    changes.push('Parameters modified')
  }

  // Check responses changes (string comparison)
  if ((old.responses || '') !== (newEndpoint.responses || '')) {
    changes.push('Responses modified')
  }

  return changes
}

/**
 * Simple diff algorithm using Longest Common Subsequence
 */
function computeDiff(lines1: string[], lines2: string[]): DiffLine[] {
  const m = lines1.length
  const n = lines2.length

  // Build LCS table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find diff
  const result: DiffLine[] = []
  let i = m
  let j = n

  const items: { type: 'unchanged' | 'added' | 'removed'; content: string; i: number; j: number }[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      items.unshift({ type: 'unchanged', content: lines1[i - 1], i: i - 1, j: j - 1 })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      items.unshift({ type: 'added', content: lines2[j - 1], i: -1, j: j - 1 })
      j--
    } else if (i > 0) {
      items.unshift({ type: 'removed', content: lines1[i - 1], i: i - 1, j: -1 })
      i--
    }
  }

  // Build result with line numbers
  let leftNum = 1
  let rightNum = 1

  for (const item of items) {
    const line: DiffLine = {
      type: item.type,
      content: item.content,
      lineNumber: {}
    }

    if (item.type === 'unchanged') {
      line.lineNumber.left = leftNum++
      line.lineNumber.right = rightNum++
    } else if (item.type === 'removed') {
      line.lineNumber.left = leftNum++
    } else if (item.type === 'added') {
      line.lineNumber.right = rightNum++
    }

    result.push(line)
  }

  return result
}

export default DocumentComparison
