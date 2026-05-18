import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCreateGroupMutation, useGetGroupsQuery, useJoinGroupMutation } from '../services/groupAPI';
import BottomNavbareM from '../components/BottomNavbareM';
import SettingsDrawer from '../components/SettingsDrawer';
import { useOutletContext } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import '../styles/Groups.css';

const PREDEFINED_ICONS = ['🏠', '🏨', '✈️', '🎉', '🛒', '⛱️', '🎓', '⚽', '🎮', '🏪', '🚗', '👥'];
function Groups() {
  const [addGroups, { isLoading: isCreatingGroup }] = useCreateGroupMutation();
  const [joinGroup, { isLoading: isJoiningGroup }] = useJoinGroupMutation();
  const { data, isLoading: isFetchingGroups } = useGetGroupsQuery();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark, toggleTheme } = useOutletContext();
  const { user: loggedInUser } = useSelector(state => state.auth);
  const { showNotification } = useNotification();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  
  // Create Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('🏠');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  
  // Join Group Form State
  const [inviteCode, setInviteCode] = useState('');
  
  const [formError, setFormError] = useState('');

  // Check URL query parameters for an automatic invitation link
  useEffect(() => {
    const invite = searchParams.get('invite');
    if (invite) {
      setInviteCode(invite.toUpperCase().trim());
      setActiveTab('join');
      setIsModalOpen(true);
      // Clear parameter to avoid popping open modal again on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('invite');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  const handleAddGroup = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newGroupName.trim()) {
      setFormError('Group name is required.');
      return;
    }

    const newGroup = {
      name: newGroupName,
      description: newGroupDescription || 'Newly created group',
      icon: newGroupIcon || '👥'
    };

    try {
      await addGroups(newGroup).unwrap();
      setIsModalOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupIcon('🏠');
      setFormError('');
      showNotification(`🏘️ "${newGroupName}" group created successfully!`, 'group');
    } catch (err) {
      console.error(err);
      showNotification(err?.data?.message || 'Unable to create group. Please try again.', 'error');
      setFormError(err?.data?.message || 'Unable to create group. Please try again.');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!inviteCode.trim()) {
      setFormError('Invite code is required.');
      return;
    }

    try {
      const res = await joinGroup({ code: inviteCode }).unwrap();
      setIsModalOpen(false);
      setInviteCode('');
      setFormError('');
      showNotification(res.message || 'Joined group successfully! 🎉', 'success');
      if (res.data?._id) {
        navigate(`/groups/${res.data._id}`);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err?.data?.message || 'Failed to join group. Please check the code.';
      showNotification(errMsg, 'error');
    }
  };
  const totalOwe = data ? data.data.reduce((acc, g) => acc + (g.userBalance?.owing || 0), 0) : 0;
  const totalOwed = data ? data.data.reduce((acc, g) => acc + (g.userBalance?.owed || 0), 0) : 0;

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => setIsSettingsOpen(true)}>
          ⚙️
        </button>
      </div>

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
        {(!data?.data || data.data.length === 0) ? (
          <div className="no-groups-message">
            <div className="no-groups-icon">👥</div>
            <p>Please join or Create a group</p>
            <button className="join-now-btn" onClick={() => setIsModalOpen(true)}>Create Group</button>
          </div>
        ) : (
          data.data.map(group => {
            // Pass updated loggedInUser name into stale router state so GroupDetail stays fresh
            const enrichedGroup = {
              ...group,
              members: group.members.map(m => ({
                ...m,
                userId: m.userId?._id === loggedInUser?._id
                  ? { ...m.userId, name: loggedInUser.name }
                  : m.userId
              }))
            };
            return (
            <div key={group._id} className="group-card" onClick={() => navigate(`/groups/${group._id}`, { state: { group: enrichedGroup } })}>
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
                    <span>{totalOwed}</span>
                  </div>
                )}
              </div>
            </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content premium-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{activeTab === 'create' ? 'Create New Group' : 'Join a Group'}</h2>
                <p className="modal-subtitle">
                  {activeTab === 'create' 
                    ? 'Add a group name, description and icon to get everyone connected fast.' 
                    : 'Enter the unique 6-character code or invitation link to join your team.'}
                </p>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Premium Sliding Tabs */}
            <div className="modal-tabs">
              <button 
                className={`modal-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => { setActiveTab('create'); setFormError(''); }}
              >
                <span>➕ Create Group</span>
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'join' ? 'active' : ''}`}
                onClick={() => { setActiveTab('join'); setFormError(''); }}
              >
                <span>⚡ Join by Code</span>
              </button>
            </div>

            {activeTab === 'create' ? (
              <form onSubmit={handleAddGroup} className="add-group-form">
                <div className="form-group">
                  <label>Group Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Roommates, Goa Trip"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="e.g., Weekend getaway"
                  />
                </div>

                <div className="form-group">
                  <label>Choose Icon</label>
                  <div className="icons-grid">
                    {PREDEFINED_ICONS.map(icon => (
                      <button
                        type="button"
                        key={icon}
                        className={`icon-btn ${newGroupIcon === icon ? 'active' : ''}`}
                        onClick={() => setNewGroupIcon(icon)}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && <p className="error-text">{formError}</p>}

                <button type="submit" className="submit-btn" disabled={isCreatingGroup}>
                  {isCreatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinGroup} className="add-group-form">
                <div className="form-group">
                  <label>Invitation Invite Code</label>
                  <input
                    type="text"
                    className="form-input code-input"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase().trim())}
                    placeholder="e.g., AB7X9K"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="info-banner invite-banner">
                  <div className="banner-icon">💡</div>
                  <div className="banner-text">
                    Ask the group admin for their group invite code or link, then paste it above to join immediately.
                  </div>
                </div>

                {formError && <p className="error-text">{formError}</p>}

                <button type="submit" className="submit-btn join-submit-btn" disabled={isJoiningGroup}>
                  {isJoiningGroup ? 'Joining Group...' : 'Join Group'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <BottomNavbareM />

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

export default Groups;
