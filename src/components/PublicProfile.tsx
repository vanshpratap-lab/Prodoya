import { useEffect, useState } from 'react';
import { Github, Heart, MessageCircle, Repeat2, Bot, GraduationCap, Activity, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Profile, Post } from '../lib/supabase';
import Avatar from './Avatar';
import { formatRelativeTime } from '../lib/time';
import { ImageGrid } from './PostCard';
import VideoPlayer from './VideoPlayer';

interface PublicProfileProps {
  username: string;
}

export default function PublicProfile({ username }: PublicProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { profile: profileData } = await api.get<{ profile: Profile }>(`/profiles/${username}`);

      if (!profileData) {
        if (!cancelled) { setNotFound(true); setLoading(false); }
        return;
      }

      const { posts: postsData } = await api.get<{ posts: Post[] }>(`/users/${profileData.id}/posts`);

      if (!cancelled) {
        setProfile(profileData as Profile);
        setPosts((postsData ?? []).map(p => ({ ...p, has_liked: false, has_reposted: false, has_saved: false })) as Post[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [username]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-home)' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--color-bg-home)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-strong)' }}>Profile not found</h1>
        <a href="/" style={{ color: 'var(--color-primary)' }}>Go to Engineer Network</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-home)', padding: '32px 16px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-elevated))',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size={84} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--color-text-strong)', margin: 0 }}>{profile.full_name}</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
              {profile.role}{profile.college ? ` • ${profile.college}` : ''}
            </span>
            {profile.bio && <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-light)' }}>{profile.bio}</span>}
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-strong)', fontWeight: 700 }}>{profile.points.toLocaleString()} pts</span>
              <span style={{ fontSize: '0.85rem', color: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={14} />
                {new Set(posts.map(p => p.created_at.slice(0, 10))).size} active days
              </span>
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Github size={14} />
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-text-strong)', margin: 0 }}>Proof of Work</h2>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted-light)' }}>No posts yet.</div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="feed-post-card">
              <div className="feed-post-header">
                <div className="feed-post-author-box">
                  <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size={40} />
                  <div className="feed-post-author-details">
                    <span className="feed-post-author-name">{profile.full_name}</span>
                    <span className="feed-post-author-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GraduationCap size={12} />
                      {profile.college} • {profile.role}
                    </span>
                  </div>
                </div>
                <span className="feed-post-time">{formatRelativeTime(post.created_at)}</span>
              </div>

              <div className="feed-post-body">{post.content}</div>

              {post.image_urls && post.image_urls.length > 0 && (
                <ImageGrid images={post.image_urls} />
              )}
              {post.video_url && <VideoPlayer src={post.video_url} />}

              <div className="feed-post-tags">
                {post.tags.map((tag, idx) => (
                  <span className="feed-post-tag-pill" key={idx}>{tag}</span>
                ))}
              </div>

              <div className="feed-post-ai-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={`feed-post-ai-badge ${post.ai_difficulty}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Bot size={13} />
                  AI: {post.ai_difficulty.toUpperCase()} | +{post.ai_points} pts
                </div>
              </div>

              <div className="feed-post-actions">
                <span className="feed-action-btn" style={{ cursor: 'default' }}>
                  <Heart size={16} style={{ marginRight: '4px' }} />
                  {post.like_count} Applauds
                </span>
                <span className="feed-action-btn" style={{ cursor: 'default' }}>
                  <MessageCircle size={16} style={{ marginRight: '4px' }} />
                  {post.comment_count} Comments
                </span>
                <span className="feed-action-btn" style={{ cursor: 'default' }}>
                  <Repeat2 size={16} style={{ marginRight: '4px' }} />
                  {post.repost_count} Reposts
                </span>
                {post.github_url && (
                  <a href={post.github_url} target="_blank" rel="noopener noreferrer" className="feed-action-btn github" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Github size={16} />
                    View Codebase
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}

        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.85rem', color: 'var(--color-text-muted-light)' }}>
          Powered by <a href="/" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Engineer Network</a> — verified proof-of-work for engineering students.
        </div>
      </div>
    </div>
  );
}
