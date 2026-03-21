import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Clock3, Github, GitBranch, Gitlab, Network, Search, ShieldCheck } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearError, getMe, checkAuthOnLoad, login } from '../store/slices/authSlice'
import { API_BASE_URL } from '../services/api'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const capabilityRows = [
  { icon: <Network size={16} />, label: 'Architecture', value: 'Interactive maps for controllers, services, dependencies, and infra edges.' },
  { icon: <GitBranch size={16} />, label: 'Execution Flow', value: 'Endpoint-to-runtime traces derived from generated impact and call graph artifacts.' },
  { icon: <Search size={16} />, label: 'Code Search', value: 'Search services, functions, endpoints, ADRs, and generated intelligence from one surface.' },
  { icon: <ShieldCheck size={16} />, label: 'Impact Review', value: 'Risk, affected modules, changed files, and doc drift aligned in one review loop.' },
]

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    const oauthToken = searchParams.get('access_token')
    const oauthError = searchParams.get('oauth_error')
    const returnTo = searchParams.get('returnTo') || '/dashboard'

    if (oauthError) {
      dispatch(clearError())
      return
    }

    if (oauthToken) {
      localStorage.setItem('access_token', oauthToken)
      dispatch(checkAuthOnLoad())
      dispatch(getMe())
      navigate(returnTo.startsWith('/') ? returnTo : '/dashboard', { replace: true })
    }
  }, [dispatch, navigate, searchParams])

  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get('returnTo') || '/dashboard'
      navigate(returnTo.startsWith('/') ? returnTo : '/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate, searchParams])

  const handleGitHubLogin = () => {
    const returnTo = searchParams.get('returnTo') || '/dashboard'
    window.location.href = `${API_BASE_URL}/auth/github?returnTo=${encodeURIComponent(returnTo)}`
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    await dispatch(login({ email, password }))
  }

  return (
    <div className="auth-dev-shell">
      <div className="auth-dev-grid" />

      <section className="auth-dev-panel auth-dev-panel--left">
        <div className="auth-dev-header-row">
          <div className="auth-dev-eyebrow">DocPulse</div>
          <div className="auth-dev-status">Handshake active</div>
        </div>

        <div className="auth-dev-brand">
          <h1>Built for engineers reviewing living systems, not raw folders.</h1>
          <p>
            Connect your repository workspace and move directly into architecture graphs,
            execution flows, API intelligence, impact review, and decision records.
          </p>
        </div>

        <div className="auth-dev-console">
          <div className="auth-dev-console-head">
            <span>workspace/session</span>
            <span>provider handshake</span>
          </div>
          <div className="auth-dev-console-body">
            <div className="auth-dev-console-line"><span>$</span> portal auth connect --provider github</div>
            <div className="auth-dev-console-line"><span>{'>'}</span> validating repository identity and token scopes</div>
            <div className="auth-dev-console-line"><span>{'>'}</span> enabling projects, intelligence graph, and code search</div>
            <div className="auth-dev-console-line"><span>$</span> portal open --surface intelligence</div>
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
            <div className="auth-dev-badge">Repository Providers</div>
            <h2>Sign in with your source control provider</h2>
            <p>GitHub is available now. Bitbucket, GitLab, and additional providers are coming soon.</p>
          </div>

          {(error || searchParams.get('oauth_error')) && (
            <div className="auth-dev-alert">
              {error || searchParams.get('oauth_error')}
            </div>
          )}

          <button
            type="button"
            className="auth-dev-github-btn"
            onClick={handleGitHubLogin}
            disabled={isLoading}
          >
            <Github size={18} />
            {isLoading ? 'Connecting...' : 'Continue with GitHub'}
          </button>

          <div className="auth-dev-divider">
            <span>or use developer credentials</span>
          </div>

          <form className="auth-dev-email-form" onSubmit={handleLogin}>
            <div className="auth-dev-field">
              <label htmlFor="email">Email</label>
              <div className="auth-dev-input-wrap">
                <Mail size={16} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="auth-dev-field">
              <div className="auth-dev-label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <div className="auth-dev-input-wrap">
                <Lock size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="auth-dev-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-dev-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-dev-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
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
            GitHub identity is used for repository access, project onboarding, documentation generation, and intelligence surfaces. Bitbucket, GitLab, and other providers will be added soon.
          </div>
        </div>
      </section>
    </div>
  )
}
