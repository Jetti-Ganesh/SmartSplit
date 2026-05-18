import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authSlice";
import ThemeToggle from "./ThemeToggle";
import api from "../../utils/api";
import { fetchUserProfile } from "../services/profileSlice";
import { useNotification } from "../context/NotificationContext";
import "../styles/SettingsDrawer.css";

const SettingsDrawer = ({ isOpen, onClose, isDark, toggleTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { user: profileUser } = useSelector((state) => state.profile);
  const { showNotification } = useNotification();

  // ── States for Change Password ──
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpStep, setCpStep] = useState(1); // 1=verify, 2=new password
  const [cpOtp, setCpOtp] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpTimer, setCpTimer] = useState(0);
  const [cpOtpSent, setCpOtpSent] = useState(false);
  const [showCpPassword, setShowCpPassword] = useState(false);
  const [showCpConfirm, setShowCpConfirm] = useState(false);

  // ── States for Two-Factor Authentication (2FA) ──
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(1); // 1=choose, 2=verify
  const [twoFAOtp, setTwoFAOtp] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFATimer, setTwoFATimer] = useState(0);
  const [twoFAMethod, setTwoFAMethod] = useState('email');
  const [twoFAOtpSent, setTwoFAOtpSent] = useState(false);
  const [show2FAWarning, setShow2FAWarning] = useState(false);

  const canEnable2FA = profileUser?.isEmailVerified && profileUser?.isPhoneVerified;

  // Sync profile details on open
  useEffect(() => {
    if (isOpen && user) {
      dispatch(fetchUserProfile());
    }
  }, [isOpen, user, dispatch]);

  // Close drawer when pressing Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Countdown timer for Change Password
  useEffect(() => {
    let interval;
    if (cpTimer > 0) {
      interval = setInterval(() => setCpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [cpTimer]);

  // Countdown timer for 2FA
  useEffect(() => {
    let interval;
    if (twoFATimer > 0) {
      interval = setInterval(() => setTwoFATimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [twoFATimer]);

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    showNotification('👋 Logged out successfully. See you soon!', 'info', 4000);
    navigate("/");
  };

  // ── Change Password Handlers ──
  const handleCpSendOtp = async () => {
    setCpLoading(true);
    setCpError('');
    setCpSuccess('');
    try {
      const payload = user.email ? { email: user.email } : { phone: user.phone };
      const res = await api.post('/send-otp', payload, { withCredentials: true });
      setCpTimer(30);
      setCpOtpSent(true);
      if (res.data.devOtp) {
        setCpSuccess(`OTP sent! Dev OTP: ${res.data.devOtp}`);
      } else {
        setCpSuccess('OTP sent successfully!');
      }
    } catch (err) {
      setCpError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setCpLoading(false);
    }
  };

  const handleCpVerifyOtp = async () => {
    setCpLoading(true);
    setCpError('');
    setCpSuccess('');
    try {
      await api.post('/verify-otp', { enteredOtp: cpOtp }, { withCredentials: true });
      setCpStep(2);
      setCpError('');
      setCpSuccess('');
    } catch (err) {
      setCpError('Invalid OTP. Try again.');
    } finally {
      setCpLoading(false);
    }
  };

  const handleCpUpdatePassword = async () => {
    setCpError('');
    setCpSuccess('');
    if (cpNewPassword.length < 6) {
      return setCpError('Password must be at least 6 characters');
    }
    if (cpNewPassword !== cpConfirm) {
      return setCpError('Passwords do not match');
    }
    setCpLoading(true);
    try {
      await api.post('/change-password', { newPassword: cpNewPassword, confirmPassword: cpConfirm }, { withCredentials: true });
      showNotification('🔑 Password updated successfully!', 'success');
      setCpSuccess('✅ Password updated!');
      setTimeout(() => {
        resetCpState();
      }, 1200);
    } catch (err) {
      setCpError(err.response?.data?.message || 'Server error.');
    } finally {
      setCpLoading(false);
    }
  };

  const resetCpState = () => {
    setShowChangePassword(false);
    setCpStep(1);
    setCpOtp('');
    setCpNewPassword('');
    setCpConfirm('');
    setCpError('');
    setCpSuccess('');
    setCpLoading(false);
    setCpTimer(0);
    setCpOtpSent(false);
    setShowCpPassword(false);
    setShowCpConfirm(false);
  };

  // ── Two-Factor Authentication Handlers ──
  const handleTwoFASendOtp = async () => {
    setTwoFALoading(true);
    setTwoFAError('');
    setTwoFASuccess('');
    try {
      const payload = twoFAMethod === 'email' ? { email: user.email } : { phone: profileUser?.phone || user.phone };
      const res = await api.post('/send-otp', payload, { withCredentials: true });
      setTwoFAStep(2);
      setTwoFATimer(30);
      setTwoFAOtpSent(true);
      if (res.data.devOtp) {
        setTwoFASuccess(`OTP sent! Dev OTP: ${res.data.devOtp}`);
      } else {
        setTwoFASuccess('OTP sent successfully!');
      }
    } catch (err) {
      setTwoFAError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError('');
    setTwoFASuccess('');
    try {
      await api.post('/verify-otp', { enteredOtp: twoFAOtp }, { withCredentials: true });
      await api.post('/enable-2fa', { method: twoFAMethod }, { withCredentials: true });
      showNotification('🔐 Two-Factor Authentication enabled!', 'success');
      setTwoFASuccess('🔐 Two-Factor Auth enabled!');
      dispatch(fetchUserProfile());
      setTimeout(() => {
        resetTwoFAState();
      }, 1200);
    } catch (err) {
      setTwoFAError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError('');
    setTwoFASuccess('');
    try {
      await api.post('/disable-2fa', {}, { withCredentials: true });
      showNotification('🔓 Two-Factor Authentication disabled.', 'warning');
      setTwoFASuccess('🔐 Two-Factor Auth disabled!');
      dispatch(fetchUserProfile());
      setTimeout(() => {
        resetTwoFAState();
      }, 1200);
    } catch (err) {
      setTwoFAError(err.response?.data?.message || 'Failed to disable 2FA.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const resetTwoFAState = () => {
    setShow2FA(false);
    setTwoFAStep(1);
    setTwoFAOtp('');
    setTwoFAError('');
    setTwoFASuccess('');
    setTwoFALoading(false);
    setTwoFATimer(0);
    setTwoFAMethod('email');
    setTwoFAOtpSent(false);
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    return `${name[0]}***@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return '';
    return `+91****${phone.slice(-4)}`;
  };

  return (
    <>
      <div className={`settings-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div className={`settings-drawer ${isOpen ? "open" : ""}`}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'currentColor', display: 'block' }}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {user && (
            <div className="settings-section">
              <h3>Account</h3>
              <div className="settings-item">
                <span className="settings-label">Email</span>
                <span className="settings-value">{user.email || profileUser?.email}</span>
              </div>
            </div>
          )}

          <div className="settings-section">
            <h3>Preferences</h3>
            <div className="settings-item theme-item">
              <span className="settings-label">App Theme</span>
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </div>
            <div className="settings-item">
              <span className="settings-label">Notifications</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {user && (
            <div className="settings-section">
              <h3>Security</h3>
              <div
                className="settings-item clickable"
                onClick={() => {
                  setShowChangePassword(true);
                  setCpStep(1);
                  setCpError('');
                  setCpSuccess('');
                }}
              >
                <span className="settings-label">Change Password</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>

              <div
                className="settings-item clickable"
                onClick={() => {
                  if (!canEnable2FA) {
                    setShow2FAWarning(true);
                    setTimeout(() => setShow2FAWarning(false), 4000);
                  } else {
                    setShow2FA(true);
                    setTwoFAStep(1);
                    setTwoFAOtp('');
                    setTwoFAError('');
                    setTwoFASuccess('');
                    setTwoFALoading(false);
                    setTwoFAMethod('email');
                    setTwoFAOtpSent(false);
                  }
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span className="settings-label">Two-Factor Auth</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {profileUser?.twoFactorEnabled ? (
                        <span className="badge-on">ON</span>
                      ) : (
                        <span className="badge-off">OFF</span>
                      )}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                  {show2FAWarning && (
                    <div className="settings-2fa-warning">
                      Complete verifying both your email and mobile number in Profile to enable Two-Factor Authentication.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="settings-logout-btn" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Secure Logout
          </button>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      {showChangePassword && (
        <div className="settings-modal-overlay" onClick={resetCpState}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3 className="settings-modal-title">
                {cpStep === 1 ? "Verify It's You" : "Create New Password"}
              </h3>
              <button className="close-btn" onClick={resetCpState} aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'currentColor', display: 'block' }}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {cpStep === 1 ? (
              <>
                <p className="settings-modal-desc">
                  {user.signupMethod === 'email' || user.email ? (
                    `We'll send a 6-digit OTP to ${user.email} to verify your identity.`
                  ) : (
                    `We'll send a 6-digit OTP to +91****${user.phone?.slice(-4)} to verify.`
                  )}
                </p>

                <button
                  type="button"
                  className="settings-modal-btn-primary"
                  onClick={handleCpSendOtp}
                  disabled={cpTimer > 0 || cpLoading}
                >
                  {cpTimer > 0 ? `Resend in ${cpTimer}s` : 'Send OTP'}
                </button>

                {cpOtpSent && (
                  <div className="settings-modal-input-group" style={{ animation: 'fadeIn 0.3s ease', marginTop: '12px' }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={cpOtp}
                      onChange={(e) => setCpOtp(e.target.value)}
                      className="settings-modal-input"
                      style={{ fontSize: '22px', letterSpacing: '6px', textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      className="settings-modal-btn-primary"
                      onClick={handleCpVerifyOtp}
                      disabled={cpOtp.length !== 6 || cpLoading}
                      style={{ marginTop: '8px' }}
                    >
                      {cpLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="settings-modal-input-group">
                  <div className="settings-modal-input-wrapper">
                    <input
                      type={showCpPassword ? 'text' : 'password'}
                      placeholder="New password (min 6 chars)"
                      value={cpNewPassword}
                      onChange={(e) => setCpNewPassword(e.target.value)}
                      className="settings-modal-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCpPassword(!showCpPassword)}
                      style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showCpPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <div className="settings-modal-input-wrapper" style={{ marginTop: '12px' }}>
                    <input
                      type={showCpConfirm ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={cpConfirm}
                      onChange={(e) => setCpConfirm(e.target.value)}
                      className="settings-modal-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCpConfirm(!showCpConfirm)}
                      style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showCpConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="settings-modal-btn-primary"
                  onClick={handleCpUpdatePassword}
                  disabled={cpLoading || cpNewPassword.length < 6 || cpConfirm.length < 6}
                  style={{ marginTop: '16px' }}
                >
                  {cpLoading ? 'Updating...' : 'Update Password'}
                </button>
              </>
            )}

            {cpError && <p style={{ color: '#f43f5e', fontSize: '13px', margin: 0, marginTop: '8px' }}>{cpError}</p>}
            {cpSuccess && <p style={{ color: '#10b981', fontSize: '13px', margin: 0, marginTop: '8px' }}>{cpSuccess}</p>}
          </div>
        </div>
      )}

      {/* ── Two-Factor Authentication Modal ── */}
      {show2FA && (
        <div className="settings-modal-overlay" onClick={resetTwoFAState}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3 className="settings-modal-title">
                {profileUser?.twoFactorEnabled 
                  ? "Disable Two-Factor Auth" 
                  : twoFAStep === 1 ? "Enable Two-Factor Auth" : "Verify & Enable"}
              </h3>
              <button className="close-btn" onClick={resetTwoFAState} aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'currentColor', display: 'block' }}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {profileUser?.twoFactorEnabled ? (
              <>
                <p className="settings-modal-desc">
                  Two-Factor Authentication is currently active on your account. Every time you sign in, an OTP is requested. Would you like to turn it off?
                </p>
                <button
                  type="button"
                  className="settings-modal-btn-primary"
                  onClick={handleDisable2FA}
                  disabled={twoFALoading}
                  style={{ background: '#f43f5e', marginTop: '12px' }}
                >
                  {twoFALoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </>
            ) : twoFAStep === 1 ? (
              <>
                <p className="settings-modal-desc">
                  Every time you log in, we'll verify your identity with a one-time code. Choose your preferred method:
                </p>

                <div className="two-factor-options" style={{ marginTop: '12px' }}>
                  <div
                    className={`two-factor-option-card ${twoFAMethod === 'email' ? 'selected' : ''}`}
                    onClick={() => setTwoFAMethod('email')}
                  >
                    <span>📧</span>
                    <span>Email OTP</span>
                  </div>
                  <div
                    className={`two-factor-option-card ${twoFAMethod === 'phone' ? 'selected' : ''}`}
                    onClick={() => setTwoFAMethod('phone')}
                  >
                    <span>📱</span>
                    <span>SMS OTP</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="settings-modal-btn-primary"
                  onClick={handleTwoFASendOtp}
                  disabled={twoFALoading}
                  style={{ marginTop: '16px' }}
                >
                  {twoFALoading ? 'Sending...' : 'Continue'}
                </button>
              </>
            ) : (
              <>
                <p className="settings-modal-desc">
                  OTP sent to {twoFAMethod === 'email' ? maskEmail(user.email) : maskPhone(profileUser?.phone || user.phone)}
                </p>

                <div className="settings-modal-input-group" style={{ marginTop: '12px' }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={twoFAOtp}
                    onChange={(e) => setTwoFAOtp(e.target.value)}
                    className="settings-modal-input"
                    style={{ fontSize: '22px', letterSpacing: '6px', textAlign: 'center' }}
                  />
                </div>

                <button
                  type="button"
                  className="settings-modal-btn-primary"
                  onClick={handleEnable2FA}
                  disabled={twoFAOtp.length !== 6 || twoFALoading}
                  style={{ marginTop: '16px' }}
                >
                  {twoFALoading ? 'Enabling...' : 'Enable 2FA'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>
                  {twoFATimer > 0 ? (
                    `Resend OTP in ${twoFATimer}s`
                  ) : (
                    <span 
                      style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}
                      onClick={handleTwoFASendOtp}
                    >
                      Resend OTP
                    </span>
                  )}
                </div>
              </>
            )}

            {twoFAError && <p style={{ color: '#f43f5e', fontSize: '13px', margin: 0, marginTop: '8px' }}>{twoFAError}</p>}
            {twoFASuccess && <p style={{ color: '#10b981', fontSize: '13px', margin: 0, marginTop: '8px' }}>{twoFASuccess}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsDrawer;
