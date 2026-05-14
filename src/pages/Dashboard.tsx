import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { getMe } from '../store/slices/authSlice'
import { fetchProjects } from '../store/slices/projectsSlice'
import DashboardLayout from '../components/DashboardLayout'
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

  useEffect(() => { if (!user) dispatch(getMe()) }, [user, dispatch])
  useEffect(() => { if (user) dispatch(fetchProjects()) }, [user, dispatch])
  useEffect(() => {
    const loadOverview = async () => {
      if (!user) return
      try {
        const response = await dashboardApi.getOverview()
        setOverview(response.data)
      } catch (error) {
        console.error('Failed to load dashboard overview:', error)
      }
    }
    loadOverview()
  }, [user])

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  const tickFill = theme === 'dark' ? '#8b95a5' : '#64748b'

  const recentProjects = useMemo(
    () => [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    [projects],
  )

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="cr-loading"><div className="cr-spinner" /></div>
      </DashboardLayout>
    )
  }

  const stats = [
    { label: 'Projects', value: overview?.stats?.projects ?? projects.length, icon: <FolderGit2 size={15} />, color: 'var(--accent-blue)' },
    {
      label: 'Doc Health',
      value: `${overview?.stats?.documentHealth ?? 0}%`,
      icon: <Activity size={15} />,
      color: 'var(--accent-green)',
    },
    {
      label: 'Drift Score',
      value: overview?.stats?.driftScore ?? 0,
      icon: <AlertTriangle size={15} />,
      color: 'var(--severity-medium)',
      trend: overview?.stats?.driftTrendChange ?? 0,
      good: (overview?.stats?.driftTrendChange ?? 0) <= 0,
    },
    {
      label: 'Coverage',
      value: `${overview?.stats?.coverage ?? 0}%`,
      icon: <FileText size={15} />,
      color: 'var(--accent-green)',
      trend: overview?.stats?.coverageTrendChange ?? 0,
      good: (overview?.stats?.coverageTrendChange ?? 0) >= 0,
    },
    {
      label: 'Risk Score',
      value: overview?.stats?.riskScore ?? 0,
      icon: <Shield size={15} />,
      color: 'var(--severity-high)',
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
        </div>

        {/* ── Stats row ── */}
        <div className="cr-stats-row">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="cr-stat-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="cr-stat-icon" style={{ color: s.color }}>{s.icon}</div>
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
            <div className="cr-card">
              <div className="cr-card-header">
                <h3 className="cr-card-title"><Activity size={14} /> Drift Trend</h3>
                <span className="cr-card-meta">Last 7 days</span>
              </div>
              <div className="cr-card-body" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={driftTrend}>
                    <defs>
                      <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
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
              </div>
            </div>

            {/* Coverage trend */}
            <div className="cr-card">
              <div className="cr-card-header">
                <h3 className="cr-card-title"><BarChart3 size={14} /> Doc Coverage</h3>
                <span className="cr-card-meta">6 months</span>
              </div>
              <div className="cr-card-body" style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={coverageTrend}>
                    <defs>
                      <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.2} />
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
              </div>
            </div>

            {/* Breaking changes */}
            <div className="cr-card">
              <div className="cr-card-header">
                <h3 className="cr-card-title"><AlertTriangle size={14} /> Breaking Changes</h3>
                <span className="cr-card-meta">8 weeks</span>
              </div>
              <div className="cr-card-body" style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakingChanges}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="w" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="c" name="Changes" fill="var(--severity-critical)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: lists */}
          <div className="cr-stack">
            <div className="cr-card">
              <div className="cr-card-header">
                <h3 className="cr-card-title"><Shield size={14} /> Published Intelligence</h3>
              </div>
              <div className="cr-card-body cr-card-body--flush">
                {intelligenceSummary.length === 0 ? (
                  <div className="cr-list-empty">No published intelligence views yet</div>
                ) : intelligenceSummary.slice(0, 6).map((item) => (
                  <button
                    key={`${item.projectId}-${item.viewKey}`}
                    className="cr-list-item"
                    onClick={() => navigate(`/projects/${item.projectId}?tab=intelligence`)}
                  >
                    <span className="cr-list-primary">{item.projectName}</span>
                    <span className="cr-list-secondary">{item.refName}</span>
                    <span className={`cr-severity cr-severity--${item.runStatus === 'failed' ? 'high' : item.runStatus === 'partial' ? 'medium' : 'low'}`}>
                      {item.viewKey}
                    </span>
                    <span className="cr-list-meta">{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent commits */}
            <div className="cr-card">
              <div className="cr-card-header">
                <h3 className="cr-card-title"><GitCommit size={14} /> Recent Commits</h3>
                <button className="cr-card-link" onClick={() => navigate('/commits')}>View all</button>
              </div>
              <div className="cr-card-body cr-card-body--flush">
                {recentCommits.map(c => (
                  <button key={c.sha} className="cr-list-item" onClick={() => navigate(`/commits?sha=${encodeURIComponent(c.sha)}`)}>
                    <code className="cr-commit-sha">{c.sha}</code>
                    <span className="cr-commit-msg">{c.msg}</span>
                    <span className={`cr-severity cr-severity--${c.risk}`}>{c.risk}</span>
                    <span className="cr-commit-time">{c.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drift findings */}
            <div className="cr-card">
              <div className="cr-card-header">
                <h3 className="cr-card-title"><AlertTriangle size={14} /> Drift Findings</h3>
              </div>
              <div className="cr-card-body cr-card-body--flush">
                {driftFindings.map(f => (
                  <div key={f.area} className="cr-list-item">
                    <span className={`cr-dot cr-dot--${f.severity}`} />
                    <span className="cr-drift-area">{f.area}</span>
                    <span className={`cr-severity cr-severity--${f.severity}`}>{f.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="cr-card">
              <div className="cr-card-header">
                <h3 className="cr-card-title"><FolderGit2 size={14} /> Projects</h3>
                <button className="cr-card-link" onClick={() => navigate('/projects')}>View all</button>
              </div>
              <div className="cr-card-body cr-card-body--flush">
                {projLoading ? (
                  <div className="cr-list-empty">Loading...</div>
                ) : recentProjects.length === 0 ? (
                  <div className="cr-list-empty">No projects yet</div>
                ) : (
                  recentProjects.map(p => (
                    <button
                      key={p.id}
                      className="cr-list-item"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <FolderGit2 size={14} className="cr-list-icon" />
                      <span className="cr-list-primary">{p.name}</span>
                      <span className="cr-list-secondary">{p.memberRole}</span>
                      <span className="cr-list-meta">{new Date(p.updatedAt).toLocaleDateString()}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default Dashboard
