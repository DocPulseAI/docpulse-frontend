import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, GitBranch, FileText } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/* ====== CUSTOM TOOLTIP ====== */
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="chart-tooltip-value" style={{ color: p.color }}>
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    )
}

/* ====== API GROWTH CHART ====== */
const apiGrowthData = [
    { month: 'Aug', endpoints: 24, documented: 18 },
    { month: 'Sep', endpoints: 31, documented: 25 },
    { month: 'Oct', endpoints: 38, documented: 32 },
    { month: 'Nov', endpoints: 45, documented: 40 },
    { month: 'Dec', endpoints: 52, documented: 47 },
    { month: 'Jan', endpoints: 58, documented: 54 },
    { month: 'Feb', endpoints: 64, documented: 61 },
]

export function ApiGrowthChart() {
    const { theme } = useTheme()
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
    const textColor = theme === 'dark' ? '#8b95a5' : '#64748b'

    return (
        <motion.div
            className="analytics-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="analytics-card-header">
                <h3><GitBranch size={16} /> API Growth</h3>
                <span className="analytics-trend analytics-trend--up">
                    <TrendingUp size={12} /> +10.3%
                </span>
            </div>
            <div className="analytics-chart-wrap" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={apiGrowthData}>
                        <defs>
                            <linearGradient id="apiGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="apiDocGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="endpoints" name="Total Endpoints" stroke="var(--chart-1)" fill="url(#apiGrowthGradient)" strokeWidth={2} />
                        <Area type="monotone" dataKey="documented" name="Documented" stroke="var(--chart-3)" fill="url(#apiDocGradient)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

/* ====== BREAKING CHANGE TREND ====== */
const breakingChangeData = [
    { week: 'W1', count: 2 },
    { week: 'W2', count: 0 },
    { week: 'W3', count: 3 },
    { week: 'W4', count: 1 },
    { week: 'W5', count: 0 },
    { week: 'W6', count: 4 },
    { week: 'W7', count: 1 },
    { week: 'W8', count: 0 },
]

export function BreakingChangeTrend() {
    const { theme } = useTheme()
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
    const textColor = theme === 'dark' ? '#8b95a5' : '#64748b'

    return (
        <motion.div
            className="analytics-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="analytics-card-header">
                <h3><AlertTriangle size={16} /> Breaking Changes</h3>
                <span className="analytics-trend analytics-trend--down">
                    <TrendingDown size={12} /> -50%
                </span>
            </div>
            <div className="analytics-chart-wrap" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={breakingChangeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="week" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Breaking Changes" fill="var(--severity-critical)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

/* ====== RISK TREND GRAPH ====== */
const riskTrendData = [
    { day: 'Mon', risk: 35, drift: 42 },
    { day: 'Tue', risk: 28, drift: 38 },
    { day: 'Wed', risk: 45, drift: 55 },
    { day: 'Thu', risk: 32, drift: 40 },
    { day: 'Fri', risk: 25, drift: 30 },
    { day: 'Sat', risk: 20, drift: 25 },
    { day: 'Sun', risk: 22, drift: 28 },
]

export function RiskTrendGraph() {
    const { theme } = useTheme()
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
    const textColor = theme === 'dark' ? '#8b95a5' : '#64748b'

    return (
        <motion.div
            className="analytics-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div className="analytics-card-header">
                <h3><FileText size={16} /> Risk & Drift Trend</h3>
            </div>
            <div className="analytics-chart-wrap" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="risk" name="Risk Score" stroke="var(--chart-5)" strokeWidth={2} dot={{ r: 3, fill: 'var(--chart-5)' }} />
                        <Line type="monotone" dataKey="drift" name="Drift Score" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3, fill: 'var(--chart-2)' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

/* ====== DRIFT RADAR CHART (Canvas) ====== */
const radarData = [
    { category: 'Schema', value: 72, severity: 'high' },
    { category: 'Endpoints', value: 45, severity: 'medium' },
    { category: 'Auth', value: 89, severity: 'critical' },
    { category: 'Models', value: 30, severity: 'low' },
    { category: 'Routes', value: 55, severity: 'medium' },
    { category: 'Types', value: 20, severity: 'low' },
]

export function DriftRadarSection() {
    const [expandedSeverity, setExpandedSeverity] = useState<string | null>(null)
    const [filterSeverity, setFilterSeverity] = useState<string>('all')

    const severityColors: Record<string, string> = {
        critical: 'var(--severity-critical)',
        high: 'var(--severity-high)',
        medium: 'var(--severity-medium)',
        low: 'var(--severity-low)',
    }

    const filtered = filterSeverity === 'all'
        ? radarData
        : radarData.filter(d => d.severity === filterSeverity)

    return (
        <motion.div
            className="intel-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
        >
            <div className="intel-card-header">
                <h3 className="intel-card-title">
                    <AlertTriangle size={18} /> Drift Radar
                </h3>
                <div className="drift-filter-group">
                    {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
                        <button
                            key={sev}
                            className={`drift-filter-btn ${filterSeverity === sev ? 'drift-filter-btn--active' : ''}`}
                            onClick={() => setFilterSeverity(sev)}
                            style={sev !== 'all' ? { borderColor: severityColors[sev] } : {}}
                        >
                            {sev}
                        </button>
                    ))}
                </div>
            </div>
            <div className="intel-card-body">
                <div className="drift-radar-grid">
                    {/* Simple visual radar representation */}
                    <div className="drift-radar-visual">
                        <div className="radar-rings">
                            <div className="radar-ring" style={{ width: '100%', height: '100%' }} />
                            <div className="radar-ring" style={{ width: '75%', height: '75%' }} />
                            <div className="radar-ring" style={{ width: '50%', height: '50%' }} />
                            <div className="radar-ring" style={{ width: '25%', height: '25%' }} />
                            {filtered.map((d, i) => {
                                const angle = (i / filtered.length) * 2 * Math.PI - Math.PI / 2
                                const r = (d.value / 100) * 48
                                const x = 50 + r * Math.cos(angle)
                                const y = 50 + r * Math.sin(angle)
                                return (
                                    <motion.div
                                        key={d.category}
                                        className="radar-dot"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + i * 0.08, type: 'spring' }}
                                        style={{
                                            left: `${x}%`,
                                            top: `${y}%`,
                                            background: severityColors[d.severity],
                                            boxShadow: `0 0 8px ${severityColors[d.severity]}`,
                                        }}
                                        title={`${d.category}: ${d.value}%`}
                                    />
                                )
                            })}
                        </div>
                    </div>

                    {/* Findings list */}
                    <div className="drift-findings">
                        {filtered.map(d => (
                            <motion.button
                                key={d.category}
                                className="drift-finding-item"
                                onClick={() => setExpandedSeverity(expandedSeverity === d.category ? null : d.category)}
                                whileHover={{ x: 2 }}
                            >
                                <div className="drift-finding-header">
                                    <span className="drift-severity-dot" style={{ background: severityColors[d.severity] }} />
                                    <span className="drift-finding-name">{d.category}</span>
                                    <span className="drift-finding-value" style={{ color: severityColors[d.severity] }}>{d.value}%</span>
                                </div>
                                {expandedSeverity === d.category && (
                                    <motion.div
                                        className="drift-finding-detail"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <p>Drift detected in {d.category.toLowerCase()} documentation. {d.value}% of {d.category.toLowerCase()} entries are outdated or missing coverage.</p>
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
