import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../services/authSlice'
import { apiUrl } from '../services/api'
import { useNotification } from '../context/NotificationContext'
import '../styles/Login-SignUp.css'

function Login() {
  const { isDark, toggleTheme } = useOutletContext() || {}
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showNotification } = useNotification()

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Username and password are required.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.')
        return
      }

      dispatch(loginSuccess({ token: data.token, user: data.user }))
      showNotification(data.message || 'Logged in successfully. Welcome back!', 'success', 5000)
      navigate('/Dashboard')
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="split-container">
        <div className="login-card">
          <div className="login-left">
            <div className="left-bg"></div>
            <div className="left-content">
              <div className="logo-container">
                <div className="logo-icon">⚡</div>
                <h2>SmartSplit</h2>
              </div>
              <h1 className="welcome-title">Welcome Back!</h1>
              <p className="welcome-desc">
                Sign in with your username and password to manage your shared expenses.
              </p>
              <button className="outline-btn" type="button" onClick={() => navigate('/signUp')}>
                CREATE ACCOUNT
              </button>
            </div>
          </div>

          <div className="login-right">
            <div className="right-content">
              <div className="mobile-logo">
                <div className="logo-icon">💸</div>
                <h2>SmartSplit</h2>
              </div>
              <h2 className="signin-title">Sign In</h2>
              <p className="signin-desc">Access your account to continue</p>

              {error && <p className="error-msg">{error}</p>}

              <form className="login-form" onSubmit={handleLogin}>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="pill-input"
                    placeholder="Username"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </div>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="pill-input password-input"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon right-icon password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button type="submit" className="solid-btn" disabled={loading}>
                  {loading ? 'Signing in...' : 'LOG IN'}
                </button>
                <p className="signup-prompt">
                  Don&apos;t have an account?{' '}
                  <a onClick={() => navigate('/signUp')} style={{ cursor: 'pointer' }}>Create one</a>
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
