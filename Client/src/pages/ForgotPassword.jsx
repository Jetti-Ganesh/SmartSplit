import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/Login-SignUp.css'
axios.defaults.withCredentials = true;

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

function maskIdentifier(value, isEmail) {
  if (!value) return ''
  if (isEmail) {
    const [local, domain] = value.split('@')
    return local[0] + '***@' + domain
  } else {
    return '+91 ****' + value.slice(-4)
  }
}

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [step1Error, setStep1Error] = useState('')
  const [step1Loading, setStep1Loading] = useState(false)
  const [devOtp, setDevOtp] = useState('')

  // Step 2
  const [otp, setOtp] = useState('')
  const [step2Error, setStep2Error] = useState('')
  const [step2Loading, setStep2Loading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Step 3
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [step3Error, setStep3Error] = useState('')
  const [step3Success, setStep3Success] = useState('')
  const [step3Loading, setStep3Loading] = useState(false)

  useEffect(() => {
    let t; if (resendTimer > 0) t = setInterval(() => setResendTimer(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [resendTimer])

  const getIdentifier = () => mode === 'email' ? email : phone.replace(/^\+91/, '').trim()
  const isEmail = mode === 'email'

  // ── Step 1: Send Reset OTP ─────────────────────────────────────────
  const handleSendOtp = async () => {
    setStep1Error('')
    const id = getIdentifier()
    if (!id) return setStep1Error(`Please enter your ${isEmail ? 'email' : 'phone number'}.`)

    setStep1Loading(true)
    try {
      const body = isEmail ? { email: id } : { phone: id }
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/forgot-password`, body)
      if (res.data.devOtp) setDevOtp(res.data.devOtp)
      setResendTimer(30)
      setStep(2)
    } catch (err) {
      setStep1Error(err.response?.data?.message || 'Failed to send OTP.')
    } finally {
      setStep1Loading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setStep2Error('')
    setResendTimer(30)
    try {
      const id = getIdentifier()
      const body = isEmail ? { email: id } : { phone: id }
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/forgot-password`, body)
      if (res.data.devOtp) setDevOtp(res.data.devOtp)
    } catch (err) {
      setStep2Error(err.response?.data?.message || 'Failed to resend OTP.')
    }
  }

  // ── Step 2: Verify Reset OTP ───────────────────────────────────────
  const handleVerifyOtp = async () => {
    setStep2Error('')
    if (!otp || otp.length < 6) return setStep2Error('Please enter the 6-digit OTP.')
    setStep2Loading(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-reset-otp`, { otp })
      setDevOtp('')
      setStep(3)
    } catch (err) {
      setStep2Error(err.response?.data?.message || 'Invalid OTP.')
    } finally {
      setStep2Loading(false)
    }
  }

  // ── Step 3: Reset Password ─────────────────────────────────────────
  const handleResetPassword = async () => {
    setStep3Error('')
    if (!newPassword || !confirmPassword) return setStep3Error('Both fields are required.')
    if (newPassword.length < 6) return setStep3Error('Password must be at least 6 characters.')
    if (newPassword !== confirmPassword) return setStep3Error('Passwords do not match.')

    setStep3Loading(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reset-password`, { newPassword, confirmPassword })
      setStep3Success('🎉 Password reset! Redirecting to login...')
      setTimeout(() => navigate('/Login'), 2000)
    } catch (err) {
      setStep3Error(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setStep3Loading(false)
    }
  }

  return (
    <>
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
      </div>

      <div className="split-container">
        <div className="login-card" style={{ maxWidth: 520, flexDirection: 'column' }}>
          <div className="login-right" style={{ flex: 1, padding: '40px 52px' }}>
            <div className="right-content">

              <div className="mobile-logo">
                <div className="logo-icon">⚡</div>
                <h2>SplitSmart</h2>
              </div>

              {/* ── Step Progress ── */}
              <div className="step-progress">
                {[1, 2, 3].map(n => (
                  <div key={n} className="step-progress-item">
                    <div className={`step-dot ${step >= n ? 'active' : ''} ${step > n ? 'done' : ''}`}>
                      {step > n ? '✓' : n}
                    </div>
                    {n < 3 && <div className={`step-line ${step > n ? 'done' : ''}`}></div>}
                  </div>
                ))}
              </div>

              {/* ════════════════════════════════
                  STEP 1: Find Your Account
              ════════════════════════════════ */}
              {step === 1 && (
                <div style={{ animation: 'slideUpFade 0.4s ease', width: '100%' }}>
                  <h2 className="signin-title" style={{ fontSize: 22 }}>Find Your Account</h2>
                  <p className="signin-desc">We'll send a reset OTP to your registered contact.</p>

                  <div className="mode-toggle">
                    <button type="button" className={`mode-toggle-btn ${mode === 'email' ? 'active' : ''}`}
                      onClick={() => { setMode('email'); setStep1Error('') }}>
                      📧 Email
                    </button>
                    <button type="button" className={`mode-toggle-btn ${mode === 'phone' ? 'active' : ''}`}
                      onClick={() => { setMode('phone'); setStep1Error('') }}>
                      📱 Mobile
                    </button>
                  </div>

                  {step1Error && <p className="error-msg">{step1Error}</p>}

                  {mode === 'email' ? (
                    <div className="input-wrapper" style={{ marginBottom: 16, width: '100%' }}>
                      <div className="input-icon left-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <input type="email" className="pill-input has-left-icon" placeholder="john@example.com"
                        value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  ) : (
                    <div className="input-wrapper" style={{ marginBottom: 16, width: '100%' }}>
                      <div className="input-icon left-icon"><PhoneIcon /></div>
                      <input type="tel" className="pill-input has-left-icon" placeholder="+91 XXXXXXXXXX"
                        value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  )}

                  <button className="solid-btn" onClick={handleSendOtp} disabled={step1Loading}
                    style={{ width: '100%', marginTop: 4 }}>
                    {step1Loading ? 'Sending...' : 'Send Reset OTP'}
                  </button>

                  <p className="signup-prompt">
                    <a onClick={() => navigate('/Login')} style={{ cursor: 'pointer' }}>← Back to Login</a>
                  </p>
                </div>
              )}

              {/* ════════════════════════════════
                  STEP 2: Verify OTP
              ════════════════════════════════ */}
              {step === 2 && (
                <div style={{ animation: 'slideUpFade 0.4s ease', width: '100%' }}>
                  <h2 className="signin-title" style={{ fontSize: 22 }}>Verify OTP</h2>
                  <p className="signin-desc">
                    OTP sent to <strong>{maskIdentifier(getIdentifier(), isEmail)}</strong>
                  </p>

                  {step2Error && <p className="error-msg">{step2Error}</p>}

                  <div className="input-wrapper" style={{ marginBottom: 8, width: '100%' }}>
                    <div className="input-icon left-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                    <input type="text" className="pill-input has-left-icon otp-input"
                      placeholder="• • • • • •" maxLength={6}
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                  </div>

                  {devOtp && (
                    <p className="dev-otp-hint">📱 Dev mode — OTP: <strong>{devOtp}</strong></p>
                  )}

                  <div className="resend-row">
                    <button type="button" className="resend-link" onClick={handleResendOtp} disabled={resendTimer > 0}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button className="solid-btn" onClick={handleVerifyOtp} disabled={step2Loading}
                    style={{ width: '100%', marginTop: 8 }}>
                    {step2Loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <p className="signup-prompt">
                    <a onClick={() => setStep(1)} style={{ cursor: 'pointer' }}>← Change contact</a>
                  </p>
                </div>
              )}

              {/* ════════════════════════════════
                  STEP 3: New Password
              ════════════════════════════════ */}
              {step === 3 && (
                <div style={{ animation: 'slideUpFade 0.4s ease', width: '100%' }}>
                  <h2 className="signin-title" style={{ fontSize: 22 }}>Create New Password</h2>
                  <p className="signin-desc">Choose a strong password for your account.</p>

                  {step3Error && <p className="error-msg">{step3Error}</p>}
                  {step3Success && <p className="success-msg">{step3Success}</p>}

                  <div className="input-wrapper" style={{ marginBottom: 12, width: '100%' }}>
                    <div className="input-icon left-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <input type={showNewPw ? 'text' : 'password'} className="pill-input has-both-icons"
                      placeholder="New password (min. 6 chars)"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <button type="button" className="input-icon right-icon" onClick={() => setShowNewPw(!showNewPw)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showNewPw
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>

                  <div className="input-wrapper" style={{ marginBottom: 16, width: '100%' }}>
                    <div className="input-icon left-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <input type={showConfirmPw ? 'text' : 'password'} className="pill-input has-both-icons"
                      placeholder="Confirm new password"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    <button type="button" className="input-icon right-icon" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showConfirmPw
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>

                  <button className="solid-btn" onClick={handleResetPassword} disabled={step3Loading || !!step3Success}
                    style={{ width: '100%' }}>
                    {step3Loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword
