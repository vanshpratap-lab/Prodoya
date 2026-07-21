import { ArrowLeft, Github, Linkedin, Twitter, ShieldCheck, Briefcase, Star, UserPlus, UserCheck, Activity as ActivityIcon, GitBranch, BookOpen, GitFork, FlaskConical, Users, Zap, Loader2 } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import { useEngineeringActivity, useActivityCalendar, usePeerProfile, usePeerPosts } from '../lib/hooks';
import Activity from './Activity';
import Achievements from './Achievements';
import type { FeedPost } from './PostCard';
import { formatRelativeTime } from '../lib/time';

interface Connection {
  id: string;
  name: string;
  role: string;
  college: string;
  avatar: string;
  connected: boolean;
}

interface PeerProfileViewProps {
  peer: Connection;
  currentUser: Profile;
  onBack: () => void;
  onToggleConnect: (id: string) => void;
}

export default function PeerProfileView({ peer, currentUser, onBack, onToggleConnect }: PeerProfileViewProps) {
  const { profile, connectionCount, loading: profileLoading } = usePeerProfile(peer.id);
  const { activity } = useEngineeringActivity(peer.id);
  const { days: activityDays } = useActivityCalendar(peer.id);
  const { posts, toggleLike, toggleRepost, incrementCommentCount } = usePeerPosts(peer.id, currentUser.id);

  const noop = () => {};

  const myPosts: FeedPost[] = posts.map(p => ({
    id: p.id,
    feedKey: `post-${p.id}`,
    authorId: p.author_id,
    author: p.author?.full_name ?? peer.name,
    avatar: p.author?.avatar_url ?? peer.avatar,
    college: p.author?.college ?? peer.college,
    role: p.author?.role ?? peer.role,
    content: p.content,
    tags: p.tags,
    aiDifficulty: p.ai_difficulty,
    aiPoints: p.ai_points,
    likes: p.like_count,
    hasLiked: p.has_liked,
    reposts: p.repost_count,
    hasReposted: p.has_reposted,
    commentCount: p.comment_count,
    time: formatRelativeTime(p.created_at),
    githubUrl: p.github_url ?? undefined,
    codeSnippet: p.code_snippet ?? undefined,
    images: p.image_urls ?? [],
    videoUrl: p.video_url ?? undefined,
  }));

  // Real GitHub-style contribution grid built from this peer's actual post activity.
  const buildContributionGrid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 370);
    start.setDate(start.getDate() - start.getDay());

    const grid: number[][] = [];
    const cursor = new Date(start);
    for (let w = 0; w < 53; w++) {
      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        // Local date key — toISOString() is UTC and shifts the whole grid a day for IST users.
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
        const count = activityDays.get(key) ?? 0;
        const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4;
        week.push(level);
        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(week);
    }
    return grid;
  };

  const contributionGrid = buildContributionGrid();
  const totalContributions = [...activityDays.values()].reduce((sum, n) => sum + n, 0);

  // Contribution statistics, all computed from the real calendar data (same as own profile).
  const contributionStats = (() => {
    let bestDay = { date: '', count: 0 };
    const monthTotals = new Map<string, number>();
    activityDays.forEach((count, date) => {
      if (count > bestDay.count) bestDay = { date, count };
      const month = date.slice(0, 7);
      monthTotals.set(month, (monthTotals.get(month) ?? 0) + count);
    });
    let bestMonth = { month: '', count: 0 };
    monthTotals.forEach((count, month) => {
      if (count > bestMonth.count) bestMonth = { month, count };
    });

    const activeDates = [...activityDays.entries()]
      .filter(([, c]) => c > 0)
      .map(([d]) => d)
      .sort();
    let longestChain = 0;
    let run = 0;
    let prev: Date | null = null;
    activeDates.forEach(dateStr => {
      const d = new Date(dateStr + 'T00:00:00');
      run = prev && d.getTime() - prev.getTime() === 86400000 ? run + 1 : 1;
      longestChain = Math.max(longestChain, run);
      prev = d;
    });

    const fmtDay = bestDay.date
      ? new Date(bestDay.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : '—';
    const fmtMonth = bestMonth.month
      ? new Date(bestMonth.month + '-01T00:00:00').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      : '—';
    return { bestDay, bestMonth, longestChain, fmtDay, fmtMonth };
  })();

  const getCellColor = (level: number) => {
    switch (level) {
      case 0: return '#ebedf0';
      case 1: return '#9be9a8';
      case 2: return '#40c463';
      case 3: return '#30a14e';
      case 4: return '#216e39';
      default: return '#ebedf0';
    }
  };

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  if (profileLoading || !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={26} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px', margin: '0 auto', paddingBottom: '40px', animation: 'fadeIn 0.3s ease' }}>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 0', alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={16} />
        Back to Connections
      </button>

      {/* Header Profile Card — same design as your own profile */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{
          height: '128px',
          background: profile.cover_url
            ? `url(${profile.cover_url}) center / cover no-repeat`
            : 'linear-gradient(120deg, #7c3aed, #2563eb, #06b6d4)',
        }} />

        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-40px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ borderRadius: '50%', border: '4px solid var(--color-surface)', background: 'var(--color-surface)' }}>
              <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size={84} />
            </div>

            {profile.tech_stack && profile.tech_stack.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={12} />
                  Skills
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {profile.tech_stack.slice(0, 6).map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)',
                        backgroundColor: 'var(--color-primary-soft)', border: '1px solid rgba(124, 58, 237, 0.2)',
                        padding: '4px 12px', borderRadius: '999px',
                      }}
                    >
                      {tech.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: 'var(--color-text-strong)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {profile.full_name}
                <ShieldCheck size={18} style={{ color: '#2563eb' }} />
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500, margin: 0 }}>
                {profile.role}
              </p>
              {profile.college && (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-light)', margin: 0 }}>
                  {profile.college}
                </p>
              )}
              {profile.bio && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)', marginTop: '4px' }}>
                  {profile.bio}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={12} />
                Current role
              </span>
              <span style={{
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-strong)',
                backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-dark-border)',
                padding: '5px 14px', borderRadius: '999px',
              }}>
                {profile.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
            <button
              type="button"
              onClick={() => onToggleConnect(peer.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700,
                backgroundColor: peer.connected ? 'var(--color-surface-elevated)' : 'var(--color-text-strong)',
                color: peer.connected ? 'var(--color-text-strong)' : 'var(--color-surface)',
                border: peer.connected ? '1px solid var(--color-dark-border)' : 'none',
                padding: '8px 16px', borderRadius: '999px', cursor: 'pointer',
              }}
            >
              {peer.connected ? <UserCheck size={15} /> : <UserPlus size={15} />}
              {peer.connected ? 'Connected' : 'Connect'}
            </button>
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-light)', border: '1px solid var(--color-dark-border)', padding: '8px 16px', borderRadius: '999px' }}
              >
                <Github size={15} />
                GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'rgba(37, 99, 235, 0.10)', border: '1px solid rgba(37, 99, 235, 0.30)', color: '#1d4ed8', padding: '8px 16px', borderRadius: '999px' }}
              >
                <Linkedin size={15} />
                LinkedIn
              </a>
            )}
            {profile.twitter_url && (
              <a
                href={profile.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-light)', border: '1px solid var(--color-dark-border)', padding: '8px 16px', borderRadius: '999px' }}
              >
                <Twitter size={14} />
                Twitter/X
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contribution calendar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600 }}>
          {totalContributions} contribution{totalContributions === 1 ? '' : 's'} in the last year
        </h3>

        {/* Contribution statistics — real values from the calendar */}
        {totalContributions > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {[
              { label: 'Best day', value: `${contributionStats.bestDay.count}`, sub: contributionStats.fmtDay },
              { label: 'Best month', value: `${contributionStats.bestMonth.count}`, sub: contributionStats.fmtMonth },
              { label: 'Longest chain', value: `${contributionStats.longestChain}`, sub: `day${contributionStats.longestChain === 1 ? '' : 's'} in a row` },
              { label: 'Daily average', value: (totalContributions / 365).toFixed(2), sub: 'per day this year' },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-dark-border)',
                }}
              >
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {stat.label}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-strong)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-muted-light)' }}>{stat.sub}</span>
              </div>
            ))}
          </div>
        )}

        <div className="contribution-scroll" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '780px' }}>
            <div style={{ display: 'flex', paddingLeft: '32px', marginBottom: '4px' }}>
              {months.map((m, idx) => (
                <div key={idx} style={{ flexGrow: 1, fontSize: '0.7rem', color: 'var(--color-text-muted-light)' }}>
                  {m}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted-light)', height: '85px', paddingTop: '2px' }}>
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div style={{ display: 'flex', gap: '3px', flexGrow: 1 }}>
                {contributionGrid.map((week, wIdx) => (
                  <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {week.map((level, dIdx) => (
                      <div
                        key={dIdx}
                        style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: getCellColor(level),
                          borderRadius: '2px',
                          transition: 'background-color 0.2s ease'
                        }}
                        title={`Level ${level} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '32px', fontSize: '0.72rem', color: 'var(--color-text-muted-light)', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Less</span>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#ebedf0', borderRadius: '2px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: '#9be9a8', borderRadius: '2px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: '#40c463', borderRadius: '2px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: '#30a14e', borderRadius: '2px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: '#216e39', borderRadius: '2px' }} />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Activity — real, GitHub-contribution-style metrics */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ActivityIcon size={18} style={{ color: 'var(--color-primary)' }} />
          Engineering Activity
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
          {[
            { icon: ActivityIcon, label: 'Active Days', value: activity.active_days, color: '#f97316' },
            { icon: GitBranch, label: 'Projects Built', value: activity.projects_built, color: 'var(--color-primary)' },
            { icon: BookOpen, label: 'Learning Sessions', value: activity.learning_sessions, color: '#3b82f6' },
            { icon: GitFork, label: 'Open Source', value: activity.open_source_contributions, color: '#10b981' },
            { icon: FlaskConical, label: 'Research Activity', value: activity.research_activity, color: '#ec4899' },
            { icon: Users, label: 'Community', value: activity.community_contributions, color: '#8b5cf6' },
            { icon: Star, label: 'Reputation', value: activity.reputation_score, color: '#eab308' },
            { icon: Zap, label: 'AI Impact', value: activity.ai_impact_score, color: '#06b6d4' },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '12px', backgroundColor: 'var(--color-surface-elevated)', borderRadius: '12px', border: '1px solid var(--color-dark-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <stat.icon size={16} style={{ color: stat.color }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-strong)' }}>{stat.value.toLocaleString()}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements — unlocked purely by this peer's real activity thresholds */}
      <Achievements activity={activity} postCount={myPosts.filter(p => !p.repostedBy).length} followerCount={connectionCount} />

      {/* Posts — this peer's real proof-of-work, compact cards */}
      <Activity
        variant="compact"
        currentUser={currentUser}
        myPosts={myPosts}
        followerCount={connectionCount}
        onLike={toggleLike}
        onRepost={toggleRepost}
        onCommentAdded={incrementCommentCount}
        onDelete={noop}
      />
    </div>
  );
}
