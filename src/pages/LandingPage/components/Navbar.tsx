import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../../components/ThemeToggle'
import { useAppSelector } from '../../../store/hooks'
import Logo from '../../../components/Logo'


const navLinks = [
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Team', href: '#team-collaboration' },
    { label: 'Diagrams', href: '#diagrams' },
    { label: 'Artifacts', href: '#artifacts' },
    { label: 'Integrations', href: '#integrations' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth)
    const showAppLinks = isAuthenticated || !!accessToken

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="lp-nav"
            style={{
                background: scrolled ? 'var(--bg-surface, var(--bg-overlay))' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--border-muted)' : '1px solid transparent',
            }}
        >
            <div className="lp-nav-inner">
                {/* Logo */}
                <a href="#hero" className="lp-nav-brand">
                    <Logo size={36} />
                    <span className="lp-nav-brand-name">
                        DocPulse<span style={{ color: 'var(--accent-blue)' }}> AI</span>
                    </span>
                </a>


                {/* Desktop links */}
                <div className="lp-nav-links">
                    {navLinks.map((link) => (
                        <a key={link.label} href={link.href} className="lp-nav-link">
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="lp-nav-cta">
                    <ThemeToggle size="sm" />
                    {showAppLinks ? (
                        <>
                            <Link to="/projects" className="lp-nav-link">Projects</Link>
                            <Link to="/dashboard" className="lp-btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                                Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="lp-nav-link">Log In</Link>
                            <Link to="/signup" className="lp-btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="lp-nav-mobile-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`lp-nav-mobile-menu ${mobileOpen ? 'is-open' : ''}`}
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="lp-nav-link"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {showAppLinks ? (
                                <>
                                    <Link to="/projects" className="lp-nav-link" style={{ textAlign: 'center' }}>Projects</Link>
                                    <Link to="/dashboard" className="lp-btn-primary" style={{ justifyContent: 'center' }}>Dashboard</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="lp-nav-link" style={{ textAlign: 'center' }}>Log In</Link>
                                    <Link to="/signup" className="lp-btn-primary" style={{ justifyContent: 'center' }}>Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
