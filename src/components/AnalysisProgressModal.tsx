import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitBranch,
  GitCommit,
  Zap,
  FileCode2,
  GitMerge,
  TrendingUp,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { useRunStatus } from '../hooks/useRunStatus'
import type { RunStage } from '../services/api'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const remS = s % 60
  if (m === 0) return `${s}s`
  return `${m}m ${remS}s`
}

const useElapsedClock = (startedAt: string | null, completedAt: string | null, isTerminal: boolean) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return
    if (isTerminal && completedAt) {
      setElapsed(new Date(completedAt).getTime() - new Date(startedAt).getTime())
      return
    }
    const tick = () => setElapsed(Date.now() - new Date(startedAt).getTime())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt, completedAt, isTerminal])

  return elapsed
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage icons
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_ICONS: Record<string, React.ReactNode> = {
  QUEUE:  <Zap size={16} />,
  EPIC1:  <FileCode2 size={16} />,
  EPIC2:  <GitMerge size={16} />,
  EPIC3:  <TrendingUp size={16} />,
  EPIC4:  <Sparkles size={16} />,
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface StageRowProps {
  stage: RunStage
  index: number
  isLast: boolean
}

const StageRow = ({ stage, index, isLast }: StageRowProps) => {
  const [expanded, setExpanded] = useState(false)

  const statusColor = {
    pending: 'var(--text-muted)',
    running: '#60a5fa',
    succeeded: '#34d399',
    failed: '#f87171',
    skipped: 'var(--text-muted)',
  }[stage.status]

  const bgColor = {
    pending: 'transparent',
    running: 'rgba(96,165,250,0.05)',
    succeeded: 'rgba(52,211,153,0.05)',
    failed: 'rgba(248,113,113,0.08)',
    skipped: 'transparent',
  }[stage.status]

  const StatusIcon = () => {
    switch (stage.status) {
      case 'running':
        return <Loader2 size={18} style={{ color: statusColor, animation: 'spin 1s linear infinite' }} />
      case 'succeeded':
        return <CheckCircle2 size={18} style={{ color: statusColor }} />
      case 'failed':
        return <XCircle size={18} style={{ color: statusColor }} />
      case 'skipped':
        return <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px dashed var(--text-muted)', flexShrink: 0 }} />
      default:
        return (
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '2px solid var(--border-default)',
            background: 'var(--bg-subtle)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'var(--text-muted)', fontWeight: 700,
          }}>
            {index + 1}
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
      {/* Timeline line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <StatusIcon />
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 24,
            background: stage.status === 'succeeded'
              ? 'rgba(52,211,153,0.3)'
              : stage.status === 'running'
              ? 'linear-gradient(to bottom, rgba(96,165,250,0.4), transparent)'
              : 'var(--border-default)',
            marginTop: 4,
          }} />
        )}
      </div>

      {/* Stage content */}
      <div style={{
        flex: 1,
        marginBottom: isLast ? 0 : 20,
        padding: '2px 12px 8px',
        borderRadius: 8,
        background: bgColor,
        border: stage.status === 'running' ? '1px solid rgba(96,165,250,0.2)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ color: statusColor, display: 'flex', alignItems: 'center' }}>
            {STAGE_ICONS[stage.name]}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: stage.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
          }}>
            {stage.label}
          </span>
          {stage.status === 'running' && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              color: '#60a5fa', background: 'rgba(96,165,250,0.15)',
              padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase',
            }}>
              Running
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, paddingLeft: 24 }}>
          {stage.description}
        </p>

        {/* Error row */}
        {stage.error && (
          <div style={{ marginTop: 6, paddingLeft: 24 }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                cursor: 'pointer', color: '#f87171', fontSize: 12, padding: 0,
              }}
            >
              <AlertTriangle size={12} />
              Show error details
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {expanded && (
              <div style={{
                marginTop: 6, padding: '8px 12px', borderRadius: 6,
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                fontSize: 12, color: '#fca5a5', fontFamily: 'var(--font-mono, monospace)',
                lineHeight: 1.6, wordBreak: 'break-word',
              }}>
                {stage.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress Bar
// ─────────────────────────────────────────────────────────────────────────────

interface ProgressBarProps {
  pct: number
  status: string
}

const ProgressBar = ({ pct, status }: ProgressBarProps) => {
  const color = status === 'failed'
    ? '#f87171'
    : status === 'completed' || status === 'succeeded'
    ? '#34d399'
    : '#60a5fa'

  return (
    <div style={{
      width: '100%', height: 6, borderRadius: 999,
      background: 'var(--bg-subtle)', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        height: '100%',
        width: `${Math.max(4, pct)}%`,
        background: status === 'completed' || status === 'succeeded'
          ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
          : status === 'failed'
          ? '#f87171'
          : 'linear-gradient(90deg, #3b82f6, #8b5cf6, #60a5fa)',
        backgroundSize: status === 'failed' ? '100%' : '200% 100%',
        borderRadius: 999,
        transition: 'width 0.5s ease',
        animation: (status !== 'completed' && status !== 'succeeded' && status !== 'failed')
          ? 'progressShimmer 2s linear infinite'
          : 'none',
      }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────────────────────────────────────

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
  const elapsed = useElapsedClock(
    data?.startedAt ?? null,
    data?.completedAt ?? null,
    isTerminal,
  )
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
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(96,165,250,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(96,165,250,0); }
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
                    <Loader2 size={18} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite' }} />
                  ) : isSuccess ? (
                    <CheckCircle2 size={18} style={{ color: '#34d399' }} />
                  ) : isFailed ? (
                    <XCircle size={18} style={{ color: '#f87171' }} />
                  ) : (
                    <Loader2 size={18} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite' }} />
                  )}
                  <h2 style={{
                    margin: 0, fontSize: 15, fontWeight: 700,
                    color: isSuccess ? '#34d399' : isFailed ? '#f87171' : 'var(--text-primary)',
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
            {/* Progress bar + pct */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Pipeline Progress
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: isSuccess ? '#34d399' : isFailed ? '#f87171' : '#60a5fa',
                  fontFamily: 'var(--font-mono, monospace)',
                }}>
                  {data ? `${data.progressPct}%` : '—'}
                </span>
              </div>
              <ProgressBar pct={data?.progressPct ?? 0} status={data?.status ?? 'running'} />
            </div>

            {/* Time info row */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Elapsed: <strong style={{ color: 'var(--text-secondary)' }}>
                    {elapsed > 0 ? formatDuration(elapsed) : '…'}
                  </strong>
                </span>
              </div>
              {data?.estimatedRemainingMs != null && !isTerminal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Loader2 size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    ETA: <strong style={{ color: 'var(--text-secondary)' }}>
                      ~{formatDuration(data.estimatedRemainingMs)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Stage Timeline */}
            <div style={{
              padding: '12px 12px 8px',
              background: 'var(--bg-subtle)',
              borderRadius: 10,
              border: '1px solid var(--border-default)',
            }}>
              {loading && !data ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
                  <Loader2 size={16} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading run status…</span>
                </div>
              ) : data?.stages ? (
                data.stages.map((stage, i) => (
                  <StageRow
                    key={stage.name}
                    stage={stage}
                    index={i}
                    isLast={i === data.stages.length - 1}
                  />
                ))
              ) : null}
            </div>

            {/* Error summary */}
            {isFailed && data?.errorMessage && (
              <div style={{
                marginTop: 12, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <AlertTriangle size={14} style={{ color: '#f87171' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>Pipeline Error</span>
                </div>
                <p style={{ fontSize: 12, color: '#fca5a5', margin: 0, lineHeight: 1.6 }}>
                  {data.errorMessage}
                </p>
              </div>
            )}
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
                    color: '#fff', display: 'flex', alignItems: 'center', gap: 6,
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
