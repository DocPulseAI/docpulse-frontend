import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { getMe } from '../store/slices/authSlice'
import { fetchProjects } from '../store/slices/projectsSlice'
import DashboardLayout from '../components/DashboardLayout'
import { SkeletonDashboard } from '../components/Skeleton'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { dashboardApi, DashboardOverviewResponse } from '../services/api'
import {
  FolderGit2, GitCommit, AlertTriangle, FileText,
  ArrowUpRight, ArrowDownRight, Shield, Activity, BarChart3,
  Plus, TrendingUp,
} from 'lucide-react'

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="cr-chart-tip">
      <span className="cr-chart-tip-label">{label}</span>
      {payload.map((p: any, i: number) => (
        <span key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></span>
      ))}
    </div>
  )
}

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, isLoading } = useAppSelector(s => s.auth)
  const { projects, isLoading: projLoading } = useAppSelector(s => s.projects)
  const { theme } = useTheme()
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  useEffect(() => { if (!user) dispatch(getMe()) }, [user, dispatch])
  useEffect(() => { if (user) dispatch(fetchProjects()) }, [user, dispatch])
  useEffect(() => {
    const loadOverview = async () => {
      if (!user) return
      setOverviewLoading(true)
      try {
        const response = await dashboardApi.getOverview()
        setOverview(response.data)
      } catch (error) {
        console.error('Failed to load dashboard overview:', error)
      } finally {
        setOverviewLoading(false)
      }
    }
    loadOverview()
  }, [user])

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  const tickFill = theme === 'dark' ? '#9ba7b8' : '#475569'

  const recentProjects = useMemo(
    () => [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    [projects],
  )

  if (isLoading || !user || overviewLoading) {
    return (
      <DashboardLayout>
        <SkeletonDashboard />
      </DashboardLayout>
    )
  }

  const stats = [
    {
      label: 'Projects',
      value: overview?.stats?.projects ?? projects.length,
      icon: <FolderGit2 size={16} />,
      color: 'var(--accent-blue)',
      bg: 'var(--accent-blue-soft)',
    },
    {
      label: 'Doc Health',
      value: `${overview?.stats?.documentHealth ?? 0}%`,
      icon: <Activity size={16} />,
      color: 'var(--accent-green)',
      bg: 'var(--accent-green-soft)',
      trend: overview?.stats?.documentHealth ? overview.stats.documentHealth - 75 : 0,
      good: true,
    },
    {
      label: 'Drift Score',
      value: overview?.stats?.driftScore ?? 0,
      icon: <AlertTriangle size={16} />,
      color: 'var(--severity-medium)',
      bg: 'var(--severity-medium-glow)',
      trend: overview?.stats?.driftTrendChange ?? 0,
      good: (overview?.stats?.driftTrendChange ?? 0) <= 0,
    },
    {
      label: 'Coverage',
      value: `${overview?.stats?.coverage ?? 0}%`,
      icon: <FileText size={16} />,
      color: 'var(--accent-green)',
      bg: 'var(--accent-green-soft)',
      trend: overview?.stats?.coverageTrendChange ?? 0,
      good: (overview?.stats?.coverageTrendChange ?? 0) >= 0,
    },
    {
      label: 'Risk Score',
      value: overview?.stats?.riskScore ?? 0,
      icon: <Shield size={16} />,
      color: 'var(--severity-high)',
      bg: 'var(--severity-high-glow)',
      trend: overview?.stats?.riskTrendChange ?? 0,
      good: (overview?.stats?.riskTrendChange ?? 0) <= 0,
    },
  ]

  const driftTrend = overview?.driftTrend || []
  const coverageTrend = overview?.coverageTrend || []
  const breakingChanges = overview?.breakingChanges || []
  const recentCommits = overview?.recentCommits || []
  const driftFindings = overview?.driftFindings || []
  const intelligenceSummary = overview?.intelligenceSummary || []

  return (
    <DashboardLayout>
      <motion.div
        className="cr-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Page header */}
        <div className="cr-page-header">
          <div>
            <h1 className="cr-page-title">Overview</h1>
            <p className="cr-page-subtitle">Documentation intelligence for your workspace</p>
          </div>
          {projects.length === 0 && (
            <button
              className="cr-doc-btn cr-doc-btn--primary"
              style={{ padding: '7px 16px', fontSize: 13, gap: 6, display: 'flex', alignItems: 'center' }}
              onClick={() => navigate('/projects')}
            >
              <Plus size={14} /> New Project
            </button>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="cr-stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="cr-stat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              {/* Colored icon bubble */}
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s.bg, color: s.color,
              }}>
                {s.icon}
              </div>
              <div className="cr-stat-body">
                <span className="cr-stat-label">{s.label}</span>
                <span className="cr-stat-value">{s.value}</span>
              </div>
              {s.trend !== undefined && (
                <span className={`cr-stat-trend ${s.good ? 'cr-stat-trend--good' : 'cr-stat-trend--bad'}`}>
                  {s.good ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                  {Math.abs(s.trend)}%
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Two-column grid ── */}
        <div className="cr-grid-2">
          {/* Left: charts */}
          <div className="cr-stack">
            {/* Drift trend */}
            <motion.div className="cr-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
              <div className="cr-card-header">
                <h3 className="cr-card-title"><Activity size={14} /> Drift Trend</h3>
                <span className="cr-card-meta">Last 7 days</span>
              </div>
              <div className="cr-card-body" style={{ height: 180 }}>
                {driftTrend.length === 0 ? (
                  <div className="cr-doc-empty" style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                    <TrendingUp size={24} style={{ opacity: 0.2 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No drift data yet</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={driftTrend}>
                      <defs>
                        <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="d" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="score" name="Drift" stroke="var(--chart-1)" fill="url(#driftGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Coverage trend */}
            <motion.div className="cr-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}>
              <div className="cr-card-header">
                <h3 className="cr-card-title"><BarChart3 size={14} /> Doc Coverage</h3>
                <span className="cr-card-meta">6 months</span>
              </div>
              <div className="cr-card-body" style={{ height: 160 }}>
                {coverageTrend.length === 0 ? (
                  <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                    <BarChart3 size={22} style={{ opacity: 0.2 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No coverage data yet</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={coverageTrend}>
                      <defs>
                        <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="m" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="pct" name="Coverage %" stroke="var(--chart-3)" fill="url(#covGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Breaking changes */}
            <motion.div className="cr-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="cr-card-header">
                <h3 className="cr-card-title"><AlertTriangle size={14} /> Breaking Changes</h3>
                <span className="cr-card-meta">8 weeks</span>
              </div>
              <div className="cr-card-body" style={{ height: 140 }}>
                {breakingChanges.length === 0 ? (
                  <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                    <AlertTriangle size={22} style={{ opacity: 0.2 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No breaking changes recorded</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={breakingChanges}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="w" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="c" name="Changes" fill="var(--severity-critical)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: lists */}
          <div className="cr-stack">
            {/* Published intelligence */}
            <motion.div className="cr-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}>
              <div className="cr-card-header">
                <h3 className="cr-card-title"><Shield size={14} /> Published Intelligence</h3>
              </div>
              <div className="cr-card-body cr-card-body--flush">
                {intelligenceSummary.length === 0 ? (
                  <div className="cr-empty" style={{ padding: '32px 24px' }}>
                    <div className="cr-empty-icon"><Shield size={22} /></div>
                    <p className="cr-empty-title">No published views</p>
                    <p className="cr-empty-body">Analyze a repository to generate intelligence views.</p>
                    <div className="cr-empty-cta">
                      <button className="cr-doc-btn cr-doc-btn--primary" style={{ padding: '5px 14px' }} onClick={() => navigate('/repositories')}>
                        Connect Repository
                      </button>
                    </div>
                  </div>
                ) : intelligenceSummary.slice(0, 6).map((item) => (
                  <button
                    key={`${item.projectId}-${item.viewKey}`}
                    className="cr-list-item"
                    onClick={() => navigate(`/projects/${item.projectId}?tab=intelligence`)}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: item.runStatus === 'failed' ? 'var(--severity-critical)' :
                        item.runStatus === 'partial' ? 'var(--severity-medium)' : 'var(--accent-green)',
                    }} />
                    <span className="cr-list-primary">{item.projectName}</span>
                    <span className="cr-list-secondary">{item.refName}</span>
                    <span className={`cr-severity cr-severity--${item.runStatus === 'failed' ? 'high' : item.runStatus === 'partial' ? 'medium' : 'low'}`}>
                      {item.viewKey}
                    </span>
                    <span className="cr-list-meta">{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Recent commits */}
            <motion.div className="cr-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
              <div className="cr-card-header">
                <h3 className="cr-card-title"><GitCommit size={14} /> Recent Commits</h3>
                <button className="cr-card-link" onClick={() => navigate('/commits')}>View all</button>
              </div>
              <div className="cr-card-body cr-card-body--flush">
                {recentCommits.length === 0 ? (
                  <div className="cr-list-empty">No commits yet</div>
                ) : recentCommits.map(c => (
                  <button key={c.sha} className="cr-list-item" onClick={() => navigate(`/commits?sha=${encodeURIComponent(c.sha)}`)}>
                    <code className="cr-commit-sha">{c.sha}</code>
                    <span className="cr-commit-msg">{c.msg}</span>
                    <span className={`cr-severity cr-severity--${c.risk}`}>{c.risk}</span>
                    <span className="cr-commit-time">{c.time}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Drift findings */}
            <motion.div className="cr-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
              <div className="cr-card-header">
                <h3 className="cr-card-title"><AlertTriangle size={14} /> Drift Findings</h3>
              </div>
              <div className="cr-card-body cr-card-body--flush">
                {driftFindings.length === 0 ? (
                  <div className="cr-list-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--accent-green)', fontSize: 12 }}>✓</span> No drift findings
                  </div>
                ) : driftFindings.map(f => (
                  <div key={f.area} className="cr-list-item">
                    <span className={`cr-dot cr-dot--${f.severity}`} />
                    <span className="cr-drift-area">{f.area}</span>
                    <span className={`cr-severity cr-severity--${f.severity}`}>{f.pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Projects */}
            <motion.div className="cr-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}>
              <div className="cr-card-header">
                <h3 className="cr-card-title"><FolderGit2 size={14} /> Projects</h3>
                <button className="cr-card-link" onClick={() => navigate('/projects')}>View all</button>
              </div>
              <div className="cr-card-body cr-card-body--flush">
                {projLoading ? (
                  <div className="cr-list-empty">Loading…</div>
                ) : recentProjects.length === 0 ? (
                  <div className="cr-empty" style={{ padding: '24px 16px' }}>
                    <div className="cr-empty-icon" style={{ width: 36, height: 36 }}><FolderGit2 size={16} /></div>
                    <p className="cr-empty-title" style={{ fontSize: 13 }}>No projects yet</p>
                    <div className="cr-empty-cta">
                      <button className="cr-doc-btn cr-doc-btn--primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => navigate('/projects')}>
                        <Plus size={12} /> Create Project
                      </button>
                    </div>
                  </div>
                ) : (
                  recentProjects.map(p => (
                    <button
                      key={p.id}
                      className="cr-list-item"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)',
                      }}>
                        <FolderGit2 size={12} />
                      </div>
                      <span className="cr-list-primary">{p.name}</span>
                      <span className="cr-list-secondary">{p.memberRole}</span>
                      <span className="cr-list-meta">{new Date(p.updatedAt).toLocaleDateString()}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default Dashboard
