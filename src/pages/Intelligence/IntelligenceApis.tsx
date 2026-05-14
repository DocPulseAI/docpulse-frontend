import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Search, ChevronDown, ChevronRight, FileCode } from 'lucide-react'
import { portalApi, ApiGroup, ApiEndpoint } from '../../services/portalApi'

const METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    GET:    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    POST:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    PUT:    { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    PATCH:  { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    DELETE: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
}

function MethodBadge({ method }: { method: string }) {
    const cfg = METHOD_COLORS[method] ?? { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' }
    return (
        <span className="intel-method-badge" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
            {method}
        </span>
    )
}

function EndpointRow({ ep }: { ep: ApiEndpoint }) {
    return (
        <div className="intel-api-row">
            <MethodBadge method={ep.method} />
            <code className="intel-api-path">{ep.path}</code>
            <div className="intel-api-meta">
                {ep.file && <span className="intel-api-file"><FileCode size={11} />{ep.file.split('/').slice(-2).join('/')}{ep.line ? `:${ep.line}` : ''}</span>}
                {ep.controller && <span className="intel-api-ctrl">{ep.controller}</span>}
            </div>
        </div>
    )
}

function GroupCard({ group }: { group: ApiGroup }) {
    const [open, setOpen] = useState(true)
    return (
        <div className="intel-api-group">
            <button className="intel-api-group-header" onClick={() => setOpen(o => !o)}>
                <code className="intel-api-resource">{group.resource}</code>
                <span className="intel-chip">{group.count}</span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {open && (
                <div className="intel-api-group-body">
                    {group.endpoints.map((ep, i) => <EndpointRow key={i} ep={ep} />)}
                </div>
            )}
        </div>
    )
}

const METHOD_FILTERS = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const IntelligenceApis: React.FC = () => {
    const { projectId, commitHash } = useOutletContext<{ projectId: string; commitHash: string }>()
    const [groups, setGroups] = useState<ApiGroup[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const [methodFilter, setMethodFilter] = useState('ALL')

    useEffect(() => {
        if (!projectId || !commitHash) return
        setLoading(true)
        portalApi.getApis(projectId, commitHash)
            .then(r => { setGroups(r.data.groups); setTotal(r.data.total) })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [projectId, commitHash])

    const filtered = groups
        .map(g => ({
            ...g,
            endpoints: g.endpoints.filter(ep => {
                const matchMethod = methodFilter === 'ALL' || ep.method === methodFilter
                const matchQuery = !query || ep.path.toLowerCase().includes(query.toLowerCase()) ||
                    ep.controller.toLowerCase().includes(query.toLowerCase()) ||
                    ep.file.toLowerCase().includes(query.toLowerCase())
                return matchMethod && matchQuery
            })
        }))
        .filter(g => g.endpoints.length > 0)

    return (
        <div className="intel-page">
            <div className="intel-page-header">
                <h1 className="intel-page-title">
                    <span className="intel-page-title-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}>
                        <Globe size={18} />
                    </span>
                    API Surface
                </h1>
                <p className="intel-page-subtitle">Complete endpoint inventory for this commit</p>
            </div>

            {loading ? (
                <div className="intel-section-card">
                    <div className="intel-section-card-body">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="intel-loading-skeleton" style={{ height: 48, marginBottom: 8 }} />
                        ))}
                    </div>
                </div>
            ) : error ? (
                <div className="intel-section-card">
                    <div className="intel-empty">
                        <Globe size={36} className="text-slate-300" />
                        <p>{error}</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="intel-api-toolbar">
                        <div className="intel-api-search-wrap">
                            <Search size={14} className="intel-api-search-icon" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search endpoints, controllers, files…"
                                className="intel-api-search"
                            />
                        </div>
                        <div className="intel-api-method-filters">
                            {METHOD_FILTERS.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMethodFilter(m)}
                                    className={`intel-api-method-btn ${methodFilter === m ? 'intel-api-method-btn--active' : ''}`}
                                    style={m !== 'ALL' && methodFilter === m ? {
                                        background: METHOD_COLORS[m]?.bg,
                                        color: METHOD_COLORS[m]?.text,
                                        borderColor: METHOD_COLORS[m]?.border,
                                    } : {}}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        <span className="intel-chip" style={{ marginLeft: 'auto' }}>{total} endpoints</span>
                    </div>

                    {/* Groups */}
                    <div className="intel-api-groups">
                        {filtered.length === 0 ? (
                            <div className="intel-section-card">
                                <div className="intel-empty">
                                    <Globe size={28} className="text-slate-300" />
                                    <p>No endpoints match your filters.</p>
                                </div>
                            </div>
                        ) : (
                            filtered.map((g, i) => (
                                <motion.div key={g.resource} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                    <GroupCard group={g} />
                                </motion.div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default IntelligenceApis
