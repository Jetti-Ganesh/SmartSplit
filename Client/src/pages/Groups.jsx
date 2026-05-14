import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateGroupMutation, useGetGroupsQuery } from '../services/groupAPI';
import '../styles/Groups.css';

const PREDEFINED_ICONS = ['🏠', '🏨', '✈️', '🎉', '🛒', '⛱️', '🎓', '⚽', '🎮', '🏪', '🚗', '👥'];
import '../styles/Groups.css';
function Groups() {
  const [addGroups, { isLoading: isCreatingGroup }] = useCreateGroupMutation();
  const { data, isLoading: isFetchingGroups } = useGetGroupsQuery();
  // const [groups, setGroups] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('🏠');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  // const totalOwe =data ?  data.reduce((acc, g) => acc + g.owe, 0) : "";
  // const totalOwed =data ? data.reduce((acc, g) => acc + g.owed, 0) : "";

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      description: newGroupDescription || 'Newly created group',
      owe: 0,
      owed: 0,
      members: 1,
      icon: newGroupIcon || '👥'
    };
    try {
      await addGroups(newGroup).unwrap();
      setIsModalOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupIcon('🏠');
    }
    catch (err) {
      console.log(err);
    }

  };
  console.log(data);
  
  return (
    <div className="groups-container">
      <div className="groups-header">
        <div className="header-text">
          <h1>My Groups</h1>
          <p>Manage your shared expenses effortlessly</p>
        </div>
        <button className="add-group-btn" onClick={() => setIsModalOpen(true)}>
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
            <h2 className="balance-amount">₹{1000}</h2>
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
            <h2 className="balance-amount">₹{3200}</h2>
          </div>
        </div>
      </div>

      <div className="groups-list">
        <h2 className="section-title">Recent Groups</h2>
        {data?.data?.map(group => (
          <div key={group._id} className="group-card" onClick={() => navigate(`/groups/${group.id}`, { state: { group } })}>
            <div className="group-info">
              <div className="group-avatar" style={group.icon ? { fontSize: '24px' } : {}}>
                {group.icon ? group.icon : group.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="group-details">
                <h3>{group.name}</h3>
                <p>{group.description} • {group.members.length} members</p>
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Group</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddGroup} className="add-group-form">
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Roommates, Office Lunch..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="e.g., Weekend trip expenses"
                />
              </div>
              <div className="form-group">
                <label>Choose an Icon</label>
                <div className="icons-grid">
                  {PREDEFINED_ICONS.map(icon => (
                    <div
                      key={icon}
                      className={`icon-option ${newGroupIcon === icon ? 'selected' : ''}`}
                      onClick={() => setNewGroupIcon(icon)}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="submit-group-btn" disabled={isCreatingGroup}>{isCreatingGroup ? "Creating.." : "Create Group"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;
