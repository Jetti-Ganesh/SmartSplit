// ProfilePage.jsx
// ─────────────────────────────────────────────────────
// UPI Expense Splitter — Profile Page
// Includes: Sidebar (desktop) + Mobile Bottom Nav
// CSS: ./ProfilePage.css
// ─────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { logout } from "../services/authSlice";
import { fetchUserProfile, updateUserProfile, clearSuccess } from "../services/profileSlice";
import ThemeToggle from "../components/ThemeToggle";
import BottomNavbareM from "../components/BottomNavbareM";
import SettingsDrawer from "../components/SettingsDrawer";
import "../styles/Profile.css";
// ─────────────────────────────────────────────────────
// ── CONSTANTS 
// ─────────────────────────────────────────────────────



const INITIAL_USER = {
  name: "Loading...",
  phone: "",
  email: "Loading...",
  defaultUpi: "",
  upiList: [],
  avatar: null,
};

const STATS = [
  { label: "Total Expenses",     value: "₹1,24,560", colorClass: "gold"  },
  { label: "Groups Joined",      value: "8",          colorClass: ""      },
  { label: "Settled This Month", value: "₹4,200",     colorClass: "green" },
  { label: "Fairness Score",     value: "92",         colorClass: "",     isScore: true },
];

const PREFERENCES = [
  { id: "notifications",    label: "Notifications",     icon: "🔔", defaultOn: true  },
  { id: "paymentReminders", label: "Payment Reminders", icon: "⏰", defaultOn: true  },
  { id: "weeklySummary",    label: "Weekly Summary",    icon: "📊", defaultOn: false },
];

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getActiveId(pathname) {
  const map = {
    "/Dashboard": "dashboard",
    "/Groups":    "groups",
    "/Activity":  "activity",
    "/SettleUp":  "settle",
    "/Profile":   "profile",
  };
  return map[pathname] ?? "dashboard";
}

// ─────────────────────────────────────────────────────
// ── REUSABLE SMALL COMPONENTS
// ─────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-track" />
    </label>
  );
}

function InfoRow({ icon, iconClass, label, value, onClick }) {
  return (
    <div className="info-row" onClick={onClick}>
      <div className="info-row-left">
        <div className={`info-icon ${iconClass}`}>{icon}</div>
        <span className="info-label">{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span className="info-value">{value}</span>
        <span className="info-arrow">›</span>
      </div>
    </div>
  );

}


function ActionBtn({ icon, iconClass, label, onClick, variant }) {
  return (
    <button className={`action-btn ${variant || ""}`} onClick={onClick}>
      <div className={`btn-icon ${iconClass}`}>{icon}</div>
      <span>{label}</span>
      <span className="btn-arrow">›</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────
// ── MODALS
// ─────────────────────────────────────────────────────

function EditModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone, email: user.email });
  const [avatar, setAvatar] = useState(user.avatar);
  const [previewImage, setPreviewImage] = useState(user.avatar);
  const fileInputRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image using canvas
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Resize if larger than 500px
          if (width > 500 || height > 500) {
            const ratio = Math.min(500 / width, 500 / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (JPEG at 0.8 quality)
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          console.log('📸 Original size:', file.size, 'bytes');
          console.log('📸 Compressed size:', compressedImage.length, 'bytes');
          
          setPreviewImage(compressedImage);
          setAvatar(compressedImage);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ ...form, avatar });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Edit Personal Details</div>
        
        {/* Image Upload Section */}
        <div className="modal-field" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>Profile Picture</label>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 10px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb',
            cursor: 'pointer'
          }} onClick={() => fileInputRef.current?.click()}>
            {previewImage ? (
              <img src={previewImage} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '40px' }}>📸</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Change Photo
          </button>
        </div>
        
        <div className="modal-field">
          <label>Full Name</label>
          <input value={form.name} onChange={set("name")} placeholder="Your name" />
        </div>
        
        <div className="modal-field">
          <label>Phone Number</label>
          <input value={form.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX" />
        </div>
        
        <div className="modal-field">
          <label>Email Address</label>
          <input value={form.email} onChange={set("email")} placeholder="you@example.com" type="email" />
        </div>
        
        <div className="modal-actions">
          <button className="modal-btn modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-save" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function UpiModal({ upiList, defaultUpi, onSave, onClose }) {
  const [list,   setList]   = useState([...upiList]);
  const [def,    setDef]    = useState(defaultUpi);
  const [newUpi, setNewUpi] = useState("");

  const addUpi = () => {
    const trimmed = newUpi.trim();
    if (trimmed && !list.includes(trimmed)) {
      const updated = [...list, trimmed];
      setList(updated);
      if (list.length === 0) setDef(trimmed);
    }
    setNewUpi("");
  };

  const removeUpi = (upi) => {
    const updated = list.filter((u) => u !== upi);
    setList(updated);
    if (def === upi) setDef(updated[0] || "");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Manage Payment Methods</div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
          {list.map((upi) => (
            <div key={upi} className={`upi-item ${def === upi ? "upi-item--default" : ""}`}>
              <span className="upi-item-id">{upi}</span>
              {def === upi
                ? <span className="upi-default-badge">Primary</span>
                : <button className="upi-set-default-btn" onClick={() => setDef(upi)}>Set Primary</button>
              }
              <button className="upi-remove-btn" onClick={() => removeUpi(upi)}>✕</button>
            </div>
          ))}
        </div>

        <div className="modal-field">
          <label>Add New UPI ID</label>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              value={newUpi}
              onChange={(e) => setNewUpi(e.target.value)}
              placeholder="username@bank"
              onKeyDown={(e) => e.key === "Enter" && addUpi()}
              style={{ flex: 1 }}
            />
            <button className="upi-add-btn" onClick={addUpi}>+</button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-cancel" onClick={onClose}>Close</button>
          <button className="modal-btn modal-save" onClick={() => onSave(list, def)}>Save Selection</button>
        </div>
      </div>
    </div>
  );
}

function VerifyOtherModal({ profileUser, setShowVerifyPopup }) {
  const dispatch = useDispatch();
  const [verifyStep, setVerifyStep] = useState(1);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyOtp, setVerifyOtp] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyTimer, setVerifyTimer] = useState(0);
  const [verifyDevOtp, setVerifyDevOtp] = useState('');

  // countdown timer useEffect
  useEffect(() => {
    let interval;
    if (verifyTimer > 0) {
      interval = setInterval(() => setVerifyTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [verifyTimer]);

  const needsPhone = profileUser?.signupMethod === 'email' && !profileUser?.isPhoneVerified;
  const verifyType = needsPhone ? 'phone' : 'email';
  const icon = needsPhone ? '📱' : '📧';
  const label = needsPhone ? 'mobile number' : 'email address';

  const handleSendVerifyOtp = async () => {
    setVerifyError('');
    setVerifySuccess('');
    setVerifyLoading(true);
    try {
      let formattedInput = verifyInput.trim();
      if (verifyType === 'phone') {
        const digits = formattedInput.replace(/\D/g, '').slice(-10);
        if (digits.length !== 10) {
          setVerifyError('Please enter a valid 10-digit mobile number.');
          setVerifyLoading(false);
          return;
        }
        formattedInput = digits;
      } else {
        if (!formattedInput.includes('@')) {
          setVerifyError('Please enter a valid email address.');
          setVerifyLoading(false);
          return;
        }
      }

      const payload = verifyType === 'phone' ? { phone: formattedInput } : { email: formattedInput };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/send-otp`, payload, {
        withCredentials: true
      });

      setVerifyTimer(30);
      setVerifySuccess(res.data.message || 'OTP sent successfully!');
      if (res.data.devOtp) {
        setVerifyDevOtp(res.data.devOtp);
      }
      setVerifyStep(3);
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyError('');
    setVerifySuccess('');
    setVerifyLoading(true);
    try {
      // 1. Verify OTP with session
      await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-otp`, {
        enteredOtp: verifyOtp
      }, {
        withCredentials: true
      });

      let verifiedValue = verifyInput.trim();
      if (verifyType === 'phone') {
        verifiedValue = verifiedValue.replace(/\D/g, '').slice(-10);
      } else {
        verifiedValue = verifiedValue.toLowerCase();
      }

      // 2. Persist to DB using new PATCH /api/profile/verify-contact
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/profile/verify-contact`,
        { type: verifyType, value: verifiedValue },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      setVerifySuccess('✅ Verified successfully!');
      
      // Update Redux profile & localstorage
      dispatch({ type: 'profile/setUser', payload: res.data.user });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(fetchUserProfile());

      setTimeout(() => {
        sessionStorage.setItem('dismissedVerifyPopup', 'true');
        setShowVerifyPopup(false);
      }, 1500);
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.setItem('dismissedVerifyPopup', 'true');
    setShowVerifyPopup(false);
  };

  const digits = verifyType === 'phone' ? verifyInput.replace(/\D/g, '').slice(-10) : '';

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ maxWidth: '400px', animation: 'slideUpFade 0.4s ease' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* Progress dots at top of modal */}
        <div className="verify-step-dots">
          <div className={`verify-step-dot ${verifyStep === 1 ? 'active' : ''}`} />
          <div className={`verify-step-dot ${verifyStep === 2 ? 'active' : ''}`} />
          <div className={`verify-step-dot ${verifyStep === 3 ? 'active' : ''}`} />
        </div>

        {/* Step 1 — Intro */}
        {verifyStep === 1 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', margin: '10px 0 20px' }}>🔐</div>
            <div className="modal-title" style={{ marginBottom: '12px' }}>Secure Your Account</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
              {needsPhone
                ? "You signed up with email. Add your mobile number to secure your account and recover it if you lose access."
                : "You signed up with mobile. Add your email address to secure your account and recover it if you lose access."}
            </p>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px' }}>
              <button className="modal-btn modal-cancel" style={{ flex: 1 }} onClick={handleCancel}>
                Maybe Later
              </button>
              <button 
                className="modal-btn modal-save" 
                style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', color: '#fff' }} 
                onClick={() => setVerifyStep(2)}
              >
                Verify Now →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Enter Contact + Send OTP */}
        {verifyStep === 2 && (
          <div>
            <div className="modal-title" style={{ marginBottom: '8px' }}>Verify Your {label}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Enter your {label} below. We'll send you a 6-digit OTP.
            </p>

            <div className="modal-field" style={{ marginBottom: '16px' }}>
              <input
                type={verifyType === 'phone' ? 'tel' : 'email'}
                placeholder={verifyType === 'phone' ? '+91 XXXXXXXXXX' : 'you@example.com'}
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                style={{ width: '100%', height: 'auto', background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
              />
            </div>

            {verifyError && <p style={{ color: '#f43f5e', fontSize: '14px', marginBottom: '16px' }}>{verifyError}</p>}
            {verifySuccess && <p style={{ color: '#10d9a0', fontSize: '14px', marginBottom: '16px' }}>{verifySuccess}</p>}

            <div className="modal-actions" style={{ flexDirection: 'column', gap: '12px' }}>
              <button 
                className="modal-btn modal-save" 
                style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', color: '#fff' }} 
                onClick={handleSendVerifyOtp}
                disabled={verifyLoading || verifyTimer > 0}
              >
                {verifyLoading ? 'Sending...' : verifyTimer > 0 ? `Resend in ${verifyTimer}s` : 'Send OTP'}
              </button>
              <button className="resend-link" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', alignSelf: 'center' }} onClick={() => setVerifyStep(1)}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Enter OTP */}
        {verifyStep === 3 && (
          <div>
            <div className="modal-title" style={{ marginBottom: '8px' }}>Enter OTP</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              {verifyType === 'phone'
                ? `OTP sent to +91 ******${digits.slice(-4)}`
                : `OTP sent to ${verifyInput[0]}***@${verifyInput.split('@')[1]}`}
            </p>

            {verifyDevOtp && (
              <p className="dev-otp-hint" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', margin: '0 0 16px 0', textAlign: 'center' }}>
                🔑 Dev Mode OTP: <strong>{verifyDevOtp}</strong>
              </p>
            )}

            <div className="modal-field" style={{ marginBottom: '16px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={verifyOtp}
                onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, ''))}
                style={{
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontSize: '24px',
                  fontWeight: '600',
                  width: '100%',
                  height: 'auto',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-input)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {verifyError && <p style={{ color: '#f43f5e', fontSize: '14px', marginBottom: '16px' }}>{verifyError}</p>}
            {verifySuccess && <p style={{ color: '#10d9a0', fontSize: '14px', marginBottom: '16px' }}>{verifySuccess}</p>}

            <div className="modal-actions" style={{ flexDirection: 'column', gap: '12px' }}>
              <button 
                className="modal-btn modal-save" 
                style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', color: '#fff' }} 
                onClick={handleVerifyOtp}
                disabled={verifyLoading}
              >
                {verifyLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                {verifyTimer > 0 ? (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Resend OTP in {verifyTimer}s</span>
                ) : (
                  <button className="resend-link" style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }} onClick={handleSendVerifyOtp}>
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// ── MAIN EXPORT
// ─────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark, toggleTheme } = useOutletContext();
  const dispatch = useDispatch();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── Verify modal state ──────────────────────────────────────
  const [verifyModal, setVerifyModal] = useState(null); // 'phone' | 'email' | null
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyOtp, setVerifyOtp] = useState('');
  const [verifyStep, setVerifyStep] = useState(1); // 1 = enter contact, 2 = enter OTP
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyDevOtp, setVerifyDevOtp] = useState('');
  const [verifyTimer, setVerifyTimer] = useState(0);

  useEffect(() => {
    let t; if (verifyTimer > 0) t = setInterval(() => setVerifyTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [verifyTimer]);

  const openVerifyModal = (type) => {
    setVerifyModal(type);
    setVerifyInput(type === 'phone' ? (displayUser?.phone || '') : (displayUser?.email || ''));
    setVerifyOtp('');
    setVerifyStep(1);
    setVerifyError('');
    setVerifySuccess('');
    setVerifyDevOtp('');
  };

  const handleSendVerifyOtp = async () => {
    setVerifyError(''); setVerifyLoading(true);
    try {
      const payload = verifyModal === 'phone' ? { phone: verifyInput } : { email: verifyInput };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/send-otp`, payload,
        { withCredentials: true });
      setVerifyTimer(30);
      setVerifyStep(2);
      if (res.data.devOtp) setVerifyDevOtp(res.data.devOtp);
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setVerifyLoading(false); }
  };

  const handleConfirmVerifyOtp = async () => {
    setVerifyError(''); setVerifyLoading(true);
    try {
      // First verify the OTP with session
      await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-otp`, { enteredOtp: verifyOtp },
        { withCredentials: true });

      // Then persist to DB via profile endpoint
      const token = localStorage.getItem('token');
      const endpoint = verifyModal === 'phone'
        ? `${import.meta.env.VITE_API_URL}/api/profile/verify-phone`
        : `${import.meta.env.VITE_API_URL}/api/profile/verify-email`;
      const payload = verifyModal === 'phone'
        ? { phone: verifyInput }
        : { email: verifyInput };
      const res = await axios.patch(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      // Update Redux profile with fresh user
      dispatch({ type: 'profile/setUser', payload: res.data.user });
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setVerifySuccess(verifyModal === 'phone' ? '✅ Phone verified!' : '✅ Email verified!');
      setTimeout(() => setVerifyModal(null), 1500);
      dispatch(fetchUserProfile());
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Verification failed.');
    } finally { setVerifyLoading(false); }
  };

  const active = getActiveId(location.pathname);

  // Redux selectors
  const { user: profileUser, loading, error, success } = useSelector(state => state.profile);

  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  useEffect(() => {
    if (!profileUser) return;

    // 1. Primary priority: Verify missing email/phone
    const dismissed = sessionStorage.getItem('dismissedVerifyPopup');
    const needsPhone = profileUser.signupMethod === 'email' && !profileUser.isPhoneVerified;
    const needsEmail = profileUser.signupMethod === 'phone' && !profileUser.isEmailVerified;
    if ((needsPhone || needsEmail) && dismissed !== 'true') {
      setShowVerifyPopup(true);
      return;
    }

    // 2. Secondary priority: If verified but upiList is empty, prompt for UPI
    const promptedUpi = sessionStorage.getItem('promptedUpi');
    if (profileUser.upiList && profileUser.upiList.length === 0 && promptedUpi !== 'true') {
      setModal("upi");
      sessionStorage.setItem('promptedUpi', 'true');
    }
  }, [profileUser]);

  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(PREFERENCES.map((p) => [p.id, p.defaultOn]))
  );
  const [modal, setModal] = useState(null); // "edit" | "upi" | null
  const fillRef = useRef(null);

  // Fetch user profile on component mount
  useEffect(() => {
    console.log('📍 Profile page mounted, fetching user profile...');
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Animate fairness progress bar after mount
  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = "92%";
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const togglePref = (id) => setPrefs((p) => ({ ...p, [id]: !p[id] }));
  
  const handleSaveProfile = async (form) => {
    console.log('💾 Saving profile:', form);
    try {
      // Dispatch the update action and wait for it
      const result = await dispatch(updateUserProfile(form));
      console.log('✅ Profile save result:', result);
      // Wait a moment for state to update, then close modal
      setTimeout(() => {
        setModal(null);
      }, 300);
    } catch (err) {
      console.error('❌ Error saving profile:', err);
    }
  };
  
  const handleSaveUpi = async (list, def) => {
    console.log('💾 Saving UPI:', { list, def });
    try {
      await dispatch(updateUserProfile({ upiList: list, defaultUpi: def }));
      // Wait for state update before closing
      setTimeout(() => {
        setModal(null);
      }, 300);
    } catch (err) {
      console.error('❌ Error saving UPI:', err);
    }
    };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Use actual user data from Redux, or fallback to INITIAL_USER
  const displayUser = profileUser || INITIAL_USER;

  return (
    <div className="dashboard-shell">

      {/* ── MOBILE TOP BAR ────────────────────────────────────────── */}
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/Dashboard")}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => setIsSettingsOpen(true)}>
          ⚙️
        </button>
      </div>

      {/* ── Status Messages ────────────────────────────────────────── */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#3b82f6',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          Loading profile...
        </div>
      )}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          Profile updated successfully!
        </div>
      )}


      {/* ════════════════════════════════════════
          MAIN CONTENT  — scrollable profile body
          ════════════════════════════════════════ */}
      <main className="profile-main">
        <div className="profile-container">

          {/* ── 1. Hero Section ── */}
          <section className="profile-hero-premium">
            <div className="avatar-wrapper">
              <div className="avatar-main" key={displayUser.avatar}>
                {displayUser.avatar
                  ? <img src={displayUser.avatar} alt="avatar" key={displayUser.avatar} />
                  : getInitials(displayUser.name)
                }
              </div>
              <button className="edit-avatar-btn" onClick={() => setModal("edit")}>📸</button>
            </div>
            <div className="hero-info">
              <h1>
                {displayUser.name}
                {displayUser.isEmailVerified && displayUser.isPhoneVerified && (
                  <span className="fully-verified-badge" style={{ marginLeft: 10, fontSize: 11 }}>✅ Fully Verified</span>
                )}
              </h1>
              <p>{displayUser.email || displayUser.phone}</p>
              <div className="user-badge-stack">
                <span className="premium-badge">Verified User</span>
                <span className="premium-badge" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', color: '#7c3aed' }}>Beta Tester</span>
              </div>
            </div>
          </section>

          {/* ── 1b. Verification Banners ── */}
          {profileUser && (() => {
            const needsPhone = profileUser.signupMethod === 'email' && !profileUser.isPhoneVerified;
            const needsEmail = profileUser.signupMethod === 'phone' && !profileUser.isEmailVerified;
            if (needsPhone) return (
              <div className="verify-banner">
                <div className="verify-banner-icon">📱</div>
                <div className="verify-banner-text">
                  <strong>Add your mobile number</strong>
                  <span>Secure your account with phone verification</span>
                </div>
                <button className="verify-banner-btn" onClick={() => openVerifyModal('phone')}>Verify Now →</button>
              </div>
            );
            if (needsEmail) return (
              <div className="verify-banner">
                <div className="verify-banner-icon">📧</div>
                <div className="verify-banner-text">
                  <strong>Add your email address</strong>
                  <span>Get notifications and recover your account</span>
                </div>
                <button className="verify-banner-btn" onClick={() => openVerifyModal('email')}>Verify Now →</button>
              </div>
            );
            return null;
          })()}

          {/* ── 2. Statistics Bento Grid ── */}
          <section className="stats-bento">
            <div className="stat-card-premium">
              <div className="stat-icon-wrap" style={{ color: '#00e5ff' }}>📊</div>
              <div className="stat-value-premium">₹1.2L</div>
              <div className="stat-label-premium">Total Volume</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon-wrap" style={{ color: '#10d9a0' }}>🤝</div>
              <div className="stat-value-premium">92</div>
              <div className="stat-label-premium">Fairness Score</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon-wrap" style={{ color: '#7c3aed' }}>👥</div>
              <div className="stat-value-premium">08</div>
              <div className="stat-label-premium">Active Groups</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon-wrap" style={{ color: '#f0b429' }}>⭐</div>
              <div className="stat-value-premium">4.9</div>
              <div className="stat-label-premium">Member Rating</div>
            </div>
          </section>

          {/* ── 3. Information Grid ── */}
          <div className="profile-grid">
            {/* Personal Details */}
            <section className="profile-card-premium">
              <div className="card-header-premium">
                <h2>Account Details</h2>
                <span className="edit-link" onClick={() => setModal("edit")}>Edit Info</span>
              </div>
              <div className="info-item-premium">
                <label>Full Name</label>
                <p>{displayUser.name}</p>
              </div>
              <div className="info-item-premium">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Mobile Number</span>
                  {displayUser.isPhoneVerified ? (
                    <span style={{ color: '#10d9a0', fontSize: '12px', fontWeight: 'bold' }}>✓ Verified</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>Unverified</span>
                      <button 
                        onClick={() => openVerifyModal('phone')}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </label>
                <p>{displayUser.phone || 'Not added'}</p>
              </div>
              <div className="info-item-premium">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Email Address</span>
                  {displayUser.isEmailVerified ? (
                    <span style={{ color: '#10d9a0', fontSize: '12px', fontWeight: 'bold' }}>✓ Verified</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>Unverified</span>
                      <button 
                        onClick={() => openVerifyModal('email')}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </label>
                <p>{displayUser.email || 'Not added'}</p>
              </div>
            </section>

            {/* Payment Methods */}
            <section className="profile-card-premium">
              <div className="card-header-premium">
                <h2>Payment Methods</h2>
                <span className="edit-link" onClick={() => setModal("upi")}>Manage</span>
              </div>
              <div className="upi-scroll">
                {displayUser.upiList.map(upi => (
                  <div key={upi} className="upi-card-mini">
                    <div className="upi-icon-box">⚡</div>
                    <div className="upi-details">
                      <div className="upi-id-text">
                        {upi}
                        {displayUser.defaultUpi === upi && <span className="default-tag">PRIMARY</span>}
                      </div>
                      <div className="upi-status">UPI ID • Active</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── 4. Danger Zone ── */}
          <section className="danger-zone">
            <button className="logout-btn-premium" onClick={handleLogout}>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
              Secure Logout
            </button>
          </section>

        </div>
      </main>


    {/* bottom navbar */}
    <BottomNavbareM />

      {/* ── Modals (rendered outside main so they overlay everything) ── */}
      {modal === "edit" && (
        <EditModal user={displayUser} onSave={handleSaveProfile} onClose={() => setModal(null)} />
      )}
      {modal === "upi" && (
        <UpiModal
          upiList={displayUser.upiList}
          defaultUpi={displayUser.defaultUpi}
          onSave={handleSaveUpi}
          onClose={() => setModal(null)}
        />
      )}
      {showVerifyPopup === true && modal !== 'edit' && modal !== 'upi' && (
        <VerifyOtherModal
          profileUser={profileUser}
          setShowVerifyPopup={setShowVerifyPopup}
        />
      )}

      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />

      {/* ── Verify Phone/Email Modal ── */}
      {verifyModal && (
        <div className="verify-modal-overlay" onClick={() => setVerifyModal(null)}>
          <div className="verify-modal" onClick={e => e.stopPropagation()}>
            <h3>{verifyModal === 'phone' ? '📱 Verify Phone Number' : '📧 Verify Email Address'}</h3>
            <p>
              {verifyModal === 'phone'
                ? 'Enter your 10-digit mobile number. We will send an OTP to verify it.'
                : 'Enter your email address. We will send an OTP to verify it.'}
            </p>

            {verifyError && <p className="error-msg">{verifyError}</p>}
            {verifySuccess && <p className="success-msg">{verifySuccess}</p>}

            {verifyStep === 1 && (
              <>
                <div className="input-wrapper" style={{ marginBottom: 16 }}>
                  <input
                    type={verifyModal === 'phone' ? 'tel' : 'email'}
                    className="pill-input"
                    style={{ paddingLeft: 20 }}
                    placeholder={verifyModal === 'phone' ? '+91 XXXXXXXXXX' : 'you@example.com'}
                    value={verifyInput}
                    onChange={e => setVerifyInput(e.target.value)}
                  />
                </div>
                <div className="verify-modal-actions">
                  <button className="verify-modal-cancel" onClick={() => setVerifyModal(null)}>Cancel</button>
                  <button className="solid-btn" style={{ flex: 1, margin: 0, width: 'auto' }}
                    onClick={handleSendVerifyOtp} disabled={verifyLoading}>
                    {verifyLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </>
            )}

            {verifyStep === 2 && (
              <>
                {verifyDevOtp && (
                  <p className="dev-otp-hint">📱 Dev mode — OTP: <strong>{verifyDevOtp}</strong></p>
                )}
                <div className="input-wrapper" style={{ marginBottom: 12 }}>
                  <input
                    type="text" maxLength={6}
                    className="pill-input"
                    style={{ paddingLeft: 20, textAlign: 'center', letterSpacing: 10, fontSize: 20 }}
                    placeholder="• • • • • •"
                    value={verifyOtp}
                    onChange={e => setVerifyOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="resend-row" style={{ marginBottom: 12 }}>
                  <button className="resend-link" onClick={handleSendVerifyOtp} disabled={verifyTimer > 0}>
                    {verifyTimer > 0 ? `Resend in ${verifyTimer}s` : 'Resend OTP'}
                  </button>
                </div>
                <div className="verify-modal-actions">
                  <button className="verify-modal-cancel" onClick={() => setVerifyStep(1)}>← Back</button>
                  <button className="solid-btn" style={{ flex: 1, margin: 0, width: 'auto' }}
                    onClick={handleConfirmVerifyOtp} disabled={verifyLoading}>
                    {verifyLoading ? 'Verifying...' : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
