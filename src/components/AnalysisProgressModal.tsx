import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  ExternalLink,
  GitBranch,
  GitCommit,
  Zap,
} from 'lucide-react'
import { useRunStatus } from '../hooks/useRunStatus'
import { AnalysisProgress } from './AnalysisProgress'
import { AnalysisTimeline } from './AnalysisTimeline'

interface AnalysisProgressModalProps {
  projectId: string
  runId: string
  projectName?: string
  onDismiss: () => void
  onComplete?: (commitSha: string) => void
}

export const AnalysisProgressModal = ({
  projectId,
  runId,
  projectName,
  onDismiss,
  onComplete,
}: AnalysisProgressModalProps) => {
  const navigate = useNavigate()
  const { data, loading, isTerminal } = useRunStatus(projectId, runId)
  const prevIsTerminalRef = useRef(false)

  // Fire onComplete callback once when run finishes successfully
  useEffect(() => {
    if (isTerminal && !prevIsTerminalRef.current) {
      prevIsTerminalRef.current = true
      if (data && (data.status === 'completed' || data.status === 'succeeded') && onComplete) {
        onComplete(data.commitSha)
      }
    }
  }, [isTerminal, data, onComplete])

  const isSuccess = data?.status === 'completed' || data?.status === 'succeeded'
  const isFailed = data?.status === 'failed'
  
  const statusLabel = {
    queued: 'Queuing run…',
    running: 'Initializing…',
    epic1_running: 'Analyzing code…',
    epic1_completed: 'Code analyzed ✓',
    epic2_running: 'Generating docs…',
    epic2_completed: 'Docs generated ✓',
    epic3_running: 'Validating drift…',
    epic3_completed: 'Drift validated ✓',
    epic4_running: 'Building AI summary…',
    completed: 'Analysis complete!',
    succeeded: 'Analysis complete!',
    failed: 'Analysis failed',
    cancelled: 'Analysis cancelled',
    partial: 'Partial completion',
  }[data?.status || ''] || 'Starting…'

  const handleViewDocs = () => {
    onDismiss()
    navigate(`/projects/${projectId}/docs`)
  }

  return (
    <>
      {/* CSS keyframes injected inline */}
      <style>{`
        @keyframes progressShimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px 16px',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onDismiss() }}
      >
        {/* Modal Card */}
        <div style={{
          width: '100%', maxWidth: 520,
          background: 'var(--bg-default)',
          border: '1px solid var(--border-default)',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.25s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid var(--border-default)',
            background: isSuccess
              ? 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(110,231,183,0.03))'
              : isFailed
              ? 'linear-gradient(135deg, rgba(248,113,113,0.06), rgba(252,165,165,0.03))'
              : 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.03))',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {loading && !data ? (
                    <Loader2 size={18} style={{ color: 'var(--status-running-color)', animation: 'spin 1s linear infinite' }} />
                  ) : isSuccess ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--status-success-color)' }} />
                  ) : isFailed ? (
                    <XCircle size={18} style={{ color: 'var(--status-error-color)' }} />
                  ) : (
                    <Loader2 size={18} style={{ color: 'var(--status-running-color)', animation: 'spin 1s linear infinite' }} />
                  )}
                  <h2 style={{
                    margin: 0, fontSize: 15, fontWeight: 700,
                    color: isSuccess ? 'var(--status-success-color)' : isFailed ? 'var(--status-error-color)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-sans, Inter, sans-serif)',
                  }}>
                    {statusLabel}
                  </h2>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {projectName && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={11} /> {projectName}
                    </span>
                  )}
                  {data?.refName && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitBranch size={11} /> {data.refName}
                    </span>
                  )}
                  {data?.commitSha && data.commitSha !== 'pending' && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitCommit size={11} />
                      <code style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)' }}>
                        {data.commitSha.substring(0, 7)}
                      </code>
                    </span>
                  )}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={onDismiss}
                style={{
                  background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
                  borderRadius: 8, padding: '6px', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
                title="Dismiss (run continues in background)"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Progress section */}
          <div style={{ padding: '16px 20px 12px' }}>
            <AnalysisProgress runId={runId} />
            <AnalysisTimeline runId={runId} />
          </div>

          {/* Footer actions */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              {isTerminal
                ? isFailed
                  ? 'The pipeline encountered errors. Partial docs may still be available.'
                  : 'Your documentation is ready to view.'
                : 'Run continues in background if you dismiss this.'}
            </p>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={onDismiss}
                style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 500,
                  background: 'none', border: '1px solid var(--border-default)',
                  borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans, Inter, sans-serif)',
                }}
              >
                {isTerminal ? 'Close' : 'Dismiss'}
              </button>

              {isSuccess && (
                <button
                  onClick={handleViewDocs}
                  style={{
                    padding: '6px 14px', fontSize: 12, fontWeight: 600,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    color: 'var(--text-inverse)', display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-sans, Inter, sans-serif)',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
                  }}
                >
                  <ExternalLink size={12} />
                  View Docs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AnalysisProgressModal
