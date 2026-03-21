import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchUsers, createUser, updateUserRole, deleteUser, clearUsersError } from '../store/slices/usersSlice'
import DashboardLayout from '../components/DashboardLayout'
import { Users, Plus, Trash2, X, CheckCircle } from 'lucide-react'

const Settings = () => {
  const dispatch = useAppDispatch()
  const { users, isLoading, error } = useAppSelector((state) => state.users)
  const { user: currentUser } = useAppSelector((state) => state.auth)

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => { dispatch(fetchUsers()) }, [dispatch])
  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => setSuccessMessage(''), 3000); return () => clearTimeout(t) }
  }, [successMessage])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.username.trim()) errors.username = 'Name is required'
    if (!formData.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 8) errors.password = 'Min 8 characters'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearUsersError())
    if (!validateForm()) return
    const result = await dispatch(createUser(formData))
    if (createUser.fulfilled.match(result)) {
      setShowModal(false)
      setFormData({ username: '', email: '', password: '', role: 'user' })
      setSuccessMessage('User created successfully')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const result = await dispatch(updateUserRole({ userId, role: newRole }))
    if (updateUserRole.fulfilled.match(result)) setSuccessMessage('Role updated')
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete user "${email}"?`)) return
    const result = await dispatch(deleteUser(userId))
    if (deleteUser.fulfilled.match(result)) setSuccessMessage('User deleted')
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({ username: '', email: '', password: '', role: 'user' })
    setFormErrors({})
    dispatch(clearUsersError())
  }

  return (
    <DashboardLayout>
      <motion.div
        className="cr-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="cr-page-header">
          <div>
            <h1 className="cr-page-title">User Management</h1>
            <p className="cr-page-subtitle">Manage users, roles, and access</p>
          </div>
          <button
            className="cr-doc-btn"
            style={{ padding: '6px 14px', fontWeight: 600 }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={14} /> Add User
          </button>
        </div>

        {successMessage && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', marginBottom: 12,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-green-soft)',
            border: '1px solid var(--accent-green)',
            fontSize: 13, color: 'var(--accent-green)', fontWeight: 500,
          }}>
            <CheckCircle size={14} /> {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            padding: '8px 12px', marginBottom: 12,
            borderRadius: 'var(--radius-md)',
            background: 'var(--severity-critical-glow)',
            border: '1px solid var(--severity-critical)',
            fontSize: 13, color: 'var(--severity-critical)',
          }}>
            {error}
          </div>
        )}

        {/* User List */}
        <div className="cr-settings-list">
          {/* Header Row */}
          <div className="cr-settings-row" style={{ background: 'var(--bg-subtle)', padding: '8px 16px' }}>
            <span style={{ flex: 2, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</span>
            <span style={{ flex: 2, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</span>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</span>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
            <span style={{ width: 60, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</span>
          </div>

          {isLoading ? (
            <div className="cr-loading" style={{ minHeight: 120 }}><div className="cr-spinner" /></div>
          ) : users.length === 0 ? (
            <div className="cr-list-empty"><Users size={18} style={{ marginBottom: 8, opacity: 0.4 }} /><br />No users found</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="cr-settings-row">
                <span style={{ flex: 2, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{u.username}</span>
                <span style={{ flex: 2, fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</span>
                <span style={{ flex: 1 }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id}
                    style={{
                      padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                      fontSize: 12, cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </span>
                <span style={{ flex: 1 }}>
                  <span className={`cr-severity cr-severity--${u.is_active ? 'low' : 'medium'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </span>
                <span style={{ width: 60, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="cr-token-btn"
                    style={{ color: 'var(--severity-critical)' }}
                    onClick={() => handleDelete(u.id, u.email)}
                    disabled={u.id === currentUser?.id}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          }} onClick={closeModal}>
            <div style={{
              background: 'var(--bg-default)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 440,
              overflow: 'hidden',
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: '1px solid var(--border-default)',
              }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Add New User</h3>
                <button className="cr-token-btn" onClick={closeModal}><X size={14} /></button>
              </div>
              {error && <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--severity-critical)' }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
                {(['username', 'email', 'password'] as const).map((field) => (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'capitalize' }}>
                      {field === 'username' ? 'Full Name' : field}
                    </label>
                    <input
                      type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder={field === 'password' ? 'Min 8 characters' : `Enter ${field}`}
                      style={{
                        width: '100%', padding: '7px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${formErrors[field] ? 'var(--severity-critical)' : 'var(--border-default)'}`,
                        background: 'var(--bg-subtle)', color: 'var(--text-primary)',
                        fontSize: 13, outline: 'none',
                      }}
                    />
                    {formErrors[field] && <span style={{ fontSize: 11, color: 'var(--severity-critical)' }}>{formErrors[field]}</span>}
                  </div>
                ))}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} style={{
                    padding: '7px 10px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)', background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)', fontSize: 13, width: '100%',
                  }}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="cr-doc-btn" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="cr-doc-btn" style={{
                    background: 'var(--accent-primary)', color: '#fff', border: 'none',
                  }} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default Settings
