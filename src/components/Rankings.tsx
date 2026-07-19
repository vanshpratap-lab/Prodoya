import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  Bot,
  GitFork,
  GraduationCap,
  Medal,
  Rocket,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import { useActivityCalendar, type LeaderboardRow } from '../lib/hooks';

interface RankingsProps {
  rows: LeaderboardRow[];
  loading: boolean;
  currentUser: Profile;
}

/** Animated counter — snaps instantly when the user prefers reduced motion. */
function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || target === 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Guarantee convergence even when rAF is throttled (hidden/background tabs).
    const settle = setTimeout(() => setValue(target), durationMs + 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [target, durationMs]);
  return value;
}

// Weights mirror get_engineering_rankings() exactly — the breakdown must add up
// to the score people actually see, not a prettier story.
const SCORE_WEIGHTS = [
  { key: 'reputation', label: 'Reputation', icon: Award, weight: 1.0, color: '#7c3aed' },
  { key: 'active_days', label: 'Active days', icon: Activity, weight: 5.0, color: '#2563eb' },
  { key: 'projects_built', label: 'Projects built', icon: Rocket, weight: 8.0, color: '#059669' },
  { key: 'open_source_contributions', label: 'Open source', icon: GitFork, weight: 6.0, color: '#d97706' },
  { key: 'community_contributions', label: 'Community', icon: Users, weight: 3.0, color: '#dc2626' },
  { key: 'ai_impact_score', label: 'AI impact', icon: Bot, weight: 0.5, color: '#0891b2' },
] as const;

function StatCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="anim-rise"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-dark-border)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ icon: Icon, children }: { icon: typeof Award; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: '0.7rem',
        fontWeight: 800,
        color: 'var(--color-text-muted-light)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <Icon size={13} style={{ color: 'var(--color-primary)' }} />
      {children}
    </span>
  );
}

export default function Rankings({ rows, loading, currentUser }: RankingsProps) {
  const { days: calendar } = useActivityCalendar(currentUser.id);

  const myIndex = rows.findIndex(r => r.id === currentUser.id);
  const myRow = myIndex >= 0 ? rows[myIndex] : null;
  const topScore = rows.length > 0 ? rows[0].rank_score : 0;

  // Rank among engineers from the same college (rows are already score-sorted).
  const collegePeers = useMemo(
    () => (currentUser.college ? rows.filter(r => r.college === currentUser.college) : []),
    [rows, currentUser.college],
  );
  const collegeRank = collegePeers.findIndex(r => r.id === currentUser.id) + 1;

  // Real 14-day momentum from the contribution calendar.
  const momentum = useMemo(() => {
    const daily: number[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      daily.push(calendar.get(key) ?? 0);
    }
    const prevWeek = daily.slice(0, 7).reduce((a, b) => a + b, 0);
    const thisWeek = daily.slice(7).reduce((a, b) => a + b, 0);
    return { daily, prevWeek, thisWeek, max: Math.max(...daily, 1) };
  }, [calendar]);

  // Rank-score distribution across the platform, bucketed for the histogram.
  const distribution = useMemo(() => {
    if (rows.length === 0) return { buckets: [] as number[], myBucket: -1, max: 1, bucketSize: 0 };
    const bucketCount = 6;
    const max = Math.max(topScore, 1);
    const bucketSize = max / bucketCount;
    const buckets = new Array(bucketCount).fill(0);
    rows.forEach(r => {
      const idx = Math.min(bucketCount - 1, Math.floor(r.rank_score / bucketSize));
      buckets[idx] += 1;
    });
    const myBucket = myRow ? Math.min(bucketCount - 1, Math.floor(myRow.rank_score / bucketSize)) : -1;
    return { buckets, myBucket, max: Math.max(...buckets, 1), bucketSize };
  }, [rows, topScore, myRow]);

  const breakdown = useMemo(() => {
    if (!myRow) return [];
    const raw = {
      reputation: myRow.points,
      active_days: myRow.active_days,
      projects_built: myRow.projects_built,
      open_source_contributions: myRow.open_source_contributions,
      community_contributions: myRow.community_contributions,
      ai_impact_score: myRow.ai_impact_score,
    };
    const parts = SCORE_WEIGHTS.map(w => ({
      ...w,
      raw: raw[w.key],
      contribution: raw[w.key] * w.weight,
    }));
    const maxContribution = Math.max(...parts.map(p => p.contribution), 1);
    return parts.map(p => ({ ...p, share: p.contribution / maxContribution }));
  }, [myRow]);

  const animatedScore = useCountUp(myRow ? Math.round(myRow.rank_score) : 0);
  const animatedPoints = useCountUp(myRow ? myRow.points : 0);

  const weekDelta = momentum.thisWeek - momentum.prevWeek;
  const pctOfTop = topScore > 0 && myRow ? Math.min(1, myRow.rank_score / topScore) : 0;

  if (loading) {
    return (
      <div className="rank-leaderboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="skeleton-shimmer" style={{ height: '120px', borderRadius: '20px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
          {[0, 1, 2].map(n => (
            <div key={n} className="skeleton-shimmer" style={{ height: '110px', borderRadius: '20px' }} />
          ))}
        </div>
        <div className="skeleton-shimmer" style={{ height: '260px', borderRadius: '20px' }} />
      </div>
    );
  }

  return (
    <div className="rank-leaderboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── Header ── */}
      <div className="anim-rise" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-text-strong)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={22} style={{ color: 'var(--color-warning)' }} />
          Rank
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-light)', margin: 0 }}>
          Your engineering performance, computed live from real proof-of-work — posts, projects, open source, and community activity.
        </p>
      </div>

      {!myRow ? (
        <div
          className="anim-rise"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '56px 20px',
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-soft)' }}>
            <Rocket size={28} style={{ color: 'var(--color-primary)' }} />
          </div>
          <span style={{ fontWeight: 800, color: 'var(--color-text-strong)' }}>You're not ranked yet</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-light)', maxWidth: '360px', textAlign: 'center', lineHeight: 1.5 }}>
            Share your first proof-of-work post and your engineering score starts building immediately.
          </span>
        </div>
      ) : (
        <>
          {/* ── Hero stat cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
            <StatCard delay={0}>
              <CardLabel icon={Trophy}>Global rank</CardLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-text-strong)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  #{myIndex + 1}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>of {rows.length}</span>
              </div>
              {/* Progress toward #1 — honest ring, not a vanity meter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-dark-border)" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${pctOfTop * 97.4} 97.4`}
                    transform="rotate(-90 18 18)"
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />
                </svg>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>
                  {Math.round(pctOfTop * 100)}% of #1's score
                </span>
              </div>
            </StatCard>

            {currentUser.college && collegeRank > 0 && (
              <StatCard delay={60}>
                <CardLabel icon={GraduationCap}>College rank</CardLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-text-strong)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    #{collegeRank}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>of {collegePeers.length}</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted-light)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.college}
                </span>
              </StatCard>
            )}

            <StatCard delay={120}>
              <CardLabel icon={BarChart3}>Engineering score</CardLabel>
              <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {animatedScore.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>
                {animatedPoints.toLocaleString()} reputation points
              </span>
            </StatCard>

            <StatCard delay={180}>
              <CardLabel icon={TrendingUp}>This week</CardLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-text-strong)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {momentum.thisWeek}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>contributions</span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: weekDelta > 0 ? '#059669' : weekDelta < 0 ? '#dc2626' : 'var(--color-text-muted-light)',
                }}
              >
                {weekDelta > 0 ? <TrendingUp size={13} /> : weekDelta < 0 ? <TrendingDown size={13} /> : <Activity size={13} />}
                {weekDelta === 0 ? 'Same as last week' : `${weekDelta > 0 ? '+' : ''}${weekDelta} vs last week`}
              </span>
            </StatCard>
          </div>

          {/* ── Score breakdown + momentum ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <StatCard delay={240}>
              <CardLabel icon={BarChart3}>Score breakdown</CardLabel>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted-light)', marginTop: '-4px' }}>
                How your {Math.round(myRow.rank_score).toLocaleString()}-point score is actually composed.
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                {breakdown.map(part => {
                  const Icon = part.icon;
                  return (
                    <div key={part.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-strong)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Icon size={13} style={{ color: part.color }} />
                          {part.label}
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-muted-light)', fontVariantNumeric: 'tabular-nums' }}>
                          {part.raw.toLocaleString()} · +{Math.round(part.contribution).toLocaleString()} pts
                        </span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '999px', background: 'var(--color-surface-elevated)', overflow: 'hidden' }}>
                        <div
                          className="anim-grow-x"
                          style={{
                            height: '100%',
                            width: `${Math.max(part.share * 100, part.raw > 0 ? 4 : 0)}%`,
                            borderRadius: '999px',
                            background: part.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </StatCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 14-day momentum sparkline */}
              <StatCard delay={300}>
                <CardLabel icon={Activity}>14-day momentum</CardLabel>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '72px', marginTop: '6px' }}>
                  {momentum.daily.map((count, i) => (
                    <div
                      key={i}
                      title={`${count} contribution${count === 1 ? '' : 's'}`}
                      className="anim-grow-y"
                      style={{
                        flex: 1,
                        height: `${Math.max((count / momentum.max) * 100, 6)}%`,
                        borderRadius: '4px 4px 2px 2px',
                        background: i >= 7 ? 'var(--color-primary)' : 'var(--color-dark-border)',
                        opacity: count === 0 ? 0.45 : 1,
                        animationDelay: `${i * 30}ms`,
                        transformOrigin: 'bottom',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>
                  <span>Last week · {momentum.prevWeek}</span>
                  <span style={{ color: 'var(--color-primary)' }}>This week · {momentum.thisWeek}</span>
                </div>
              </StatCard>

              {/* Rank distribution histogram */}
              <StatCard delay={360}>
                <CardLabel icon={Users}>Rank distribution</CardLabel>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '64px', marginTop: '6px' }}>
                  {distribution.buckets.map((count, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', height: '100%', justifyContent: 'flex-end' }}>
                      <div
                        title={`${count} engineer${count === 1 ? '' : 's'}`}
                        className="anim-grow-y"
                        style={{
                          width: '100%',
                          height: `${Math.max((count / distribution.max) * 100, count > 0 ? 10 : 4)}%`,
                          borderRadius: '4px 4px 2px 2px',
                          background: i === distribution.myBucket ? 'var(--color-primary)' : 'var(--color-dark-border)',
                          opacity: count === 0 ? 0.4 : 1,
                          animationDelay: `${i * 40}ms`,
                          transformOrigin: 'bottom',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>
                  Score range 0 – {Math.round(topScore).toLocaleString()} · <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>■ your bracket</span>
                </span>
              </StatCard>
            </div>
          </div>
        </>
      )}

      {/* ── Peer comparison ── */}
      <div className="anim-rise" style={{ display: 'flex', flexDirection: 'column', gap: '10px', animationDelay: '420ms' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '4px' }}>
          Compare with peers
        </span>

        {rows.map((row, idx) => {
          const isCurrentUser = row.id === currentUser.id;
          const medalColor = idx === 0 ? '#d97706' : idx === 1 ? '#6b7280' : idx === 2 ? '#b45309' : null;
          return (
            <div
              className="leaderboard-row"
              key={row.id}
              style={{
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: isCurrentUser ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                border: isCurrentUser ? '1.5px solid var(--color-primary)' : '1px solid var(--color-dark-border)',
                boxShadow: isCurrentUser ? '0 0 15px rgba(124, 58, 237, 0.15)' : 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isCurrentUser && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--color-primary)' }} />
              )}

              <div className="leaderboard-left-info">
                <span
                  className="leaderboard-position"
                  style={{
                    color: isCurrentUser ? 'var(--color-primary)' : 'var(--color-text-strong)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {medalColor && <Medal size={15} style={{ color: medalColor }} />}
                  #{idx + 1}
                </span>
                <Avatar name={row.full_name} avatarUrl={row.avatar_url} size={48} />
                <div className="leaderboard-user-details">
                  <span className="leaderboard-user-name" style={{ fontWeight: isCurrentUser ? 800 : 700 }}>
                    {row.full_name}
                    {isCurrentUser && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600, marginLeft: '6px', padding: '1px 6px', border: '1px solid var(--color-primary)', borderRadius: '10px' }}>
                        You
                      </span>
                    )}
                  </span>
                  <span className="leaderboard-user-role">
                    {row.college ? `${row.role} — ${row.college}` : row.role}
                  </span>
                </div>
              </div>

              <div className="leaderboard-right-info">
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
                    fontWeight: 700,
                  }}
                >
                  <Activity size={12} />
                  {row.active_days}d
                </span>
                <span className="rank-score" style={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round(row.rank_score).toLocaleString()} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
