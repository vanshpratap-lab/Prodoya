import {
  Rocket, Layers, Flame, GitFork, Users, CalendarCheck, Zap, FlaskConical,
  Star, UserPlus, type LucideIcon,
} from 'lucide-react';
import type { EngineeringActivity } from '../lib/supabase';

interface AchievementsProps {
  activity: EngineeringActivity;
  postCount: number;
  followerCount: number;
}

interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  value: number;
  threshold: number;
}

// Every threshold reads directly off get_engineering_activity() / real counts —
// no achievement here can be unlocked without a matching row in the database.
function buildAchievements({ activity, postCount, followerCount }: AchievementsProps): Achievement[] {
  const totalContributions = postCount + activity.community_contributions;
  return [
    {
      id: 'first-project',
      label: 'First Project',
      description: 'Share a post with a repo link or an image — your first proof of work.',
      icon: Rocket,
      color: '#059669',
      value: activity.projects_built,
      threshold: 1,
    },
    {
      id: 'builder',
      label: 'Builder',
      description: 'Ship 5 projects to the feed.',
      icon: Layers,
      color: '#059669',
      value: activity.projects_built,
      threshold: 5,
    },
    {
      id: 'daily-learner',
      label: 'Daily Learner',
      description: 'Post real activity on 7 different days.',
      icon: Flame,
      color: '#f97316',
      value: activity.active_days,
      threshold: 7,
    },
    {
      id: 'open-source',
      label: 'Open Source Contributor',
      description: 'Link a GitHub repo to one of your posts.',
      icon: GitFork,
      color: '#2563eb',
      value: activity.open_source_contributions,
      threshold: 1,
    },
    {
      id: 'community-voice',
      label: 'Community Voice',
      description: 'Comment on or repost 10 posts from other engineers.',
      icon: Users,
      color: '#8b5cf6',
      value: activity.community_contributions,
      threshold: 10,
    },
    {
      id: 'century',
      label: '100 Contributions',
      description: '100 combined posts, comments, and reposts.',
      icon: CalendarCheck,
      color: '#dc2626',
      value: totalContributions,
      threshold: 100,
    },
    {
      id: 'ai-explorer',
      label: 'AI Explorer',
      description: 'Earn 100+ AI-assessed points across your posts.',
      icon: Zap,
      color: '#06b6d4',
      value: activity.ai_impact_score,
      threshold: 100,
    },
    {
      id: 'research',
      label: 'Research & Hackathons',
      description: 'Tag a post #research or #hackathon.',
      icon: FlaskConical,
      color: '#ec4899',
      value: activity.research_activity,
      threshold: 1,
    },
    {
      id: 'reputation',
      label: 'Rising Engineer',
      description: 'Reach 100 reputation points.',
      icon: Star,
      color: '#eab308',
      value: activity.reputation_score,
      threshold: 100,
    },
    {
      id: 'connected',
      label: 'Connected',
      description: 'Build a network of 5 peer connections.',
      icon: UserPlus,
      color: '#0891b2',
      value: followerCount,
      threshold: 5,
    },
  ];
}

interface AchievementsPanelProps extends AchievementsProps {
  compact?: boolean;
}

export default function Achievements({ activity, postCount, followerCount, compact }: AchievementsPanelProps) {
  const achievements = buildAchievements({ activity, postCount, followerCount });
  const unlocked = achievements.filter(a => a.value >= a.threshold);
  const locked = achievements.filter(a => a.value < a.threshold);
  const ordered = [...unlocked, ...locked];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-dark-border)',
        borderRadius: '20px',
        padding: compact ? '18px' : '24px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
        <h3 style={{ fontSize: compact ? '0.95rem' : '1.05rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={compact ? 16 : 18} style={{ color: '#eab308' }} />
          Achievements
        </h3>
        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-text-muted-light)', fontVariantNumeric: 'tabular-nums' }}>
          {unlocked.length} / {achievements.length}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(auto-fill, minmax(84px, 1fr))' : 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: compact ? '10px' : '12px',
        }}
      >
        {ordered.map(a => {
          const Icon = a.icon;
          const isUnlocked = a.value >= a.threshold;
          const progress = Math.min(1, a.value / a.threshold);
          return (
            <div
              key={a.id}
              title={`${a.description} (${Math.min(a.value, a.threshold)}/${a.threshold})`}
              style={{
                display: 'flex',
                flexDirection: compact ? 'column' : 'row',
                alignItems: compact ? 'center' : 'flex-start',
                textAlign: compact ? 'center' : 'left',
                gap: compact ? '6px' : '10px',
                padding: compact ? '10px 6px' : '12px',
                borderRadius: '14px',
                border: `1px solid ${isUnlocked ? a.color + '40' : 'var(--color-dark-border)'}`,
                background: isUnlocked ? a.color + '14' : 'var(--color-surface-elevated)',
                opacity: isUnlocked ? 1 : 0.65,
                transition: 'transform 0.15s ease, opacity 0.15s ease',
              }}
            >
              <div
                style={{
                  width: compact ? '32px' : '38px',
                  height: compact ? '32px' : '38px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isUnlocked ? a.color : 'var(--color-dark-border)',
                  color: isUnlocked ? '#fff' : 'var(--color-text-muted-light)',
                }}
              >
                <Icon size={compact ? 15 : 18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, width: '100%' }}>
                <span
                  style={{
                    fontSize: compact ? '0.68rem' : '0.82rem',
                    fontWeight: 700,
                    color: isUnlocked ? 'var(--color-text-strong)' : 'var(--color-text-muted-light)',
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {a.label}
                </span>
                {!compact && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)', lineHeight: 1.4 }}>
                    {a.description}
                  </span>
                )}
                {!isUnlocked && (
                  <div style={{ height: '4px', borderRadius: '999px', background: 'var(--color-dark-border)', overflow: 'hidden', marginTop: '2px' }}>
                    <div style={{ height: '100%', width: `${progress * 100}%`, borderRadius: '999px', background: a.color }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
