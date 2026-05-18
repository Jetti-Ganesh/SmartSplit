import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../services/authSlice';
import MobileTopBar from '../components/MobileTopBar';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import '../styles/Login-SignUp.css'
axios.defaults.withCredentials = true;

function SignUp() {
  const context = useOutletContext() || {};
  const { isDark, toggleTheme } = context;
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showNotification } = useNotification()

  const [signupMode, setSignupMode] = useState('email') // 'email' | 'phone'
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

  const [showPassword, setShowPassword] = useState(false)
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [timer, setTimer] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  // console.log("API URL" , import.meta.env.VITE_API_URL);
 
  
  // Countdown timer for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const resetVerification = () => {
    setIsEmailVerified(false)
    setIsPhoneVerified(false)
    setShowOTPInput(false)
    setOtp('')
    setDevOtp('')
    setError('')
    setSuccess('')
    setForm(f => ({ ...f, email: '', phone: '' }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Handle Email OTP verification send
  const handleEmailVerification = async () => {
    setError('')
    if (!form.email) {
      return setError('Please enter your email address.')
    }
    setSuccess('Sending OTP to your email...')
    setTimer(30)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/send-otp`,
        { email: form.email },
        { withCredentials: true }
      )
      setShowOTPInput(true)
      setOtp('')
      setDevOtp(res.data.devOtp || '')
      setError('')
      setSuccess(res.data.message)
    } catch (err) {
      setSuccess('')
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.')
    }
  }

  // Handle Phone OTP verification send
  const handlePhoneVerification = async () => {
    setError('')
    const digits = form.phone.replace(/\D/g, '').slice(-10)
    if (digits.length !== 10) {
      return setError('Please enter a valid 10-digit mobile number.')
    }
    setSuccess('Sending OTP to your mobile...')
    setTimer(30)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/send-otp`,
        { phone: digits },
        { withCredentials: true }
      )
      setShowOTPInput(true)
      setOtp('')
      setDevOtp(res.data.devOtp || '')
      setError('')
      setSuccess(res.data.message)
    } catch (err) {
      setSuccess('')
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.')
    }
  }

  // Handle verifying entered OTP
  const handleOTPverification = async () => {
    setError('')
    if (!otp) {
      return setError('Please enter the OTP.')
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verify-otp`,
        { enteredOtp: otp },
        { withCredentials: true }
      )
      setShowOTPInput(false)
      setDevOtp('')
      if (signupMode === 'email') setIsEmailVerified(true)
      else setIsPhoneVerified(true)
      setError('')
      setSuccess(res.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (signupMode === 'email') {
      if (!form.name || !form.email || !form.password)
        return setError('All fields are required.')
      if (!isEmailVerified)
        return setError('Please verify your email first.')
    } else {
      if (!form.name || !form.phone || !form.password)
        return setError('All fields are required.')
      if (!isPhoneVerified)
        return setError('Please verify your mobile number first.')
    }

    setLoading(true)
    try {
      const digits = form.phone.replace(/\D/g, '').slice(-10)
      const body = signupMode === 'email'
        ? { name: form.name, email: form.email, password: form.password, signupMethod: 'email' }
        : { name: form.name, phone: digits, password: form.password, signupMethod: 'phone' }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signUp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        return setError(data.message || 'Signup failed.')
      }

      dispatch(loginSuccess({ token: data.token, user: data.user }))
      showNotification('🎉 Account created successfully! Welcome to SmartSplit.', 'success', 5000)
      navigate('/Dashboard')
    } catch (err) {
      setError('Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  // Google Sign In (unchanged functionality)
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const userInfo = await res.json()
        const backendRes = await fetch(`${import.meta.env.VITE_API_URL}/api/google-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userInfo.name, email: userInfo.email, googleId: userInfo.sub }),
        })
        const data = await backendRes.json()
        if (!backendRes.ok) return setError(data.message || 'Google sign-up failed.')
        dispatch(loginSuccess({ token: data.token, user: data.user }))
        showNotification('🎉 Signed in with Google! Welcome to SmartSplit.', 'success', 5000)
        navigate('/Dashboard')
      } catch { setError('Google sign-up failed. Try again.') }
    },
    onError: () => setError('Google sign-up failed. Try again.'),
  })

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
              <h1 className="welcome-title">Hello, Friend!</h1>
              <p className="welcome-desc">
                Enter your details and start your journey with us today. Split bills, track expenses effortlessly.
              </p>
              <button className="outline-btn" type="button" onClick={() => navigate('/login')}>
                SIGN IN
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

              <h2 className="signin-title">Create Account</h2>
              <p className="signin-desc">Join us today — it's free</p>

              {/* ── Mode Toggle ── */}
              <div className="auth-toggle-container">
                <button
                  type="button"
                  className={`auth-toggle-btn ${signupMode === 'email' ? 'active' : ''}`}
                  onClick={() => { setSignupMode('email'); resetVerification(); }}
                >
                  📧 Email
                </button>
                <button
                  type="button"
                  className={`auth-toggle-btn ${signupMode === 'phone' ? 'active' : ''}`}
                  onClick={() => { setSignupMode('phone'); resetVerification(); }}
                >
                  📱 Mobile
                </button>
              </div>

              {/* Google Button */}
              <button className="google-btn" type="button" onClick={handleGoogleSignup}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
                Sign up with Google
              </button>

              <div className="divider">
                <span>{signupMode === 'email' ? 'or sign up with email' : 'or sign up with mobile'}</span>
              </div>

              {error && <p className="error-msg">{error}</p>}
              {success && <p className="success-msg">{success}</p>}

              <form onSubmit={handleSignup} className="login-form">

                {/* Name */}
                <div className="input-wrapper">
                  <div className="input-icon left-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="name"
                    className="pill-input has-left-icon"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleInputChange}
                  />
                </div>

                {/* ── Email mode fields ── */}
                {signupMode === 'email' && (
                  <>
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
                        className="pill-input has-right-btn"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={handleInputChange}
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          className="verify-btn-inside"
                          onClick={handleEmailVerification}
                          disabled={timer > 0}
                          style={{ opacity: timer > 0 ? 0.6 : 1, cursor: timer > 0 ? 'not-allowed' : 'pointer' }}
                        >
                          {timer > 0 ? `Resend (${timer}s)` : 'Verify'}
                        </button>
                      )}
                      {isEmailVerified && <span className="verified-badge-inline">✓ Verified</span>}
                    </div>
                  </>
                )}

                {/* ── Phone mode fields ── */}
                {signupMode === 'phone' && (
                  <>
                    <div className="input-wrapper">
                      <div className="input-icon left-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.77 3.38 2 2 0 0 1 3.74 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        className="pill-input has-right-btn"
                        placeholder="+91 XXXXXXXXXX"
                        value={form.phone}
                        onChange={handleInputChange}
                      />
                      {!isPhoneVerified && (
                        <button
                          type="button"
                          className="verify-btn-inside"
                          onClick={handlePhoneVerification}
                          disabled={timer > 0}
                          style={{ opacity: timer > 0 ? 0.6 : 1, cursor: timer > 0 ? 'not-allowed' : 'pointer' }}
                        >
                          {timer > 0 ? `Resend (${timer}s)` : 'Verify'}
                        </button>
                      )}
                      {isPhoneVerified && <span className="verified-badge-inline">✓ Verified</span>}
                    </div>
                  </>
                )}

                {/* OTP Input Block */}
                {showOTPInput && (
                  <div className="input-wrapper" style={{ animation: 'slideUpFade 0.4s ease', flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
                      <div className="input-icon left-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="pill-input has-left-icon"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ width: '100%' }}
                      />
                      <button type="button" className="verify-otp-btn-inside" onClick={handleOTPverification}>
                        Verify OTP
                      </button>
                    </div>
                    {devOtp && (
                      <p className="dev-otp-hint" style={{ marginTop: 8, fontSize: 12, paddingLeft: 12 }}>
                        📱 Dev mode — OTP: <strong>{devOtp}</strong>
                      </p>
                    )}
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
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="pill-input has-both-icons"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleInputChange}
                  />
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

                <button type="submit" className="solid-btn" disabled={loading}>
                  {loading ? 'Creating...' : 'CREATE ACCOUNT'}
                </button>

                <p className="signup-prompt">
                  Already have an account?{' '}
                  <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Log in</a>
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