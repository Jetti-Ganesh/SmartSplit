import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/Activity.css'
import { useState, useEffect } from 'react';
import BottomNavbareM from '../components/BottomNavbareM';

const SIDEBAR_NAV = [
  { id: "dashboard", icon: "🏡", label: "Dashboard", path: "/Dashboard" },
  { id: "groups",    icon: "👥", label: "Groups",    path: "/Groups"    },
  { id: "activity",  icon: "📊", label: "Activity",  path: "/Activity"  },
  { id: "settle",    icon: "💰", label: "Settle Up", path: "/SettleUp"  },
  { id: "profile",   icon: "👤", label: "Profile",   path: "/Profile"   },
];

const USER = { name: "Rahul", email: "rahul@email.com", initial: "R" };


function Activity(){

 const { isDark, toggleTheme } = useOutletContext();
  const { isLoggedIn } = useSelector((state) => state.auth);
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

           {/* ── SIDEBAR (desktop only) ──────────────────────────────────── */}
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

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="main-content">
        <div className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Activity</h2>
            <p className="section-subtitle">Track your recent expenses and settlement history.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="card-glow glow-purple" />
              <div className="panel-header">
                <div className="panel-label">
                  <span className="panel-tag">History</span>
                  <div className="panel-title">Recent Activity</div>
                </div>
                <span className="panel-icon">📊</span>
              </div>
              <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>No recent activity to show.</p>
            </div>
          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      {isLoggedIn && <BottomNavbareM />}
        </div>
    )
}   

export default Activity;