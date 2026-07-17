import { useState } from 'react';
import { Github, Linkedin, Twitter, Award, ShieldCheck, Lock, Code, Cpu, Layers, GitPullRequest, Share2, Check, Activity as ActivityIcon, GitBranch, BookOpen, GitFork, FlaskConical, Users, Star, Zap } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import Activity from './Activity';
import type { FeedPost } from './PostCard';
import { useEngineeringActivity, useActivityCalendar } from '../lib/hooks';

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
}: ProfileViewProps) {
  const [selectedYear, setSelectedYear] = useState<2026 | 2025>(2026);
  const [linkCopied, setLinkCopied] = useState(false);
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
        const key = cursor.toISOString().slice(0, 10);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header Profile Summary */}
      <div 
        className="profile-card-widget relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-elevated))',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <Avatar
            name={profile.full_name}
            avatarUrl={profile.avatar_url}
            size={84}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-text-strong)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {profile.full_name}
              <ShieldCheck size={20} style={{ color: '#2563eb' }} />
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
              {profile.role}{profile.college ? ` • ${profile.college}` : ''}
            </p>
            {profile.bio && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)' }}>
                {profile.bio}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={shareProfileLink}
            className="feed-action-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
          >
            {linkCopied ? <Check size={15} /> : <Share2 size={15} />}
            {linkCopied ? 'Link copied!' : 'Share public profile'}
          </button>
          <a
            href={profile.github_url || 'https://github.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="feed-action-btn github"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            <Github size={15} />
            GitHub
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="feed-action-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', backgroundColor: 'rgba(37, 99, 235, 0.10)', border: '1px solid rgba(37, 99, 235, 0.30)', color: '#1d4ed8', padding: '6px 12px', borderRadius: '8px' }}
          >
            <Linkedin size={15} />
            LinkedIn
          </a>
          <a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="feed-action-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-dark-border)', color: 'var(--color-text-light)', padding: '6px 12px', borderRadius: '8px' }}
          >
            <Twitter size={14} />
            Twitter/X
          </a>
        </div>
      </div>

      {/* Activity — the user's own proof-of-work posts */}
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

      {/* GitHub Contributions Grid */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600 }}>
            {totalContributions} contribution{totalContributions === 1 ? '' : 's'} in the last year
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted-light)', cursor: 'pointer' }}>
              Contribution settings ▼
            </span>
            <div style={{ display: 'flex', gap: '2px', backgroundColor: '#e5e7eb', padding: '2px', borderRadius: '8px' }}>
              <button 
                type="button" 
                onClick={() => setSelectedYear(2026)}
                style={{ 
                  background: selectedYear === 2026 ? 'var(--color-primary)' : 'none', 
                  color: selectedYear === 2026 ? 'var(--color-on-primary)' : 'var(--color-text-muted-light)',
                  border: 'none', 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                2026
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedYear(2025)}
                style={{ 
                  background: selectedYear === 2025 ? 'var(--color-primary)' : 'none', 
                  color: selectedYear === 2025 ? 'var(--color-on-primary)' : 'var(--color-text-muted-light)',
                  border: 'none', 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                2025
              </button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '32px', fontSize: '0.72rem', color: 'var(--color-text-muted-light)', marginTop: '8px' }}>
              <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Learn how we count contributions</a>
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

      {/* Developer Stats & Progression Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

        {/* Engineering Activity Panel — real, GitHub-contribution-style metrics */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ActivityIcon className="text-amber-400" size={20} />
            Engineering Activity
          </h3>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-strong)' }}>{stat.value.toLocaleString()}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Mastery Levels */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu className="text-purple-400" size={20} />
            Skill Mastery Metrics
          </h3>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Skill 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                <span>System Architecture</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>95%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '95%', height: '100%', backgroundColor: 'var(--color-primary)' }} />
              </div>
            </div>

            {/* Skill 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                <span>3D Graphics & WebGL</span>
                <span style={{ color: '#ec4899', fontWeight: 700 }}>90%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '90%', height: '100%', backgroundColor: '#ec4899' }} />
              </div>
            </div>

            {/* Skill 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                <span>Distributed ML Inference</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>80%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '80%', height: '100%', backgroundColor: '#10b981' }} />
              </div>
            </div>

            {/* Skill 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                <span>UI/UX Design Systems</span>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>85%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: '#3b82f6' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Tech Stack Interests & Milestones Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Tech Stack Panel */}
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
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code className="text-purple-400" size={20} />
            Stack & Tech Focus
          </h3>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)' }} />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['React', 'TypeScript', 'Three.js', 'C++', 'CUDA', 'Python', 'Node.js', 'WebGL', 'GLSL', 'Rust', 'Docker', 'Git'].map((tech, idx) => (
              <span 
                key={idx}
                style={{ 
                  fontSize: '0.8rem', 
                  backgroundColor: 'var(--color-primary-soft)',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  color: 'var(--color-primary)',
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '0.82rem', color: 'var(--color-text-muted-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
              Active learning in distributed GPU pipelines.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
              Contributing weekly to experimental 3D render pipelines.
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
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
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers className="text-purple-400" size={20} />
            Recent Milestones
          </h3>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '20px' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '7px', top: '4px', bottom: '4px', width: '2px', backgroundColor: '#e5e7eb' }} />

            {/* Event 1 */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ position: 'absolute', left: '-18px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-strong)' }}>Design Patterns in C++ Completed</span>
                <span style={{ color: 'var(--color-text-muted-light)' }}>Today</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Earned +200 XP from lessons</span>
            </div>

            {/* Event 2 */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ position: 'absolute', left: '-18px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-strong)' }}>Synced Matrix Optimizations</span>
                <span style={{ color: 'var(--color-text-muted-light)' }}>Yesterday</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Merged local memory buffers into ADA-LOCAL-RUN</span>
            </div>

            {/* Event 3 */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ position: 'absolute', left: '-18px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-strong)' }}>Pull Shark Achievement Unlocked</span>
                <span style={{ color: 'var(--color-text-muted-light)' }}>3 days ago</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Successfully merged 5 pull requests in a week</span>
            </div>
          </div>
        </div>

      </div>

      {/* Achievements Section */}
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
        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award className="text-amber-400" size={20} />
          Achievements
        </h3>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '8px' }}>
          
          {/* Badge 1: Pull Shark (Earned / Active) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '2.5px solid var(--color-primary)',
                overflow: 'hidden',
                boxShadow: '0 0 15px rgba(124, 58, 237, 0.25)',
                transition: 'transform 0.25s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-surface-elevated))',
              }}
              className="hover:scale-105"
            >
              <GitPullRequest size={30} style={{ color: 'var(--color-primary)' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-strong)', fontWeight: 600 }}>Pull Shark</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600 }}>Active</span>
          </div>

          {/* Badge 2: YOLO (Locked / Empty) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
            <div 
              style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                border: '2px dashed #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                position: 'relative'
              }}
            >
              <Lock size={20} className="text-gray-400" />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>YOLO</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Locked</span>
          </div>

          {/* Badge 3: Quickdraw (Locked / Empty) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
            <div 
              style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                border: '2px dashed #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                position: 'relative'
              }}
            >
              <Lock size={20} className="text-gray-400" />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted-light)', fontWeight: 600 }}>Quickdraw</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Locked</span>
          </div>

        </div>
      </div>

    </div>
  );
}
