import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import '../styles/SettleUp.css'
import ThemeToggle from '../components/ThemeToggle';
import { useState, useEffect } from 'react';

const SIDEBAR_NAV = [
  { id: "dashboard", icon: "🏡", label: "Dashboard", path: "/Dashboard" },
  { id: "groups",    icon: "👥", label: "Groups",    path: "/Groups"    },
  { id: "activity",  icon: "📊", label: "Activity",  path: "/Activity"  },
  { id: "settle",    icon: "💰", label: "Settle Up", path: "/SettleUp"  },
  { id: "profile",   icon: "👤", label: "Profile",   path: "/Profile"   },
];

// SVG icon components — clean stroke icons, no emoji
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1.5"/>
    <rect x="13" y="3" width="8" height="8" rx="1.5"/>
    <rect x="3" y="13" width="8" height="8" rx="1.5"/>
    <rect x="13" y="13" width="8" height="8" rx="1.5"/>
  </svg>
);

const IconGroups = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="7" r="3"/>
    <path d="M2 21v-1a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v1"/>
    <circle cx="18" cy="7" r="2.5"/>
    <path d="M22 21v-1a4 4 0 0 0-3-3.87"/>
  </svg>
);

const IconActivity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const IconProfile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/>
  </svg>
);

const IconSettle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

// Bottom nav config — left and right of FAB, no labels
const BOTTOM_LEFT  = [
  { id: "dashboard", path: "/Dashboard", Icon: IconDashboard, label: "Dashboard" },
  { id: "groups",    path: "/Groups",    Icon: IconGroups,    label: "Groups"    },
];
const BOTTOM_RIGHT = [
  { id: "activity",  path: "/Activity",  Icon: IconActivity,  label: "Activity"  },
  { id: "profile",   path: "/Profile",   Icon: IconProfile,   label: "Profile"   },
];

const USER = { name: "Rahul", email: "rahul@email.com", initial: "R" };


function SettleUp(){

 const { isDark, toggleTheme } = useOutletContext();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Derive active tab from URL — stays in sync on direct navigation too
  const getActiveId = () => {
    const p = location.pathname;
    if (p === "/Dashboard") return "dashboard";
    if (p === "/Groups")    return "groups";
    if (p === "/Activity")  return "activity";
    if (p === "/SettleUp")  return "settle";
    if (p === "/Profile")   return "profile";
    return "dashboard";
  };
  const active = getActiveId();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

    return (
        <>

           {/* ── SIDEBAR (desktop only) ──────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="user-avatar">{USER.initial}</div>
          <div className="user-name">{USER.name}</div>
          <div className="user-email">{USER.email}</div>
        </div>

        <nav className="sidebar-nav">
          {SIDEBAR_NAV.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div className="sidebar-divider" />

          <div
            className={`nav-item ${active === "settings" ? "active" : ""}`}
            onClick={() => navigate("/Settings")}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </div>
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

        </nav>
      </aside>



        {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      <nav className="mobile-bottom-nav">

        {BOTTOM_LEFT.map(({ id, path, Icon, label }) => (
          <button
            key={id}
            className={`mobile-nav-tab ${active === id ? "active" : ""}`}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <span className="mobile-nav-svg"><Icon /></span>
            {active === id && <span className="mobile-nav-pip" />}
          </button>
        ))}

        {/* Centre FAB */}
        <div className="mobile-nav-fab">
          <button
            className={`mobile-nav-fab-btn ${active === "settle" ? "fab-active" : ""}`}
            onClick={() => navigate("/SettleUp")}
            aria-label="Settle Up"
          >
            <span className="mobile-nav-svg"><IconSettle /></span>
          </button>
        </div>

        {BOTTOM_RIGHT.map(({ id, path, Icon, label }) => (
          <button
            key={id}
            className={`mobile-nav-tab ${active === id ? "active" : ""}`}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <span className="mobile-nav-svg"><Icon /></span>
            {active === id && <span className="mobile-nav-pip" />}
          </button>
        ))}

      </nav>
        </>
    )
}   

export default SettleUp;