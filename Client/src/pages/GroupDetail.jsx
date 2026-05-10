import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../styles/GroupDetail.css';

function GroupDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  // Try to get group from state, otherwise provide a fallback or fetch it
  const group = location.state?.group || {
    id: groupId,
    name: 'Group Details',
    members: 1,
    icon: '👥',
    owe: 0,
    owed: 0
  };

  const [activeTab, setActiveTab] = useState('Expenses');

  const handleBack = () => {
    navigate('/groups');
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
          <div className="large-avatar">{group.icon || group.name.substring(0,2).toUpperCase()}</div>
          <h1>{group.name}</h1>
          <p>{group.members} members • Created Dec 15</p>
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
        <button className="action-card">
          <div className="action-icon icon-expense">💰</div>
          <span>Add Expense</span>
        </button>
        <button className="action-card">
          <div className="action-icon icon-settle">⚖️</div>
          <span>Settle Up</span>
        </button>
        <button className="action-card">
          <div className="action-icon icon-member">👥</div>
          <span>Add Member</span>
        </button>
        <button className="action-card">
          <div className="action-icon icon-analytics">📊</div>
          <span>Analytics</span>
        </button>
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
          <div className="members-empty">
            <p>Member list will appear here.</p>
          </div>
        )}
        {activeTab === 'Activity' && (
          <div className="activity-empty">
            <p>Recent activity will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupDetail;
