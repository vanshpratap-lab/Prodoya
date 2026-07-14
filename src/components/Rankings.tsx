import { useState, useEffect } from 'react';
import { Award, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import Avatar from './Avatar';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  score: string;
  streaks: string;
  change: string;
  role: string;
  avatar: string;
}

interface RankingsProps {
  ranks: LeaderboardEntry[];
  currentUserId: string;
  streakDays: number;
}

export default function Rankings({ ranks, currentUserId, streakDays }: RankingsProps) {
  const [loading, setLoading] = useState(true);

  // Local loading skeleton simulation on tab mount
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rank-leaderboard-container">
      {/* Streak Banner */}
      <div
        className="relative overflow-hidden"
        style={{
          marginBottom: '24px',
          padding: '24px',
          background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-elevated))',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-text-strong)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award style={{ color: 'var(--color-warning)' }} size={24} />
            Leaderboard Standings
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-light)' }}>
            {(() => {
              const myIdx = ranks.findIndex(r => r.id === currentUserId);
              if (myIdx < 0) return 'Post your first update to join the leaderboard!';
              if (myIdx === 0) return "You're #1 on the platform! Keep the streak alive.";
              const gap = parseInt(ranks[0].score.replace(/[^\d]/g, ''), 10) - parseInt(ranks[myIdx].score.replace(/[^\d]/g, ''), 10);
              return `Ranked #${myIdx + 1} on the CS Platform. You are only ${gap.toLocaleString()} points away from #1!`;
            })()}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '12px' }}>
          <span style={{ fontSize: '4.5rem', fontFamily: 'var(--font-specialty)', color: 'var(--color-primary)', lineHeight: 0.85 }}>
            {streakDays}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.72rem', color: 'var(--color-text-muted-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span>Days</span>
            <span style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>Streak <Flame size={12} fill="var(--color-primary)" /></span>
          </div>
        </div>
      </div>

      {loading ? (
        /* Skeletons */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} className="leaderboard-row animate-pulse" style={{ height: '70px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '24px', height: '14px', backgroundColor: '#e5e7eb' }} />
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e5e7eb' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ width: '120px', height: '12px', backgroundColor: '#e5e7eb' }} />
                  <div style={{ width: '80px', height: '8px', backgroundColor: '#e5e7eb' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Rankings Table */
        ranks.map(row => {
          const isCurrentUser = row.id === currentUserId;
          const isUp = row.change === 'up';

          return (
            <div 
              className={`leaderboard-row ${isCurrentUser ? 'border-primary relative overflow-hidden' : ''}`} 
              key={row.rank}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: isCurrentUser ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                border: isCurrentUser ? '1.5px solid var(--color-primary)' : '1px solid var(--color-dark-border)',
                boxShadow: isCurrentUser ? '0 0 15px rgba(124, 58, 237, 0.15)' : 'var(--shadow-sm)'
              }}
            >
              {isCurrentUser && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: 'var(--color-primary)'
                  }}
                />
              )}

              <div className="leaderboard-left-info">
                <span className="leaderboard-position" style={{ color: isCurrentUser ? 'var(--color-primary)' : 'var(--color-text-strong)' }}>
                  #{row.rank}
                </span>
                <Avatar name={row.name} avatarUrl={row.avatar} size={48} />
                <div className="leaderboard-user-details">
                  <span className="leaderboard-user-name" style={{ fontWeight: isCurrentUser ? 800 : 700 }}>
                    {row.name} {isCurrentUser && <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600, marginLeft: '6px', padding: '1px 6px', border: '1px solid var(--color-primary)', borderRadius: '10px' }}>You</span>}
                  </span>
                  <span className="leaderboard-user-role">🏫 {row.role}</span>
                </div>
              </div>

              <div className="leaderboard-right-info">
                <span 
                  className={`rank-shift-indicator ${isUp ? 'up' : 'down'}`}
                  style={{
                    backgroundColor: isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: isUp ? '#059669' : '#dc2626',
                    border: `1px solid ${isUp ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {isUp ? (
                    <>
                      <TrendingUp size={12} className="animate-bounce" />
                      Up
                    </>
                  ) : (
                    <>
                      <TrendingDown size={12} />
                      Down
                    </>
                  )}
                </span>
                
                <span
                  className="rank-shift-indicator"
                  style={{
                    backgroundColor: 'var(--color-primary-soft)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  <Flame size={12} fill="var(--color-primary)" />
                  {row.streaks.split(' ')[0]}d
                </span>
                <span className="rank-score" style={{ fontWeight: 'bold' }}>{row.score}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
