import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";
import BottomNavbareM from "../components/BottomNavbareM";

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

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { isDark, toggleTheme } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();

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

      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => navigate("/Settings")}>
          ⚙️
        </button>
      </div>

      {/* ── MAIN ── */}
      <main className="main-content">
        <div className="dash-section">

          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">Hi {USER.name}! 👋</h2>
            <p className="section-subtitle">
              {today} — Here's your balance overview and group activity.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="top-bar-actions">
            <button className="btn-primary">+ Add Expense</button>
            <button className="btn-secondary" onClick={() => navigate("/SettleUp")}>
              💰 Settle Up
            </button>
          </div>

          {/* Balance Cards */}
          <div className="balance-row">
            {BALANCE.map((card, i) => (
              <div
                key={card.label}
                className="feature-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`card-glow ${card.glow}`} />
                <div className="balance-card-label">{card.label}</div>
                <div className={`balance-card-amount ${card.cls}`}>{card.amount}</div>
                <div className="balance-card-sub">{card.sub}</div>
              </div>
            ))}
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

            {/* Activity Panel */}
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <BottomNavbareM />

    </div>
  );
}