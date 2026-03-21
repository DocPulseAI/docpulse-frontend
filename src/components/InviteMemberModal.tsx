import { useState } from 'react'
import { X, Mail, Send } from 'lucide-react'
import type { TeamRole, InvitePayload } from '../types/team'
import { ROLE_META } from '../types/team'

interface InviteMemberModalProps {
    isOpen: boolean
    onClose: () => void
    onInvite: (payload: InvitePayload) => void
    isLoading?: boolean
}

const ROLE_OPTIONS: TeamRole[] = ['member', 'admin']

export default function InviteMemberModal({ isOpen, onClose, onInvite, isLoading }: InviteMemberModalProps) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<TeamRole>('member')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const trimmed = email.trim()
        if (!trimmed) { setError('Email is required'); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Invalid email address'); return }
        onInvite({ email: trimmed, role })
        setEmail('')
        setRole('member')
    }

    return (
        <div className="cr-team-modal-overlay" onClick={onClose}>
            <div className="cr-team-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="cr-team-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={14} />
                        <h3 className="cr-team-modal-title">Invite Member</h3>
                    </div>
                    <button className="cr-team-modal-close" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="cr-team-modal-body">
                        <div className="cr-team-modal-field">
                            <label className="cr-team-modal-label">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                className="cr-team-modal-input"
                                autoFocus
                            />
                        </div>

                        <div className="cr-team-modal-field">
                            <label className="cr-team-modal-label">Role</label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value as TeamRole)}
                                className="cr-team-modal-select"
                            >
                                {ROLE_OPTIONS.map(r => (
                                    <option key={r} value={r}>
                                        {ROLE_META[r].label} — {ROLE_META[r].description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="cr-team-modal-error">{error}</div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="cr-team-modal-footer">
                        <button type="button" className="cr-doc-btn" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="cr-doc-btn cr-doc-btn--primary"
                            disabled={isLoading}
                        >
                            <Send size={12} />
                            {isLoading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
