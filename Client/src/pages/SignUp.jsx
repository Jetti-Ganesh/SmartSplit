import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../services/authSlice'
import { apiUrl } from '../services/api'
import { useNotification } from '../context/NotificationContext'
import '../styles/Login-SignUp.css'

function SignUp() {
  const { isDark, toggleTheme } = useOutletContext() || {}
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showNotification } = useNotification()

  const handleSignup = async (event) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !username.trim() || !password) {
      setError('Name, username, and password are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(apiUrl('/api/signUp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Account creation failed. Please try again.')
        return
      }

      dispatch(loginSuccess({ token: data.token, user: data.user }))
      showNotification('Account created successfully. Welcome to SmartSplit!', 'success', 5000)
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
                <div className="logo-icon">💸</div>
                <h2>SmartSplit</h2>
              </div>
              <h1 className="welcome-title">Hello, Friend!</h1>
              <p className="welcome-desc">
                Create an account to start sharing bills and tracking expenses.
              </p>
              <button className="outline-btn" type="button" onClick={() => navigate('/login')}>
                SIGN IN
              </button>
            </div>
          </div>

          <div className="login-right">
            <div className="right-content">
              <div className="mobile-logo">
                <div className="logo-icon">💸</div>
                <h2>SmartSplit</h2>
              </div>
              <h2 className="signin-title">Create Account</h2>
              <p className="signin-desc">Use a username and password to get started</p>
              {error && <p className="error-msg">{error}</p>}

              <form onSubmit={handleSignup} className="login-form">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    className="pill-input"
                    placeholder="Your name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="username"
                    className="pill-input"
                    placeholder="Username (3-30 letters, numbers, or _)"
                    autoComplete="username"
                    minLength={3}
                    maxLength={30}
                    pattern="[A-Za-z0-9_]{3,30}"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </div>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="pill-input password-input"
                    placeholder="Password (at least 6 characters)"
                    autoComplete="new-password"
                    minLength={6}
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
                  {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
                </button>
                <p className="signup-prompt">
                  Already have an account?{' '}
                  <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Sign in</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUp
