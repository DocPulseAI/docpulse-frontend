import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import { useAppSelector } from '../store/hooks'
import { useTheme } from '../context/ThemeContext'
import {
    User, Mail, Shield, Calendar, Github,
    Eye, EyeOff, Copy, CheckCircle,
} from 'lucide-react'

export default function Profile() {
    const { user } = useAppSelector((state) => state.auth)
    const { theme, toggleTheme } = useTheme()
    const [showToken, setShowToken] = useState(false)
    const [copied, setCopied] = useState(false)
    const [notifications, setNotifications] = useState(true)

    const token = 'cli_a8f3e2d1b7c9e4f6a3d2e1b7c9e4f6a3'

    const handleCopy = () => {
        navigator.clipboard.writeText(token)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!user) return null

    return (
        <DashboardLayout>
            <motion.div
                className="cr-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {/* Profile Header */}
                <div className="cr-profile-header">
                    <div className="cr-profile-avatar">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="cr-profile-info">
                        <h2 className="cr-profile-name">{user.username}</h2>
                        <p className="cr-profile-email">{user.email}</p>
                    </div>
                    <button className="cr-profile-edit">Edit Profile</button>
                </div>

                {/* Two-column grid */}
                <div className="cr-profile-grid">
                    {/* LEFT: Account & Settings */}
                    <div className="cr-stack">
                        {/* Account Settings */}
                        <div className="cr-card">
                            <div className="cr-card-header">
                                <h3 className="cr-card-title"><Shield size={14} /> Account Settings</h3>
                            </div>
                            <div className="cr-settings-list" style={{ border: 'none', borderRadius: 0 }}>
                                <div className="cr-settings-row">
                                    <div className="cr-settings-left">
                                        <span className="cr-settings-label">Username</span>
                                    </div>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.username}</span>
                                </div>
                                <div className="cr-settings-row">
                                    <div className="cr-settings-left">
                                        <span className="cr-settings-label">Email</span>
                                    </div>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Mail size={12} /> {user.email}
                                    </span>
                                </div>
                                <div className="cr-settings-row">
                                    <div className="cr-settings-left">
                                        <span className="cr-settings-label">Role</span>
                                    </div>
                                    <span className="cr-severity cr-severity--info">{user.role}</span>
                                </div>
                                <div className="cr-settings-row">
                                    <div className="cr-settings-left">
                                        <span className="cr-settings-label">Joined</span>
                                    </div>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={11} /> {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* GitHub */}
                        <div className="cr-card">
                            <div className="cr-card-header">
                                <h3 className="cr-card-title"><Github size={14} /> GitHub Connection</h3>
                                <span className="cr-setting-status cr-setting-status--connected">
                                    <CheckCircle size={12} /> Connected
                                </span>
                            </div>
                            <div className="cr-settings-list" style={{ border: 'none', borderRadius: 0 }}>
                                <div className="cr-settings-row">
                                    <div className="cr-settings-left">
                                        <span className="cr-settings-label">Theme</span>
                                        <span className="cr-settings-desc">Switch between dark and light mode</span>
                                    </div>
                                    <div className="cr-toggle-group" onClick={toggleTheme}>
                                        <span className={`cr-toggle-opt ${theme === 'dark' ? 'cr-toggle-opt--active' : ''}`}>Dark</span>
                                        <span className={`cr-toggle-opt ${theme === 'light' ? 'cr-toggle-opt--active' : ''}`}>Light</span>
                                    </div>
                                </div>
                                <div className="cr-settings-row">
                                    <div className="cr-settings-left">
                                        <span className="cr-settings-label">Notifications</span>
                                        <span className="cr-settings-desc">Receive drift and risk alerts</span>
                                    </div>
                                    <button
                                        className={`cr-switch ${notifications ? 'cr-switch--on' : ''}`}
                                        onClick={() => setNotifications(!notifications)}
                                    >
                                        <span className="cr-switch-thumb" />
                                    </button>
                                </div>
                                <div className="cr-settings-row cr-settings-row--col">
                                    <div className="cr-settings-left">
                                        <span className="cr-settings-label">API Token</span>
                                        <span className="cr-settings-desc">Use this token for CLI and CI/CD integrations</span>
                                    </div>
                                    <div className="cr-token-display">
                                        <code className="cr-token-value">
                                            {showToken ? token : '••••••••••••••••••••••••'}
                                        </code>
                                        <button className="cr-token-btn" onClick={() => setShowToken(!showToken)} title={showToken ? 'Hide' : 'Show'}>
                                            {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button className="cr-token-btn" onClick={handleCopy} title="Copy">
                                            {copied ? <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Activity */}
                    <div className="cr-stack">
                        {/* Activity Metrics */}
                        <div className="cr-card">
                            <div className="cr-card-header">
                                <h3 className="cr-card-title"><User size={14} /> Activity</h3>
                            </div>
                            <div className="cr-card-body">
                                <div className="cr-activity-grid">
                                    <div className="cr-activity-item">
                                        <span className="cr-activity-value">128</span>
                                        <span className="cr-activity-label">Commits Reviewed</span>
                                    </div>
                                    <div className="cr-activity-item">
                                        <span className="cr-activity-value">23</span>
                                        <span className="cr-activity-label">Drift Alerts</span>
                                    </div>
                                    <div className="cr-activity-item">
                                        <span className="cr-activity-value">47</span>
                                        <span className="cr-activity-label">Summaries</span>
                                    </div>
                                    <div className="cr-activity-item">
                                        <span className="cr-activity-value">5</span>
                                        <span className="cr-activity-label">Projects</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Timeline */}
                        <div className="cr-card">
                            <div className="cr-card-header">
                                <h3 className="cr-card-title">Recent Activity</h3>
                            </div>
                            <div className="cr-card-body">
                                <div className="cr-timeline">
                                    <div className="cr-timeline-item">
                                        <span className="cr-timeline-dot" />
                                        <span className="cr-timeline-text">Reviewed commit <code>a3f8d2c</code> in backend-service</span>
                                        <span className="cr-timeline-time">2h ago</span>
                                    </div>
                                    <div className="cr-timeline-item">
                                        <span className="cr-timeline-dot" />
                                        <span className="cr-timeline-text">Resolved drift alert in auth module</span>
                                        <span className="cr-timeline-time">5h ago</span>
                                    </div>
                                    <div className="cr-timeline-item">
                                        <span className="cr-timeline-dot" />
                                        <span className="cr-timeline-text">Generated summary for v2.1.0 release</span>
                                        <span className="cr-timeline-time">1d ago</span>
                                    </div>
                                    <div className="cr-timeline-item">
                                        <span className="cr-timeline-dot" />
                                        <span className="cr-timeline-text">Created project <strong>docs-pipeline</strong></span>
                                        <span className="cr-timeline-time">3d ago</span>
                                    </div>
                                    <div className="cr-timeline-item">
                                        <span className="cr-timeline-dot" />
                                        <span className="cr-timeline-text">Updated GitHub token for ci-platform</span>
                                        <span className="cr-timeline-time">5d ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    )
}
