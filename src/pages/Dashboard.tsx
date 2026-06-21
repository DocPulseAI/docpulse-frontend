import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { getMe } from '../store/slices/authSlice'
import { fetchProjects } from '../store/slices/projectsSlice'
import DashboardLayout from '../components/DashboardLayout'
import { SkeletonDashboard } from '../components/Skeleton'
import { Card } from '../design-system'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { dashboardApi, DashboardOverviewResponse } from '../services/api'
import {
  Plus, TrendingUp, BarChart3, AlertTriangle,
} from 'lucide-react'
import { MetricsGrid } from '../components/MetricsGrid'
import {
  PublishedIntelligencePanel,
  RecentCommitsPanel,
  DriftFindingsPanel,
  RecentProjectsPanel,
} from '../components/ActivityList'

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

        {/* Stats Row */}
        <MetricsGrid overview={overview} projectsCount={projects.length} />

        {/* Two-column grid */}
        <div className="cr-grid-2">
          {/* Left: charts */}
          <div className="cr-stack">
            {/* Drift trend */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
              <Card
                title="Drift Trend"
                headerActions={<span className="cr-card-meta">Last 7 days</span>}
                isHoverable={false}
              >
                <div style={{ height: 180 }}>
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
              </Card>
            </motion.div>

            {/* Coverage trend */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}>
              <Card
                title="Doc Coverage"
                headerActions={<span className="cr-card-meta">6 months</span>}
                isHoverable={false}
              >
                <div style={{ height: 160 }}>
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
              </Card>
            </motion.div>

            {/* Breaking changes */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Card
                title="Breaking Changes"
                headerActions={<span className="cr-card-meta">8 weeks</span>}
                isHoverable={false}
              >
                <div style={{ height: 140 }}>
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
              </Card>
            </motion.div>
          </div>

          {/* Right: lists */}
          <div className="cr-stack">
            {/* Published intelligence */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}>
              <PublishedIntelligencePanel intelligenceSummary={intelligenceSummary} navigate={navigate} />
            </motion.div>

            {/* Recent commits */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
              <RecentCommitsPanel recentCommits={recentCommits} navigate={navigate} />
            </motion.div>

            {/* Drift findings */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
              <DriftFindingsPanel driftFindings={driftFindings} />
            </motion.div>

            {/* Projects */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}>
              <RecentProjectsPanel
                recentProjects={recentProjects}
                projLoading={projLoading}
                navigate={navigate}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default Dashboard
