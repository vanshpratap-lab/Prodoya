import { useState, useRef, useEffect } from 'react';
import { Video, Image as ImageIcon, X, Loader2, Search, Mic, Plus, Bookmark } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import { uploadPostMedia, MAX_POST_IMAGES } from '../lib/hooks';
import PostCard, { type FeedPost } from './PostCard';
import EmojiPicker from './EmojiPicker';
import VideoPlayer from './VideoPlayer';

interface FeedProps {
  feedPosts: FeedPost[];
  handleLikePost: (id: number) => void;
  handleRepostPost: (id: number) => void;
  handleSavePost: (id: number) => void;
  onCommentAdded: (id: number) => void;
  handleDeletePost: (id: number) => void;
  handleBlockUser: (authorId: string) => void;
  handleReportPost: (input: {
    reporterId: string;
    postId?: number;
    reason: 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'other';
    details?: string;
  }) => Promise<void>;
  handleCreatePost: (
    text: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    category: string,
    extraData?: { imageUrls?: string[]; videoUrl?: string },
  ) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  feedFilter: 'all' | 'aiml' | 'webdev' | 'opensource' | 'hackathons';
  currentUser: Profile;
}

export default function Feed({
  feedPosts,
  handleLikePost,
  handleRepostPost,
  handleSavePost,
  onCommentAdded,
  handleDeletePost,
  handleBlockUser,
  handleReportPost,
  handleCreatePost,
  searchQuery,
  setSearchQuery,
  feedFilter,
  currentUser,
}: FeedProps) {
  const [savedOnly, setSavedOnly] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [category, setCategory] = useState('webdev');
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [showComposerWidget, setShowComposerWidget] = useState(false);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'image' | 'video' | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
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
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    const remainingSlots = MAX_POST_IMAGES - imageUrls.length;
    if (remainingSlots <= 0) {
      setUploadError(`You can add up to ${MAX_POST_IMAGES} images per post.`);
      return;
    }
    const toUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setUploadError(`Only ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} allowed (max ${MAX_POST_IMAGES} per post) — the rest were skipped.`);
    } else {
      setUploadError(null);
    }

    setUploading('image');
    setUploadingCount(toUpload.length);
    setComposerExpanded(true);
    try {
      const urls = await Promise.all(toUpload.map(file => uploadPostMedia(currentUser.id, file)));
      setImageUrls(prev => [...prev, ...urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(null);
      setUploadingCount(0);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onVideoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setUploadError('That file isn\'t a video. Please choose a video file.');
      return;
    }
    setUploadError(null);
    setUploading('video');
    setComposerExpanded(true);
    try {
      const url = await uploadPostMedia(currentUser.id, file);
      setVideoUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload video. It may be too large — try a shorter clip or a smaller file size.');
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || uploading) return;

    handleCreatePost(newPostText, difficulty, category, {
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      videoUrl: videoUrl ?? undefined,
    });

    setNewPostText('');
    setImageUrls([]);
    setVideoUrl(null);
    setComposerExpanded(false);
    setShowComposerWidget(false);
  };

  const filteredFeedPosts = feedPosts.filter(post => {
    const matchesSearch = post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (savedOnly && !post.hasSaved) return false;

    if (feedFilter === 'all') return true;
    if (feedFilter === 'aiml') return post.tags.includes('#ai') || post.tags.includes('#aiml');
    if (feedFilter === 'webdev') return post.tags.includes('#webdev') || post.tags.includes('#frontend') || post.tags.includes('#collaboration');
    if (feedFilter === 'opensource') return post.tags.includes('#opensource');
    if (feedFilter === 'hackathons') return post.tags.includes('#hackathon') || post.tags.includes('#research');

    return true;
  });

  return (
    <div className="feed-layout-container" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      maxWidth: '820px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Search and Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          gap: '12px',
          border: '1px solid var(--color-dark-border)',
          flex: 1,
          boxShadow: 'var(--shadow-sm)',
          position: 'relative'
        }}>
          <Search size={18} style={{ color: 'var(--color-text-muted-light)' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-light)',
              fontSize: '0.92rem',
              width: '100%'
            }}
          />
          <Mic size={18} style={{ color: 'var(--color-text-muted-light)', cursor: 'pointer', marginLeft: 'auto' }} />
        </div>
        <button
          type="button"
          onClick={() => setShowComposerWidget(prev => !prev)}
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), #a29bfe)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: '999px',
            padding: '12px 24px',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition)'
          }}
          className="create-post-btn"
        >
          <Plus size={16} />
          Create new post
        </button>
      </div>


      {/* Composer Widget (Toggleable Overlay Card) */}
      {showComposerWidget && (
        <form className="feed-create-post-widget" onSubmit={onSubmit} style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: 'var(--shadow-md)',
          animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div className="feed-create-input-row" style={{ display: 'flex', gap: '12px' }}>
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
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                color: 'var(--color-text-light)',
                resize: 'none',
                height: composerExpanded ? '96px' : '44px',
                transition: 'height 0.2s ease'
              }}
            />
          </div>

          {/* Image previews — up to MAX_POST_IMAGES, each individually removable */}
          {(imageUrls.length > 0 || uploading === 'image') && (
            <div style={{ padding: '0 0 0 54px', marginTop: '10px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {imageUrls.map((url, i) => (
                  <div key={url} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
                    <img src={url} alt={`Attachment ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label={`Remove image ${i + 1}`}
                      style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: 'rgba(15, 23, 42, 0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                {uploading === 'image' && Array.from({ length: uploadingCount }).map((_, i) => (
                  <div key={`uploading-${i}`} style={{ width: '90px', height: '90px', borderRadius: '10px', border: '1px solid var(--color-dark-border)', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-text-muted-light)' }} />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)', marginTop: '4px', display: 'block' }}>
                {imageUrls.length}/{MAX_POST_IMAGES} images
              </span>
            </div>
          )}

          {/* Video preview */}
          {(uploading === 'video' || videoUrl) && (
            <div style={{ padding: '0 0 0 54px', position: 'relative', marginTop: '10px' }}>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)', maxWidth: '320px' }}>
                {uploading === 'video' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'var(--color-surface-elevated)', gap: '8px', color: 'var(--color-text-muted-light)', fontSize: '0.82rem' }}>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading video…
                  </div>
                ) : videoUrl ? (
                  <>
                    <VideoPlayer src={videoUrl} maxHeight={220} />
                    <button
                      type="button"
                      onClick={() => setVideoUrl(null)}
                      aria-label="Remove video"
                      style={{ position: 'absolute', top: '8px', right: '8px', width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'rgba(15, 23, 42, 0.65)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1 }}
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {uploadError && (
            <div style={{ padding: '0 0 0 54px', fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: '8px' }}>{uploadError}</div>
          )}

          <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={onImageSelected} style={{ display: 'none' }} />
          <input ref={videoInputRef} type="file" accept="video/*" onChange={onVideoSelected} style={{ display: 'none' }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--color-dark-border)',
            paddingTop: '14px',
            marginTop: '14px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={pickVideo}
                disabled={uploading !== null}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted-light)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <Video size={16} style={{ color: '#059669' }} />
                Video
              </button>
              <button
                type="button"
                onClick={pickImage}
                disabled={uploading !== null || imageUrls.length >= MAX_POST_IMAGES}
                style={{
                  background: 'none',
                  border: 'none',
                  color: imageUrls.length >= MAX_POST_IMAGES ? 'var(--color-text-muted)' : 'var(--color-text-muted-light)',
                  cursor: uploading !== null || imageUrls.length >= MAX_POST_IMAGES ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <ImageIcon size={16} style={{ color: imageUrls.length >= MAX_POST_IMAGES ? 'var(--color-text-muted)' : '#2563eb' }} />
                Photo{imageUrls.length > 0 ? ` (${imageUrls.length}/${MAX_POST_IMAGES})` : ''}
              </button>
              <EmojiPicker onSelect={emoji => setNewPostText(prev => prev + emoji)} />
            </div>

            {composerExpanded && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  style={{
                    background: 'var(--color-bg-home)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    color: 'var(--color-text-light)',
                    fontWeight: 600
                  }}
                >
                  <option value="beginner">Beginner (+10 pts)</option>
                  <option value="intermediate">Intermediate (+20 pts)</option>
                  <option value="advanced">Advanced (+35 pts)</option>
                </select>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    background: 'var(--color-bg-home)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    color: 'var(--color-text-light)',
                    fontWeight: 600
                  }}
                >
                  <option value="webdev">WebDev</option>
                  <option value="aiml">AI/ML</option>
                  <option value="opensource">OpenSource</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading !== null}
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: '999px',
                padding: '6px 18px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Post Update
            </button>
          </div>
        </form>
      )}

      {/* Feeds Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-strong)' }}>Feeds</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setSavedOnly(false)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: savedOnly ? '1px solid var(--color-dark-border)' : '1.5px solid var(--color-primary)',
              background: savedOnly ? 'var(--color-surface)' : 'var(--color-primary-soft)',
              color: savedOnly ? 'var(--color-text-light)' : 'var(--color-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSavedOnly(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              border: savedOnly ? '1.5px solid var(--color-primary)' : '1px solid var(--color-dark-border)',
              background: savedOnly ? 'var(--color-primary-soft)' : 'var(--color-surface)',
              color: savedOnly ? 'var(--color-primary)' : 'var(--color-text-light)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <Bookmark size={13} />
            Saved
          </button>
        </div>
      </div>

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
          {savedOnly ? (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-soft)' }}>
                <Bookmark size={26} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-text-strong)', fontWeight: 500 }}>No saved posts yet</h3>
              <p style={{ color: 'var(--color-text-muted-light)', fontSize: '0.9rem', maxWidth: '380px' }}>Tap the bookmark on any post to save it here for later.</p>
            </>
          ) : (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-text-strong)', fontWeight: 500 }}>No proof-of-work posts found</h3>
              <p style={{ color: 'var(--color-text-muted-light)', fontSize: '0.9rem', maxWidth: '380px' }}>There are no learning activities registered under this tag or matching your search. Be the first to share an update!</p>
            </>
          )}
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
            onSave={handleSavePost}
            onCommentAdded={onCommentAdded}
            onDelete={handleDeletePost}
            onBlockAuthor={handleBlockUser}
            onReport={handleReportPost}
          />
        ))
      )}
    </div>
  );
}

