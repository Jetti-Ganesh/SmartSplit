import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import '../styles/GroupDetail.css';
import { useAddMemberMutation } from '../services/groupAPI';
import { useCreateExpenseMutation, useGetExpensesQuery } from '../services/expenseAPI';
import { useGetBalancesQuery, useRecordSettlementMutation } from '../services/settleUpAPI';
import { fetchUserProfile } from '../services/profileSlice';
import { settleDebtWallet } from '../services/walletSlice';
import SettingsDrawer from '../components/SettingsDrawer';
import { useOutletContext } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

function GroupDetail() {
  const categories = [
    { name: 'Food', icon: '🍕' }, { name: 'Rent', icon: '🏠' },
    { name: 'Travel', icon: '🚕' }, { name: 'Fun', icon: '🎉' },
    { name: 'Shopping', icon: '🛒' }, { name: 'Utilities', icon: '💡' },
    { name: 'Health', icon: '🏥' }, { name: 'Other', icon: '➕' }
  ];
  const splits = [
    { name: 'Equally', icon: '⚖️' }, { name: 'Exact', icon: '💯' },
  ];
  const location = useLocation();
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { isDark, toggleTheme } = useOutletContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user: loggedInUser } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const profileUser = useSelector((state) => state.profile.user);

  const [addMemberFn, { isLoading: isAddingMember }] = useAddMemberMutation();
  const [addExpenseFn, { isLoading: isCreatingExpense }] = useCreateExpenseMutation();
  const { data: expensesRes, isLoading: isLoadingExpenses } = useGetExpensesQuery(groupId);
  const { showNotification } = useNotification();
  const { data: balancesResponse, refetch: refetchBalances } = useGetBalancesQuery(groupId, { skip: !groupId });
  const [recordSettlement, { isLoading: isRecording }] = useRecordSettlementMutation();

  const debts = balancesResponse?.data?.balances || [];

  // Try to get group from state, otherwise provide a fallback or fetch it
  const group = location.state?.group || {
    id: groupId,
    name: 'Group Details',
    members: [],
    icon: '👥',
    owe: 0,
    owed: 0
  };
  // console.log(group);

  const [activeTab, setActiveTab] = useState('Expenses');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activeUpiDebt, setActiveUpiDebt] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [memberTab, setMemberTab] = useState('email'); // 'email' | 'invite'
  const [splitType, setSplitType] = useState('Equally');
  const [email, setEmail] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState([]);
  const [exactAmounts, setExactAmounts] = useState({});

  useEffect(() => {
    function handleClickOutside(event) {
      if (expandedExpenseId !== null) {
        if (!event.target.closest('.expense-card')) {
          setExpandedExpenseId(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedExpenseId]);

  useEffect(() => {
    if (loggedInUser) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, loggedInUser]);

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v);

  const handlePayViaUpi = (debt) => {
    const recipientName = debt.toName || debt.to;
    const upiUrl = `upi://pay?pa=9848247279-2@axl&pn=${encodeURIComponent(recipientName)}&am=${debt.amount}&cu=INR`;
    const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}&color=8b5cf6`;
    
    setQrCodeUrl(qrCodeImage);
    setActiveUpiDebt(debt);
    setShowQrModal(true);
    showNotification('📱 Opening secure UPI QR Code scanner!', 'info');
  };

  const handleRecordSettlement = async (debt) => {
    const payload = {
      groupId,
      to: debt.to,
      amount: debt.amount,
      method: 'upi',
      notes: debt.toName ? `Settled with ${debt.toName}` : 'Settled debt',
    };

    if (debt.from !== loggedInUser?._id) {
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

  const handlePayViaWallet = async (debt) => {
    const balance = profileUser?.walletBalance || 0;
    if (balance < debt.amount) {
      showNotification(`❌ Insufficient wallet balance (${fmt(balance)}). Please top up in your Profile.`, 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to pay ${fmt(debt.amount)} to ${debt.toName || debt.to} via your Wallet?`)) {
      return;
    }

    try {
      await dispatch(settleDebtWallet({
        groupId,
        to: debt.to,
        amount: debt.amount
      })).unwrap();

      showNotification(`👛 Paid ${fmt(debt.amount)} successfully via Wallet!`, 'success');
      dispatch(fetchUserProfile());
      await refetchBalances();
    } catch (error) {
      console.error('Wallet payment failed:', error);
      showNotification(error || 'Failed to settle debt via wallet', 'error');
    }
  };

  const handleBack = () => {
    navigate('/groups');
  };
  const toggleExpenseDetails = (id) => {
    setExpandedExpenseId(prev => prev === id ? null : id);
  };
  function copyToClipBoard(text, label = "Code") {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(`📋 ${label} copied to clipboard successfully!`, 'success');
    }).catch(err => {
      console.error('Unable to copy text', err);
      showNotification('Failed to copy to clipboard.', 'error');
    });
  }
  async function addMember(email) {
    const currentGroupId = group._id || groupId;
    try {
      const res = await addMemberFn({ groupId: currentGroupId, email }).unwrap();
      showNotification('👥 Member added successfully!', 'success');
      setShowAddMemberModal(false);
      setEmail('');
    } catch (err) {
      console.error("Failed to add member:", err);
      const errorMsg = err?.data?.message || err?.message || '';

      if (err?.status === 404 || errorMsg.toLowerCase().includes('not found')) {
        showNotification('No user found with that email.', 'error');
      } else if (err?.status === 400 || errorMsg.toLowerCase().includes('already')) {
        showNotification('This person is already in the group.', 'warning');
      } else if (err?.status === 403 || errorMsg.toLowerCase().includes('admin')) {
        showNotification('Only group admins can add members.', 'error');
      } else {
        showNotification(errorMsg || 'Something went wrong. Please try again.', 'error');
      }
    }
  }

  const handleOpenAddExpense = () => {
    setExpenseAmount('');
    setExpenseDescription('');
    setSelectedCategory('Food');
    setSplitType('Equally');
    setExactAmounts({});
    if (Array.isArray(group.members) && group.members.length > 0) {
      setPaidBy(group.members[0].userId?._id || group.members[0]._id || 'You');
      setSplitBetween(group.members.map(m => m.userId?._id || m._id || 'You'));
    } else {
      setPaidBy('You');
      setSplitBetween(['You']);
    }
    setShowAddExpenseModal(true);
  };

  const handleAddExpense = async () => {
    const splitTypeLower = splitType === 'Equally' ? 'equal' : 'exact';
    let finalSplitBetween = splitBetween;

    if (splitType === 'Exact') {
      finalSplitBetween = splitBetween.map(userId => ({
        userId: userId,
        amount: Number(exactAmounts[userId]) || 0
      }));
    }

    const expenseData = {
      groupId,
      description: expenseDescription,
      amount: Number(expenseAmount),
      category: selectedCategory === 'Fun' ? 'Entertainment' : selectedCategory,
      paidBy: paidBy,
      splitType: splitTypeLower,
      ...(splitTypeLower === 'equal' ? { selectedMembers: splitBetween } : { splitDetails: finalSplitBetween })
    };
    console.log('Expense Data Object:', expenseData);
    try {
      await addExpenseFn(expenseData).unwrap();
      setShowAddExpenseModal(false);
      setExpenseAmount('');
      setExpenseDescription('');
      showNotification('💰 Expense added successfully!', 'expense');
    } catch (err) {
      console.error('Failed to create expense:', err);
      showNotification(err?.data?.message || err?.message || 'Failed to create expense', 'error');
    }
  };

  const youOwe = debts
    .filter((debt) => debt.from === loggedInUser?._id)
    .reduce((sum, debt) => sum + debt.amount, 0);
  const youAreOwed = debts
    .filter((debt) => debt.to === loggedInUser?._id)
    .reduce((sum, debt) => sum + debt.amount, 0);
  const groupDebts = debts.filter(debt => debt.from === loggedInUser?._id || debt.to === loggedInUser?._id);

  return (
    <>
      
      

      {/* Group detail container */}
      <div className="group-detail-container">
      {/* Header Section */}
      <div className="group-detail-header">
        {/* <div className="header-top">
          <button className="icon-btn back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <button className="icon-btn settings-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div> */}

        <div className="header-info">
          <div className="large-avatar">{group.icon || group.name.substring(0, 2).toUpperCase()}</div>
          <h1>{group.name}</h1>
          <p>{group.members.length} members • Created Dec 15</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="balance-summary-card">
        <p>YOUR BALANCE</p>
        <h2 className={youOwe > 0 ? 'text-owe' : youAreOwed > 0 ? 'text-owed' : ''}>
          {youOwe > 0 ? `You owe ₹${youOwe}` : youAreOwed > 0 ? `You are owed ₹${youAreOwed}` : 'Settled Up'}
        </h2>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions">
        <button className="action-card" onClick={handleOpenAddExpense}>
          <div className="action-icon icon-expense">💰</div>
          <span>Add Expense</span>
        </button>
        <button className="action-card" onClick={() => setShowSettleModal(true)}>
          <div className="action-icon icon-settle">⚖️</div>
          <span>Settle Up</span>
        </button>
        <button className="action-card" onClick={() => setShowAddMemberModal(true)}>
          <div className="action-icon icon-member">👥</div>
          <span>Add Member</span>
        </button>
        {/* <button className="action-card">
          <div className="action-icon icon-analytics">📊</div>
          <span>Analytics</span>
        </button> */}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {['Expenses', 'Members', 'Activity'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'Expenses' && (
          <div className="expenses-list">
            {isLoadingExpenses ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Loading expenses...</p>
            ) : expensesRes?.data?.length > 0 ? (
              expensesRes.data.map(expense => {
                const isExpanded = expandedExpenseId === expense._id;
                // The payer's own portion of the expense is already 'settled' since they paid it.
                const payerSplit = expense.splitDetails?.find(split => split.userId?._id === expense.paidBy?._id);
                const settledAmount = payerSplit ? payerSplit.amount : 0;
                const progressPercentage = expense.amount > 0 ? (settledAmount / expense.amount) * 100 : 0;
                const isSettled = progressPercentage >= 100;

                return (
                  <div className={`expense-card ${isExpanded ? 'expanded' : ''} ${isSettled ? 'settled' : ''}`} key={expense._id}>
                    <div className="expense-item" onClick={() => toggleExpenseDetails(expense._id)} style={{ cursor: 'pointer' }}>
                      <div className="expense-icon">
                        {categories.find(c => c.name === (expense.category === 'Entertainment' ? 'Fun' : expense.category))?.icon || '➕'}
                      </div>
                      <div className="expense-details">
                        <h3>{expense.description}</h3>
                        <p>Paid by {expense.paidBy?._id === loggedInUser?._id ? loggedInUser?.name : (expense.paidBy?.name || 'Someone')} • {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <div className="expense-amount">
                        <strong>₹{expense.amount}</strong>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="expense-expanded-content">
                        <div className="settlement-progress-section">
                          <div className="progress-header">
                            <span>Amount Settled</span>
                            <span>₹{settledAmount} / ₹{expense.amount}</span>
                          </div>
                          <div className="progress-bar-container-custom">
                            <div className="progress-bar-fill-custom" style={{ width: `${progressPercentage}%` }}>
                              {progressPercentage > 0 && <span className="progress-emoji">💰</span>}
                            </div>
                          </div>
                        </div>

                        <div className="expense-split-details">
                          <div className="paid-by-section">
                            <h4>Paid By</h4>
                            <div className="split-user-row">
                              <span className="split-user-name">{expense.paidBy?._id === loggedInUser?._id ? loggedInUser?.name : (expense.paidBy?.name || 'Someone')}</span>
                              <span className="split-user-amount text-owed">₹{expense.amount}</span>
                            </div>
                          </div>
                          <div className="owed-by-section">
                            <h4>Owed By (Not Paid)</h4>
                            {expense.splitDetails?.filter(split => split.userId?._id !== expense.paidBy?._id).map(split => (
                              <div className="split-user-row" key={split.userId?._id || Math.random()}>
                                <span className="split-user-name">{split.userId?._id === loggedInUser?._id ? loggedInUser?.name : (split.userId?.name || 'Unknown')}</span>
                                <span className="split-user-amount text-owe">₹{split.amount.toFixed(2)}</span>
                              </div>
                            ))}
                            {(!expense.splitDetails || expense.splitDetails.filter(split => split.userId?._id !== expense.paidBy?._id).length === 0) && (
                              <p className="no-owes-msg">No one else owes for this expense.</p>
                            )}
                          </div>
                        </div>

                        <div className="expense-actions-row" style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <button className="primary-btn enhanced-btn" style={{ flex: 1, padding: '10px', fontSize: '14px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-color)' }} onClick={() => alert("Update feature coming soon!")}>
                            ✏️ Update Expense
                          </button>
                          <button className="primary-btn enhanced-btn" style={{ flex: 1, padding: '10px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }} onClick={() => alert("Delete feature coming soon!")}>
                            🗑️ Delete Expense
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="activity-empty">
                <p>No expenses yet. Add one!</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'Members' && (
          <div className="members-list">
            {
              group.members.map(member => {
                const isCurrentUser = member.userId._id === loggedInUser?._id;
                const displayName = isCurrentUser ? loggedInUser?.name : member.userId.name;
                return (
                  <div className="member-item" key={member._id}>
                    <div className="member-avatar">{displayName?.[0] || '?'}</div>
                    <div className="member-details">
                      <h3>{displayName}</h3>
                      <p>{member.userId.email}</p>
                    </div>
                    {member.role == "admin" ? <div className="admin-badge">ADMIN</div> : ""}
                  </div>
                );
              }
              )
            }

            <button className="add-member-list-btn" onClick={() => setShowAddMemberModal(true)}>
              <span className="add-icon">+</span> Add New Member
            </button>
          </div>
        )}
        {activeTab === 'Activity' && (
          <div className="activity-empty">
            <p>Recent activity will appear here.</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowAddExpenseModal(false)}>
          <div className="add-expense-modal enhanced-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Expense</h2>
              <p className="modal-subtitle">Track your shared costs</p>
              <button className="close-btn" onClick={() => setShowAddExpenseModal(false)}>×</button>
            </div>
            <div className="modal-content scrollable-content">
              <div className="expense-amount-input">
                <span className="currency-symbol">₹</span>
                <input type="number" placeholder="0" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
              </div>

              <div className="input-group left-align">
                <label>Description</label>
                <div className="input-with-icon">
                  <span className="input-icon">📝</span>
                  <input type="text" placeholder="What was this for?" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} />
                </div>
              </div>

              <div className="input-group left-align">
                <label>Category</label>
                <div className="category-grid">
                  {categories.map(cat => (
                    <div
                      key={cat.name}
                      className={`category-item ${selectedCategory === cat.name ? 'selected' : ''}`}
                      onClick={() => setSelectedCategory(cat.name)}
                    >
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-name">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="input-group left-align">
                <label>Paid By</label>
                <select className="custom-select" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                  {Array.isArray(group.members) && group.members.map((member, i) => {
                    const memberId = member.userId?._id || member._id || 'You';
                    const isCurrentUser = memberId === loggedInUser?._id;
                    const displayName = isCurrentUser ? loggedInUser?.name : (member.userId?.name || 'You');
                    return <option key={i} value={memberId}>{displayName}</option>;
                  })}
                </select>
              </div>

              <div className="split-section">
                <label>SPLIT BETWEEN</label>
                <div className="split-members-list">
                  {Array.isArray(group.members) && group.members.map((member, i) => {
                    const memberId = member.userId?._id || member._id || 'You';
                    return (
                      <div className="split-member-item" key={i}>
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={splitBetween.includes(memberId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSplitBetween([...splitBetween, memberId]);
                              } else {
                                setSplitBetween(splitBetween.filter(id => id !== memberId));
                              }
                            }}
                          />
                          <span className="checkmark"></span>
                          <span className="member-name">{member.userId?.name || 'You'}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="input-group left-align">
                <label>Split Type</label>
                <div className="split-type-grid">
                  {splits.map(type => (
                    <div
                      key={type.name}
                      className={`split-type-item ${splitType === type.name ? 'selected' : ''}`}
                      onClick={() => setSplitType(type.name)}
                    >
                      <span className="split-icon">{type.icon}</span>
                      <span className="split-name">{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {splitType === 'Exact' && (
                <div className="split-section" style={{ marginTop: '16px', background: 'transparent', padding: '0' }}>
                  <label>ENTER EXACT AMOUNTS</label>
                  <div className="exact-members-list">
                    {splitBetween.map(userId => {
                      const member = Array.isArray(group.members) ? group.members.find(m => (m.userId?._id || m._id) === userId) : null;
                      const memberName = member?.userId?.name || (userId === 'You' ? 'You' : 'Member');
                      return (
                        <div className="exact-member-item" key={userId}>
                          <span className="member-name">{memberName}</span>
                          <div className="exact-amount-wrapper">
                            <span className="currency-symbol">₹</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={exactAmounts[userId] || ''}
                              onChange={(e) => setExactAmounts({ ...exactAmounts, [userId]: e.target.value })}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button className="primary-btn enhanced-btn add-expense-submit-btn" onClick={handleAddExpense}>
                {isCreatingExpense ? (
                  <span className="loading-text">Adding Expense...</span>
                ) : (
                  <>
                    <span className="btn-icon">💰</span>
                    <span>Add Expense</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="add-member-modal enhanced-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Group Members</h2>
              <p className="modal-subtitle">Grow your circle and keep all expenses in sync</p>
              <button className="close-btn" onClick={() => setShowAddMemberModal(false)}>×</button>
            </div>

            {/* Premium Sliding Tabs inside Add Member Modal */}
            <div className="modal-tabs" style={{ margin: '12px 24px 0', display: 'flex', borderBottom: '1px solid rgba(139, 92, 246, 0.12)' }}>
              <button 
                className={`modal-tab-btn ${memberTab === 'email' ? 'active' : ''}`}
                onClick={() => setMemberTab('email')}
                style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', fontWeight: '700', cursor: 'pointer', borderBottom: memberTab === 'email' ? '3px solid #8b5cf6' : '3px solid transparent', color: memberTab === 'email' ? '#8b5cf6' : 'var(--text-muted)' }}
              >
                <span>✉️ Add by Email</span>
              </button>
              <button 
                className={`modal-tab-btn ${memberTab === 'invite' ? 'active' : ''}`}
                onClick={() => setMemberTab('invite')}
                style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', fontWeight: '700', cursor: 'pointer', borderBottom: memberTab === 'invite' ? '3px solid #8b5cf6' : '3px solid transparent', color: memberTab === 'invite' ? '#8b5cf6' : 'var(--text-muted)' }}
              >
                <span>🔗 Share Code/Link</span>
              </button>
            </div>

            <div className="modal-content scrollable-content" style={{ padding: '20px 24px 24px' }}>
              {memberTab === 'email' ? (
                <>
                  <div className="premium-email-field">
                    <label>Email Address</label>
                    <div className="premium-input-container">
                      <span className="premium-input-icon">✉️</span>
                      <input 
                        type="email" 
                        placeholder="Enter member's email address..." 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="premium-email-input"
                      />
                    </div>
                  </div>

                  <div className="info-banner enhanced-banner">
                    <strong>💡 Quick Tip:</strong> The person must have an active SmartSplit account to be added immediately.
                  </div>

                  <button className="premium-add-btn" onClick={() => addMember(email)}>
                    {isAddingMember ? 'Adding Member...' : '➕ Add Member'}
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                  
                  {/* Invite Code Box */}
                  <div className="invite-code-container enhanced-invite" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>INVITATION CODE</p>
                    <div className="invite-code-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                      <h3 className="invite-code" style={{ margin: 0, fontSize: '32px', letterSpacing: '4px', color: '#8b5cf6', fontFamily: 'monospace', fontWeight: '800' }}>{group.inviteCode || 'AB7X9K'}</h3>
                      <button 
                        className="copy-code-btn" 
                        onClick={() => copyToClipBoard(group.inviteCode || "AB7X9K", "Invite Code")}
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>

                  {/* Invite Link Box */}
                  <div className="invite-link-container" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>INVITATION LINK</p>
                    <div className="invite-link-preview" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all', fontFamily: 'monospace', marginBottom: '14px' }}>
                      {window.location.origin}/groups?invite={group.inviteCode || 'AB7X9K'}
                    </div>
                    <button 
                      className="primary-btn invite-link-btn" 
                      onClick={() => copyToClipBoard(`${window.location.origin}/groups?invite=${group.inviteCode || 'AB7X9K'}`, "Invite Link")}
                      style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.2)' }}
                    >
                      <span>🔗</span> Copy Invitation Link
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settle Up Modal */}
      {showSettleModal && (
        <div className="modal-overlay" onClick={() => setShowSettleModal(false)}>
          <div className="add-member-modal enhanced-modal settle-up-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settle Up Balances</h2>
              <p className="modal-subtitle">Pay your dues or verify incoming settlements</p>
              <button className="close-btn" onClick={() => setShowSettleModal(false)}>×</button>
            </div>

            <div className="modal-content scrollable-content" style={{ padding: '20px 24px 24px' }}>
              <div className="debts-list-premium-detail">
                {groupDebts.length === 0 ? (
                  <div className="empty-state-premium-detail">
                    <span className="empty-icon-prem">🎉</span>
                    <h4>All Settled Up!</h4>
                    <p>No outstanding balances or payments remaining in this group.</p>
                  </div>
                ) : (
                  groupDebts.map((debt, index) => {
                    const isOutgoing = debt.from === loggedInUser?._id;
                    const isIncoming = debt.to === loggedInUser?._id;
                    const label = isOutgoing
                      ? `You owe ${debt.toName || debt.to}`
                      : `${debt.fromName || debt.from} owes you`;
                    
                    const initials = (isOutgoing ? (debt.toName || 'U') : (debt.fromName || 'U'))
                      .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <div 
                        key={index} 
                        className={`debt-item-premium-detail ${isIncoming ? 'incoming' : 'outgoing'}`}
                      >
                        <div className="debt-avatar-prem-detail">
                          {initials}
                        </div>
                        <div className="debt-details-prem-detail">
                          <div className="debt-desc-prem-detail">{label}</div>
                          <div className="debt-meta-prem-detail">
                            {isOutgoing 
                              ? `Your wallet: ${fmt(profileUser?.walletBalance || 0)}` 
                              : 'Verify and mark when received'
                            }
                          </div>
                          <div className="debt-actions-prem-detail">
                            {isOutgoing && (
                              <>
                                <button className="btn-pay-upi-prem-detail" onClick={() => handlePayViaUpi(debt)}>
                                  ⚡ UPI Pay
                                </button>
                                <button className="btn-pay-wallet-prem-detail" onClick={() => handlePayViaWallet(debt)}>
                                  👛 Wallet Pay
                                </button>
                              </>
                            )}
                            <button 
                              className="btn-mark-settled-prem-detail" 
                              onClick={() => handleRecordSettlement(debt)} 
                              disabled={isRecording}
                            >
                              {isIncoming ? '✓ Received' : '✓ Paid Cash'}
                            </button>
                          </div>
                        </div>
                        <div className="debt-amount-prem-detail">{fmt(debt.amount)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal (within GroupDetail) */}
      {showQrModal && activeUpiDebt && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)} style={{ zIndex: 1100 }}>
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

      {/* ── MOBILE BOTTOM NAV ── */}

    </div>

      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
    </>
  );
}

export default GroupDetail;
