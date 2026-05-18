import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/SettleUp.css'
import { useState, useEffect } from 'react';
import SettingsDrawer from '../components/SettingsDrawer';
import BottomNavbareM from '../components/BottomNavbareM';
import { useGetGroupsQuery } from '../services/groupAPI';
import { useGetBalancesQuery, useRecordSettlementMutation } from '../services/settleUpAPI';
import { useNotification } from '../context/NotificationContext';

function SettleUp() {
  const { isLoggedIn, user: currentUser } = useSelector((state) => state.auth);
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isDark, toggleTheme } = useOutletContext();
  const { showNotification } = useNotification();

  const { data: groupsResponse, isLoading: groupsLoading } = useGetGroupsQuery();
  const groups = groupsResponse?.data || [];

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activeUpiDebt, setActiveUpiDebt] = useState(null);

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
    // Generate UPI URL
    const upiUrl = `upi://pay?pa=9848247279-2@axl&pn=${encodeURIComponent(recipientName)}&am=${debt.amount}&cu=INR`;
    
    // Dynamic QR API using Google or QRserver
    const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}&color=8b5cf6`;
    
    setQrCodeUrl(qrCodeImage);
    setActiveUpiDebt(debt);
    setShowQrModal(true);
    showNotification('📱 Opening secure UPI QR Code scanner!', 'info');
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
      showNotification(`✅ Settlement of ${fmt(debt.amount)} recorded!`, 'success');
      await refetchBalances();
      if (showQrModal) {
        setShowQrModal(false);
      }
    } catch (error) {
      console.error('Failed to record settlement', error);
      showNotification(error?.data?.message || 'Unable to record settlement', 'error');
    }
  };

  return (
    <div className="dashboard-shell">
      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate('/Dashboard')}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => setIsSettingsOpen(true)}>
          ⚙️
        </button>
      </div>

      <main className="main-content settle-up-shell">
        <div className="dash-section">
          
          {/* Section Header */}
          <div className="section-header-settle">
            <div className="title-area">
              <h2 className="section-title-custom">Settle Up Balances</h2>
              <p className="section-subtitle-custom">Clear your outstanding dues, request payments, and keep everyone squared up.</p>
            </div>
            
            {/* Custom Responsive Dropdown */}
            <div className="group-selector-premium">
              <label htmlFor="group-selector">Active Group</label>
              <div className="select-wrapper">
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
                <span className="select-arrow">▼</span>
              </div>
            </div>
          </div>

          <div className="settle-container">
            {/* Expert-level glassmorphism balance card */}
            <div className="balance-grid-expert">
              <div className="balance-box-expert owe card-glow-red">
                <div className="box-glow bg-red" />
                <span className="box-icon-expert">📤</span>
                <div className="box-info-expert">
                  <div className="box-label-expert">You Owe</div>
                  <div className="box-amount-expert">{fmt(youOwe)}</div>
                </div>
              </div>

              <div className="balance-box-expert net card-glow-purple">
                <div className="box-glow bg-purple" />
                <span className="box-icon-expert">⚖️</span>
                <div className="box-info-expert">
                  <div className="box-label-expert">Net Status</div>
                  <div className="box-amount-expert" style={{ color: groupNet < 0 ? '#ef4444' : '#10b981' }}>
                    {groupNet > 0 ? '+' : ''}{fmt(groupNet)}
                  </div>
                </div>
              </div>

              <div className="balance-box-expert owed card-glow-green">
                <div className="box-glow bg-green" />
                <span className="box-icon-expert">📥</span>
                <div className="box-info-expert">
                  <div className="box-label-expert">You are Owed</div>
                  <div className="box-amount-expert">{fmt(youAreOwed)}</div>
                </div>
              </div>
            </div>

            {/* Main Content Splitting */}
            <div className="settle-content-split">
              
              {/* Left Column: Outstanding Debts */}
              <div className="settle-column flex-2">
                <div className="column-header">
                  <h3 className="section-heading-custom">💸 Outstanding Debts</h3>
                  <span className="badge-count">{debts.length} active</span>
                </div>

                {balancesLoading ? (
                  <div className="loading-state-premium">
                    <div className="spinner-premium"></div>
                    <p>Fetching active balances...</p>
                  </div>
                ) : balancesError ? (
                  <div className="error-state-premium">
                    <span className="err-icon">⚠️</span>
                    <p>Unable to load balances for this group.</p>
                  </div>
                ) : (
                  <div className="debts-list-premium">
                    {debts.length === 0 ? (
                      <div className="empty-state-premium">
                        <span className="empty-icon-prem">🎉</span>
                        <h4>All Settled Up!</h4>
                        <p>No outstanding balances or payments remaining for this group.</p>
                      </div>
                    ) : (
                      debts.map((debt) => {
                        const isOutgoing = debt.from === currentUserId;
                        const isIncoming = debt.to === currentUserId;
                        const label = isOutgoing
                          ? `You owe ${debt.toName || debt.to}`
                          : `${debt.fromName || debt.from} owes you`;
                        
                        const initials = (isOutgoing ? (debt.toName || 'U') : (debt.fromName || 'U'))
                          .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                        return (
                          <div 
                            key={`${debt.from}-${debt.to}-${debt.amount}`} 
                            className={`debt-item-premium ${isIncoming ? 'incoming' : 'outgoing'}`}
                          >
                            <div className="debt-avatar-prem">
                              {initials}
                            </div>
                            <div className="debt-details-prem">
                              <div className="debt-desc-prem">{label}</div>
                              <div className="debt-meta-prem">
                                {isOutgoing ? 'Pay instantly using UPI QR or cash' : 'Verify and mark when received'}
                              </div>
                              <div className="debt-actions-prem">
                                {isOutgoing && (
                                  <button className="btn-pay-upi-prem" onClick={() => handlePayViaUpi(debt)}>
                                    ⚡ UPI QR Pay
                                  </button>
                                )}
                                <button className="btn-mark-settled-prem" onClick={() => handleRecordSettlement(debt)} disabled={isRecording}>
                                  {isIncoming ? '✓ Mark Received' : '✓ Mark Paid'}
                                </button>
                              </div>
                            </div>
                            <div className="debt-amount-prem">{fmt(debt.amount)}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: History */}
              <div className="settle-column flex-1">
                <div className="column-header">
                  <h3 className="section-heading-custom">⏳ Recent Settlements</h3>
                </div>
                
                <div className="settlements-list-premium">
                  {settlements.length === 0 ? (
                    <div className="empty-state-premium mini">
                      <p>No settlements recorded yet.</p>
                    </div>
                  ) : (
                    settlements.map((s) => (
                      <div key={s._id || s.id} className="history-item-premium">
                        <div className="history-indicator" />
                        <div className="history-details-prem">
                          <div className="history-desc-prem">
                            <strong>{s.from?.name || s.from}</strong> paid <strong>{s.to?.name || s.to}</strong>
                          </div>
                          <div className="history-meta-prem">
                            <span>💸 {fmt(s.amount)}</span> • <span>{new Date(s.settledAt || s.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ── UPI SECURE QR MODAL ── */}
      {showQrModal && activeUpiDebt && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>Secure UPI Settlement</h3>
              <p>Scan to pay {activeUpiDebt.toName || activeUpiDebt.to} instantly</p>
              <button className="close-btn" onClick={() => setShowQrModal(false)}>×</button>
            </div>
            
            <div className="qr-modal-body">
              <div className="qr-code-wrapper">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="UPI QR Code" className="upi-qr-image" />
                ) : (
                  <div className="qr-spinner"></div>
                )}
              </div>
              
              <div className="qr-details-area">
                <div className="qr-amount-pill">{fmt(activeUpiDebt.amount)}</div>
                <p className="qr-instructions">
                  Scan this QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) on your mobile phone to transfer the funds directly.
                </p>
              </div>

              <div className="qr-buttons-wrapper">
                <button 
                  className="btn-qr-success" 
                  onClick={() => handleRecordSettlement(activeUpiDebt)}
                  disabled={isRecording}
                >
                  ✓ Transfer Successful, Record Now
                </button>
                <button 
                  className="btn-qr-cancel" 
                  onClick={() => setShowQrModal(false)}
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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