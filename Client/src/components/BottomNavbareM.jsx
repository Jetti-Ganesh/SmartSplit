import { useNavigate, useLocation } from "react-router-dom";
import "../styles/BottomNavbareM.css";
// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

const IconGroups = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="7" r="3" />
    <path d="M2 21v-1a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v1" />
    <circle cx="18" cy="7" r="2.5" />
    <path d="M22 21v-1a4 4 0 0 0-3-3.87" />
  </svg>
);

const IconActivity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconProfile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
  </svg>
);

const IconSettle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

// ── Nav config ────────────────────────────────────────────────────────────────
const BOTTOM_LEFT = [
  { id: "dashboard", path: "/Dashboard", Icon: IconDashboard, label: "Dashboard" },
  { id: "groups",    path: "/Groups",    Icon: IconGroups,    label: "Groups"    },
];

const BOTTOM_RIGHT = [
  { id: "activity", path: "/Activity", Icon: IconActivity, label: "Activity" },
  { id: "profile",  path: "/Profile",  Icon: IconProfile,  label: "Profile"  },
];

// ── Active index for CSS indicator positioning ─────────────────────────────
// Maps each tab to an index so your CSS can slide the blob
// dashboard=0, groups=1, settle=2(FAB), activity=3, profile=4
const ACTIVE_INDEX_MAP = {
  dashboard: 0,
  groups:    1,
  settle:    2,
  activity:  3,
  profile:   4,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function BottomNavbareM() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab from current URL path
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

  return (
    <nav
      className="mobile-bottom-nav"
      data-active-index={ACTIVE_INDEX_MAP[active] ?? 0}
    >
      {/* Sliding indicator blob */}
      <div className="mobile-nav-indicator">
        <div className="nav-indicator-blob" />
      </div>

      {/* Left tabs: Dashboard, Groups */}
      {BOTTOM_LEFT.map(({ id, path, Icon, label }) => (
        <button
          key={id}
          className={`mobile-nav-tab ${active === id ? "active" : ""}`}
          onClick={() => navigate(path)}
          aria-label={label}
        >
          <span className="mobile-nav-svg"><Icon /></span>
        </button>
      ))}

      {/* Centre FAB: Settle Up */}
      <div className="mobile-nav-fab">
        <button
          className={`mobile-nav-fab-btn ${active === "settle" ? "fab-active" : ""}`}
          onClick={() => navigate("/SettleUp")}
          aria-label="Settle Up"
        >
          <span className="mobile-nav-svg"><IconSettle /></span>
        </button>
      </div>

      {/* Right tabs: Activity, Profile */}
      {BOTTOM_RIGHT.map(({ id, path, Icon, label }) => (
        <button
          key={id}
          className={`mobile-nav-tab ${active === id ? "active" : ""}`}
          onClick={() => navigate(path)}
          aria-label={label}
        >
          <span className="mobile-nav-svg"><Icon /></span>
        </button>
      ))}
    </nav>
  );
}

