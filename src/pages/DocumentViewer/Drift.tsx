import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { documentsApi } from '../../services/api'
import { ShieldAlert, CheckCircle } from 'lucide-react'

export default function DocumentDrift() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [drift, setDrift] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            try {
                const res = await documentsApi.getDrift(id, commit)
                setDrift(res.data?.drift || {})
            } catch (err) {
                console.warn('Drift report not found:', err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id, commit])

    if (isLoading) return <div className="cr-loading"><div className="cr-spinner" /></div>

    const issues = drift?.statistics?.total_issues || 0

    return (
        <div className="cr-page" style={{ padding: '24px 32px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Drift Detection</h2>

            <div className="cr-card" style={{ padding: '24px', textAlign: 'center' }}>
                {issues > 0 ? (
                    <>
                        <ShieldAlert size={48} color="var(--severity-high)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Drift Detected</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Analysis found {issues} areas where the documentation has drifted from the actual implementation.</p>
                    </>
                ) : (
                    <>
                        <CheckCircle size={48} color="var(--accent-green)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Architecture is in sync</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>No drift between code and documentation.</p>
                    </>
                )}
            </div>

            {issues > 0 && drift?.findings && (
                <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Drift Findings</h4>
                    {drift.findings.map((f: any, i: number) => (
                        <div key={i} className="cr-card" style={{ padding: '12px', marginBottom: '8px', borderLeft: `3px solid var(--severity-${f.severity || 'low'})` }}>
                            <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>{f.area}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{f.description}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
