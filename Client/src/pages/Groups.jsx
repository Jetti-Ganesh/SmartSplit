import { useState } from 'react';
import '../styles/Groups.css';

const mockGroups = [
  { id: 1, name: 'Goa Trip', description: 'December vacation', owe: 1500, owed: 0, members: 5 },
  { id: 2, name: 'Roommates', description: 'Monthly rent & groceries', owe: 0, owed: 3200, members: 3 },
  { id: 3, name: 'Office Lunch', description: 'Friday team lunch', owe: 450, owed: 0, members: 4 },
];
function Groups() {
  const [groups, setGroups] = useState(mockGroups);

  const totalOwe = groups.reduce((acc, g) => acc + g.owe, 0);
  const totalOwed = groups.reduce((acc, g) => acc + g.owed, 0);

  return (
    <div className="groups-container">
      <div className="groups-header">
        <div className="header-text">
          <h1>My Groups</h1>
          <p>Manage your shared expenses effortlessly</p>
        </div>
        <button className="add-group-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Group
        </button>
      </div>

      <div className="balance-cards">
        <div className="balance-card owe">
          <div className="balance-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
              <polyline points="17 18 23 18 23 12"></polyline>
            </svg>
          </div>
          <div className="balance-info">
            <p className="balance-label">You Owe</p>
            <h2 className="balance-amount">₹{totalOwe}</h2>
          </div>
        </div>

        <div className="balance-card owed">
          <div className="balance-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <div className="balance-info">
            <p className="balance-label">You are Owed</p>
            <h2 className="balance-amount">₹{totalOwed}</h2>
          </div>
        </div>
      </div>

      <div className="groups-list">
        <h2 className="section-title">Recent Groups</h2>
        {groups.map(group => (
          <div key={group.id} className="group-card">
            <div className="group-info">
              <div className="group-avatar">
                {group.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="group-details">
                <h3>{group.name}</h3>
                <p>{group.description} • {group.members} members</p>
              </div>
            </div>
            <div className="group-balance">
              {group.owe > 0 && (
                <div className="amount-owe">
                  <span>You owe</span>
                  <strong>₹{group.owe}</strong>
                </div>
              )}
              {group.owed > 0 && (
                <div className="amount-owed">
                  <span>You are owed</span>
                  <strong>₹{group.owed}</strong>
                </div>
              )}
              {group.owe === 0 && group.owed === 0 && (
                <div className="amount-settled">
                  <span>Settled</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Groups;
