import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Settings, HelpCircle, Moon, Sun, Camera, X, Check } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, interviewHistory, themeMode, toggleTheme } = useAppContext();
  const fileInputRef = useRef(null);
  
  const [activeModal, setActiveModal] = useState(null); // 'difficulty', 'roles', 'settings', 'support'
  const [tempInput, setTempInput] = useState('');

  // Get top 2 history items
  const recentHistory = interviewHistory.slice(0, 2);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserProfile(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setTempInput('');
  };

  const toggleGoogleLink = () => {
    setUserProfile(prev => ({
      ...prev,
      linkedAccounts: { google: !prev.linkedAccounts.google }
    }));
  };

  const updateDifficulty = (level) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, difficulty: level }
    }));
    closeModal();
  };

  const addRole = (e) => {
    e.preventDefault();
    if (!tempInput.trim()) return;
    setUserProfile(prev => ({
      ...prev,
      preferences: { 
        ...prev.preferences, 
        targetRoles: [...new Set([...prev.preferences.targetRoles, tempInput.trim()])] 
      }
    }));
    setTempInput('');
  };

  const removeRole = (role) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: { 
        ...prev.preferences, 
        targetRoles: prev.preferences.targetRoles.filter(r => r !== role) 
      }
    }));
  };

  const toggleSetting = (key) => {
    setUserProfile(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: !prev.settings[key] }
    }));
  };

  return (
    <PageLayout>
      <div className="profile page-enter">
        <header className="profile__header">
          <h1 className="profile__title-top">Profile</h1>
        </header>

        {/* Hero with Avatar */}
        <section className="profile__hero">
          <div className="profile__avatar-container">
            <div className="profile__avatar-circle" onClick={handleAvatarClick}>
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Avatar" className="profile__avatar-img" />
              ) : (
                <span className="profile__avatar-initial">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'G'}
                </span>
              )}
              <div className="profile__avatar-overlay">
                <Camera size={16} />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleAvatarChange}
            />
          </div>
          <div className="profile__hero-info">
            <h2 className="profile__hero-name">{userProfile?.name || 'Guest User'}</h2>
            <p className="profile__hero-role">Senior Product Designer</p>
          </div>
        </section>

        {/* Account Section */}
        <section className="profile__section">
          <h3 className="profile__section-title">Account</h3>
          <div className="profile__card">
            <div className="profile__row">
              <p className="profile__row-label">Email Address</p>
              <p className="profile__row-value">{userProfile?.email || 'Not provided'}</p>
            </div>
            <div className="profile__row">
              <p className="profile__row-label">Password</p>
              <p className="profile__row-value">••••••••••••</p>
            </div>
            <div className="profile__row profile__row--action" onClick={toggleGoogleLink}>
              <p className="profile__row-label" style={{textTransform: 'none', color: 'var(--color-on-surface)'}}>Linked Accounts</p>
              <p className="profile__row-value profile__row-value--brand" style={{fontSize: '0.9rem'}}>
                {userProfile?.linkedAccounts?.google ? 'Disconnect Google' : 'Connect Google'}
              </p>
            </div>
          </div>
        </section>

        {/* Interview History */}
        <section className="profile__section">
          <h3 className="profile__section-title">Interview History</h3>
          <div className="profile__card">
            {recentHistory.length > 0 ? (
              recentHistory.map(session => (
                <div key={session.id} className="profile__row profile__row--action" onClick={() => navigate('/history')}>
                  <div>
                    <p className="profile__row-value">{session.role}</p>
                    <p className="profile__row-label">{session.date} • {session.score}%</p>
                  </div>
                  <ChevronRight size={16} className="profile__row-arrow" />
                </div>
              ))
            ) : (
              <div className="profile__row">
                <p className="profile__row-label">No recent sessions.</p>
              </div>
            )}
            {interviewHistory.length > 2 && (
              <button className="profile__row profile__row--action" style={{borderTop: '1px solid var(--color-surface-container)'}} onClick={() => navigate('/history')}>
                 <p className="profile__row-value" style={{fontSize: '0.9rem', color: 'var(--color-primary)'}}>View Full History</p>
              </button>
            )}
          </div>
        </section>

        {/* Interview Preferences */}
        <section className="profile__section">
          <h3 className="profile__section-title">Interview Preferences</h3>
          <div className="profile__card">
            <button className="profile__row profile__row--action" onClick={() => setActiveModal('difficulty')}>
              <p className="profile__row-value">Default Difficulty</p>
              <div className="profile__row-meta-wrap">
                <span className="profile__row-meta">{userProfile?.preferences?.difficulty}</span>
                <ChevronRight size={16} className="profile__row-arrow" />
              </div>
            </button>
            <button className="profile__row profile__row--action" style={{borderTop: '1px solid var(--color-surface-container)'}} onClick={() => setActiveModal('roles')}>
              <p className="profile__row-value">Target Roles</p>
              <div className="profile__row-meta-wrap">
                <span className="profile__row-meta">{userProfile?.preferences?.targetRoles?.length || 0} Selected</span>
                <ChevronRight size={16} className="profile__row-arrow" />
              </div>
            </button>
          </div>
        </section>

        {/* Settings & Support */}
        <div className="profile__links">
          <div className="profile__card" style={{ marginBottom: 'var(--space-4)' }}>
            <button className="profile__row profile__row--action" onClick={toggleTheme}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
                 {themeMode === 'dark' ? <Moon size={20} className="profile__link-icon" /> : <Sun size={20} className="profile__link-icon" />}
                 <span className="profile__link-text">Theme Mode</span>
              </div>
              <div className="profile__row-meta-wrap">
                <span className="profile__row-meta" style={{textTransform: 'capitalize'}}>{themeMode}</span>
              </div>
            </button>
          </div>

          <button className="profile__link-btn" onClick={() => setActiveModal('settings')}>
            <Settings size={20} className="profile__link-icon" />
            <span className="profile__link-text">App Settings</span>
          </button>
          <button className="profile__link-btn" onClick={() => setActiveModal('support')}>
            <HelpCircle size={20} className="profile__link-icon" />
            <span className="profile__link-text">Support & About</span>
          </button>
          <button
            id="btn-sign-out"
            className="profile__link-btn profile__link-btn--danger"
            onClick={() => {
              setUserProfile(null);
              navigate('/');
            }}
          >
            <LogOut size={20} className="profile__link-icon" />
            <span className="profile__link-text">Sign Out</span>
          </button>
        </div>

        {/* MODALS */}
        {activeModal && (
          <div className="profile__modal-backdrop" onClick={closeModal}>
            <div className="profile__modal-content" onClick={e => e.stopPropagation()}>
              <button className="profile__modal-close" onClick={closeModal}><X size={24} /></button>
              
              {activeModal === 'difficulty' && (
                <>
                  <h3 className="profile__modal-title">Select Difficulty</h3>
                  <div className="profile__options">
                    {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                      <button 
                        key={level} 
                        className={`profile__option-btn ${userProfile?.preferences?.difficulty === level ? 'active' : ''}`}
                        onClick={() => updateDifficulty(level)}
                      >
                        {level} {userProfile?.preferences?.difficulty === level && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeModal === 'roles' && (
                <>
                  <h3 className="profile__modal-title">Target Roles</h3>
                  <p className="profile__modal-sub">Add or remove roles you are interviewing for.</p>
                  <div className="profile__tags">
                    {userProfile?.preferences?.targetRoles?.map(role => (
                      <div key={role} className="profile__tag">
                        {role} <X size={14} onClick={() => removeRole(role)} style={{cursor: 'pointer'}} />
                      </div>
                    ))}
                  </div>
                  <form onSubmit={addRole} className="profile__modal-form">
                    <input 
                      type="text" 
                      placeholder="E.g. Frontend Master" 
                      value={tempInput} 
                      onChange={e => setTempInput(e.target.value)}
                      className="profile__modal-input" 
                    />
                    <button type="submit" className="profile__modal-submit">Add</button>
                  </form>
                </>
              )}

              {activeModal === 'settings' && (
                <>
                  <h3 className="profile__modal-title">App Settings</h3>
                  <div className="profile__options">
                    <label className="profile__toggle-row">
                      <span>Enable Notifications</span>
                      <input 
                        type="checkbox" 
                        checked={userProfile?.settings?.notifications} 
                        onChange={() => toggleSetting('notifications')} 
                      />
                    </label>
                    <label className="profile__toggle-row">
                      <span>Share Data for AI Training</span>
                      <input 
                        type="checkbox" 
                        checked={userProfile?.settings?.dataSharing} 
                        onChange={() => toggleSetting('dataSharing')} 
                      />
                    </label>
                  </div>
                </>
              )}

              {activeModal === 'support' && (
                <>
                  <h3 className="profile__modal-title" style={{textAlign: 'center', marginTop: '20px'}}>Interview Stimulator 3.0</h3>
                  <p className="profile__modal-sub" style={{textAlign: 'center', marginBottom: '20px'}}>Ready for Production. Build 2026.04.</p>
                  <button className="profile__modal-submit" onClick={closeModal} style={{width: '100%'}}>Contact Support</button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
