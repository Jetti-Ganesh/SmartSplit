// ProfilePage.jsx
// ─────────────────────────────────────────────────────
// UPI Expense Splitter — Profile Page
// Includes: Sidebar (desktop) + Mobile Bottom Nav
// CSS: ./ProfilePage.css
// ─────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../services/authSlice";
import ThemeToggle from "../components/ThemeToggle";
import Navbar from "../components/Navbar";
import BottomNavbareM from "../components/BottomNavbareM";
import "../styles/Profile.css";
// ─────────────────────────────────────────────────────
// ── CONSTANTS
// ─────────────────────────────────────────────────────



const INITIAL_USER = {
  name: "Rahul Kumar",
  phone: "+91 98765 43210",
  email: "rahul@gmail.com",
  defaultUpi: "rahul@paytm",
  upiList: ["rahul@paytm", "rahul@okicici", "8765432100@ybl"],
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
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Edit Personal Details</div>
        
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
          <button className="modal-btn modal-save" onClick={() => onSave(form)}>Save Changes</button>
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

  const active = getActiveId(location.pathname);

  const [user,  setUser]  = useState(INITIAL_USER);
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(PREFERENCES.map((p) => [p.id, p.defaultOn]))
  );
  const [modal, setModal] = useState(null); // "edit" | "upi" | null
  const fillRef = useRef(null);

  // Animate fairness progress bar after mount
  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = "92%";
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const togglePref        = (id)        => setPrefs((p) => ({ ...p, [id]: !p[id] }));
  const handleSaveProfile = (form)      => { setUser((u) => ({ ...u, ...form })); setModal(null); };
  const handleSaveUpi     = (list, def) => { setUser((u) => ({ ...u, upiList: list, defaultUpi: def })); setModal(null); };

  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

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

        {/* ── DESKTOP NAVBAR ────────────────────────────────────────── */}
     <Navbar isDark={isDark} toggleTheme={toggleTheme} forceShow />


      {/* ════════════════════════════════════════
          MAIN CONTENT  — scrollable profile body
          ════════════════════════════════════════ */}
      <main className="profile-main">
        <div className="profile-container">

          {/* ── 1. Hero Section ── */}
          <section className="profile-hero-premium">
            <div className="avatar-wrapper">
              <div className="avatar-main">
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" />
                  : getInitials(user.name)
                }
              </div>
              <button
                className="edit-avatar-btn"
                onClick={() => alert("Upload functionality would go here.")}
              >
                📸
              </button>
            </div>
            <div className="hero-info">
              <h1>{user.name}</h1>
              <p>{user.email}</p>
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
                <p>{user.name}</p>
              </div>
              <div className="info-item-premium">
                <label>Mobile Number</label>
                <p>{user.phone}</p>
              </div>
              <div className="info-item-premium">
                <label>Email Address</label>
                <p>{user.email}</p>
              </div>
            </section>

            {/* Payment Methods */}
            <section className="profile-card-premium">
              <div className="card-header-premium">
                <h2>Payment Methods</h2>
                <span className="edit-link" onClick={() => setModal("upi")}>Manage</span>
              </div>
              <div className="upi-scroll">
                {user.upiList.map(upi => (
                  <div key={upi} className="upi-card-mini">
                    <div className="upi-icon-box">⚡</div>
                    <div className="upi-details">
                      <div className="upi-id-text">
                        {upi}
                        {user.defaultUpi === upi && <span className="default-tag">PRIMARY</span>}
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
              Secure Logout
            </button>
          </section>

        </div>
      </main>


    {/* bottom navbar */}
    <BottomNavbareM />

      {/* ── Modals (rendered outside main so they overlay everything) ── */}
      {modal === "edit" && (
        <EditModal user={user} onSave={handleSaveProfile} onClose={() => setModal(null)} />
      )}
      {modal === "upi" && (
        <UpiModal
          upiList={user.upiList}
          defaultUpi={user.defaultUpi}
          onSave={handleSaveUpi}
          onClose={() => setModal(null)}
        />
      )}

    </div>
  );
}