import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import '../styles/Login-SignUp.css'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password)
      return setError('All fields are required.')

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.')
        return
      }

      // Dispatch Redux action
      dispatch(loginSuccess({ token: data.token, user: data.user }))

      navigate('/Dashboard')
    } catch (err) {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
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

            {error && <p className="error-msg">{error}</p>}

            <form className="login-form" onSubmit={handleLogin}>

              {/* Email */}
              <div className="input-wrapper">
                <div className="input-icon left-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  className="pill-input has-left-icon"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="input-wrapper">
                <div className="input-icon left-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="pill-input has-both-icons"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="input-icon right-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
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

              {/* Remember me + Forgot password */}
              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                  />
                  <span className="custom-check"></span>
                  Remember me
                </label>
                <a href="#" className="forgot-pass">Forgot password?</a>
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
  )
}

export default Login