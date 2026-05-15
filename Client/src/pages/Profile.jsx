// ProfilePage.jsx
// ─────────────────────────────────────────────────────
// UPI Expense Splitter — Profile Page
// Includes: Sidebar (desktop) + Mobile Bottom Nav
// CSS: ./ProfilePage.css
// ─────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { fetchUserProfile, updateUserProfile, clearSuccess, clearError } from "../store/slices/profileSlice";
import ThemeToggle from "../components/ThemeToggle";
import BottomNavbareM from "../components/BottomNavbareM";
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

// ─────────────────────────────────────────────────────
// ── MAIN EXPORT
// ─────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark, toggleTheme } = useOutletContext();
  const dispatch = useDispatch();

  const active = getActiveId(location.pathname);

  // Redux selectors
  const { user: profileUser, loading, error, success } = useSelector(state => state.profile);

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
      // Use .unwrap() to correctly throw errors from createAsyncThunk
      await dispatch(updateUserProfile({ upiList: list, defaultUpi: def })).unwrap();
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
        <button className="mobile-top-settings" onClick={() => navigate("/Settings")}>
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
              <button
                className="edit-avatar-btn"
                onClick={() => setModal("edit")}
              >
                📸
              </button>
            </div>
            <div className="hero-info">
              <h1>{displayUser.name}</h1>
              <p>{displayUser.email}</p>
              <div className="user-badge-stack">
                <span className="premium-badge">Verified User</span>
                <span className="premium-badge" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', color: '#7c3aed' }}>Beta Tester</span>
              </div>
            </div>
          </section>

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
                <label>Mobile Number</label>
                <p>{displayUser.phone}</p>
              </div>
              <div className="info-item-premium">
                <label>Email Address</label>
                <p>{displayUser.email}</p>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

    </div>
  );
}

