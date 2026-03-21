import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GitPullRequest, ExternalLink, MessageSquare, CheckCircle } from 'lucide-react'

export default function DocumentPR() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [prInfo, setPrInfo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            setIsLoading(true)
            try {
                // Mock PR data for now, in real it would come from api
                // We'll simulate fetching it
                await new Promise(r => setTimeout(r, 500))
                setPrInfo({
                    number: 42,
                    title: 'Refactor core engine and update documentation',
                    author: 'kireeti-ai',
                    status: 'open',
                    createdAt: '2026-03-08T10:00:00Z',
                    url: 'https://github.com/kireeti-ai/ci-living-documentation/pull/42',
                    description: 'This PR refactors the core engine and updates the documentation generation logic to support multi-page views.',
                    reviews: [
                        { author: 'reviewer-1', status: 'approved', comment: 'Looks great!' },
                        { author: 'reviewer-2', status: 'commented', comment: 'Nice work on the UI spacing.' }
                    ],
                    checks: [
                        { name: 'EPIC-1 Analysis', status: 'success' },
                        { name: 'EPIC-2 Doc Gen', status: 'success' },
                        { name: 'Build / lint', status: 'success' }
                    ]
                })
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id, commit])

    if (isLoading) return <div className="cr-loading"><div className="cr-spinner" /></div>

    if (!prInfo) {
        return (
            <div className="cr-page-content" style={{ padding: 48, textAlign: 'center' }}>
                <GitPullRequest size={48} className="cr-text-muted" style={{ marginBottom: 16 }} />
                <h3>No Pull Request found</h3>
                <p className="cr-text-muted">This commit may not be associated with an open pull request.</p>
            </div>
        )
    }

    return (
        <div className="cr-page-content" style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <div className="cr-card" style={{ marginBottom: 24 }}>
                <div className="cr-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <GitPullRequest size={20} className="cr-text-success" />
                        <h2 className="cr-card-title" style={{ fontSize: 18 }}>
                            #{prInfo.number} {prInfo.title}
                        </h2>
                    </div>
                    <a href={prInfo.url} target="_blank" rel="noopener noreferrer" className="cr-btn cr-btn--secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        View on GitHub <ExternalLink size={14} />
                    </a>
                </div>
                <div className="cr-card-body" style={{ display: 'flex', gap: 24 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13 }}>
                            <span className="cr-tag cr-tag--success">{prInfo.status.toUpperCase()}</span>
                            <span className="cr-text-muted">
                                <strong>{prInfo.author}</strong> opened this PR on {new Date(prInfo.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="portal-markdown cr-markdown-small" style={{ background: 'var(--bg-default)', padding: 16, borderRadius: 8, border: '1px solid var(--border-default)' }}>
                            {prInfo.description}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <section className="cr-card">
                    <div className="cr-card-header">
                        <h3 className="cr-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle size={14} className="cr-text-success" /> Quality Checks
                        </h3>
                    </div>
                    <div className="cr-card-body" style={{ padding: 0 }}>
                        {prInfo.checks.map((check: any) => (
                            <div key={check.name} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13 }}>{check.name}</span>
                                <span className="cr-text-success" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <CheckCircle size={12} /> {check.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="cr-card">
                    <div className="cr-card-header">
                        <h3 className="cr-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MessageSquare size={14} className="cr-text-muted" /> Review Summary
                        </h3>
                    </div>
                    <div className="cr-card-body" style={{ padding: 0 }}>
                        {prInfo.reviews.map((review: any, i: number) => (
                            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{review.author}</span>
                                    <span className={review.status === 'approved' ? 'cr-text-success' : 'cr-text-muted'} style={{ fontSize: 11, fontWeight: 500 }}>
                                        {review.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="cr-text-muted" style={{ fontSize: 12, margin: 0 }}>"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
