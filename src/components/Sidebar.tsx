import { CheckCircle2, Star } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import { useEngineeringActivity } from '../lib/hooks';

interface SidebarProps {
  profileStats: {
    connections: number;
    rank: number;
    points: number;
  };
  sidebarOpen: boolean;
  profile: Profile;
  setActiveTab?: (tab: 'home' | 'network' | 'rank' | 'messages' | 'profile' | 'activity' | 'notifications' | 'ai') => void;
}

export default function Sidebar({ 
  profileStats, 
  sidebarOpen, 
  profile,
  setActiveTab,
}: SidebarProps) {
  const { activity } = useEngineeringActivity(profile.id);

  return (
    <aside className={`sidebar-container ${sidebarOpen ? '' : 'collapsed'}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-dark-border)',
      padding: '24px 16px',
      width: '280px',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Redesigned Profile Card Widget matching Image 2 */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-dark-border)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 8px 20px -6px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--transition)'
      }}>
        {/* Cover Photo Area with Bookmark overlay */}
        <div style={{ position: 'relative', width: '100%', height: '90px' }}>
          <img 
            src="/mountain_cover.jpg" 
            alt="Cover background" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />


          {/* Avatar Overlay overlapping the bottom */}
          <div style={{
            position: 'absolute',
            bottom: '-22px',
            left: '16px',
            borderRadius: '50%',
            border: '3px solid #ffffff',
            boxShadow: 'var(--shadow-sm)',
            display: 'inline-block'
          }}>
            <Avatar
              name={profile.full_name}
              avatarUrl={profile.avatar_url}
              size={54}
            />
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '30px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <h2 className="profile-name" style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-strong)' }}>
                  {profile.full_name}
                </h2>
                <CheckCircle2 size={13} style={{ color: '#2563eb', fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted-light)', marginTop: '2px' }}>
                {profile.role || 'Engineering Student'}
              </span>
            </div>
            
            {/* Small Tools badge matching mockup */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f1f3f5',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#495057'
            }}>
              <span style={{ fontSize: '0.7rem' }}>⭐</span>
              <span>Pro</span>
            </div>
          </div>

          {/* 3-Column stats row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--color-dark-border)',
            paddingTop: '12px',
            marginTop: '4px'
          }}>
            {/* Column 1: Rating */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Star size={11} style={{ fill: '#e9c46a', stroke: '#e9c46a' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>4.9</span>
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted-light)', textTransform: 'lowercase', marginTop: '2px' }}>rating</span>
            </div>

            <div style={{ width: '1px', height: '18px', background: 'var(--color-dark-border)' }} />

            {/* Column 2: Duration / Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                {activity.projects_built}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted-light)', textTransform: 'lowercase', marginTop: '2px' }}>posts</span>
            </div>

            <div style={{ width: '1px', height: '18px', background: 'var(--color-dark-border)' }} />

            {/* Column 3: Rate / Points */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                {Math.round(profileStats.points / 10)}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted-light)', textTransform: 'lowercase', marginTop: '2px' }}>following</span>
            </div>
          </div>

          {/* Solid Black "View profile" CTA Button */}
          <button 
            type="button"
            onClick={() => setActiveTab?.('profile')}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '9px 0',
              width: '100%',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              textAlign: 'center'
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            View profile
          </button>
        </div>
      </div>
    </aside>
  );
}

