import { useState, useRef, useEffect } from 'react';
import { Video, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import { uploadPostMedia } from '../lib/hooks';
import PostCard, { type FeedPost } from './PostCard';

interface FeedProps {
  feedPosts: FeedPost[];
  handleLikePost: (id: number) => void;
  handleRepostPost: (id: number) => void;
  onCommentAdded: (id: number) => void;
  handleDeletePost: (id: number) => void;
  handleBlockUser: (authorId: string) => void;
  handleCreatePost: (
    text: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    category: string,
    extraData?: { imageUrl?: string; videoUrl?: string },
  ) => void;
  searchQuery: string;
  feedFilter: 'all' | 'aiml' | 'webdev' | 'opensource' | 'hackathons';
  setFeedFilter: (filter: 'all' | 'aiml' | 'webdev' | 'opensource' | 'hackathons') => void;
  currentUser: Profile;
}

export default function Feed({
  feedPosts,
  handleLikePost,
  handleRepostPost,
  onCommentAdded,
  handleDeletePost,
  handleBlockUser,
  handleCreatePost,
  searchQuery,
  feedFilter,
  setFeedFilter,
  currentUser,
}: FeedProps) {
  const [newPostText, setNewPostText] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [category, setCategory] = useState('webdev');
  const [composerExpanded, setComposerExpanded] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'image' | 'video' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [feedFilter]);

  const pickImage = () => imageInputRef.current?.click();
  const pickVideo = () => videoInputRef.current?.click();

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploading('image');
    setComposerExpanded(true);
    try {
      const url = await uploadPostMedia(currentUser.id, file);
      setImageUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(null);
    }
  };

  const onVideoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploading('video');
    setComposerExpanded(true);
    try {
      const url = await uploadPostMedia(currentUser.id, file);
      setVideoUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload video.');
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || uploading) return;

    handleCreatePost(newPostText, difficulty, category, {
      imageUrl: imageUrl ?? undefined,
      videoUrl: videoUrl ?? undefined,
    });

    setNewPostText('');
    setImageUrl(null);
    setVideoUrl(null);
    setComposerExpanded(false);
  };

  const filteredFeedPosts = feedPosts.filter(post => {
    const matchesSearch = post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (feedFilter === 'all') return true;
    if (feedFilter === 'aiml') return post.tags.includes('#ai') || post.tags.includes('#aiml');
    if (feedFilter === 'webdev') return post.tags.includes('#webdev') || post.tags.includes('#frontend') || post.tags.includes('#collaboration');
    if (feedFilter === 'opensource') return post.tags.includes('#opensource');
    if (feedFilter === 'hackathons') return post.tags.includes('#hackathon') || post.tags.includes('#research');

    return true;
  });

  return (
    <div className="feed-layout-container">
      {/* Category Filter */}
      <div className="feed-header-filter">
        <span className="feed-filter-title">Proof-of-work Feed</span>
        <div className="feed-filter-tabs">
          {(['all', 'aiml', 'webdev', 'opensource', 'hackathons'] as const).map(f => (
            <button
              key={f}
              type="button"
              className={`feed-filter-btn ${feedFilter === f ? 'active' : ''}`}
              onClick={() => setFeedFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'aiml' ? 'AI/ML' : f === 'webdev' ? 'WebDev' : f === 'opensource' ? 'Open Source' : 'Hackathons'}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <form className="feed-create-post-widget" onSubmit={onSubmit}>
        <div className="feed-create-input-row">
          <div className="feed-create-avatar">
            <Avatar name={currentUser.full_name} avatarUrl={currentUser.avatar_url} size={42} />
          </div>
          <textarea
            className="feed-create-textarea"
            placeholder="Share a project update, code snippet, or AI learning milestone..."
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            onFocus={() => setComposerExpanded(true)}
            required
            style={composerExpanded ? { height: '96px' } : undefined}
          />
        </div>

        {/* Image preview */}
        {(uploading === 'image' || imageUrl) && (
          <div style={{ padding: '0 0 0 54px', position: 'relative' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)', maxWidth: '320px' }}>
              {uploading === 'image' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'var(--color-surface-elevated)', gap: '8px', color: 'var(--color-text-muted-light)', fontSize: '0.82rem' }}>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading image…
                </div>
              ) : (
                <>
                  <img src={imageUrl ?? undefined} alt="Attachment preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    aria-label="Remove image"
                    style={{ position: 'absolute', top: '8px', right: '8px', width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'rgba(15, 23, 42, 0.65)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Video preview */}
        {(uploading === 'video' || videoUrl) && (
          <div style={{ padding: '0 0 0 54px', position: 'relative' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)', maxWidth: '320px' }}>
              {uploading === 'video' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'var(--color-surface-elevated)', gap: '8px', color: 'var(--color-text-muted-light)', fontSize: '0.82rem' }}>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading video…
                </div>
              ) : (
                <>
                  <video src={videoUrl ?? undefined} controls style={{ width: '100%', maxHeight: '220px', display: 'block', background: '#000' }} />
                  <button
                    type="button"
                    onClick={() => setVideoUrl(null)}
                    aria-label="Remove video"
                    style={{ position: 'absolute', top: '8px', right: '8px', width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'rgba(15, 23, 42, 0.65)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {uploadError && (
          <div style={{ padding: '0 0 0 54px', fontSize: '0.8rem', color: 'var(--color-danger)' }}>{uploadError}</div>
        )}

        <input ref={imageInputRef} type="file" accept="image/*" onChange={onImageSelected} style={{ display: 'none' }} />
        <input ref={videoInputRef} type="file" accept="video/*" onChange={onVideoSelected} style={{ display: 'none' }} />

        <div className="feed-create-controls" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="feed-create-options" style={{ flexWrap: 'wrap', rowGap: '8px' }}>
            <button
              type="button"
              onClick={pickVideo}
              disabled={uploading !== null}
              className="feed-composer-icon-btn"
              style={{ color: videoUrl ? '#059669' : 'var(--color-text-muted-light)' }}
              aria-label="Add a video"
            >
              <Video size={17} style={{ color: '#059669' }} />
              Video
            </button>
            <button
              type="button"
              onClick={pickImage}
              disabled={uploading !== null}
              className="feed-composer-icon-btn"
              aria-label="Add a photo"
            >
              <ImageIcon size={17} style={{ color: '#2563eb' }} />
              Photo
            </button>
          </div>

          {composerExpanded && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
              <select
                className="feed-create-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <option value="beginner">Beginner (+10 pts)</option>
                <option value="intermediate">Intermediate (+20 pts)</option>
                <option value="advanced">Advanced (+35 pts)</option>
              </select>
              <select
                className="feed-create-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="webdev">WebDev</option>
                <option value="aiml">AI/ML</option>
                <option value="opensource">OpenSource</option>
              </select>
            </div>
          )}

          <button type="submit" className="feed-post-btn" disabled={uploading !== null} style={{ marginLeft: 'auto' }}>
            Post Update
          </button>
        </div>
      </form>

      {/* Loading Skeleton States */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2].map(n => (
            <div key={n} className="feed-post-card animate-pulse" style={{ height: '180px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ borderRadius: '50%', backgroundColor: '#f0f0eb', width: '48px', height: '48px', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                  <div style={{ height: '14px', backgroundColor: '#f0f0eb', borderRadius: '4px', width: '30%' }} />
                  <div style={{ height: '10px', backgroundColor: '#f0f0eb', borderRadius: '4px', width: '20%' }} />
                </div>
              </div>
              <div style={{ height: '12px', backgroundColor: '#f0f0eb', borderRadius: '4px', width: '100%' }} />
              <div style={{ height: '12px', backgroundColor: '#f0f0eb', borderRadius: '4px', width: '80%' }} />
            </div>
          ))}
        </div>
      ) : filteredFeedPosts.length === 0 ? (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-text-strong)', fontWeight: 500 }}>No proof-of-work posts found</h3>
          <p style={{ color: 'var(--color-text-muted-light)', fontSize: '0.9rem', maxWidth: '380px' }}>There are no learning activities registered under this tag or matching your search. Be the first to share an update!</p>
        </div>
      ) : (
        /* Posts Feed */
        filteredFeedPosts.map(post => (
          <PostCard
            key={post.feedKey}
            post={post}
            currentUser={currentUser}
            onLike={handleLikePost}
            onRepost={handleRepostPost}
            onCommentAdded={onCommentAdded}
            onDelete={handleDeletePost}
            onBlockAuthor={handleBlockUser}
          />
        ))
      )}
    </div>
  );
}
