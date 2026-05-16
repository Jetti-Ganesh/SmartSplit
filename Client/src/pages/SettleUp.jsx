import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/SettleUp.css'
import { useState, useEffect } from 'react';
import BottomNavbareM from '../components/BottomNavbareM';


function SettleUp(){

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
            <h2 className="section-title">Settle Up</h2>
            <p className="section-subtitle">Clear your dues and record payments instantly.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="card-glow glow-green" />
              <div className="panel-header">
                <div className="panel-label">
                  <span className="panel-tag">Payments</span>
                  <div className="panel-title">Pending Settlements</div>
                </div>
                <span className="panel-icon">💰</span>
              </div>
              <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>All clear! You don't have any pending settlements.</p>
              <button className="btn-primary">Record a Payment</button>
            </div>
          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      {isLoggedIn && <BottomNavbareM />}
        </div>
    )
}   

export default SettleUp;