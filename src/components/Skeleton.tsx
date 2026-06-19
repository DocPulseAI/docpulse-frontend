/**
 * Skeleton loader components for DocPulseAI.
 * Uses the cr-skeleton* CSS classes defined in components.css.
 * All components respect the current theme (dark/light) via CSS tokens.
 */

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
}

export const Skeleton = ({ className = '', width, height, style }: SkeletonProps) => (
  <span
    className={`cr-skeleton ${className}`}
    style={{ width, height, ...style }}
  />
)

// ── Stat card skeleton ──────────────────────────────────────────────────────

export const SkeletonStat = () => (
  <div className="cr-skeleton-stat">
    <Skeleton className="cr-skeleton-stat-icon" />
    <div className="cr-skeleton-stat-body">
      <Skeleton className="cr-skeleton--text-sm" style={{ width: '50%' }} />
      <Skeleton className="cr-skeleton--title" style={{ width: '40%', marginBottom: 0 }} />
    </div>
  </div>
)

export const SkeletonStatRow = ({ count = 4 }: { count?: number }) => (
  <div className="cr-stats-row">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStat key={i} />
    ))}
  </div>
)

// ── List item skeleton ──────────────────────────────────────────────────────

export const SkeletonListItem = ({ wide = false }: { wide?: boolean }) => (
  <div className="cr-skeleton-list-item">
    <Skeleton className="cr-skeleton--avatar" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Skeleton className="cr-skeleton--text" style={{ width: wide ? '55%' : '40%', marginBottom: 0 }} />
      <Skeleton className="cr-skeleton--text-sm" style={{ marginBottom: 0 }} />
    </div>
    <Skeleton className="cr-skeleton--badge" />
  </div>
)

export const SkeletonList = ({ rows = 5 }: { rows?: number }) => (
  <div className="cr-settings-list">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonListItem key={i} wide={i % 3 === 0} />
    ))}
  </div>
)

// ── Card skeleton ───────────────────────────────────────────────────────────

export const SkeletonCard = ({ rows = 3 }: { rows?: number }) => (
  <div className="cr-skeleton-card">
    <div className="cr-skeleton-card-header">
      <Skeleton style={{ width: 14, height: 14, borderRadius: '50%' }} />
      <Skeleton className="cr-skeleton--text" style={{ width: 120, marginBottom: 0 }} />
    </div>
    <div className="cr-skeleton-card-body">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="cr-skeleton--text" style={{ width: `${75 - i * 8}%`, marginBottom: 0 }} />
      ))}
    </div>
  </div>
)

// ── Chart card skeleton ─────────────────────────────────────────────────────

export const SkeletonChartCard = ({ height = 160 }: { height?: number }) => (
  <div className="cr-skeleton-card">
    <div className="cr-skeleton-card-header">
      <Skeleton style={{ width: 14, height: 14, borderRadius: '50%' }} />
      <Skeleton className="cr-skeleton--text" style={{ width: 100, marginBottom: 0 }} />
      <Skeleton className="cr-skeleton--text-sm" style={{ width: 60, marginLeft: 'auto', marginBottom: 0 }} />
    </div>
    <div className="cr-skeleton-card-body" style={{ paddingTop: 16 }}>
      <Skeleton style={{ width: '100%', height, borderRadius: 4 }} />
    </div>
  </div>
)

// ── Full dashboard skeleton ─────────────────────────────────────────────────

export const SkeletonDashboard = () => (
  <div className="cr-page" style={{ opacity: 0.85 }}>
    {/* Page header */}
    <div className="cr-page-header" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton className="cr-skeleton--title" style={{ width: 160 }} />
        <Skeleton className="cr-skeleton--text-sm" style={{ width: 240, marginBottom: 0 }} />
      </div>
    </div>
    {/* Stats row */}
    <SkeletonStatRow count={5} />
    {/* Two-col grid */}
    <div className="cr-grid-2" style={{ marginTop: 4 }}>
      <div className="cr-stack">
        <SkeletonChartCard height={160} />
        <SkeletonChartCard height={140} />
        <SkeletonChartCard height={120} />
      </div>
      <div className="cr-stack">
        <SkeletonCard rows={4} />
        <SkeletonCard rows={3} />
        <SkeletonCard rows={4} />
      </div>
    </div>
  </div>
)

// ── Projects page skeleton ──────────────────────────────────────────────────

export const SkeletonProjectsPage = () => (
  <div className="cr-page" style={{ opacity: 0.85 }}>
    <div className="cr-page-header" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton className="cr-skeleton--title" style={{ width: 120 }} />
        <Skeleton className="cr-skeleton--text-sm" style={{ width: 280, marginBottom: 0 }} />
      </div>
      <Skeleton className="cr-skeleton--btn" style={{ marginLeft: 'auto' }} />
    </div>
    <SkeletonList rows={6} />
  </div>
)

// ── Repositories page skeleton ──────────────────────────────────────────────

export const SkeletonRepoItem = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)',
  }}>
    <Skeleton className="cr-skeleton--avatar" style={{ borderRadius: 6 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Skeleton className="cr-skeleton--text" style={{ width: '35%', marginBottom: 0 }} />
      <Skeleton className="cr-skeleton--text-sm" style={{ width: '60%', marginBottom: 0 }} />
    </div>
    <Skeleton className="cr-skeleton--btn" />
  </div>
)

export const SkeletonRepoGroup = ({ count = 4 }: { count?: number }) => (
  <div style={{
    background: 'var(--bg-default)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  }}>
    {/* Owner header */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px', borderBottom: '1px solid var(--border-default)',
      background: 'var(--bg-subtle)',
    }}>
      <Skeleton className="cr-skeleton--avatar" />
      <Skeleton className="cr-skeleton--text" style={{ width: 120, marginBottom: 0 }} />
    </div>
    {Array.from({ length: count }).map((_, i) => <SkeletonRepoItem key={i} />)}
  </div>
)
