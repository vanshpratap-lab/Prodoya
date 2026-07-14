import { Github } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';

interface SidebarProps {
  profileStats: {
    connections: number;
    streaks: number;
    rank: number;
    points: number;
  };
  sidebarOpen: boolean;
  profile: Profile;
}

export default function Sidebar({ profileStats, sidebarOpen, profile }: SidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <aside className="sidebar-container">
      {/* Profile Card Widget */}
      <div className="profile-card-widget">
        <div className="profile-avatar-wrapper">
          <Avatar
            name={profile.full_name}
            avatarUrl={profile.avatar_url}
            size={76}
          />
        </div>
        <h2 className="profile-name">{profile.full_name}</h2>
        <p className="profile-role">{profile.role}</p>
        {profile.college && (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted-light)', marginBottom: '8px' }}>
            🏫 {profile.college}
          </div>
        )}

        {/* Large Italianno Streak Display */}
        <div className="streak-hero-display" style={{ margin: '14px 0 10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="streak-text" style={{ fontSize: '3.5rem', fontFamily: 'var(--font-specialty)', color: 'var(--color-primary)', lineHeight: 0.9 }}>
            {profileStats.streaks}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            Days Streak <span style={{ filter: 'none' }}>🔥</span>
          </span>
          <div style={{
            marginTop: '8px',
            fontSize: '0.68rem',
            color: 'var(--color-warning)',
            border: '1px dashed rgba(251, 191, 36, 0.3)',
            backgroundColor: 'rgba(251, 191, 36, 0.08)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ⚠️ Streak at risk! Post today
          </div>
        </div>
        
        <div className="profile-stats-row">
          <div className="profile-stat-item">
            <span className="profile-stat-value">{profileStats.connections}</span>
            <span className="profile-stat-label">Peers</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-value">#{profileStats.rank}</span>
            <span className="profile-stat-label">Rank</span>
          </div>
        </div>
      </div>

      {/* Proof of Work Score Widget */}
      <div
        className="options-list-widget relative overflow-hidden"
        style={{
          border: '1px solid var(--color-dark-border)'
        }}
      >
        <div className="options-widget-title">Proof-of-work Score</div>
        
        <div className="options-widget-item" style={{ marginBottom: '16px' }}>
          <div className="options-item-header">
            <span>Learning Points</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{profileStats.points.toLocaleString()} pts</span>
          </div>
          
          {/* Animated technology progress bar (fills on mount) */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: '65%', 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-primary), #a78bfa)',
                borderRadius: '3px',
                animation: 'fillProgress 1s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            />
          </div>
        </div>

        <div className="options-widget-item">
          <div className="options-item-header">
            <span>Core Technology Stack</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', fontSize: '0.78rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>React / Frontend</span>
                <span style={{ color: 'var(--color-primary)' }}>85%</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>NumPy / AI Inference</span>
                <span style={{ color: 'var(--color-primary)' }}>60%</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="button" 
          className="sync-button" 
          style={{ marginTop: '16px', gap: '8px' }} 
          onClick={() => alert('Synced with GitHub repository and updated learning streaks!')}
        >
          <Github size={14} />
          Sync GitHub Repos
        </button>
      </div>
    </aside>
  );
}
