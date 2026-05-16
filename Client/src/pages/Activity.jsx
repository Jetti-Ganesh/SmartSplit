import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchAnalytics, seedDummyExpenses } from '../services/analytics.service';
import TrendChart from '../components/activity/TrendChart';
import CategoryDonut from '../components/activity/CategoryDonut';
import SpendHeatmap from '../components/activity/SpendHeatmap';
import BottomNavbareM from '../components/BottomNavbareM';
import SettingsDrawer from '../components/SettingsDrawer';
import '../styles/Activity.css';

// Chevron icon
const ChevronDown = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Activity() {
  const { isDark, toggleTheme } = useOutletContext();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [period, setPeriod] = useState('month');
  const [customRange, setCustomRange] = useState({ startDate: '2024-12-01', endDate: '2024-12-28' });
  const [data, setData] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Collapsible state
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
    }
    setLoading(false);
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      await seedDummyExpenses();
      await loadData();
    } catch (err) {
      alert('Error seeding data. Check console.');
    }
    setSeedLoading(false);
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
      <button onClick={handleSeed} disabled={seedLoading} style={{
        padding: '10px 24px', borderRadius: 12, background: '#10B981',
        color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 4px 16px rgba(16,185,129,0.3)', transition: 'opacity 0.2s',
        opacity: seedLoading ? 0.7 : 1
      }}>
        {seedLoading ? '⏳ Seeding...' : '🌱 Seed Demo Data'}
      </button>
    </div>
  );

  const filteredExpenses = data ? data.expenses.filter(e => !activeCat || e.cat === activeCat) : [];
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
        <div className="dash-section" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>Activity</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 500 }}>Your spending overview</p>
            </div>
            <button onClick={handleSeed} title="Seed Demo Data" disabled={seedLoading} style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontSize: 13,
              color: '#10B981', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6
            }}>
              {seedLoading ? '⏳' : '🌱'} {seedLoading ? 'Seeding...' : 'Demo Data'}
            </button>
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
            <div className="insight-banner fade-up delay-1">
              <div className="insight-emoji">💡</div>
              <div className="insight-text">
                <div className="t1">This period's insight</div>
                <div className="t2">{data.insight}</div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="summary-grid fade-up delay-2">
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
            </div>

            {/* Trend chart */}
            <div className="analytics-section fade-up delay-3">
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
            </div>

            {/* Spend Heatmap */}
            <div className="analytics-section fade-up delay-3">
              <div className="section-title">Activity Heatmap</div>
              <div className="analytics-card glass-card p-16">
                <SpendHeatmap data={data.trend} />
              </div>
            </div>

            {/* ── CATEGORY DONUT — Full Redesign ── */}
            <div className="analytics-section fade-up delay-4">
              <div className="section-title">Where your money goes</div>
              <div className="donut-section-card glass-card">
                <div className="donut-chart-block">
                  {/* Large centered donut */}
                  <div className="donut-canvas-wrap">
                    <CategoryDonut categories={data.categories} onCategoryClick={setActiveCat} />
                    <div className="donut-center">
                      {activeCat ? (
                        <>
                          <div className="dc-emoji">{data.categories.find(c => c.name === activeCat)?.emoji}</div>
                          <div className="dc-label">{activeCat}</div>
                          <div className="dc-value">₹{data.categories.find(c => c.name === activeCat)?.amount.toLocaleString('en-IN')}</div>
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

                  {/* Horizontal legend bars below the chart */}
                  <div className="cat-legend-grid">
                    {data.categories.map(c => (
                      <div
                        key={c.name}
                        className={`cat-legend-row ${activeCat === c.name ? 'active' : ''}`}
                        onClick={() => setActiveCat(activeCat === c.name ? null : c.name)}
                      >
                        <div className="cat-color-pill" style={{ background: c.color, width: 10, height: 10 }} />
                        <span className="cat-legend-name">{c.emoji} {c.name}</span>
                        <div className="cat-legend-bar-wrap">
                          <div className="cat-legend-bar" style={{ width: `${Math.round((c.amount / maxCatAmt) * 100)}%`, background: c.color }} />
                        </div>
                        <span className="cat-legend-amt">₹{c.amount.toLocaleString('en-IN')}</span>
                        <span className="cat-legend-pct">{c.pct}%</span>
                      </div>
                    ))}
                    {activeCat && (
                      <button className="clear-filter" onClick={() => setActiveCat(null)}>✕ Clear filter</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── GROUP BREAKDOWN — Collapsible ── */}
            <div className="analytics-section fade-up delay-5">
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
            </div>

            {/* ── TOP EXPENSES — Collapsible ── */}
            <div className="analytics-section fade-up delay-6" style={{ marginBottom: 40 }}>
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
            </div>
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