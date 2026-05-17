import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/SettleUp.css'
import { useState, useEffect } from 'react';
import SettingsDrawer from '../components/SettingsDrawer';
import BottomNavbareM from '../components/BottomNavbareM';
import { useGetGroupsQuery } from '../services/groupAPI';
import { useGetBalancesQuery, useRecordSettlementMutation } from '../services/settleUpAPI';

function SettleUp() {
  const { isLoggedIn, user: currentUser } = useSelector((state) => state.auth);
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isDark, toggleTheme } = useOutletContext();

  const { data: groupsResponse, isLoading: groupsLoading } = useGetGroupsQuery();
  const groups = groupsResponse?.data || [];

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0]._id || groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const {
    data: balancesResponse,
    error: balancesError,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useGetBalancesQuery(selectedGroupId, {
    skip: !selectedGroupId,
  });

  const [recordSettlement, { isLoading: isRecording }] = useRecordSettlementMutation();

  const balanceData = balancesResponse?.data;
  const debts = balanceData?.balances || [];
  const settlements = balanceData?.settlements || [];
  const currentGroup = balanceData?.group || groups.find((g) => g._id === selectedGroupId || g.id === selectedGroupId);

  const youOwe = debts
    .filter((debt) => debt.from === currentUserId)
    .reduce((sum, debt) => sum + debt.amount, 0);
  const youAreOwed = debts
    .filter((debt) => debt.to === currentUserId)
    .reduce((sum, debt) => sum + debt.amount, 0);

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v);
  const groupNet = youAreOwed - youOwe;

  const handlePayViaUpi = (debt) => {
    const recipientName = debt.toName || debt.to;
    const upiUrl = `upi://pay?pa=9848247279-2@axl&pn=${encodeURIComponent(recipientName)}&am=${debt.amount}&cu=INR`;
    window.open(upiUrl, '_blank');
  };

  const handleRecordSettlement = async (debt) => {
    const payload = {
      groupId: selectedGroupId,
      to: debt.to,
      amount: debt.amount,
      method: 'upi',
      notes: debt.toName ? `Settled with ${debt.toName}` : 'Settled debt',
    };

    if (debt.from !== currentUserId) {
      payload.from = debt.from;
    }

    try {
      await recordSettlement(payload).unwrap();
      await refetchBalances();
    } catch (error) {
      console.error('Failed to record settlement', error);
      alert(error?.data?.message || 'Unable to record settlement');
    }
  };

  return (
    <div className="dashboard-shell">
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate('/Dashboard')}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => navigate('/Settings')}>
          ⚙️
        </button>
      </div>

      <main className="main-content">
        <div className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Settle Up</h2>
            <p className="section-subtitle">Clear your dues, record payments, and keep recent settlements in one place.</p>
          </div>

          <div className="group-selector-row">
            <label htmlFor="group-selector">Select group</label>
            <select
              id="group-selector"
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={groupsLoading}
            >
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="settle-container">
            <div className="balance-card">
              <div className="panel-header">
                <div className="balance-expanded">
                  <div className="balance-title">{currentGroup?.name || 'Group'} balance</div>
                  <div className="balance-grid-expanded">
                    <div className="balance-box owe large">
                      <div className="box-label">You Owe</div>
                      <div className="box-amount">{fmt(youOwe)}</div>
                    </div>
                    <div className="balance-box net large">
                      <div className="box-label">Net</div>
                      <div className="box-amount" style={{ color: groupNet < 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{fmt(groupNet)}</div>
                    </div>
                    <div className="balance-box owed large">
                      <div className="box-label">You're Owed</div>
                      <div className="box-amount">{fmt(youAreOwed)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="section-heading">Outstanding Debts</h3>
            {balancesLoading ? (
              <div className="loading">Loading debts...</div>
            ) : balancesError ? (
              <div className="error">Unable to load balances.</div>
            ) : (
              <div className="debts-list">
                {debts.length === 0 && <div className="empty">No outstanding debts</div>}
                {debts.map((debt) => {
                  const isOutgoing = debt.from === currentUserId;
                  const isIncoming = debt.to === currentUserId;
                  const label = isOutgoing
                    ? `You → ${debt.toName || debt.to}`
                    : `${debt.fromName || debt.from} → You`;

                  return (
                    <div key={`${debt.from}-${debt.to}-${debt.amount}`} className={`debt-item ${isIncoming ? 'incoming' : 'outgoing'}`}>
                      <div className="debt-left">
                        <div className="debt-desc">{label}</div>
                        <div className="debt-actions">
                          {isOutgoing && (
                            <button className="btn-upi" onClick={() => handlePayViaUpi(debt)}>
                              Pay via UPI
                            </button>
                          )}
                          <button className="btn-secondary" onClick={() => handleRecordSettlement(debt)} disabled={isRecording}>
                            {isIncoming ? 'Mark Received' : 'Mark Settled'}
                          </button>
                        </div>
                      </div>
                      <div className="debt-amount">{fmt(debt.amount)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <h3 className="section-heading">Recent Settlements</h3>
            <div className="settlements-list">
              {settlements.length === 0 && <div className="empty">No recent settlements</div>}
              {settlements.map((s) => (
                <div key={s._id || s.id} className="history-item">
                  <div className="history-left">
                    <div className="history-desc">{s.from?.name || s.from} paid {s.to?.name || s.to}</div>
                    <div className="history-date">{new Date(s.settledAt || s.date).toLocaleDateString()}</div>
                  </div>
                  <div className="history-amount">{fmt(s.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

export default SettleUp;