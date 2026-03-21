import { useState } from 'react'
import { Building2, ShieldCheck, Loader2 } from 'lucide-react'
import { integrationsApi } from '../../../services/api'

export default function OrganizationIntegrationSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await integrationsApi.getGithubOrgInstallUrl()
      window.location.href = response.data.installUrl
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load GitHub App install URL')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="integrations" className="lp-section lp-org-section">
      <div className="lp-container">
        <div className="lp-org-card">
          <div className="lp-org-badge">
            <ShieldCheck size={16} />
            Organization-Level Integration
          </div>

          <h2 className="lp-org-title">Connect your GitHub organization securely using our GitHub App.</h2>

          <p className="lp-org-subtitle">Once installed, we automatically:</p>

          <ul className="lp-org-list">
            <li>Discover selected repositories</li>
            <li>Monitor push and pull request events</li>
            <li>Generate AI-powered documentation</li>
            <li>Validate architecture drift</li>
            <li>Post summaries directly to pull requests</li>
          </ul>

          <p className="lp-org-footnote">No personal access tokens required. Permissions are scoped and fully revocable.</p>

          <button className="lp-btn-primary lp-org-cta" onClick={handleConnect} disabled={loading}>
            {loading ? <Loader2 size={16} className="lp-spin" /> : <Building2 size={16} />}
            {loading ? 'Connecting...' : 'Connect GitHub Organization'}
          </button>

          {error ? <p className="lp-org-error">{error}</p> : null}
        </div>
      </div>
    </section>
  )
}
