import React from 'react'
import { Users, Trash2 } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)', background: 'var(--bg-subtle)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

const roleBadgeClass = (role: string) => {
  switch (role) {
    case 'owner': return 'cr-severity--critical'
    case 'admin': return 'cr-severity--high'
    case 'editor': return 'cr-severity--medium'
    default: return 'cr-severity--info'
  }
}

interface ProjectMembersPanelProps {
  currentProject: any
  canManageProject: boolean
  isOwner: boolean
  user: any
  isLoading: boolean
  inviteEmail: string
  setInviteEmail: (v: string) => void
  inviteRole: 'member' | 'admin'
  setInviteRole: (v: 'member' | 'admin') => void
  inviteError: string
  handleInvite: (e: React.FormEvent) => void
  handleChangeRole: (memberId: string, role: string) => void
  handleRemoveMember: (memberId: string) => void
  handleCancelInvitation: (invitationId: string) => void
}

export const ProjectMembersPanel: React.FC<ProjectMembersPanelProps> = ({
  currentProject,
  canManageProject,
  isOwner,
  user,
  isLoading,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  inviteError,
  handleInvite,
  handleChangeRole,
  handleRemoveMember,
  handleCancelInvitation,
}) => {
  return (
    <div className="cr-stack">
      {canManageProject && (
        <div className="cr-card">
          <div className="cr-card-header"><h3 className="cr-card-title"><Users size={14} /> Invite Member</h3></div>
          <div className="cr-card-body">
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email address" style={{ ...inputStyle, flex: 2, minWidth: 180 }} />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'member' | 'admin')}
                style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontSize: 12 }}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="cr-doc-btn" style={{ padding: '6px 14px', fontWeight: 600, background: 'var(--accent-primary)', color: '#fff', border: 'none' }} disabled={isLoading}>Send</button>
            </form>
            {inviteError && <div style={{ fontSize: 12, color: 'var(--severity-critical)', marginTop: 6 }}>{inviteError}</div>}
          </div>
        </div>
      )}

      {/* Role legend */}
      <div className="cr-card">
        <div className="cr-card-header"><h3 className="cr-card-title">Role Permissions</h3></div>
        <div className="cr-card-body" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
          <div><span className={`cr-severity ${roleBadgeClass('owner')}`}>owner</span> — full control</div>
          <div><span className={`cr-severity ${roleBadgeClass('admin')}`}>admin</span> — settings + members</div>
          <div><span className={`cr-severity ${roleBadgeClass('editor')}`}>editor</span> — edit docs + versioning</div>
          <div><span className={`cr-severity ${roleBadgeClass('member')}`}>member</span> — read-only</div>
        </div>
      </div>

      <div className="cr-card">
        <div className="cr-card-header"><h3 className="cr-card-title">Members ({currentProject.members?.length || 0})</h3></div>
        <div className="cr-settings-list" style={{ border: 'none', borderRadius: 0 }}>
          {currentProject.members?.map((m: any) => (
            <div key={m.id} className="cr-settings-row">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.username}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</span>
              </div>
              {canManageProject && m.userId !== user?.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select value={m.role} onChange={(e) => handleChangeRole(m.id, e.target.value)} disabled={isLoading}
                    style={{ padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontSize: 12 }}>
                    <option value="member">Member</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    {isOwner && <option value="owner">Owner</option>}
                  </select>
                  {m.role !== 'owner' && <button className="cr-token-btn" style={{ color: 'var(--severity-critical)' }} onClick={() => handleRemoveMember(m.id)}><Trash2 size={14} /></button>}
                </div>
              ) : <span className={`cr-severity ${roleBadgeClass(m.role)}`}>{m.role}</span>}
            </div>
          ))}
        </div>
      </div>

      {canManageProject && currentProject.pendingInvitations && currentProject.pendingInvitations.length > 0 && (
        <div className="cr-card">
          <div className="cr-card-header"><h3 className="cr-card-title">Pending Invitations</h3></div>
          <div className="cr-settings-list" style={{ border: 'none', borderRadius: 0 }}>
            {currentProject.pendingInvitations.map((inv: any) => (
              <div key={inv.id} className="cr-settings-row">
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{inv.email}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="cr-severity cr-severity--medium">Pending</span>
                  <button className="cr-doc-btn" onClick={() => handleCancelInvitation(inv.id)}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
