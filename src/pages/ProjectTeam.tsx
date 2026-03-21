import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchProjectById, inviteMember, removeMember, updateMemberRole, cancelInvitation } from '../store/slices/projectsSlice'
import { projectsApi } from '../services/api'
import { Users, UserPlus, ChevronRight, Clock, Shield, Trash2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import RoleBadge from '../components/RoleBadge'
import InviteMemberModal from '../components/InviteMemberModal'
import type { TeamMember, TeamRole, TeamActivity, InvitePayload } from '../types/team'
import { ROLE_META } from '../types/team'

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const relativeTime = (iso?: string) => {
  if (!iso) return '-'
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60_000) return 'Just now'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  if (d < 604_800_000) return `${Math.floor(d / 86_400_000)}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function ProjectTeam() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentProject, isLoading } = useAppSelector((s) => s.projects)
  const { user } = useAppSelector((s) => s.auth)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [activity, setActivity] = useState<TeamActivity[]>([])

  useEffect(() => {
    if (id) dispatch(fetchProjectById(id))
  }, [dispatch, id])

  const members: TeamMember[] = useMemo(() => {
    if (!currentProject?.members) return []
    return currentProject.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.username,
      email: m.email,
      role: (m.role as TeamRole) || 'member',
      status: 'active',
      lastActive: m.joinedAt,
      joinedAt: m.joinedAt,
    }))
  }, [currentProject])

  const invitedMembers: TeamMember[] = useMemo(() => {
    if (!currentProject?.pendingInvitations) return []
    return currentProject.pendingInvitations.map((inv) => ({
      id: inv.id,
      name: inv.email.split('@')[0],
      email: inv.email,
      role: (inv.role as TeamRole) || 'member',
      status: 'invited',
      joinedAt: inv.createdAt,
      lastActive: inv.createdAt,
    }))
  }, [currentProject])

  const allRows = [...members, ...invitedMembers]
  const isOwnerOrAdmin = currentProject?.memberRole === 'owner' || currentProject?.memberRole === 'admin'

  const roleDistribution = useMemo(() => {
    const map: Record<string, number> = {}
    for (const m of members) map[m.role] = (map[m.role] || 0) + 1
    return Object.entries(map) as [TeamRole, number][]
  }, [members])

  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return
      try {
        const response = await projectsApi.getActivity(id)
        const rows = (response.data.activity || []).map((a) => ({
          id: a.id,
          type: (a.type as TeamActivity['type']) || 'join',
          actor: a.actor,
          detail: a.detail,
          timestamp: a.timestamp,
        }))
        setActivity(rows)
      } catch {
        setActivity([])
      }
    }
    loadActivity()
  }, [id, currentProject?.updatedAt, user?.username])

  const handleInvite = async (payload: InvitePayload) => {
    if (!id) return
    setInviteLoading(true)
    const result = await dispatch(inviteMember({ projectId: id, email: payload.email, role: payload.role }))
    if (inviteMember.fulfilled.match(result)) {
      setShowInviteModal(false)
      await dispatch(fetchProjectById(id))
    }
    setInviteLoading(false)
  }

  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    if (!id) return
    await dispatch(updateMemberRole({ projectId: id, memberId, role: newRole }))
    await dispatch(fetchProjectById(id))
  }

  const handleRemove = async (memberId: string, status: 'active' | 'invited') => {
    if (!id) return
    if (status === 'active') {
      await dispatch(removeMember({ projectId: id, memberId }))
      await dispatch(fetchProjectById(id))
      return
    }
    await dispatch(cancelInvitation({ projectId: id, invitationId: memberId }))
    await dispatch(fetchProjectById(id))
  }

  if (isLoading && !currentProject) {
    return <DashboardLayout><div className="cr-page"><div className="cr-loading"><div className="cr-spinner" /></div></div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="cr-page cr-page--flush">
        <div className="cr-team-page-header">
          <div className="cr-doc-breadcrumb" style={{ marginBottom: 8 }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-link)', cursor: 'pointer', fontSize: 12, padding: 0 }} onClick={() => navigate('/projects')}>Projects</button>
            <ChevronRight size={10} />
            <button style={{ background: 'none', border: 'none', color: 'var(--text-link)', cursor: 'pointer', fontSize: 12, padding: 0 }} onClick={() => navigate(`/projects/${id}`)}>Project</button>
            <ChevronRight size={10} />
            <strong style={{ color: 'var(--text-primary)', fontSize: 12 }}>Team</strong>
          </div>
          <div className="cr-team-header-row">
            <div>
              <h1 className="cr-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} /> Team</h1>
              <p className="cr-page-subtitle">Manage project members, roles, and permissions</p>
            </div>
            {isOwnerOrAdmin && <button className="cr-doc-btn cr-doc-btn--primary" onClick={() => setShowInviteModal(true)}><UserPlus size={13} /> Invite Member</button>}
          </div>
        </div>

        <div style={{ padding: 24, maxWidth: 1000 }}>
          <div className="cr-team-summary">
            <div className="cr-team-summary-stat"><span className="cr-team-summary-value">{allRows.length}</span><span className="cr-team-summary-label">Members</span></div>
            <div className="cr-team-summary-divider" />
            <div className="cr-team-summary-roles">
              {roleDistribution.map(([role, count]) => <div key={role} className="cr-team-summary-role"><RoleBadge role={role} size="sm" /><span className="cr-team-summary-count">{count}</span></div>)}
            </div>
          </div>

          <div className="cr-card" style={{ marginBottom: 16 }}>
            <div className="cr-card-header"><h3 className="cr-card-title"><Users size={14} /> Team Members</h3><span className="cr-card-meta">{allRows.length} total</span></div>
            <div className="cr-card-body--flush">
              <div className="cr-team-table-wrap">
                <table className="cr-team-table">
                  <thead><tr><th style={{ width: 40 }}></th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Active</th>{isOwnerOrAdmin && <th style={{ width: 120 }}>Actions</th>}</tr></thead>
                  <tbody>
                    {allRows.map((member) => (
                      <tr key={member.id}>
                        <td><div className="cr-team-avatar">{member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} /> : initials(member.name)}</div></td>
                        <td><span className="cr-team-name">{member.name}</span></td>
                        <td><span className="cr-team-email">{member.email}</span></td>
                        <td><RoleBadge role={member.role} /></td>
                        <td><span className={`cr-team-status cr-team-status--${member.status}`}><span className="cr-team-status-dot" />{member.status === 'active' ? 'Active' : 'Invited'}</span></td>
                        <td><span className="cr-team-last-active">{relativeTime(member.lastActive)}</span></td>
                        {isOwnerOrAdmin && (
                          <td>
                            <div className="cr-team-actions">
                              {member.role !== 'owner' && member.status === 'active' ? (
                                <>
                                  <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value as TeamRole)} className="cr-team-role-select">
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
                                  </select>
                                  <button className="cr-team-remove-btn" onClick={() => handleRemove(member.id, member.status)} title="Remove member"><Trash2 size={13} /></button>
                                </>
                              ) : (<span className="cr-team-you-label">-</span>)}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="cr-card" style={{ marginBottom: 16 }}>
            <div className="cr-card-header"><h3 className="cr-card-title"><Shield size={14} /> Role Permissions</h3></div>
            <div className="cr-card-body"><div className="cr-team-role-legend">{(Object.entries(ROLE_META) as [TeamRole, typeof ROLE_META[TeamRole]][]).map(([role, meta]) => <div key={role} className="cr-team-role-legend-item"><RoleBadge role={role} /><span className="cr-team-role-legend-desc">- {meta.description}</span></div>)}</div></div>
          </div>

          <div className="cr-card">
            <div className="cr-card-header"><h3 className="cr-card-title"><Clock size={14} /> Activity</h3><span className="cr-card-meta">Recent</span></div>
            <div className="cr-card-body--flush">
              <div className="cr-timeline" style={{ padding: '0 16px' }}>
                {activity.map((a) => <div key={a.id} className="cr-timeline-item"><span className="cr-timeline-text">{a.detail}</span><span className="cr-timeline-time">{relativeTime(a.timestamp)}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InviteMemberModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onInvite={handleInvite} isLoading={inviteLoading} />
    </DashboardLayout>
  )
}
