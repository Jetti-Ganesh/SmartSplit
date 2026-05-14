import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import axios from 'axios';
import '../styles/Login-SignUp.css'
axios.defaults.withCredentials = true;

function SignUp() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', isVerified: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOtp] = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer] = useState(0)
  // console.log(error);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSignup = async (e) => {
    e.preventDefault()

    console.log('API URL:', import.meta.env.VITE_API_URL);
    setError('')
    setSuccess('')

    // Client-side validation
    if (!form.name || !form.email || !form.password)
      return setError('All fields are required.')
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.')

    setLoading(true)
    try {
      if (form.isVerified) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signUp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.message || 'Signup failed. Please try again.')
          return
        }

        // Dispatch Redux action
        dispatch(loginSuccess({ token: data.token, user: data.user }))

        setSuccess('Ready to Login!!')
        navigate('/Dashboard')
      }
      else {
        setSuccess('');
        setError("Verify Your Email To Create Account")
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }


  }
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 1. Get user info from Google
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const userInfo = await res.json()

        // 2. Send to backend to create/find user & get JWT
        const backendRes = await fetch(`${import.meta.env.VITE_API_URL}/api/google-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userInfo.name,
            email: userInfo.email,
            googleId: userInfo.sub,
          }),
        })
        const data = await backendRes.json()

        if (!backendRes.ok) {
          setError(data.message || 'Google sign-up failed.')
          return
        }

        // 3. Dispatch Redux login & navigate
        dispatch(loginSuccess({ token: data.token, user: data.user }))
        navigate('/Dashboard')
      } catch {
        setError('Google sign-up failed. Try again.')
      }
    },
    onError: () => setError('Google sign-up failed. Try again.'),
  })
  const handleEmailVerification = async () => {
    setSuccess("Sending Email...")
    setTimer(8)
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/send-otp`, { email: form.email })
    // console.log(res, res.status);

    console.log(res);
    if (res.status === 200) {
      setShowOTPInput(true)
      setOtp('');
      setError('')
      setSuccess(res.data.message);
    }
    else {
      setSuccess("");
      setError(res.data.message);
    }
  }
  const handleOTPverification = async () => {
    // console.log(otp);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-otp`, { enteredOtp: otp })
      // console.log(res, res.status);
      setShowOTPInput(false)
      setForm({ ...form, isVerified: true })
      setError('')
      setSuccess(res.data.message);
    }
    catch (err) {
      // console.log(err);
      setSuccess("");
      setError(err.response?.data?.message || "Something Went Wrong..");
    }
  }
  return (
    <>
            {/* ── MOBILE TOP BAR ── */} 
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
      </div>
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

            <button className="google-btn" type="button" onClick={handleGoogleSignup}>
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="google-icon"
              />
              Sign up with Google
            </button>

            <div className="divider"><span>or sign up with email</span></div>

            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}

            <form onSubmit={handleSignup} className="login-form">

              {/* Full Name */}
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
                  onChange={handleChange}
                />
              </div>

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
                  className="pill-input has-right-btn"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {
                  !form.isVerified &&
                  <button
                    type="button"
                    className="verify-btn-inside"
                    onClick={handleEmailVerification}
                    disabled={timer > 0}
                    style={{ opacity: timer > 0 ? 0.6 : 1, cursor: timer > 0 ? 'not-allowed' : 'pointer', letterSpacing: 'normal' }}
                  >
                    {timer > 0 ? `Resend (${timer}s)` : (showOTPInput ? 'Resend' : 'Verify')}
                  </button>
                }
              </div>

              {/* OTP */}
              {showOTPInput && (
                <div className="input-wrapper" style={{ animation: 'slideUpFade 0.4s ease' }}>
                  <div className="input-icon left-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="otp"
                    className="pill-input has-left-icon"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    className="verify-otp-btn-inside"
                    onClick={handleOTPverification}
                  >
                    Verify
                  </button>
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