import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";
import BottomNavbareM from "../components/BottomNavbareM";
import SettingsDrawer from "../components/SettingsDrawer";
import { useState, useEffect } from "react";
import {  useGetGroupsQuery } from "../services/groupAPI";
import api from "../../utils/api";
// ── Static data ───────────────────────────────────────────────────────────────
// const USER = { name: "Rahul", email: "rahul@email.com", initial: "R" };


// const BALANCE = [
//   { label: "YOU OWE", amount: "₹1,240", sub: "Across 1 group", cls: "amount-red", glow: "glow-red" },
//   { label: "YOU'RE OWED", amount: "₹850", sub: "Across 1 group", cls: "amount-green", glow: "glow-green" },
//   { label: "NET BALANCE", amount: "-₹390", sub: "Updated now", cls: "amount-neg", glow: "glow-purple" },
// ];

// const GROUPS = [
//   { id: 1, icon: "🏠", name: "Flat 301 Roommates", meta: "Next due: Rent in 5 days", amount: "-₹1,200", amountCls: "amount-red" },
//   { id: 2, icon: "🎉", name: "Goa Trip 2024", meta: "Last activity: 2h ago", amount: "+₹850", amountCls: "amount-green" },
// ];

export default function Dashboard() {
  const { isDark, toggleTheme } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: Groupdata, isLoading: isFetchingGroups } = useGetGroupsQuery();
  // console.log(Groupdata);

  const totalOwe = Groupdata ? Groupdata.data.reduce((acc, g) => acc + g.userBalance.owing, 0) : "";
  const totalOwed = Groupdata ? Groupdata.data.reduce((acc, g) => acc + g.userBalance.owed, 0) : "";
  const totalNet = Groupdata ? Groupdata.data.reduce((acc, g) => acc + g.userBalance.net, 0) : "";
  const getActiveId = () => {
    const p = location.pathname;
    if (p === "/Dashboard") return "dashboard";
    if (p === "/Groups") return "groups";
    if (p === "/Activity") return "activity";
    if (p === "/SettleUp") return "settle";
    if (p === "/Profile") return "profile";
    return "dashboard";
  };
  const active = getActiveId();
  const [notifications, setNotifications] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [flashMessage, setFlashMessage] = useState(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data || []);
        }
      } catch (err) {
        console.error('Could not load notifications', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    const flash = localStorage.getItem('flashMessage');
    if (flash) {
      try {
        setFlashMessage(JSON.parse(flash));
      } catch (e) {
        console.warn('Invalid flash message', e);
      }
      localStorage.removeItem('flashMessage');
    }

    fetchNotifications();
  }, []);

  const fmt = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);
  const settleAmount = typeof totalNet === "number" ? fmt(Math.abs(totalNet)) : "—";
  const settleText = typeof totalNet === "number"
    ? (totalNet < 0 ? `Pay ${settleAmount}` : totalNet > 0 ? `Get ${settleAmount}` : "All settled")
    : "—";

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    if (diffMs < 60_000) return 'Just now';
    if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
    return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };
  
  return (
    <div className="dashboard-shell">

      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">💸</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => setIsSettingsOpen(true)}>
          ⚙️
        </button>
      </div>

      {/* ── MAIN ── */}
      <main className="main-content">
        <div className="dash-section">

          {/* Section Header */}
          <div className="section-header">
            <h1 className="section-title">Hi {user.name}! 👋</h1>
            <p className="section-subtitle">
              {today} — Here's your balance overview and recent messages.
            </p>
          </div>

          {flashMessage && (
            <div className={`flash-banner flash-${flashMessage.type || 'info'}`}>
              {flashMessage.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="top-bar-actions">
            <button className="btn-primary" onClick={() => navigate('/Groups')}>
              + Add Expense
            </button>
            <button
              className="btn-settle"
              onClick={() => navigate("/SettleUp", { state: { totalNet } })}
              title={typeof totalNet === "number" ? (totalNet < 0 ? `You owe ${settleAmount}` : totalNet > 0 ? `You're owed ${settleAmount}` : "You're all settled") : "No balances"}
              aria-label="Settle up"
            >
              <span style={{ marginRight: 8 }}>💰</span>
              <span style={{ marginRight: 8 }}>Settle Up</span>
            </button>
              {/* <span style={{ fontWeight: 600 }}>{settleText}</span> */}
          </div>

          {/* Balance Cards */}
          <div className="balance-row">

            <div
              // key={data.data._id}
              className="feature-card"
              style={{ animationDelay: `${2 * 0.1}s` }}
            >
              <div className={`card-glow glow-red`} />
              <div className="balance-card-label">YOU OWE</div>
              <div className={`balance-card-amount amount-red`}>{totalOwe}</div>
              {/* <div className="balance-card-sub">{card.sub}</div> */}
            </div>
            <div
              // key={data.data._id}
              className="feature-card"
              style={{ animationDelay: `${2 * 0.1}s` }}
            >
              <div className={`card-glow glow-green`} />
              <div className="balance-card-label">YOU ARE OWED</div>
              <div className={`balance-card-amount amount-green`}>{totalOwed}</div>
              {/* <div className="balance-card-sub">{card.sub}</div> */}
            </div>
            <div
              // key={data.data._id}
              className="feature-card"
              style={{ animationDelay: `${2 * 0.1}s` }}
            >
              <div className={`card-glow glow-purple`} />
              <div className="balance-card-label">NET BALANCE</div>
              <div className={`balance-card-amount ${totalNet>0 ? "amount-green" : "amount-neg"}`}>{totalNet}</div>
              {/* <div className="balance-card-sub">{card.sub}</div> */}
            </div>

          </div>

          {/* Features Grid */}
          <div className="features-grid">

            {/* Groups Panel */}
            <div className="feature-card" style={{ animationDelay: "0.3s" }}>
              <div className="card-glow glow-cyan" />
              <div className="panel-header">
                <div className="panel-label">
                  <span className="panel-tag">Groups</span>
                  <div className="panel-title">Your Groups</div>
                </div>
                <span className="panel-icon">🏘️</span>
              </div>
              {/* {console.log(Groupdata)} */}

              {Groupdata?.data?.slice(0,2).map((g) => (
                <div className="group-item" key={g._id} onClick={()=>(navigate('/Groups'))}>
                  <div className="group-icon-wrap">{g.icon}</div>
                  <div className="group-info">
                    <div className="group-name">{g.name}</div>
                    <div className="group-meta">{g.description}</div>
                  </div>
                  <div className={`group-amount ${g.amountCls}`}>{g.amount}</div>
                </div>
              ))}
              <button className="create-group-btn" onClick={() => navigate("/Groups")}>
                + Create New Group
              </button>
            </div>

            {/* Messages Panel */}
            <div className="feature-card" style={{ animationDelay: "0.4s" }}>
              <div className="card-glow glow-purple" />
              <div className="panel-header">
                <div className="panel-label">
                  <span className="panel-tag">Live</span>
                  <div className="panel-title">Recent Messages</div>
                </div>
                <span className="panel-icon">✉️</span>
              </div>
              {loadingMessages ? (
                <div className="activity-item">
                  <div className="activity-dot" style={{ background: 'var(--accent-purple)', boxShadow: '0 0 6px var(--accent-purple)' }} />
                  <div className="activity-text">Loading messages…</div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((item, index) => (
                  <div className="activity-item" key={item._id || index}>
                    <div
                      className="activity-dot"
                      style={{
                        background: item.type === 'error' ? '#ef4444' : item.type === 'success' ? '#10b981' : item.type === 'group' ? '#38bdf8' : 'var(--accent-purple)',
                        boxShadow: `0 0 6px ${item.type === 'error' ? '#ef4444' : item.type === 'success' ? '#10b981' : item.type === 'group' ? '#38bdf8' : 'rgba(124,58,237,0.5)'}`
                      }}
                    />
                    <div className="activity-text">{item.message}</div>
                    <div className="activity-time">{formatMessageTime(item.createdAt)}</div>
                  </div>
                ))
              ) : (
                <div className="activity-item">
                  <div className="activity-dot" style={{ background: 'var(--accent-purple)', boxShadow: '0 0 6px rgba(124,58,237,0.5)' }} />
                  <div className="activity-text">No recent messages yet. New login and group updates will appear here.</div>
                  <div className="activity-time">—</div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <BottomNavbareM />

      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
    </div>
  );
}