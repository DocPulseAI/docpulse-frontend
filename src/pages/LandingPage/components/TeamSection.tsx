import { motion } from 'framer-motion'
import { Users, UserPlus, FileText, ShieldCheck, Eye, MessageSquare } from 'lucide-react'

const collaborationFeatures = [
    {
        icon: <UserPlus size={18} />,
        title: 'Invite Teammates',
        description: 'Add engineers, tech writers, and reviewers to a project with one click.',
        color: 'var(--accent-blue)',
    },
    {
        icon: <FileText size={18} />,
        title: 'Shared Documentation Workspace',
        description: 'Keep architecture docs, API references, and ADRs visible for the entire team.',
        color: 'var(--accent-green)',
    },
    {
        icon: <ShieldCheck size={18} />,
        title: 'Role-Based Access',
        description: 'Control who can edit, approve, or publish documentation updates.',
        color: 'var(--accent-purple)',
    },
]

const teamMembers = [
    { name: 'Maya Chen', role: 'Backend Engineer', access: 'Editor', status: 'Online' },
    { name: 'Ravi Patel', role: 'Tech Writer', access: 'Reviewer', status: 'Reviewing' },
    { name: 'Sara Kim', role: 'Engineering Manager', access: 'Admin', status: 'Approving' },
]

export default function TeamSection() {
    return (
        <section id="team-collaboration" className="lp-section">
            <hr className="lp-divider" />

            <div className="lp-container" style={{ paddingTop: 40 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="lp-section-header"
                >
                    <span className="lp-badge">
                        <Users size={13} style={{ color: 'var(--accent-blue)' }} />
                        Team Collaboration
                    </span>
                    <h2 className="lp-section-title" style={{ marginTop: 16 }}>
                        Built for Project Teams
                    </h2>
                    <p className="lp-section-subtitle">
                        Add teammates, assign roles, and give everyone a clear view of live documentation artifacts in one shared workspace.
                    </p>
                </motion.div>

                <div className="lp-grid-2">
                    {/* Feature cards */}
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45 }}
                        className="lp-team-features"
                    >
                        {collaborationFeatures.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="lp-feature-card"
                            >
                                <div className="lp-team-feature">
                                    <div
                                        className="lp-feature-icon"
                                        style={{
                                            background: `color-mix(in srgb, ${feature.color} 12%, transparent)`,
                                            color: feature.color, marginBottom: 0,
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <div className="lp-feature-title">{feature.title}</div>
                                        <div className="lp-feature-desc">{feature.description}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Team workspace */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                        className="lp-card"
                    >
                        <div className="lp-card-body">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Team Workspace Snapshot
                                </span>
                                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                    3 members active
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {teamMembers.map((member) => (
                                    <div key={member.name} className="lp-team-member">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{member.name}</span>
                                            <span className="lp-team-member-status">{member.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{member.role}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{member.access}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                                marginTop: 14, paddingTop: 14,
                                borderTop: '1px solid var(--border-muted)',
                            }}>
                                <div style={{
                                    padding: 10, borderRadius: 6, background: 'var(--bg-subtle)',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <Eye size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>View docs in real time</span>
                                </div>
                                <div style={{
                                    padding: 10, borderRadius: 6, background: 'var(--bg-subtle)',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <MessageSquare size={14} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Comment before publish</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
