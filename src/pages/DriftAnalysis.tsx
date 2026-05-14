import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchProjects } from '../store/slices/projectsSlice'
import { documentsApi, DocumentVersion, projectsApi } from '../services/api'
import { AlertTriangle, Shield, Activity } from 'lucide-react'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const severityBase: Record<string, number> = {
  MAJOR: 80,
  MINOR: 55,
  PATCH: 25,
}

type ArtifactHealth = {
  id: 'summary' | 'readme' | 'api_reference' | 'api_description' | 'architecture'
  label: string
  exists: boolean
  health: number
  status: 'healthy' | 'warning' | 'critical' | 'missing'
  driftPart: string
}

const computeScores = (metadata: DocumentVersion['metadata']) => {
  if (!metadata) return { drift: 0, risk: 0, health: 0, findings: [] as string[] }
  const tagText = (metadata.tags || []).join(' ').toLowerCase()
  const title = (metadata.title || '').toLowerCase()
  const ageDays = Math.floor((Date.now() - new Date(metadata.updatedAt).getTime()) / (1000 * 60 * 60 * 24))

  let drift = clamp(ageDays * 3, 0, 100)
  if (/stale|outdated|drift/.test(tagText)) drift = clamp(drift + 20, 0, 100)

  let risk = 25
  if (/breaking|major|security|migration|auth/.test(`${title} ${tagText}`)) risk = 80
  else if (/refactor|schema|db|model/.test(`${title} ${tagText}`)) risk = 55

  const health = clamp(Math.round((100 - drift) * 0.6 + (100 - risk) * 0.4), 0, 100)
  const findings: string[] = []
  if (drift > 70) findings.push('Document appears stale compared to recent update patterns.')
  if (risk > 70) findings.push('Commit metadata indicates elevated change risk.')
  if (findings.length === 0) findings.push('No critical drift or risk signals detected for this document.')

  return { drift, risk, health, findings }
}

export default function DriftAnalysis() {
  const dispatch = useAppDispatch()
  const { projects } = useAppSelector((s) => s.projects)
  const [projectId, setProjectId] = useState('')
  const [documents, setDocuments] = useState<DocumentVersion[]>([])
  const [commit, setCommit] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [driftReport, setDriftReport] = useState<any | null>(null)
  const [driftError, setDriftError] = useState<string | null>(null)
  const [artifactHealth, setArtifactHealth] = useState<ArtifactHealth[]>([])
  const [artifactLoading, setArtifactLoading] = useState(false)

  useEffect(() => { dispatch(fetchProjects()) }, [dispatch])
  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    Promise.allSettled([
      projectsApi.getDefaultIntelligenceView(projectId),
      documentsApi.list(projectId),
    ])
      .then(([viewResult, docsResult]) => {
        const docs =
          docsResult.status === 'fulfilled'
            ? (docsResult.value.data.documents || [])
            : []
        setDocuments(docs)

        const resolvedCommit =
          viewResult.status === 'fulfilled'
            ? (viewResult.value.data.view?.commitHash || '')
            : ''

        setCommit(resolvedCommit || docs?.[0]?.commit || '')
      })
      .finally(() => setIsLoading(false))
  }, [projectId])

  useEffect(() => {
    const loadDrift = async () => {
      if (!projectId || !commit) {
        setDriftReport(null)
        setDriftError(null)
        return
      }
      try {
        const response = await documentsApi.getDrift(projectId, commit)
        setDriftReport(response.data.drift || null)
        setDriftError(null)
      } catch {
        setDriftReport(null)
        setDriftError('Drift report not available for this commit; using metadata fallback scoring.')
      }
    }
    loadDrift()
  }, [projectId, commit])

  const currentDoc = useMemo(() => documents.find((d) => d.commit === commit), [documents, commit])

  useEffect(() => {
    const extractFindings = (drift: any): string[] => {
      if (!Array.isArray(drift?.findings)) return []
      return drift.findings.map((f: any) => typeof f === 'string' ? f : JSON.stringify(f)).slice(0, 20)
    }

    const hasKeyword = (txt: string, keywords: string[]) => keywords.some((k) => txt.includes(k))

    const findingFor = (artifactId: ArtifactHealth['id'], findings: string[]) => {
      const rules: Record<ArtifactHealth['id'], string[]> = {
        summary: ['summary', 'change summary'],
        readme: ['readme'],
        api_reference: ['api-reference', 'api reference', 'openapi', 'endpoint', 'route'],
        api_description: ['api-description', 'api description', 'descriptions', 'schema'],
        architecture: ['architecture', 'diagram', 'adr', 'design', 'component'],
      }
      const hit = findings.find((f) => hasKeyword(f.toLowerCase(), rules[artifactId]))
      return hit || 'No explicit drift finding for this artifact.'
    }

    const calcStatus = (health: number, exists: boolean): ArtifactHealth['status'] => {
      if (!exists) return 'missing'
      if (health < 45) return 'critical'
      if (health < 70) return 'warning'
      return 'healthy'
    }

    const build = async () => {
      if (!projectId || !commit) {
        setArtifactHealth([])
        return
      }
      setArtifactLoading(true)
      try {
        const [summaryR, readmeR, apiRefR, apiDescR, archR] = await Promise.allSettled([
          documentsApi.getSummary(projectId, commit),
          documentsApi.getReadme(projectId, commit),
          documentsApi.getApiReference(projectId, commit),
          documentsApi.get(projectId, commit),
          documentsApi.getArchitecture(projectId, commit),
        ])

        const exists = {
          summary: summaryR.status === 'fulfilled' && !!summaryR.value?.data?.content,
          readme: readmeR.status === 'fulfilled' && !!readmeR.value?.data?.content,
          api_reference: apiRefR.status === 'fulfilled' && !!apiRefR.value?.data?.content,
          api_description: apiDescR.status === 'fulfilled' && !!apiDescR.value?.data?.content,
          architecture: archR.status === 'fulfilled' && Array.isArray(archR.value?.data?.files) && archR.value.data.files.length > 0,
        }

        const findings = extractFindings(driftReport)
        let base = computeScores(currentDoc?.metadata || null).health
        if (driftReport?.statistics) {
          const major = Number(driftReport.statistics.major || 0)
          const minor = Number(driftReport.statistics.minor || 0)
          const patch = Number(driftReport.statistics.patch || 0)
          const totalIssues = Number(driftReport.statistics.total_issues || 0)
          const severity = String(driftReport.severity || 'PATCH').toUpperCase()
          const validationStatus = String(driftReport.validation_status || 'FAILED').toUpperCase()

          const weighted = major * 12 + minor * 6 + patch * 2
          const severityFloor = driftReport.drift_detected ? (severityBase[severity] || 0) : 0
          let drift = clamp(Math.max(weighted, severityFloor), 0, 100)
          if (validationStatus !== 'SUCCESS') drift = clamp(drift + 5, 0, 100)

          let risk = clamp(major * 20 + minor * 10 + patch * 4 + (totalIssues > 0 ? 10 : 0), 0, 100)
          if (severity === 'MAJOR') risk = Math.max(risk, 75)
          if (validationStatus !== 'SUCCESS') risk = clamp(risk + 10, 0, 100)

          base = clamp(Math.round((100 - drift) * 0.6 + (100 - risk) * 0.4), 0, 100)
        }

        const baseRows: ArtifactHealth[] = [
          { id: 'summary', label: 'Summary', exists: exists.summary, health: 0, status: 'healthy', driftPart: '' },
          { id: 'readme', label: 'README', exists: exists.readme, health: 0, status: 'healthy', driftPart: '' },
          { id: 'api_reference', label: 'API Reference', exists: exists.api_reference, health: 0, status: 'healthy', driftPart: '' },
          { id: 'api_description', label: 'API Description JSON', exists: exists.api_description, health: 0, status: 'healthy', driftPart: '' },
          { id: 'architecture', label: 'Architecture Docs', exists: exists.architecture, health: 0, status: 'healthy', driftPart: '' },
        ]

        const rows: ArtifactHealth[] = baseRows.map((row) => {
          const note = findingFor(row.id, findings)
          const explicitDrift = note !== 'No explicit drift finding for this artifact.'
          let health = base
          if (!row.exists) health -= 45
          if (explicitDrift) health -= 20
          health = clamp(health, 0, 100)
          return {
            ...row,
            health,
            status: calcStatus(health, row.exists),
            driftPart: note,
          }
        })

        setArtifactHealth(rows)
      } finally {
        setArtifactLoading(false)
      }
    }

    void build()
  }, [projectId, commit, driftReport, currentDoc])

  const scores = useMemo(() => {
    if (driftReport?.statistics) {
      const major = Number(driftReport.statistics.major || 0)
      const minor = Number(driftReport.statistics.minor || 0)
      const patch = Number(driftReport.statistics.patch || 0)
      const totalIssues = Number(driftReport.statistics.total_issues || 0)
      const severity = String(driftReport.severity || 'PATCH').toUpperCase()
      const validationStatus = String(driftReport.validation_status || 'FAILED').toUpperCase()

      // Weighted issue score + severity floor for cases where upstream reports major drift but sparse issue counts.
      const weighted = major * 12 + minor * 6 + patch * 2
      const severityFloor = driftReport.drift_detected ? (severityBase[severity] || 0) : 0
      let drift = clamp(Math.max(weighted, severityFloor), 0, 100)
      if (validationStatus !== 'SUCCESS') drift = clamp(drift + 5, 0, 100)

      let risk = clamp(major * 20 + minor * 10 + patch * 4 + (totalIssues > 0 ? 10 : 0), 0, 100)
      if (severity === 'MAJOR') risk = Math.max(risk, 75)
      if (validationStatus !== 'SUCCESS') risk = clamp(risk + 10, 0, 100)

      const health = clamp(Math.round((100 - drift) * 0.6 + (100 - risk) * 0.4), 0, 100)
      const findings = Array.isArray(driftReport.findings) && driftReport.findings.length > 0
        ? driftReport.findings.slice(0, 5).map((f: any) => typeof f === 'string' ? f : JSON.stringify(f))
        : ['No critical drift or risk signals detected for this document.']
      if (validationStatus !== 'SUCCESS') {
        findings.unshift('Drift validation status is not SUCCESS; scores include uncertainty penalty.')
      }
      return { drift, risk, health, findings, validationStatus, severity }
    }
    return { ...computeScores(currentDoc?.metadata || null), validationStatus: 'FALLBACK', severity: 'N/A' }
  }, [currentDoc, driftReport])

  return (
    <DashboardLayout>
      <div className="cr-page">
        <div className="cr-page-header">
          <div>
            <h1 className="cr-page-title">Drift Analysis</h1>
            <p className="cr-page-subtitle">Document-specific drift and risk (not global overview)</p>
          </div>
        </div>

        <div className="cr-card" style={{ marginBottom: 16 }}>
          <div className="cr-card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="doc-settings-input" style={{ minWidth: 260 }}>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={commit} onChange={(e) => setCommit(e.target.value)} className="doc-settings-input" style={{ minWidth: 260 }} disabled={!projectId || isLoading}>
              <option value="">{isLoading ? 'Loading documents...' : 'Select commit'}</option>
              {documents.map((d) => <option key={d.commit} value={d.commit}>{d.commit.substring(0, 7)} - {d.metadata?.title || 'Untitled'}</option>)}
            </select>
          </div>
          {driftError && (
            <div style={{ padding: '0 16px 14px', fontSize: 12, color: 'var(--severity-medium)' }}>
              {driftError}
            </div>
          )}
        </div>

        {commit && currentDoc && (
          <>
            <div className="cr-stats-row">
              <div className="cr-stat-card"><div className="cr-stat-icon" style={{ color: 'var(--severity-medium)' }}><AlertTriangle size={15} /></div><div className="cr-stat-body"><span className="cr-stat-label">Drift Score</span><span className="cr-stat-value">{scores.drift}</span></div></div>
              <div className="cr-stat-card"><div className="cr-stat-icon" style={{ color: 'var(--severity-high)' }}><Shield size={15} /></div><div className="cr-stat-body"><span className="cr-stat-label">Risk Score</span><span className="cr-stat-value">{scores.risk}</span></div></div>
              <div className="cr-stat-card"><div className="cr-stat-icon" style={{ color: 'var(--accent-green)' }}><Activity size={15} /></div><div className="cr-stat-body"><span className="cr-stat-label">Doc Health</span><span className="cr-stat-value">{scores.health}%</span></div></div>
            </div>
            <div className="cr-card" style={{ marginTop: 16 }}>
              <div className="cr-card-header"><h3 className="cr-card-title">Drift Signal</h3></div>
              <div className="cr-card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
                <span className="cr-severity cr-severity--info">Validation: {scores.validationStatus}</span>
                <span className="cr-severity cr-severity--medium">Severity: {scores.severity}</span>
              </div>
            </div>
            <div className="cr-card" style={{ marginTop: 16 }}>
              <div className="cr-card-header"><h3 className="cr-card-title">Findings</h3></div>
              <div className="cr-card-body">
                {scores.findings.map((f: string, i: number) => <div key={i} className="cr-list-item">{f}</div>)}
              </div>
            </div>
            <div className="cr-card" style={{ marginTop: 16 }}>
              <div className="cr-card-header"><h3 className="cr-card-title">Per-Document Health</h3></div>
              <div className="cr-card-body" style={{ display: 'grid', gap: 8 }}>
                {artifactLoading && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Evaluating artifacts…</div>}
                {!artifactLoading && artifactHealth.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No document artifacts available for this commit.</div>
                )}
                {!artifactLoading && artifactHealth.map((a) => (
                  <div key={a.id} className="cr-settings-row" style={{ alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ minWidth: 180 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.exists ? 'present' : 'missing'}</div>
                    </div>
                    <div style={{ minWidth: 80, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{a.health}%</div>
                    <span className={`cr-severity ${
                      a.status === 'healthy' ? 'cr-severity--low'
                        : a.status === 'warning' ? 'cr-severity--medium'
                          : a.status === 'critical' ? 'cr-severity--high'
                            : 'cr-severity--critical'
                    }`}>
                      {a.status}
                    </span>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{a.driftPart}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
