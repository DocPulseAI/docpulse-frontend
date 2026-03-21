import { motion } from 'framer-motion'
import { GitBranch, ArrowRight, Github, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = [
    {
        title: 'Product',
        links: [
            { label: 'Documentation', href: '#artifacts' },
            { label: 'API Reference', href: '#artifacts' },
            { label: 'Team Collaboration', href: '#team-collaboration' },
            { label: 'Pricing', href: '/signup' },
        ],
    },
    {
        title: 'Developers',
        links: [
            { label: 'Quick Start', href: '/signup' },
            { label: 'CLI Reference', href: '#pipeline' },
            { label: 'Integrations', href: '#pipeline' },
            { label: 'Changelog', href: '/projects' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '#hero' },
            { label: 'Security', href: '#dashboard' },
            { label: 'Privacy', href: '/signup' },
            { label: 'Terms', href: '/signup' },
        ],
    },
]

export default function Footer() {
    return (
        <footer>
            {/* CTA Section */}
            <hr className="lp-divider" />
            <div className="lp-section" style={{ padding: '80px 24px' }}>
                <div className="lp-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lp-cta-card"
                    >
                        <h2 className="lp-cta-title">
                            Ready to automate your docs?
                        </h2>
                        <p className="lp-cta-desc">
                            Connect your repository and start generating living documentation in under 60 seconds.
                        </p>
                        <div className="lp-cta-actions">
                            <Link to="/signup" className="lp-btn-primary">
                                <GitBranch size={16} />
                                Connect Repository
                                <ArrowRight size={14} />
                            </Link>
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-btn-secondary">
                                <Github size={16} />
                                View on GitHub
                                <ExternalLink size={12} />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer links */}
            <hr className="lp-divider" />
            <div className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-grid">
                        {/* Brand */}
                        <div>
                            <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 8 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    DocPulse<span style={{ color: 'var(--accent-blue)' }}> AI</span>
                                </span>
                            </a>
                            <p className="lp-footer-brand-desc">
                                AI-powered CI documentation intelligence for engineering teams.
                            </p>
                            <div className="lp-footer-status">
                                <span className="lp-status-dot" />
                                All systems operational
                            </div>
                        </div>

                        {footerLinks.map((section) => (
                            <div key={section.title}>
                                <h4 className="lp-footer-col-title">{section.title}</h4>
                                <ul className="lp-footer-links">
                                    {section.links.map((link) => (
                                        <li key={link.label}>
                                            <a href={link.href}>{link.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="lp-footer-bottom">
                        <p className="lp-footer-copy">
                            © 2026 DocPulse AI. Built for engineers, by engineers.
                        </p>
                        <div className="lp-footer-bottom-links">
                            <a href="https://www.githubstatus.com/" target="_blank" rel="noreferrer">Status</a>
                            <a href="/signup">Privacy</a>
                            <a href="/signup">Terms</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
