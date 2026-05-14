import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/Settings.css'
import ThemeToggle from '../components/ThemeToggle';
import Navbar from '../components/Navbar';
import BottomNavbareM from '../components/BottomNavbareM';
import { useState, useEffect } from 'react';



const USER = { name: "Rahul", email: "rahul@email.com", initial: "R" };


function Settings(){

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

      {/* Desktop navbar  */}
      <Navbar isDark={isDark} toggleTheme={toggleTheme} forceShow />

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="main-content">
        <div className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Settings</h2>
            <p className="section-subtitle">Manage your account preferences and app display.</p>
          </div>

          <div className="features-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="feature-card">
              <div className="card-glow glow-cyan" />
              <div className="panel-header">
                <div className="panel-label">
                  <span className="panel-tag">Display</span>
                  <div className="panel-title">Appearance</div>
                </div>
                <span className="panel-icon">🌓</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Toggle between light and dark mode for your dashboard.
              </p>
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </div>

            <div className="feature-card" style={{ opacity: 0.7 }}>
              <div className="panel-header">
                <div className="panel-label">
                  <span className="panel-tag">Account</span>
                  <div className="panel-title">Notifications</div>
                </div>
                <span className="panel-icon">🔔</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Coming soon — Manage your email and push notification settings.
              </p>
            </div>
          </div>
        </div>
      </main>



        {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      {isLoggedIn && <BottomNavbareM />}
        </div>
    )
}   

export default Settings;