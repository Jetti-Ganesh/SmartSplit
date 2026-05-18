import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../services/authSlice';
import MobileTopBar from '../components/MobileTopBar';
import '../styles/Login-SignUp.css';

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

function Login() {
  const context = useOutletContext() || {};
  const { isDark, toggleTheme } = context;
  const [loginMode, setLoginMode] = useState('email')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const switchMode = (mode) => { setLoginMode(mode); setError('') }

  const getStrippedPhone = () => phone.replace(/^\+91/, '').trim()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!password) return setError('Password is required.')
    if (loginMode === 'email' && !email) return setError('Email is required.')
    if (loginMode === 'phone' && !getStrippedPhone()) return setError('Phone number is required.')

    setLoading(true)
    try {
      const body = loginMode === 'email'
        ? { email, password }
        : { phone: getStrippedPhone(), password }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) return setError(data.message || 'Login failed. Please try again.')

      dispatch(loginSuccess({ token: data.token, user: data.user }))
      const flashMessage = { type: 'success', text: data.message || 'Logged in successfully.' };
      localStorage.setItem('flashMessage', JSON.stringify(flashMessage));
      navigate('/Dashboard')
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <MobileTopBar isDark={isDark ?? false} toggleTheme={toggleTheme ?? (() => {})} showHamburger={false} />

      <div className="split-container">
        <div className="login-card">

          {/* LEFT PANEL */}
          <div className="login-left">
            <div className="left-bg"></div>
            <div className="left-content">
              <div className="logo-container">
                <div className="logo-icon">⚡</div>
                <h2>SplitSmart</h2>
              </div>
              <h1 className="welcome-title">Welcome Back!</h1>
              <p className="welcome-desc">
                To stay connected and manage your expenses effortlessly, please log in with your personal info.
              </p>
              <button className="outline-btn" type="button" onClick={() => navigate('/signUp')}>
                SIGN UP
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="login-right">
            <div className="right-content">

              <div className="mobile-logo">
                <div className="logo-icon">⚡</div>
                <h2>SplitSmart</h2>
              </div>

              <h2 className="signin-title">Sign In</h2>
              <p className="signin-desc">Access your account to continue</p>

              {/* ── Mode Toggle ── */}
              <div className="mode-toggle">
                <button type="button"
                  className={`mode-toggle-btn ${loginMode === 'email' ? 'active' : ''}`}
                  onClick={() => switchMode('email')}>
                  📧 Email
                </button>
                <button type="button"
                  className={`mode-toggle-btn ${loginMode === 'phone' ? 'active' : ''}`}
                  onClick={() => switchMode('phone')}>
                  📱 Mobile
                </button>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <form className="login-form" onSubmit={handleLogin}>

                {/* Email input */}
                {loginMode === 'email' && (
                  <div className="input-wrapper">
                    <div className="input-icon left-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <input type="email" className="pill-input has-left-icon" placeholder="john@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                )}

                {/* Phone input */}
                {loginMode === 'phone' && (
                  <div className="input-wrapper">
                    <div className="input-icon left-icon"><PhoneIcon /></div>
                    <input type="tel" className="pill-input has-left-icon" placeholder="+91 XXXXXXXXXX"
                      value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                )}

                {/* Password */}
                <div className="input-wrapper">
                  <div className="input-icon left-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input type={showPassword ? 'text' : 'password'} className="pill-input has-both-icons"
                    placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" className="input-icon right-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Remember me + Forgot */}
                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <span className="custom-check"></span>
                    Remember me
                  </label>
                  <a className="forgot-pass" style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/forgot-password')}>
                    Forgot password?
                  </a>
                </div>

                <button type="submit" className="solid-btn" disabled={loading}>
                  {loading ? 'Signing in...' : 'LOG IN'}
                </button>

                <p className="signup-prompt">
                  Don't have an account?{' '}
                  <a onClick={() => navigate('/signUp')} style={{ cursor: 'pointer' }}>Sign up</a>
                </p>

              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Login