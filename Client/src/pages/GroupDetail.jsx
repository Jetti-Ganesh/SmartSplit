import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../styles/GroupDetail.css';
import { useAddMemberMutation } from '../services/groupAPI';
import {useCreateExpenseMutation} from '../services/expenseAPI'
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
  const [addMemberFn, { isLoading: isAddingMember }] = useAddMemberMutation();
  const [addExpenseFn , {isLoading : isCreatingExpense}] = useCreateExpenseMutation();
  // Try to get group from state, otherwise provide a fallback or fetch it
  const group = location.state?.group || {
    id: groupId,
    name: 'Group Details',
    members: [],
    icon: '👥',
    owe: 0,
    owed: 0
  };
  console.log(group);

  const [activeTab, setActiveTab] = useState('Expenses');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [splitType, setSplitType] = useState('Equally');
  const [email, setEmail] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState([]);
  const [exactAmounts, setExactAmounts] = useState({});
  const handleBack = () => {
    navigate('/groups');
  };
  function copyToClipBoard(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text successfully copied!');
      alert("Copied: " + text);
    }).catch(err => {
      console.error('Unable to copy text', err);
    });
  }
  async function addMember(email) {
    console.log(group._id);
    const groupId = group._id;
    await addMemberFn({ groupId, email })
    setShowAddMemberModal(false)
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

  const handleAddExpense = () => {
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
      category: selectedCategory,
      paidBy: paidBy,
      splitType: splitType,
      splitBetween: finalSplitBetween
    };
    console.log('Expense Data Object:', expenseData);
    // Add logic to save expense later
    addExpenseFn(expenseData);
    setShowAddExpenseModal(false);
  };

  return (
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
        <h2 className={group.owe > 0 ? 'text-owe' : group.owed > 0 ? 'text-owed' : ''}>
          {group.owe > 0 ? `You owe ₹${group.owe}` : group.owed > 0 ? `You are owed ₹${group.owed}` : 'Settled Up'}
        </h2>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions">
        <button className="action-card" onClick={handleOpenAddExpense}>
          <div className="action-icon icon-expense">💰</div>
          <span>Add Expense</span>
        </button>
        {/* <button className="action-card">
          <div className="action-icon icon-settle">⚖️</div>
          <span>Settle Up</span>
        </button> */}
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
            <div className="expense-item">
              <div className="expense-icon">🍕</div>
              <div className="expense-details">
                <h3>Pizza Party</h3>
                <p>Paid by Amit • Dec 28</p>
              </div>
              <div className="expense-amount">
                <strong>₹1,200</strong>
              </div>
            </div>
            <div className="expense-item">
              <div className="expense-icon">🚕</div>
              <div className="expense-details">
                <h3>Uber to Airport</h3>
                <p>Paid by You • Dec 25</p>
              </div>
              <div className="expense-amount">
                <strong>₹850</strong>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Members' && (
          <div className="members-list">
            {
              group.members.map(member => {
                return (
                  <div className="member-item" key={member._id}>
                    <div className="member-avatar">{member.userId.name[0]}</div>
                    <div className="member-details">
                      <h3>{member.userId.name}</h3>
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
          <div className="add-expense-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="close-btn" onClick={() => setShowAddExpenseModal(false)}>×</button>
            </div>
            <div className="modal-content scrollable-content">
              <div className="expense-amount-input">
                <span className="currency-symbol">₹</span>
                <input type="number" placeholder="0" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
              </div>

              <div className="input-group left-align">
                <label>Description</label>
                <input type="text" placeholder="What was this for?" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} />
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
                    return <option key={i} value={memberId}>{member.userId?.name || 'You'}</option>;
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
                              onChange={(e) => setExactAmounts({...exactAmounts, [userId]: e.target.value})}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button className="primary-btn add-expense-submit-btn" onClick={handleAddExpense}>Add Expense</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="add-member-modal enhanced-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Member</h2>
              <p className="modal-subtitle">Expand your circle and share expenses</p>
              <button className="close-btn" onClick={() => setShowAddMemberModal(false)}>×</button>
            </div>

            <div className="modal-content">
              <div className="input-group left-align">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input type="email" placeholder="Enter member's email" onChange={(e) => { setEmail(e.target.value) }} />
                </div>
              </div>

              <div className="info-banner enhanced-banner">
                <div className="banner-icon">💡</div>
                <div className="banner-text">The person must have a SmartSplit account. They'll be added immediately.</div>
              </div>

              <button className="primary-btn enhanced-btn" onClick={() => addMember(email)}>
                {isAddingMember ? (
                  <span className="loading-text">Adding Member...</span>
                ) : (
                  <>
                    <span className="btn-icon">+</span>
                    <span>Add Member</span>
                  </>
                )}
              </button>

              <div className="divider enhanced-divider">
                <span>Or Share Invite Code</span>
              </div>

              <div className="invite-code-container enhanced-invite">
                <p>Share this code with your friends</p>
                <div className="invite-code-box">
                  <h3 className="invite-code">{group.inviteCode || 'AB7X9K'}</h3>
                  <button className="icon-copy-btn" onClick={() => copyToClipBoard(group.inviteCode || "AB7X9K")}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;
