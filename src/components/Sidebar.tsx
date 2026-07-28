import { Activity, Bot, CheckCircle2, Rocket, Trophy, Users, Zap } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import { useEngineeringActivity, useActivityCalendar } from '../lib/hooks';

const LEVEL_STEP = 100; // reputation points per level

/** Local YYYY-MM-DD key matching get_activity_calendar's date format. */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
  const { days: calendar } = useActivityCalendar(profile.id);

  // 12-week mini heatmap, columns aligned to weeks (Sunday-start, like GitHub).
  const today = new Date();
  const rawStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 83);
  const start = new Date(rawStart.getFullYear(), rawStart.getMonth(), rawStart.getDate() - rawStart.getDay());
  const totalDays = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
  const weekCount = Math.ceil(totalDays / 7);
  const heatWeeks: Array<Array<number | null>> = [];
  for (let w = 0; w < weekCount; w++) {
    const col: Array<number | null> = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
      col.push(cell > today ? null : (calendar.get(dateKey(cell)) ?? 0));
    }
    heatWeeks.push(col);
  }
  const heatColor = (count: number | null): string => {
    if (count === null) return 'transparent';
    if (count === 0) return 'var(--color-surface-elevated)';
    if (count === 1) return 'rgba(124, 58, 237, 0.35)';
    if (count === 2) return 'rgba(124, 58, 237, 0.6)';
    return 'var(--color-primary)';
  };

  const level = Math.floor(profileStats.points / LEVEL_STEP) + 1;
  const levelProgress = (profileStats.points % LEVEL_STEP) / LEVEL_STEP;

  const quickStats = [
    { label: 'Projects', value: activity.projects_built, icon: Rocket, color: '#059669' },
    { label: 'Community', value: activity.community_contributions, icon: Users, color: '#dc2626' },
    { label: 'AI impact', value: activity.ai_impact_score, icon: Bot, color: '#0891b2' },
    { label: 'Active days', value: activity.active_days, icon: Activity, color: '#2563eb' },
  ];

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
        minHeight: 'fit-content',
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
         <div style={{ padding: '30px 16px 32px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            {/* Column 1: Global rank (real) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Trophy size={11} style={{ color: '#e9c46a' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>#{profileStats.rank}</span>
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted-light)', textTransform: 'lowercase', marginTop: '2px' }}>rank</span>
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

            {/* Column 3: Connections (real) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                {profileStats.connections}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted-light)', textTransform: 'lowercase', marginTop: '2px' }}>peers</span>
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

      {/* ── Engineering Activity panel — GitHub-contribution-panel feel, all real data ── */}
      <div
        className="anim-rise"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '24px',
          padding: '16px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 8px 20px -6px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'var(--color-text-muted-light)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Zap size={12} style={{ color: 'var(--color-primary)' }} />
          Engineering Activity
        </span>

        {/* Mini contribution heatmap — last 12 weeks */}
        <div style={{ display: 'flex', gap: '3px', justifyContent: 'space-between' }}>
          {heatWeeks.map((week, w) => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
              {week.map((count, d) => (
                <div
                  key={d}
                  title={count === null ? '' : `${count} contribution${count === 1 ? '' : 's'}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '2.5px',
                    background: heatColor(count),
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Level + progress to next level (derived from real reputation points) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-strong)' }}>Level {level}</span>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--color-text-muted-light)', fontVariantNumeric: 'tabular-nums' }}>
              {profileStats.points % LEVEL_STEP} / {LEVEL_STEP} pts
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '999px', background: 'var(--color-surface-elevated)', overflow: 'hidden' }}>
            <div
              className="anim-grow-x"
              style={{
                height: '100%',
                width: `${Math.max(levelProgress * 100, 3)}%`,
                borderRadius: '999px',
                background: 'linear-gradient(90deg, var(--color-primary), #2563eb)',
              }}
            />
          </div>
        </div>

        {/* Quick stats 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {quickStats.map(stat => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '12px',
                  background: 'var(--color-surface-elevated)',
                }}
              >
                <Icon size={13} style={{ color: stat.color, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-strong)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                    {stat.value}
                  </span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap' }}>
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

