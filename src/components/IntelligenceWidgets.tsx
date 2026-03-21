import { motion } from 'framer-motion'
import { Shield, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react'

/* ====== RADIAL GAUGE ====== */
interface RadialGaugeProps {
    value: number
    maxValue?: number
    size?: number
    label: string
    color?: string
    icon?: React.ReactNode
}

export function RadialGauge({ value, maxValue = 100, size = 120, label, color, icon }: RadialGaugeProps) {
    const normalizedValue = Math.min(value / maxValue, 1)
    const strokeWidth = 8
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - normalizedValue)

    const getColor = () => {
        if (color) return color
        if (normalizedValue <= 0.3) return 'var(--severity-low)'
        if (normalizedValue <= 0.6) return 'var(--severity-medium)'
        if (normalizedValue <= 0.8) return 'var(--severity-high)'
        return 'var(--severity-critical)'
    }

    return (
        <div className="radial-gauge" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="var(--border-default)"
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ filter: `drop-shadow(0 0 6px ${getColor()})` }}
                />
            </svg>
            <div className="radial-gauge-content">
                {icon && <span className="radial-gauge-icon">{icon}</span>}
                <span className="radial-gauge-value" style={{ color: getColor() }}>{value}</span>
                <span className="radial-gauge-label">{label}</span>
            </div>
        </div>
    )
}

/* ====== RISK SCORE CARD ====== */
interface RiskScoreCardProps {
    score: number
    breakingChanges: number
    impactedModules: string[]
    confidence: number
}

export function RiskScoreCard({ score, breakingChanges, impactedModules, confidence }: RiskScoreCardProps) {
    return (
        <motion.div
            className="intel-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="intel-card-header">
                <h3 className="intel-card-title">
                    <Shield size={18} />
                    Commit Intelligence
                </h3>
                {breakingChanges > 0 && (
                    <span className="intel-badge intel-badge--critical">
                        <AlertTriangle size={12} />
                        {breakingChanges} Breaking
                    </span>
                )}
            </div>
            <div className="intel-card-body">
                <div className="intel-gauge-row">
                    <RadialGauge value={score} label="Risk Score" icon={<Shield size={14} />} />
                    <div className="intel-details">
                        <div className="intel-detail-item">
                            <span className="intel-detail-label">Impacted Modules</span>
                            <div className="intel-module-list">
                                {impactedModules.map(m => (
                                    <span key={m} className="intel-module-chip">{m}</span>
                                ))}
                            </div>
                        </div>
                        <div className="intel-detail-item">
                            <span className="intel-detail-label">Confidence</span>
                            <div className="intel-confidence-bar">
                                <motion.div
                                    className="intel-confidence-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${confidence}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                />
                                <span className="intel-confidence-text">{confidence}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

/* ====== DRIFT SCORE WIDGET ====== */
interface DriftScoreProps {
    score: number
    trend: 'up' | 'down' | 'stable'
    delta: number
}

export function DriftScoreWidget({ score, trend, delta }: DriftScoreProps) {
    const getTrendIcon = () => {
        if (trend === 'up') return <ArrowUpRight size={14} />
        if (trend === 'down') return <ArrowDownRight size={14} />
        return <Minus size={14} />
    }

    const getTrendColor = () => {
        // For drift, lower is better, so "down" trend is good
        if (trend === 'down') return 'var(--text-success)'
        if (trend === 'up') return 'var(--text-danger)'
        return 'var(--text-muted)'
    }

    return (
        <div className="drift-widget">
            <div className="drift-widget-header">
                <span className="drift-widget-label">Drift Score</span>
                <span className="drift-widget-trend" style={{ color: getTrendColor() }}>
                    {getTrendIcon()} {delta > 0 ? '+' : ''}{delta}%
                </span>
            </div>
            <div className="drift-widget-gauge">
                <RadialGauge value={score} label="Score" size={90} />
            </div>
        </div>
    )
}

/* ====== COVERAGE WIDGET ====== */
interface CoverageWidgetProps {
    percentage: number
    total: number
    documented: number
}

export function CoverageWidget({ percentage, total, documented }: CoverageWidgetProps) {
    return (
        <div className="coverage-widget">
            <div className="coverage-widget-header">
                <span className="coverage-widget-label">Doc Coverage</span>
                <Info size={14} className="coverage-widget-info" />
            </div>
            <div className="coverage-widget-value">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="coverage-pct"
                >
                    {percentage}%
                </motion.span>
            </div>
            <div className="coverage-bar">
                <motion.div
                    className="coverage-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
            <span className="coverage-meta">{documented} of {total} endpoints documented</span>
        </div>
    )
}

/* ====== SKELETON LOADERS ====== */
export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text skeleton-text--short" />
        </div>
    )
}

export function SkeletonChart() {
    return (
        <div className="skeleton-chart">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-rect" />
        </div>
    )
}
