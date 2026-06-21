import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '../design-system'
import { ArrowUpRight, ArrowDownRight, FolderGit2, Activity, AlertTriangle, FileText, Shield } from 'lucide-react'

interface MetricsGridProps {
  overview: any
  projectsCount: number
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ overview, projectsCount }) => {
  const stats = [
    {
      label: 'Projects',
      value: overview?.stats?.projects ?? projectsCount,
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

  return (
    <div className="cr-stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          style={{ display: 'flex' }}
        >
          <Card
            isHoverable={true}
            className="flex items-center gap-4 p-4 w-full"
          >
            {/* Colored icon bubble */}
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: s.bg, color: s.color,
            }}>
              {s.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="block text-xs text-muted font-medium truncate">{s.label}</span>
              <span className="block text-xl font-bold text-primary mt-0.5 truncate">{s.value}</span>
            </div>
            {s.trend !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 self-start ${s.good ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {s.good ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
                {Math.abs(s.trend)}%
              </span>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
