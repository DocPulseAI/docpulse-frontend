import { useEffect, useState } from 'react'
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom'
import { GitBranch, Shield, Boxes, BookOpen, Activity, Layout as LayoutIcon, Download } from 'lucide-react'
import { documentsApi, DocumentMetadata } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'

export default function DocumentViewerLayout() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const navigate = useNavigate()

    const [metadata, setMetadata] = useState<DocumentMetadata | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            try {
                const res = await documentsApi.getMetadata(id, commit)
                setMetadata(res.data)
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to load document metadata')
            }
        }
        load()
    }, [id, commit])

    if (error) {
        return (
            <DashboardLayout>
                <div className="cr-page">
                    <div className="doc-error-banner">{error}</div>
                    <button className="cr-doc-btn" onClick={() => navigate(`/projects/${id}`)}>Back to Project</button>
                </div>
            </DashboardLayout>
        )
    }

    const tabs = [
        { to: 'overview', label: 'Overview', icon: <LayoutIcon size={16} /> },
        { to: 'architecture', label: 'Architecture', icon: <Boxes size={16} /> },
        { to: 'dependencies', label: 'Dependencies', icon: <GitBranch size={16} /> },
        { to: 'api', label: 'API Explorer', icon: <BookOpen size={16} /> },
        { to: 'data-model', label: 'Data Model', icon: <Boxes size={16} /> },
        { to: 'impact', label: 'Impact Analysis', icon: <Activity size={16} /> },
        { to: 'drift', label: 'Drift Detection', icon: <Shield size={16} /> },
        { to: 'adr', label: 'ADR', icon: <BookOpen size={16} /> },
    ]

    return (
        <DashboardLayout>
            <div className="doc-workspace-container cr-page cr-page--flush" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <div style={{ padding: '10px 24px 0', background: 'var(--bg-default)', borderBottom: '1px solid var(--border-default)' }}>
                    <div className="cr-doc-breadcrumb" style={{ marginBottom: 8 }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-link)', cursor: 'pointer', fontSize: 12, padding: 0 }} onClick={() => navigate(`/projects/${id}`)}>Projects</button>
                        <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>/</span>
                        <strong style={{ color: 'var(--text-primary)', fontSize: 12 }}>Developer Intelligence</strong>
                    </div>

                    <div className="cr-page-header" style={{ marginBottom: 12 }}>
                        <div>
                            <h1 className="cr-page-title" style={{ fontSize: 16 }}>{metadata?.title || 'Project Documentation'}</h1>
                            <p className="cr-page-subtitle" style={{ fontSize: 12 }}>
                                {metadata?.description || 'Explore generated architecture, APIs, and impact analyses.'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div className="cr-commit-sha" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 6px', fontSize: 11 }}>
                                <GitBranch size={11} />
                                {metadata?.branch || 'main'} · {(commit || '').slice(0, 8)}
                            </div>
                            <button
                                className="cr-btn cr-btn--primary"
                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '4px 10px' }}
                                onClick={async () => {
                                    if (!id || !commit) return
                                    try {
                                        const res = await documentsApi.downloadZip(id, commit)
                                        const url = window.URL.createObjectURL(new Blob([res.data]))
                                        const link = document.createElement('a')
                                        link.href = url
                                        link.setAttribute('download', `docs-${commit.slice(0, 8)}.zip`)
                                        document.body.appendChild(link)
                                        link.click()
                                        link.remove()
                                    } catch (err) {
                                        console.error('Download failed:', err)
                                        alert('Failed to download documents ZIP.')
                                    }
                                }}
                            >
                                <Download size={12} /> Download ZIP
                            </button>
                        </div>
                    </div>

                    {/* Removed Navigation Tabs from header */}
                </div>

                {/* Main Content Area with Sidebar */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Navigation Sidebar */}
                    <div style={{ width: '240px', borderRight: '1px solid var(--border-default)', background: 'var(--bg-default)', overflowY: 'auto', paddingTop: '16px' }}>
                        {metadata && (
                            <details style={{ 
                                margin: '0 12px 12px', 
                                padding: '10px 12px', 
                                background: 'var(--bg-subtle)', 
                                borderRadius: 'var(--radius-lg)', 
                                border: '1px solid var(--border-default)',
                                fontSize: '11px'
                            }}>
                                <summary style={{ 
                                    fontWeight: 600, 
                                    color: 'var(--text-primary)', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.05em', 
                                    cursor: 'pointer',
                                    outline: 'none',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>System Metadata</span>
                                    <span style={{ fontSize: '9px', opacity: 0.5, textTransform: 'none' }}>show</span>
                                </summary>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Project:</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Branch:</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{metadata.branch}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Commit:</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{(commit || '').slice(0, 8)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Version:</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{metadata.version || '1.0.0'}</span>
                                    </div>
                                </div>
                            </details>
                        )}
                        <nav style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {tabs.map((t) => (
                                <NavLink
                                    key={t.to}
                                    to={t.to}
                                    style={({ isActive }) => ({
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        background: isActive ? 'var(--bg-subtle)' : 'transparent',
                                        textDecoration: 'none', fontWeight: isActive ? 600 : 500,
                                        transition: 'all 0.1s ease'
                                    })}
                                >
                                    {t.icon}
                                    {t.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Child Page Content */}
                    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-canvas)' }}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
