import { useState } from 'react';
import { Menu, Bell, Sparkles } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';

interface TopBarProps {
  activeTab: 'home' | 'network' | 'rank' | 'messages' | 'profile' | 'activity' | 'notifications' | 'ai';
  setActiveTab: (tab: 'home' | 'network' | 'rank' | 'messages' | 'profile' | 'activity' | 'notifications' | 'ai') => void;
  setSidebarOpen: (open: (prev: boolean) => boolean) => void;
  notificationsCount: number;
  profile: Profile;
  onSignOut: () => void;
}

export default function TopBar({
  activeTab,
  setActiveTab,
  setSidebarOpen,
  notificationsCount,
  profile,
  onSignOut,
}: TopBarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="top-bar">
      <div className="top-bar-logo-area">
        <button
          className="top-bar-hamburger"
          type="button"
          onClick={() => setSidebarOpen(prev => !prev)}
          aria-label="Toggle navigation sidebar"
        >
          <Menu size={22} />
        </button>
      </div>

      <nav className="top-bar-nav">
        <button 
          type="button"
          className={`top-bar-link ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          style={{ background: 'none', border: 'none', fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}
        >
          Home Feed
        </button>
        <button 
          type="button"
          className={`top-bar-link ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
          style={{ background: 'none', border: 'none', fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}
        >
          Mentors & Peers
        </button>
        <button 
          type="button"
          className={`top-bar-link ${activeTab === 'rank' ? 'active' : ''}`}
          onClick={() => setActiveTab('rank')}
          style={{ background: 'none', border: 'none', fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}
        >
          Engineering Rank
        </button>
        <button
          type="button"
          className={`top-bar-link ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
          style={{ background: 'none', border: 'none', fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}
        >
          Messages
        </button>
        <button
          type="button"
          className={`top-bar-link ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          style={{ background: 'none', border: 'none', fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <Sparkles size={15} />
          AI
        </button>
      </nav>

      <div className="top-bar-profile-area" style={{ gap: '16px', position: 'relative' }}>
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-2 rounded-full transition-colors"
          style={{ position: 'relative', background: 'none', border: 'none', color: activeTab === 'notifications' ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Open notifications page"
        >
          <Bell size={22} />
          {notificationsCount > 0 && (
            <span 
              className="animate-pulse"
              style={{
                position: 'absolute',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                borderRadius: '50%',
                top: '-2px',
                right: '-2px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}
            >
              {notificationsCount}
            </span>
          )}
        </button>

        <button 
          className="top-bar-avatar-btn"
          type="button"
          onClick={() => setProfileMenuOpen(prev => !prev)}
          aria-label="Open user menu"
        >
          <Avatar
            name={profile.full_name}
            avatarUrl={profile.avatar_url}
            size={40}
          />
        </button>

        {profileMenuOpen && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 900,
                background: 'transparent',
                cursor: 'default'
              }}
              onClick={() => setProfileMenuOpen(false)}
            />
            <div 
              className="profile-dropdown-menu"
              style={{
                position: 'absolute',
                top: '56px',
                right: 0,
                width: '280px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                color: 'var(--color-text-light)',
                textAlign: 'left',
                animation: 'slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Avatar
                  name={profile.full_name}
                  avatarUrl={profile.avatar_url}
                  size={48}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{profile.full_name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>{profile.role}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  onClick={() => { setProfileMenuOpen(false); setActiveTab('profile'); }}
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    borderRadius: '20px', 
                    border: '1.5px solid var(--color-primary)', 
                    backgroundColor: 'transparent', 
                    color: 'var(--color-primary)', 
                    fontSize: '0.78rem', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  View profile
                </button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)', margin: '4px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Account
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); alert('Try Premium features clicked!'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-warning)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '4px 0', fontWeight: 600 }}
                  >
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'var(--color-warning)', borderRadius: '2px' }} />
                    Try now: Premium for ₹0
                  </button>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); alert('Settings & Privacy clicked!'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', textAlign: 'left', cursor: 'pointer', padding: '4px 0', transition: 'color 0.2s ease' }}
                  >
                    Settings & Privacy
                  </button>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); alert('Help Center clicked!'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', textAlign: 'left', cursor: 'pointer', padding: '4px 0' }}
                  >
                    Help
                  </button>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); alert('Language selection clicked!'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', textAlign: 'left', cursor: 'pointer', padding: '4px 0' }}
                  >
                    Language
                  </button>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)', margin: '4px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Manage
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <button
                    onClick={() => { setProfileMenuOpen(false); setActiveTab('activity'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', textAlign: 'left', cursor: 'pointer', padding: '4px 0' }}
                  >
                    Posts & Activity
                  </button>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); alert('Job Posting Account clicked!'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', textAlign: 'left', cursor: 'pointer', padding: '4px 0' }}
                  >
                    Job Posting Account
                  </button>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)', margin: '4px 0' }} />

              <button
                onClick={() => { setProfileMenuOpen(false); onSignOut(); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, padding: '4px 0' }}
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
