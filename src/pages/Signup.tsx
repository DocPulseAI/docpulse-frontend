import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowUpRight,
  Clock3,
  Eye,
  EyeOff,
  Github,
  GitBranch,
  Gitlab,
  Lock,
  Mail,
  Network,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react'
import { API_BASE_URL } from '../services/api'
import { clearError, signup } from '../store/slices/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

const capabilityRows = [
  { icon: <Network size={16} />, label: 'Architecture', value: 'Interactive maps for controllers, services, dependencies, and infra edges.' },
  { icon: <GitBranch size={16} />, label: 'Execution Flow', value: 'Endpoint-to-runtime traces derived from generated impact and call graph artifacts.' },
  { icon: <Search size={16} />, label: 'Code Search', value: 'Search services, functions, endpoints, ADRs, and generated intelligence from one surface.' },
  { icon: <ShieldCheck size={16} />, label: 'Impact Review', value: 'Risk, affected modules, changed files, and doc drift aligned in one review loop.' },
]

const getSafeReturnTo = (searchParams: URLSearchParams) => {
  const rawReturnTo = searchParams.get('returnTo') || searchParams.get('redirect') || '/dashboard'
  return rawReturnTo.startsWith('/') ? rawReturnTo : '/dashboard'
}

export default function Signup() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      navigate(getSafeReturnTo(searchParams), { replace: true })
    }
  }, [isAuthenticated, navigate, searchParams])

  const validateForm = () => {
    const nextErrors: typeof formErrors = {}

    if (!formData.username.trim()) {
      nextErrors.username = 'Full name is required'
    }

    if (!formData.email) {
      nextErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
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

    if (!validateForm()) {
      return
    }

    await dispatch(
      signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
    )
  }

  const handleGitHubSignup = () => {
    const returnTo = getSafeReturnTo(searchParams)
    window.location.href = `${API_BASE_URL}/auth/github?returnTo=${encodeURIComponent(returnTo)}`
  }

  const passwordStrength = () => {
    const password = formData.password
    if (!password) return { level: 0, label: '', color: '' }

    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { level: 1, label: 'Weak', color: 'var(--accent-red)' }
    if (score <= 2) return { level: 2, label: 'Fair', color: 'var(--accent-orange)' }
    if (score <= 3) return { level: 3, label: 'Good', color: 'var(--accent-orange)' }
    if (score <= 4) return { level: 4, label: 'Strong', color: 'var(--accent-green)' }
    return { level: 5, label: 'Excellent', color: 'var(--accent-green)' }
  }

  const strength = passwordStrength()
  const returnTo = getSafeReturnTo(searchParams)
  const loginHref = returnTo === '/dashboard'
    ? '/login'
    : `/login?returnTo=${encodeURIComponent(returnTo)}`

  return (
    <div className="auth-dev-shell">
      <div className="auth-dev-grid" />

      <section className="auth-dev-panel auth-dev-panel--left">
        <div className="auth-dev-header-row">
          <div className="auth-dev-eyebrow">DocPulse</div>
          <div className="auth-dev-status">Workspace bootstrap</div>
        </div>

        <div className="auth-dev-brand">
          <h1>Start from the same engineering surface you use to review code.</h1>
          <p>
            Create your workspace and move directly into architecture graphs,
            execution flows, API intelligence, impact review, and decision records.
          </p>
        </div>

        <div className="auth-dev-console">
          <div className="auth-dev-console-head">
            <span>workspace/session</span>
            <span>provider bootstrap</span>
          </div>
          <div className="auth-dev-console-body">
            <div className="auth-dev-console-line"><span>$</span> portal workspace create --provider github</div>
            <div className="auth-dev-console-line"><span>{'>'}</span> creating project access, doc generation, and intelligence scopes</div>
            <div className="auth-dev-console-line"><span>{'>'}</span> preparing repository onboarding and review surfaces</div>
            <div className="auth-dev-console-line"><span>$</span> portal open --surface dashboard</div>
          </div>
        </div>

        <div className="auth-dev-capabilities">
          {capabilityRows.map((row) => (
            <div key={row.label} className="auth-dev-capability">
              <div className="auth-dev-capability-icon">{row.icon}</div>
              <div>
                <div className="auth-dev-capability-label">{row.label}</div>
                <div className="auth-dev-capability-value">{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-dev-panel auth-dev-panel--right">
        <div className="auth-dev-card">
          <div className="auth-dev-card-head">
            <div className="auth-dev-badge">Create Account</div>
            <h2>Use the same sign-in surface, but create a new workspace</h2>
            <p>GitHub onboarding is available now. You can also create an account with your email and password.</p>
          </div>

          {error && (
            <div className="auth-dev-alert">
              {error}
            </div>
          )}

          <button
            type="button"
            className="auth-dev-github-btn"
            onClick={handleGitHubSignup}
            disabled={isLoading}
          >
            <Github size={18} />
            {isLoading ? 'Connecting...' : 'Continue with GitHub'}
          </button>

          <div className="auth-dev-divider">
            <span>or use developer credentials</span>
          </div>

          <form className="auth-dev-email-form" onSubmit={handleSubmit}>
            <div className="auth-dev-field">
              <label htmlFor="username">Full name</label>
              <div className={`auth-dev-input-wrap ${formErrors.username ? 'auth-dev-input-wrap--error' : ''}`}>
                <User size={16} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Jane Smith"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  disabled={isLoading}
                />
              </div>
              {formErrors.username && <p className="auth-error-msg">{formErrors.username}</p>}
            </div>

            <div className="auth-dev-field">
              <label htmlFor="email">Email</label>
              <div className={`auth-dev-input-wrap ${formErrors.email ? 'auth-dev-input-wrap--error' : ''}`}>
                <Mail size={16} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
              {formErrors.email && <p className="auth-error-msg">{formErrors.email}</p>}
            </div>

            <div className="auth-dev-field">
              <label htmlFor="password">Password</label>
              <div className={`auth-dev-input-wrap ${formErrors.password ? 'auth-dev-input-wrap--error' : ''}`}>
                <Lock size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="auth-dev-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.password && <p className="auth-error-msg">{formErrors.password}</p>}
              {formData.password && (
                <div className="auth-strength">
                  <div className="auth-strength-track">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="auth-strength-segment"
                        style={{
                          backgroundColor: level <= strength.level ? strength.color : 'var(--border-default)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="auth-strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-dev-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className={`auth-dev-input-wrap ${formErrors.confirmPassword ? 'auth-dev-input-wrap--error' : ''}`}>
                <Lock size={16} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="auth-dev-eye-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.confirmPassword && <p className="auth-error-msg">{formErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              className="auth-dev-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-dev-footer">
            Already have an account? <Link to={loginHref}>Sign in</Link>
          </div>

          <div className="auth-dev-provider-list">
            <div className="auth-dev-provider auth-dev-provider--active">
              <div className="auth-dev-provider-main">
                <Github size={18} />
                <div>
                  <div className="auth-dev-provider-name">GitHub</div>
                  <div className="auth-dev-provider-copy">Available now for repository onboarding and workspace auth.</div>
                </div>
              </div>
              <span className="auth-dev-provider-pill">Live</span>
            </div>

            <div className="auth-dev-provider">
              <div className="auth-dev-provider-main">
                <Clock3 size={18} />
                <div>
                  <div className="auth-dev-provider-name">Bitbucket</div>
                  <div className="auth-dev-provider-copy">Provider integration coming soon.</div>
                </div>
              </div>
              <span className="auth-dev-provider-pill auth-dev-provider-pill--muted">Soon</span>
            </div>

            <div className="auth-dev-provider">
              <div className="auth-dev-provider-main">
                <Gitlab size={18} />
                <div>
                  <div className="auth-dev-provider-name">GitLab</div>
                  <div className="auth-dev-provider-copy">Provider integration coming soon.</div>
                </div>
              </div>
              <span className="auth-dev-provider-pill auth-dev-provider-pill--muted">Soon</span>
            </div>
          </div>

          <a
            className="auth-dev-secondary-link"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            Review GitHub account access
            <ArrowUpRight size={14} />
          </a>

          <div className="auth-dev-note">
            Account creation now uses the same shell and interaction model as login. This replaces the older standalone signup screen.
          </div>
        </div>
      </section>
    </div>
  )
}
