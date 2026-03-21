import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Play, ArrowRight, Hexagon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
    const [displayText, setDisplayText] = useState('')
    const fullText = 'Self-Updating Engineering Documentation'

    useEffect(() => {
        let i = 0
        const interval = setInterval(() => {
            if (i <= fullText.length) {
                setDisplayText(fullText.slice(0, i))
                i++
            } else {
                clearInterval(interval)
            }
        }, 40)
        return () => clearInterval(interval)
    }, [])

    const stats = [
        { value: '94/100', label: 'Health Score', color: 'var(--accent-green)' },
        { value: '97%', label: 'Coverage', color: 'var(--accent-blue)' },
        { value: '12', label: 'Artifacts', color: 'var(--accent-purple)' },
        { value: '<2 min', label: 'Generation', color: 'var(--accent-orange)' },
    ]

    return (
        <>
            <section id="hero" className="lp-hero">
                {/* Background effects */}
                <div className="lp-hero-dot-pattern" />
                <div className="lp-hero-glow-1" />
                <div className="lp-hero-glow-2" />

                {/* Content */}
                <div className="lp-hero-content">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <span className="lp-badge">
                            <Hexagon size={13} style={{ color: 'var(--accent-green)' }} />
                            AI-Powered CI Documentation Intelligence
                        </span>
                    </motion.div>

                    {/* Main heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="lp-hero-title"
                    >
                        {displayText}
                        <span className="lp-hero-cursor" />
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="lp-hero-subtitle"
                    >
                        Generate architecture diagrams, API references, ADRs, and health reports
                        automatically — every commit, every push, every merge.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="lp-hero-cta"
                    >
                        <Link to="/signup" className="lp-btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
                            <GitBranch size={18} />
                            Connect Repository
                            <ArrowRight size={16} />
                        </Link>
                        <a href="#dashboard" className="lp-btn-secondary" style={{ padding: '12px 24px', fontSize: 15 }}>
                            <Play size={18} />
                            See Live Demo
                        </a>
                    </motion.div>

                    {/* Pipeline flow labels */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        className="lp-hero-pipeline-flow"
                    >
                        {['Repository', 'Analysis', 'Documentation', 'Intelligence'].map((label, i) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className="lp-hero-flow-label">{label}</span>
                                {i < 3 && <ArrowRight size={14} className="lp-hero-flow-arrow" />}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="lp-hero-scroll"
                >
                    <div className="lp-hero-scroll-dot" />
                </motion.div>
            </section>

            {/* Stats Row */}
            <div className="lp-section" style={{ padding: '0 24px 80px' }}>
                <div className="lp-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lp-stats-row"
                    >
                        {stats.map((stat) => (
                            <div key={stat.label} className="lp-stat-card">
                                <div className="lp-stat-value" style={{ color: stat.color }}>
                                    {stat.value}
                                </div>
                                <div className="lp-stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </>
    )
}
