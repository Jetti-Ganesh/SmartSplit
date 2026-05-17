import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchAnalytics } from '../services/analytics.service';
import TrendChart from '../components/activity/TrendChart';
import CategoryDonut from '../components/activity/CategoryDonut';
import SpendHeatmap from '../components/activity/SpendHeatmap';
import BottomNavbareM from '../components/BottomNavbareM';
import SettingsDrawer from '../components/SettingsDrawer';
import '../styles/Activity.css';

// Chevron icon
const ChevronDown = ({ className, size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Wrapper for scroll-reveal animations
const FadeInSection = ({ children, className = "" }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.15 });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      className={`${className} reveal-on-scroll ${isVisible ? 'revealed' : ''}`}
      ref={domRef}
    >
      {children}
    </div>
  );
};

export default function Activity() {
  const { isDark, toggleTheme } = useOutletContext();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [period, setPeriod] = useState('month');
  const [customRange, setCustomRange] = useState({ startDate: '2024-12-01', endDate: '2024-12-28' });
  const [data, setData] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Collapsible state
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [expensesOpen, setExpensesOpen] = useState(false);

  useEffect(() => { loadData(); }, [period, customRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAnalytics(period, customRange);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
      if (err.code === 'UNAUTHORIZED') {
        navigate('/Login');
      }
    }
    setLoading(false);
  };

  const handlePeriodChange = (newPeriod) => { setPeriod(newPeriod); setActiveCat(null); };

  const renderSkeleton = () => (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
      ⏳ Loading analytics...
    </div>
  );

  const renderEmptyState = () => (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 15, fontWeight: 600 }}>No spending data for this period.</p>
    </div>
  );

  const filteredExpenses = data ? data.expenses.filter(e => !activeCat || e.category === activeCat) : [];
  const maxGroupAmt = data && data.groups.length > 0 ? data.groups[0].amount : 1;
  const maxCatAmt = data && data.categories.length > 0 ? data.categories[0].amount : 1;

  return (
    <div className="dashboard-shell activity-page">
      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate('/Dashboard')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => setIsSettingsOpen(true)}>⚙️</button>
      </div>

      <main className="main-content">
        {/* Page Header */}
        <div className="dash-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>Activity</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 500 }}>Your spending overview</p>
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div className="period-wrap fade-up">
          <div className="period-tabs glass-panel">
            <button className={`period-tab ${period === '7d' ? 'active' : ''}`} onClick={() => handlePeriodChange('7d')}>Last 7 days</button>
            <button className={`period-tab ${period === 'month' ? 'active' : ''}`} onClick={() => handlePeriodChange('month')}>This month</button>
            <button className={`period-tab ${period === 'custom' ? 'active' : ''}`} onClick={() => handlePeriodChange('custom')}>Custom</button>
          </div>
          {period === 'custom' && (
            <div className="custom-range fade-up">
              <div className="date-field">
                <label>From</label>
                <input type="date" value={customRange.startDate} onChange={e => setCustomRange({ ...customRange, startDate: e.target.value })} />
              </div>
              <div className="date-field">
                <label>To</label>
                <input type="date" value={customRange.endDate} onChange={e => setCustomRange({ ...customRange, endDate: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        {loading ? renderSkeleton() : !data || data.expenses.length === 0 ? renderEmptyState() : (
          <>
            {/* Insight */}
            <FadeInSection className="insight-banner">
              <div className="insight-emoji">💡</div>
              <div className="insight-text">
                <div className="t1">This period's insight</div>
                <div className="t2">{data.insight}</div>
              </div>
            </FadeInSection>

            {/* Summary cards */}
            <FadeInSection className="summary-grid">
              <div className="summary-card card-neutral">
                <div className="s-label">Spent</div>
                <div className="s-value">{data.summary.spent}</div>
                <div className="s-sub">this period</div>
              </div>
              <div className="summary-card card-green">
                <div className="s-label">Owed</div>
                <div className="s-value">{data.summary.owed}</div>
                <div className="s-sub">to collect</div>
              </div>
              <div className="summary-card card-red">
                <div className="s-label">You owe</div>
                <div className="s-value">{data.summary.owe}</div>
                <div className="s-sub">to settle</div>
              </div>
            </FadeInSection>

            {/* Quick Stats */}
            <FadeInSection className="analytics-section">
              <div className="section-title">Quick Stats</div>
              <div className="summary-grid" style={{ padding: 0 }}>
                {/* CARD 1 — Daily Average */}
                <div className="summary-card card-blue">
                  <div className="s-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅</span> Daily Avg
                  </div>
                  <div className="s-value">₹{data.dailyAvg?.toLocaleString('en-IN') || 0}</div>
                  <div className="s-sub">this period</div>
                </div>

                {/* CARD 2 — Biggest Expense */}
                <div className="summary-card card-purple">
                  <div className="s-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔝</span> Biggest
                  </div>
                  {data.topExpense ? (
                    <>
                      <div className="s-value" style={{ fontSize: '15px' }}>
                        {data.topExpense.emoji} {data.topExpense.desc.length > 12 ? `${data.topExpense.desc.slice(0, 12)}...` : data.topExpense.desc}
                      </div>
                      <div className="s-sub" style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', width: '100%' }}>
                        <span>₹{data.topExpense.amount?.toLocaleString('en-IN')}</span>
                        <span>{data.topExpense.groupName}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="s-value" style={{ fontSize: '15px' }}>No expenses</div>
                      <div className="s-sub">this period</div>
                    </>
                  )}
                </div>

                {/* CARD 3 — Pending Settlements */}
                <div 
                  className={`summary-card ${data.pendingSettlements > 0 ? 'card-amber' : 'card-green'}`}
                  onClick={() => navigate('/SettleUp')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="s-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏳</span> Pending
                  </div>
                  <div className="s-value">{data.pendingSettlements || 0}</div>
                  <div className="s-sub">settlements</div>
                </div>
              </div>
            </FadeInSection>


            {/* Trend chart */}
            <FadeInSection className="analytics-section">
              <div className="section-title">Spending trend</div>
              <div className="analytics-card glass-card">
                <div className="bar-chart-wrap">
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: '#10B981' }} /> You</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: '#60A5FA' }} /> Group avg</div>
                  </div>
                  <div className="bar-canvas-wrap">
                    <TrendChart labels={data.trend.labels} mine={data.trend.mine} avg={data.trend.avg} />
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* Spend Heatmap */}
            <FadeInSection className="analytics-section">
              <div className="section-title">Activity Heatmap</div>
              <div className="analytics-card glass-card p-16">
                <SpendHeatmap data={data.trend} />
              </div>
            </FadeInSection>

            {/* ── CATEGORY ANALYSIS — Chart + Collapsible List ── */}
            <FadeInSection className="analytics-section">
              <div className="section-title">Where your money goes</div>
              <div className="analytics-card glass-card" style={{ padding: '32px 24px' }}>
                {/* Donut Chart — Always Visible */}
                <div className="donut-chart-block" style={{ marginBottom: 24 }}>
                  <div className="donut-canvas-wrap">
                    <CategoryDonut categories={data.categories} onCategoryClick={setActiveCat} />
                    <div className="donut-center">
                      {activeCat ? (
                        <>
                          <div className="dc-emoji">{data.categories.find(c => c.name === activeCat)?.emoji}</div>
                          <div className="dc-label">{activeCat}</div>
                          <div className="dc-value">₹{data.categories.find(c => c.name === activeCat)?.amount?.toLocaleString('en-IN')}</div>
                        </>
                      ) : (
                        <>
                          <div className="dc-emoji">💳</div>
                          <div className="dc-label">Total Spent</div>
                          <div className="dc-value">{data.summary.spent}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category List Expander */}
                <div 
                  className={`cat-summary-expander ${categoriesOpen ? 'open' : ''}`}
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                >
                  <div className="cse-info">
                    <div className="cse-title">View Categories</div>
                    <div className="cse-subtitle">
                      {data.categories.slice(0, 3).map(c => `${c.emoji} ${c.name}`).join(' · ')}...
                    </div>
                  </div>
                  <ChevronDown className={`cse-chevron ${categoriesOpen ? 'open' : ''}`} />
                </div>

                {/* The Full List — Collapsible */}
                <div className={`cat-list-collapsible ${categoriesOpen ? 'open' : ''}`}>
                  <div className="cat-legend-grid" style={{ marginTop: 20 }}>
                    {data.categories.map(c => {
                      const catExpenses = data.expenses.filter(e => e.category === c.name);
                      const isActive = activeCat === c.name;
                      
                      return (
                        <div key={c.name} className={`cat-summary-wrap ${isActive ? 'active' : ''}`}>
                          <div
                            className={`cat-legend-row ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveCat(isActive ? null : c.name)}
                          >
                            <div className="cat-color-pill" style={{ background: c.color, width: 10, height: 10 }} />
                            <span className="cat-legend-name">{c.emoji} {c.name}</span>
                            <div className="cat-legend-bar-wrap">
                              <div className="cat-legend-bar" style={{ width: `${Math.round((c.amount / maxCatAmt) * 100)}%`, background: c.color }} />
                            </div>
                            <span className="cat-legend-amt">₹{c.amount.toLocaleString('en-IN')}</span>
                            <span className="cat-legend-pct">{c.pct}%</span>
                            <ChevronDown className={`cat-chevron ${isActive ? 'open' : ''}`} size={16} />
                          </div>
                          
                          <div className={`cat-expanded-content ${isActive ? 'open' : ''}`}>
                            <div className="cat-expense-list">
                              <div className="cat-expense-header">Transactions in {c.name}</div>
                              {catExpenses.length > 0 ? (
                                catExpenses.map((e, idx) => (
                                  <div key={idx} className="cat-expense-mini-row" style={{ borderLeftColor: c.color }}>
                                    <div className="cem-info">
                                      <div className="cem-desc">{e.desc}</div>
                                      <div className="cem-meta">
                                        <span className="cem-date">{e.date}</span>
                                        <span className="cem-sep">·</span>
                                        <span className="cem-group">{e.groupIcon} {e.groupName}</span>
                                      </div>
                                    </div>
                                    <div className="cem-amt" style={{ color: c.color }}>
                                      ₹{e.share?.toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="cat-empty-msg">No transactions found in this period</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {activeCat && (
                      <button className="clear-filter" onClick={() => setActiveCat(null)}>✕ Close summary</button>
                    )}
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* ── GROUP BREAKDOWN — Collapsible ── */}
            <FadeInSection className="analytics-section">
              <div className="section-title">By group</div>
              <div className="collapsible-card">
                <div className="collapsible-header" onClick={() => setGroupsOpen(o => !o)}>
                  <div className="collapsible-icon">👥</div>
                  <div className="collapsible-header-info">
                    <div className="collapsible-title">{data.groups.length} Group{data.groups.length !== 1 ? 's' : ''}</div>
                    <div className="collapsible-subtitle">
                      Top: {data.groups[0]?.name} · ₹{data.groups[0]?.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="collapsible-meta-badge">
                    ₹{data.groups.reduce((s, g) => s + g.amount, 0).toLocaleString('en-IN')}
                  </div>
                  <ChevronDown className={`collapsible-chevron ${groupsOpen ? 'open' : ''}`} />
                </div>
                <div className={`collapsible-body ${groupsOpen ? 'open' : ''}`}>
                  <div className="collapsible-body-inner">
                    <div className="group-list">
                      {data.groups.map((g, i) => (
                        <div className="group-row" key={i}>
                          <div className="group-icon">{g.icon || '👥'}</div>
                          <div className="group-info">
                            <div className="group-name-row">
                              <span className="group-name">{g.name}</span>
                              <span className="group-amt">₹{g.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="progress-track">
                              <div className="progress-fill" style={{ width: `${Math.round((g.amount / maxGroupAmt) * 100)}%` }} />
                            </div>
                            <div className="group-meta">{g.count} expense{g.count !== 1 && 's'} this period</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* ── TOP EXPENSES — Collapsible ── */}
            <FadeInSection className="analytics-section" style={{ marginBottom: 40 }}>
              <div className="section-title">Top expenses{activeCat ? ` · ${activeCat}` : ''}</div>
              <div className="collapsible-card">
                <div className="collapsible-header" onClick={() => setExpensesOpen(o => !o)}>
                  <div className="collapsible-icon">🧾</div>
                  <div className="collapsible-header-info">
                    <div className="collapsible-title">{filteredExpenses.length} Transaction{filteredExpenses.length !== 1 ? 's' : ''}</div>
                    <div className="collapsible-subtitle">
                      {filteredExpenses[0] ? `Latest: ${filteredExpenses[0].desc} · ${filteredExpenses[0].date}` : 'No transactions'}
                    </div>
                  </div>
                  <div className="collapsible-meta-badge">
                    ₹{filteredExpenses.reduce((s, e) => s + (e.share || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <ChevronDown className={`collapsible-chevron ${expensesOpen ? 'open' : ''}`} />
                </div>
                <div className={`collapsible-body ${expensesOpen ? 'open' : ''}`}>
                  <div className="collapsible-body-inner">
                    <div className="expense-list">
                      {filteredExpenses.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>No expenses found.</div>
                      ) : filteredExpenses.map((e, i) => (
                        <div className="expense-row" key={i}>
                          <div className="expense-icon" style={{ background: `${e.color}18` }}>
                            <span>{e.emoji}</span>
                          </div>
                          <div className="expense-info">
                            <div className="expense-desc">{e.desc}</div>
                            <div className="expense-meta">Paid by {e.paid} · {e.date}</div>
                          </div>
                          <div className="expense-amounts">
                            <div className="expense-share">₹{e.share.toLocaleString('en-IN')}</div>
                            <div className="expense-total">of ₹{e.total.toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </>
        )}
      </main>

      {isLoggedIn && <BottomNavbareM />}

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
    </div>
  );
}