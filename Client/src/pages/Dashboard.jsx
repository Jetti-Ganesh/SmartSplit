import { useState } from "react";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";
import ThemeToggle from "../components/ThemeToggle";

// ── Static data ───────────────────────────────────────────────────────────────
const USER = { name: "Rahul", email: "rahul@email.com", initial: "R" };

const BALANCE = [
  { label: "YOU OWE",     amount: "₹1,240", sub: "Across 1 group", cls: "amount-red",   glow: "glow-red"    },
  { label: "YOU'RE OWED", amount: "₹850",   sub: "Across 1 group", cls: "amount-green", glow: "glow-green"  },
  { label: "NET BALANCE", amount: "-₹390",  sub: "Updated now",    cls: "amount-neg",   glow: "glow-purple" },
];

const GROUPS = [
  { id: 1, icon: "🏠", name: "Flat 301 Roommates", meta: "Next due: Rent in 5 days", amount: "-₹1,200", amountCls: "amount-red"   },
  { id: 2, icon: "🎉", name: "Goa Trip 2024",      meta: "Last activity: 2h ago",    amount: "+₹850",   amountCls: "amount-green" },
];

const ACTIVITY = [
  { id: 1, content: <><strong>Amit</strong> paid ₹500 to you</>,        time: "2h ago"    },
  { id: 2, content: <>You added <strong>"Dinner"</strong> (₹240)</>,    time: "5h ago"    },
  { id: 3, content: <><strong>Priya</strong> settled up (₹1,000)</>,    time: "Yesterday" },
  { id: 4, content: <>You added <strong>"Groceries"</strong> (₹540)</>, time: "2d ago"    },
];

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

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
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
            className={`nav-item ${location.pathname === "/Settings" ? "active" : ""}`}
            onClick={() => navigate("/Settings")}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </div>
        </nav>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main className="main-content">
        <div className="dash-section">

          {/* Section Header */}
          <div className="section-header">
            <div className="upi-badge" style={{ margin: "0 auto 1rem" }}>
              <span className="upi-dot" />
              New — UPI Integration is Live
            </div>
            <h2 className="section-title">Hi {USER.name}! 👋</h2>
            <p className="section-subtitle">
              {today} — Here's your balance overview and group activity.
            </p>
          </div>

          {/* Action buttons */}
          <div className="top-bar-actions">
            <button className="btn-primary">+ Add Expense</button>
            <button className="btn-secondary" onClick={() => navigate("/SettleUp")}>
              💰 Settle Up
            </button>
            {/* <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {isDark ? "🌙 Dark" : "☀️ Light"}
            </button> */}
          </div>

          {/* Balance Cards */}
          <div className="balance-row">
            {BALANCE.map((card, i) => (
              <div
                className="feature-card"
                key={card.label}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`card-glow ${card.glow}`} />
                <div className="balance-card-label">{card.label}</div>
                <div className={`balance-card-amount ${card.cls}`}>{card.amount}</div>
                <div className="balance-card-sub">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Features grid */}
          <div className="features-grid">

            {/* Groups panel */}
            <div className="feature-card" style={{ animationDelay: "0.3s" }}>
              <div className="card-glow glow-cyan" />
              <div className="panel-header">
                <div className="panel-label">
                  <span className="panel-tag">Groups</span>
                  <div className="panel-title">Your Groups</div>
                </div>
                <span className="panel-icon">🏘️</span>
              </div>
              {GROUPS.map((g) => (
                <div className="group-item" key={g.id}>
                  <div className="group-icon-wrap">{g.icon}</div>
                  <div className="group-info">
                    <div className="group-name">{g.name}</div>
                    <div className="group-meta">{g.meta}</div>
                  </div>
                  <div className={`group-amount ${g.amountCls}`}>{g.amount}</div>
                </div>
              ))}
              <button className="create-group-btn" onClick={() => navigate("/Groups")}>
                + Create New Group
              </button>
            </div>

            {/* Activity panel */}
            <div className="feature-card" style={{ animationDelay: "0.4s" }}>
              <div className="card-glow glow-purple" />
              <div className="panel-header">
                <div className="panel-label">
                  <span className="panel-tag">Live</span>
                  <div className="panel-title">Recent Activity</div>
                </div>
                <span className="panel-icon">⚡</span>
              </div>
              {ACTIVITY.map((a) => (
                <div className="activity-item" key={a.id}>
                  <div className="activity-dot" />
                  <div className="activity-text">{a.content}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      <nav className="mobile-bottom-nav" data-active-index={
        active === "dashboard" ? 0 :
        active === "groups"    ? 1 :
        active === "settle"    ? 2 :
        active === "activity"  ? 3 :
        active === "profile"   ? 4 : 0
      }>
        {/* Sliding Indicator Blob */}
        <div className="mobile-nav-indicator">
          <div className="nav-indicator-blob" />
        </div>

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
          </button>
        ))}

      </nav>

    </div>
  );
}