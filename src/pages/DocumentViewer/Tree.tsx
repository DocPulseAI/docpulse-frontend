import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { documentsApi } from '../../services/api'

export default function DocumentTree() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [treeContent, setTreeContent] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            try {
                const res = await documentsApi.getTree(id, commit)
                setTreeContent(res.data.content)
            } catch (err) {
                console.error('Failed to load tree:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id, commit])

    if (loading) return <div className="cr-doc-loading">Loading file tree...</div>

    return (
        <div className="cr-page-content" style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <section className="cr-card">
                <div className="cr-card-header">
                    <h3 className="cr-card-title">Repository File Structure</h3>
                </div>
                <div className="cr-card-body">
                    {treeContent ? (
                        <pre style={{
                            fontSize: 12,
                            fontFamily: 'monospace',
                            lineHeight: 1.5,
                            color: 'var(--text-primary)',
                            background: 'var(--bg-default)',
                            padding: 16,
                            borderRadius: 4,
                            border: '1px solid var(--border-default)',
                            overflowX: 'auto'
                        }}>
                            {treeContent}
                        </pre>
                    ) : (
                        <div className="cr-doc-empty">
                            <p>No file tree generated for this commit.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
