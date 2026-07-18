import { useState, useRef } from 'react';
import { Github, Linkedin, Twitter, ShieldCheck, Share2, Check, Briefcase, Star, PenSquare, Layers, ArrowRight, Activity as ActivityIcon, GitBranch, BookOpen, GitFork, FlaskConical, Users, Zap, Camera, Loader2, Pencil } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import Activity from './Activity';
import type { FeedPost } from './PostCard';
import { useEngineeringActivity, useActivityCalendar, updateProfileCover, updateProfileAvatar } from '../lib/hooks';
import EditProfileModal from './EditProfileModal';

interface ProfileViewProps {
  profile: Profile;
  myPosts: FeedPost[];
  followerCount: number;
  onLike: (id: number) => void;
  onRepost: (id: number) => void;
  onCommentAdded: (id: number) => void;
  onDelete: (id: number) => void;
  onShowAllActivity: () => void;
  onCreatePost: () => void;
  onProfileUpdated: () => Promise<void>;
}

export default function ProfileView({
  profile,
  myPosts,
  followerCount,
  onLike,
  onRepost,
  onCommentAdded,
  onDelete,
  onShowAllActivity,
  onCreatePost,
  onProfileUpdated,
}: ProfileViewProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { activity } = useEngineeringActivity(profile.id);
  const { days: activityDays } = useActivityCalendar(profile.id);

  const shareProfileLink = async () => {
    const url = `${window.location.origin}/u/${profile.username ?? profile.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy your public profile link:', url);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const onCoverSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCoverError(null);
    setUploadingCover(true);
    try {
      await updateProfileCover(profile.id, file);
      await onProfileUpdated();
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Failed to upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarError(null);
    setUploadingAvatar(true);
    try {
      await updateProfileAvatar(profile.id, file);
      await onProfileUpdated();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Real GitHub-style contribution grid: 53 weeks x 7 days, built from actual post activity.
  const buildContributionGrid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 370);
    // Align to the most recent Sunday on/before `start` so weeks are Sun→Sat columns.
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

  // Contribution statistics, all computed from the real calendar data.
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

    // Longest chain of consecutive active days.
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px', margin: '0 auto', paddingBottom: '40px' }}>

      {/* Header Profile Card */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Cover banner — real uploaded photo if set, gradient fallback otherwise */}
        <div
          style={{
            height: '128px',
            position: 'relative',
            background: profile.cover_url
              ? `url(${profile.cover_url}) center / cover no-repeat`
              : 'linear-gradient(120deg, #7c3aed, #2563eb, #06b6d4)',
          }}
        >
          <input ref={coverInputRef} type="file" accept="image/*" onChange={onCoverSelected} style={{ display: 'none' }} />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            aria-label={profile.cover_url ? 'Change cover photo' : 'Add cover photo'}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              width: '34px', height: '34px', borderRadius: '50%',
              border: 'none', background: 'rgba(15, 23, 42, 0.55)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploadingCover ? 'default' : 'pointer', backdropFilter: 'blur(4px)',
            }}
          >
            {uploadingCover ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
          </button>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          {coverError && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.78rem', paddingTop: '10px' }}>{coverError}</div>
          )}
          {avatarError && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.78rem', paddingTop: '10px' }}>{avatarError}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-40px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', borderRadius: '50%', border: '4px solid var(--color-surface)', background: 'var(--color-surface)' }}>
              <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size={84} />
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarSelected} style={{ display: 'none' }} />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label={profile.avatar_url ? 'Change profile picture' : 'Add profile picture'}
                style={{
                  position: 'absolute', bottom: '0', right: '0',
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '2px solid var(--color-surface)', background: 'var(--color-primary)', color: 'var(--color-on-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: uploadingAvatar ? 'default' : 'pointer',
                }}
              >
                {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </button>
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
              onClick={() => setEditOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', padding: '8px 16px', borderRadius: '999px', fontWeight: 700, cursor: 'pointer' }}
            >
              <Pencil size={14} />
              Edit profile
            </button>
            <button
              type="button"
              onClick={shareProfileLink}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', backgroundColor: 'var(--color-text-strong)', color: 'var(--color-surface)', border: 'none', padding: '8px 16px', borderRadius: '999px', fontWeight: 700, cursor: 'pointer' }}
            >
              {linkCopied ? <Check size={15} /> : <Share2 size={15} />}
              {linkCopied ? 'Link copied!' : 'Share public profile'}
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

          {/* Quick action row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '18px' }}>
            <button
              type="button"
              onClick={onCreatePost}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', textAlign: 'left', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-dark-border)', background: 'var(--color-surface-elevated)', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>Share posts</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Post your latest proof of work.</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-dark-border)', flexShrink: 0 }}>
                <PenSquare size={13} style={{ color: 'var(--color-primary)' }} />
              </span>
            </button>

            <button
              type="button"
              onClick={onShowAllActivity}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', textAlign: 'left', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-dark-border)', background: 'var(--color-surface-elevated)', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>View activity</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>See everything you've posted.</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-dark-border)', flexShrink: 0 }}>
                <Layers size={13} style={{ color: 'var(--color-primary)' }} />
              </span>
            </button>

            <button
              type="button"
              onClick={shareProfileLink}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', textAlign: 'left', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-dark-border)', background: 'var(--color-surface-elevated)', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>Public link</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Share your verified profile.</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-dark-border)', flexShrink: 0 }}>
                <ArrowRight size={13} style={{ color: 'var(--color-primary)' }} />
              </span>
            </button>
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

      {/* Posts — the user's own proof-of-work, compact cards */}
      <Activity
        variant="compact"
        currentUser={profile}
        myPosts={myPosts}
        followerCount={followerCount}
        onLike={onLike}
        onRepost={onRepost}
        onCommentAdded={onCommentAdded}
        onDelete={onDelete}
        onShowAll={onShowAllActivity}
        onCreatePost={onCreatePost}
      />

      {editOpen && (
        <EditProfileModal profile={profile} onClose={() => setEditOpen(false)} onSaved={onProfileUpdated} />
      )}
    </div>
  );
}
