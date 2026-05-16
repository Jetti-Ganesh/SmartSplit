import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchAnalytics, seedDummyExpenses } from '../services/analytics.service';
import TrendChart from '../components/activity/TrendChart';
import CategoryDonut from '../components/activity/CategoryDonut';
import SpendHeatmap from '../components/activity/SpendHeatmap';
import BottomNavbareM from '../components/BottomNavbareM';
import SettingsDrawer from '../components/SettingsDrawer';
import '../styles/Activity.css';

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
  
  // Settings Drawer state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [period, customRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAnalytics(period, customRange);
      if (res.success) {
        setData(res.data);
      }
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
      alert("Error seeding data");
    }
    setSeedLoading(false);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setActiveCat(null);
  };

  const renderSkeleton = () => (
    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading analytics...
    </div>
  );

  const renderEmptyState = () => (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 15 }}>No data found for this period.</p>
      <button 
        onClick={handleSeed} 
        disabled={seedLoading}
        style={{
          padding: '8px 16px', borderRadius: 8, background: 'var(--primary, #10B981)',
          color: '#fff', border: 'none', cursor: 'pointer'
        }}
      >
        {seedLoading ? 'Seeding...' : 'Seed Dummy Data'}
      </button>
    </div>
  );

  return (
    <div className="dashboard-shell activity-page">
      {/* ── MOBILE TOP BAR ────────────────────────────────────────── */}
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/Dashboard")}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => setIsSettingsOpen(true)}>
          ⚙️
        </button>
      </div>
    
      <main className="main-content">
        <div className="dash-section" style={{ paddingBottom: 0 }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="section-title" style={{ fontSize: 22, textTransform: 'none' }}>Activity</h2>
              <p className="section-subtitle">Your spending overview</p>
            </div>
            {/* Hidden seed button for debugging/demo */}
            <button onClick={handleSeed} title="Seed Dummy Data" style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                🌱
            </button>
          </div>
        </div>

        {/* ── Period selector ── */}
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
                <input type="date" value={customRange.startDate} onChange={e => setCustomRange({...customRange, startDate: e.target.value})} />
              </div>
              <div className="date-field">
                <label>To</label>
                <input type="date" value={customRange.endDate} onChange={e => setCustomRange({...customRange, endDate: e.target.value})} />
              </div>
            </div>
          )}
        </div>

        {loading ? renderSkeleton() : !data || data.expenses.length === 0 ? renderEmptyState() : (
          <>
            {/* Insight banner */}
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

            {/* Monthly bar chart */}
            <div className="analytics-section fade-up delay-3">
              <div className="section-title">Spending trend</div>
              <div className="analytics-card glass-card">
                <div className="bar-chart-wrap">
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: '#10B981' }} /> You</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: '#BFDBFE' }} /> Group avg</div>
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

            {/* Category donut */}
            <div className="analytics-section fade-up delay-4">
              <div className="section-title">Where your money goes</div>
              <div className="analytics-card glass-card">
                <div className="donut-wrap">
                  <div className="donut-row">
                    <div className="donut-canvas-wrap">
                      <CategoryDonut categories={data.categories} onCategoryClick={setActiveCat} />
                      <div className="donut-center">
                        <div className="dc-label">{activeCat || 'Total'}</div>
                        <div className="dc-value">
                           {activeCat 
                             ? `₹${data.categories.find(c => c.name === activeCat)?.amount.toLocaleString('en-IN')}` 
                             : data.summary.spent}
                        </div>
                      </div>
                    </div>
                    <div className="cat-legend">
                      {data.categories.map(c => (
                        <div key={c.name} className={`cat-row ${activeCat === c.name ? 'active' : ''}`} onClick={() => setActiveCat(activeCat === c.name ? null : c.name)}>
                          <div className="cat-dot" style={{ background: c.color }} />
                          <span className="cat-name">{c.name}</span>
                          <span className="cat-pct">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {activeCat && (
                    <button className="clear-filter" onClick={() => setActiveCat(null)}>Clear filter ×</button>
                  )}
                </div>
              </div>
            </div>

            {/* Group breakdown */}
            <div className="analytics-section fade-up delay-5">
              <div className="section-title">By group</div>
              <div className="analytics-card glass-card">
                <div className="group-list">
                  {data.groups.map((g, i) => {
                    const maxAmount = data.groups[0].amount || 1;
                    return (
                      <div className="group-row" key={i}>
                        <div className="group-icon">{g.icon}</div>
                        <div className="group-info">
                          <div className="group-name-row">
                            <span className="group-name">{g.name}</span>
                            <span className="group-amt">₹{g.amount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${Math.round((g.amount / maxAmount) * 100)}%` }} />
                          </div>
                          <div className="group-meta">{g.count} expense{g.count !== 1 && 's'} this period</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Top expenses */}
            <div className="analytics-section fade-up delay-6" style={{ marginBottom: 40 }}>
              <div className="section-title">Top expenses {activeCat ? `· ${activeCat}` : ''}</div>
              <div className="analytics-card glass-card">
                <div className="expense-list">
                  {data.expenses.filter(e => !activeCat || e.cat === activeCat).length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                      No expenses found.
                    </div>
                  ) : (
                    data.expenses.filter(e => !activeCat || e.cat === activeCat).map((e, i) => (
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      {isLoggedIn && <BottomNavbareM />}

      {/* ── SETTINGS DRAWER ───────────────────────────────────────── */}
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
    </div>
  );
}