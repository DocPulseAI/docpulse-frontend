import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { signup, clearError } from '../store/slices/authSlice'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sparkles, Shield, Zap, CheckCircle } from 'lucide-react'

const Signup = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formErrors, setFormErrors] = useState<{
    username?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    const errors: typeof formErrors = {}

    if (!formData.username.trim()) {
      errors.username = 'Full name is required'
    }

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    await dispatch(
      signup({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      })
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  }

  const passwordStrength = () => {
    const p = formData.password
    if (!p) return { level: 0, label: '', color: '' }
    let score = 0
    if (p.length >= 6) score++
    if (p.length >= 10) score++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++

    if (score <= 1) return { level: 1, label: 'Weak', color: 'var(--accent-red)' }
    if (score <= 2) return { level: 2, label: 'Fair', color: 'var(--accent-orange)' }
    if (score <= 3) return { level: 3, label: 'Good', color: 'var(--accent-orange)' }
    if (score <= 4) return { level: 4, label: 'Strong', color: 'var(--accent-green)' }
    return { level: 5, label: 'Excellent', color: 'var(--accent-green)' }
  }

  const strength = passwordStrength()

  const features = [
    { icon: <Sparkles size={20} />, title: 'AI-Powered Docs', desc: 'Auto-generated documentation from your codebase' },
    { icon: <Shield size={20} />, title: 'Drift Detection', desc: 'Real-time code-to-doc synchronization alerts' },
    { icon: <Zap size={20} />, title: 'CI/CD Integration', desc: 'Seamless pipeline hooks for every commit' },
  ]

  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-branding">
        <div className="auth-branding-bg">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-grid-overlay" />
        </div>

        <motion.div
          className="auth-branding-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="auth-brand-logo">
            <span>DocPulse</span>
          </div>

          <h2 className="auth-brand-headline">
            Start building<br />
            <span className="auth-brand-gradient-text">smarter documentation</span>
          </h2>

          <p className="auth-brand-subtitle">
            Join thousands of teams who trust DocPulse to keep their documentation always in sync with code.
          </p>

          <div className="auth-features-list">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="auth-feature-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
              >
                <div className="auth-feature-icon">{f.icon}</div>
                <div>
                  <div className="auth-feature-title">{f.title}</div>
                  <div className="auth-feature-desc">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <motion.div
          className="auth-form-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="auth-form-header">
            <h1>Create your account</h1>
            <p>Get started free — no credit card required</p>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} className="auth-alert auth-alert-error">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="auth-field">
              <label htmlFor="username">Full name</label>
              <div className={`auth-input-wrap ${formErrors.username ? 'auth-input-error' : ''}`}>
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
              {formErrors.username && <p className="auth-error-msg">{formErrors.username}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className={`auth-input-wrap ${formErrors.email ? 'auth-input-error' : ''}`}>
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {formErrors.email && <p className="auth-error-msg">{formErrors.email}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="auth-field">
              <label htmlFor="password">Password</label>
              <div className={`auth-input-wrap ${formErrors.password ? 'auth-input-error' : ''}`}>
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.password && <p className="auth-error-msg">{formErrors.password}</p>}
              {formData.password && (
                <div className="auth-strength">
                  <div className="auth-strength-track">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="auth-strength-segment"
                        style={{
                          backgroundColor: i <= strength.level ? strength.color : 'var(--border-default)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="auth-strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className={`auth-input-wrap ${formErrors.confirmPassword ? 'auth-input-error' : ''}`}>
                {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                  <CheckCircle size={16} className="auth-input-icon" style={{ color: 'var(--accent-green)' }} />
                ) : (
                  <Lock size={16} className="auth-input-icon" />
                )}
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="auth-error-msg">{formErrors.confirmPassword}</p>
              )}
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" />
                  Creating account…
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup
