import { useState } from 'react';
import { ArrowLeft, ArrowRight, PenSquare } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import PostCard, { type FeedPost } from './PostCard';

type ActivityTab = 'posts' | 'images';

interface ActivityProps {
  variant: 'compact' | 'full';
  currentUser: Profile;
  myPosts: FeedPost[];
  followerCount: number;
  onLike: (id: number) => void;
  onRepost: (id: number) => void;
  onCommentAdded: (id: number) => void;
  onDelete: (id: number) => void;
  onShowAll?: () => void;
  onBack?: () => void;
  onCreatePost?: () => void;
}

export default function Activity({
  variant,
  currentUser,
  myPosts,
  followerCount,
  onLike,
  onRepost,
  onCommentAdded,
  onDelete,
  onShowAll,
  onBack,
  onCreatePost,
}: ActivityProps) {
  const [tab, setTab] = useState<ActivityTab>('posts');

  const imagePosts = myPosts.filter(p => (p.images && p.images.length > 0) || p.videoUrl);
  const visiblePosts = tab === 'images' ? imagePosts : myPosts;
  const previewPosts = variant === 'compact' ? visiblePosts.slice(0, 2) : visiblePosts;

  const tabBtn = (value: ActivityTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      style={{
        padding: '5px 16px',
        borderRadius: '999px',
        border: tab === value ? '1px solid var(--color-primary)' : '1px solid var(--color-dark-border)',
        background: tab === value ? 'var(--color-primary)' : 'transparent',
        color: tab === value ? 'var(--color-on-primary)' : 'var(--color-text-light)',
        fontSize: '0.82rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );

  const emptyState = (
    <div style={{ textAlign: 'center', padding: variant === 'compact' ? '28px 16px' : '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted-light)' }}>
        {tab === 'images' ? 'No photos or videos posted yet.' : 'No posts yet — share your first proof of work.'}
      </span>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 700 }}>Activity</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>{followerCount} peer{followerCount === 1 ? '' : 's'}</span>
          </div>
          {onCreatePost && (
            <button
              type="button"
              onClick={onCreatePost}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '999px', border: '1px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <PenSquare size={14} />
              Create a post
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {tabBtn('posts', 'Posts')}
          {tabBtn('images', 'Images')}
        </div>

        {previewPosts.length === 0 ? emptyState : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {previewPosts.map(post => (
              <PostCard
                key={post.feedKey}
                post={post}
                currentUser={currentUser}
                onLike={onLike}
                onRepost={onRepost}
                onCommentAdded={onCommentAdded}
                onDelete={onDelete}
                compact
              />
            ))}
          </div>
        )}

        {visiblePosts.length > 0 && onShowAll && (
          <button
            type="button"
            onClick={onShowAll}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '12px', marginTop: '4px',
              borderTop: '1px solid var(--color-dark-border)', border: 'none',
              background: 'none', color: 'var(--color-text-light)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Show all {visiblePosts.length} {tab === 'images' ? 'media' : 'posts'}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    );
  }

  // Full-page variant
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '740px', margin: '0 auto', paddingBottom: '40px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--color-dark-border)', background: 'var(--color-surface)', color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
      >
        <ArrowLeft size={16} />
        Back to profile
      </button>

      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-elevated))',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
        }}
      >
        <Avatar name={currentUser.full_name} avatarUrl={currentUser.avatar_url} size={72} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: 'var(--color-text-strong)', margin: 0 }}>{currentUser.full_name}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
            {currentUser.role}{currentUser.college ? ` • ${currentUser.college}` : ''}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>{followerCount} peer{followerCount === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--color-text-strong)', margin: 0, fontWeight: 700 }}>All activity</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabBtn('posts', `Posts (${myPosts.length})`)}
          {tabBtn('images', `Images (${imagePosts.length})`)}
        </div>
      </div>

      {previewPosts.length === 0 ? emptyState : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {previewPosts.map(post => (
            <PostCard
              key={post.feedKey}
              post={post}
              currentUser={currentUser}
              onLike={onLike}
              onRepost={onRepost}
              onCommentAdded={onCommentAdded}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
