import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Search, ChevronDown, ChevronRight, FileCode } from 'lucide-react'
import { portalApi, ApiGroup, ApiEndpoint } from '../services/portalApi'

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
        <span style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, border: `1px solid ${cfg.border}`, display: 'inline-block', minWidth: '60px', textAlign: 'center' }}>
            {method}
        </span>
    )
}

function EndpointRow({ ep }: { ep: ApiEndpoint }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
            <MethodBadge method={ep.method} />
            <code style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', flex: 1 }}>{ep.path}</code>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                {ep.file && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileCode size={12} />{ep.file.split('/').slice(-2).join('/')}{ep.line ? `:${ep.line}` : ''}</span>}
                {ep.controller && <span style={{ background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px' }}>{ep.controller}</span>}
            </div>
        </div>
    )
}

function GroupCard({ group }: { group: ApiGroup }) {
    const [open, setOpen] = useState(true)
    return (
        <div className="cr-card" style={{ marginBottom: 16 }}>
            <button 
                onClick={() => setOpen(o => !o)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: open ? '1px solid var(--border-default)' : 'none' }}
            >
                <code style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', flex: 1, textAlign: 'left' }}>{group.resource}</code>
                <span className="cr-severity cr-severity--info" style={{ marginRight: 12 }}>{group.count}</span>
                {open ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
            </button>
            {open && (
                <div>
                    {group.endpoints.map((ep, i) => <EndpointRow key={i} ep={ep} />)}
                </div>
            )}
        </div>
    )
}

const METHOD_FILTERS = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']

interface Props {
    projectId: string;
    commitHash: string;
}

const IntelligenceApisWidget: React.FC<Props> = ({ projectId, commitHash }) => {
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

    if (loading) return (
        <div className="cr-card">
            <div className="cr-loading" style={{ height: 200 }}><div className="cr-spinner" /></div>
        </div>
    )

    if (error) return (
        <div className="cr-card">
            <div className="cr-doc-empty">
                <Globe size={36} className="text-slate-300" style={{ opacity: 0.5, marginBottom: 12 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{error}</p>
            </div>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="cr-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search endpoints, controllers, files…"
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {METHOD_FILTERS.map(m => (
                        <button
                            key={m}
                            onClick={() => setMethodFilter(m)}
                            style={{
                                padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                ...(methodFilter === m ? (
                                    m === 'ALL' ? { background: 'var(--bg-active)', color: 'var(--text-primary)', borderColor: 'var(--border-active)' } :
                                    { background: METHOD_COLORS[m]?.bg, color: METHOD_COLORS[m]?.text, borderColor: METHOD_COLORS[m]?.border }
                                ) : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border-default)' })
                            }}
                        >
                            {m}
                        </button>
                    ))}
                </div>
                <span className="cr-severity cr-severity--info" style={{ marginLeft: 'auto' }}>{total} endpoints</span>
            </div>

            <div>
                {filtered.length === 0 ? (
                    <div className="cr-card">
                        <div className="cr-doc-empty">
                            <Globe size={28} className="text-slate-300" style={{ opacity: 0.5, marginBottom: 12 }} />
                            <p style={{ color: 'var(--text-muted)' }}>No endpoints match your filters.</p>
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
        </div>
    )
}

export default IntelligenceApisWidget
