import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Github, Heart, ExternalLink, Loader2, GraduationCap, Bot, Flame,
  MessageCircle, Repeat2, Send, Check, MoreHorizontal, Trash2, Ban, X,
} from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import { usePostComments } from '../lib/hooks';
import EmojiPicker from './EmojiPicker';
import VideoPlayer from './VideoPlayer';

// Renders inline `code` spans and ```fenced``` code blocks distinctly from
// surrounding prose, while leaving the rest of the text untouched.
function renderPostContent(content: string): ReactNode[] {
  const renderInline = (text: string, keyPrefix: string): ReactNode[] =>
    text.split(/(`[^`\n]+`)/g).map((part, i) => {
      if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={`${keyPrefix}-${i}`}
            style={{
              background: 'var(--color-surface-elevated)', border: '1px solid var(--color-dark-border)',
              borderRadius: '4px', padding: '1px 6px', fontFamily: 'monospace', fontSize: '0.88em', color: '#c026d3',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={`${keyPrefix}-${i}`}>{part}</span>;
    });

  const nodes: ReactNode[] = [];
  const fenceRegex = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockKey = 0;

  while ((match = fenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = content.slice(lastIndex, match.index);
      if (textChunk) nodes.push(<span key={`t-${blockKey}`}>{renderInline(textChunk, `t-${blockKey}`)}</span>);
    }
    const lang = match[1];
    const code = match[2].replace(/\n$/, '');
    nodes.push(
      <pre
        key={`c-${blockKey}`}
        style={{
          backgroundColor: '#0f172a', border: '1px solid #1f2937', borderRadius: '8px',
          padding: '12px 16px', fontSize: '0.8rem', color: '#a7f3d0', fontFamily: 'monospace',
          overflowX: 'auto', margin: '8px 0', whiteSpace: 'pre',
        }}
      >
        {lang && (
          <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {lang}
          </div>
        )}
        <code>{code}</code>
      </pre>,
    );
    lastIndex = fenceRegex.lastIndex;
    blockKey++;
  }

  if (lastIndex < content.length) {
    const rest = content.slice(lastIndex);
    if (rest) nodes.push(<span key={`t-${blockKey}-end`}>{renderInline(rest, `t-${blockKey}-end`)}</span>);
  }

  return nodes;
}

// Organized multi-image layout (1-5 images, matching the posts_image_urls_max_5
// database constraint) — common social-grid patterns, no images are ever hidden.
function ImageLightbox({ images, index, onClose, onNavigate }: { images: string[]; index: number; onClose: () => void; onNavigate: (i: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1);
      if (e.key === 'ArrowRight' && index < images.length - 1) onNavigate(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length, onClose, onNavigate]);

  // Rendered via a portal to document.body: any ancestor post card can have a
  // CSS `transform` (e.g. the hover lift), which would otherwise re-anchor this
  // `position: fixed` overlay to that card instead of the viewport.
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: '20px', right: '24px', width: '40px', height: '40px', borderRadius: '50%',
          border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem',
        }}
      >
        <X size={20} />
      </button>

      {images.length > 1 && index > 0 && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onNavigate(index - 1); }}
          aria-label="Previous image"
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: '1.4rem' }}
        >
          ‹
        </button>
      )}

      <img
        src={images[index]}
        alt={`Attachment ${index + 1} of ${images.length}`}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '8px' }}
      />

      {images.length > 1 && index < images.length - 1 && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onNavigate(index + 1); }}
          aria-label="Next image"
          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: '1.4rem' }}
        >
          ›
        </button>
      )}

      {images.length > 1 && (
        <span style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600 }}>
          {index + 1} / {images.length}
        </span>
      )}
    </div>,
    document.body,
  );
}

export function ImageGrid({ images, compact }: { images: string[]; compact?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const maxHeight = compact ? 160 : 320;
  const cellStyle = { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block', cursor: 'pointer' as const };

  const lightbox = openIndex !== null && (
    <ImageLightbox images={images} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
  );

  if (images.length === 1) {
    return (
      <>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
          <img src={images[0]} alt="Attachment 1" onClick={() => setOpenIndex(0)} style={{ width: '100%', maxHeight, objectFit: 'cover', display: 'block', cursor: 'pointer' }} />
        </div>
        {lightbox}
      </>
    );
  }

  if (images.length === 2) {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', height: maxHeight, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
          {images.map((src, i) => <img key={i} src={src} alt={`Attachment ${i + 1}`} onClick={() => setOpenIndex(i)} style={cellStyle} />)}
        </div>
        {lightbox}
      </>
    );
  }

  if (images.length === 3) {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4px', height: maxHeight, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
          <img src={images[0]} alt="Attachment 1" onClick={() => setOpenIndex(0)} style={cellStyle} />
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '4px' }}>
            <img src={images[1]} alt="Attachment 2" onClick={() => setOpenIndex(1)} style={cellStyle} />
            <img src={images[2]} alt="Attachment 3" onClick={() => setOpenIndex(2)} style={cellStyle} />
          </div>
        </div>
        {lightbox}
      </>
    );
  }

  if (images.length === 4) {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4px', height: maxHeight, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
          {images.map((src, i) => <img key={i} src={src} alt={`Attachment ${i + 1}`} onClick={() => setOpenIndex(i)} style={cellStyle} />)}
        </div>
        {lightbox}
      </>
    );
  }

  // 5 images (the max): a clean 3-column grid, all real images shown.
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', gap: '4px', height: maxHeight, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
        {images.map((src, i) => <img key={i} src={src} alt={`Attachment ${i + 1}`} onClick={() => setOpenIndex(i)} style={cellStyle} />)}
      </div>
      {lightbox}
    </>
  );
}

export interface FeedPost {
  id: number;
  feedKey: string;
  repostedBy?: string;
  authorId: string;
  author: string;
  avatar: string;
  college: string;
  role: string;
  content: string;
  tags: string[];
  aiDifficulty: 'beginner' | 'intermediate' | 'advanced';
  aiPoints: number;
  likes: number;
  hasLiked: boolean;
  reposts: number;
  hasReposted: boolean;
  commentCount: number;
  time: string;
  githubUrl?: string;
  images?: string[];
  codeSnippet?: string;
  videoUrl?: string;
}

function PostComments({ postId, currentUser, expanded, onCommentAdded }: { postId: number; currentUser: Profile; expanded: boolean; onCommentAdded: () => void }) {
  const { comments, loading, addComment } = usePostComments(postId, expanded);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addComment(currentUser.id, draft);
      setDraft('');
      onCommentAdded();
    } finally {
      setSubmitting(false);
    }
  };

  if (!expanded) return null;

  return (
    <div style={{ borderTop: '1px solid var(--color-dark-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.2s ease' }}>
      {loading ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)' }}>Loading comments…</span>
      ) : comments.length === 0 ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)' }}>No comments yet — be the first to reply.</span>
      ) : (
        comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Avatar name={c.author?.full_name ?? 'Unknown'} avatarUrl={c.author?.avatar_url} size={28} />
            <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '12px', padding: '8px 12px', flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>{c.author?.full_name ?? 'Unknown'}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--color-text-light)', marginTop: '2px' }}>{c.text}</div>
            </div>
          </div>
        ))
      )}
      <form onSubmit={submit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Avatar name={currentUser.full_name} avatarUrl={currentUser.avatar_url} size={28} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px 4px 14px', borderRadius: '18px', border: '1px solid var(--color-dark-border)', background: 'var(--color-surface-elevated)' }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write a comment…"
            maxLength={1000}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'none',
              fontSize: '0.84rem', color: 'var(--color-text-light)',
            }}
          />
          <EmojiPicker onSelect={emoji => setDraft(prev => prev + emoji)} align="right" />
        </div>
        {draft.trim() && (
          <button type="submit" disabled={submitting} className="feed-action-btn" style={{ padding: '6px 8px' }} aria-label="Send comment">
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        )}
      </form>
    </div>
  );
}

interface PostCardProps {
  post: FeedPost;
  currentUser: Profile;
  onLike: (id: number) => void;
  onRepost: (id: number) => void;
  onCommentAdded: (id: number) => void;
  onDelete?: (id: number) => void;
  onBlockAuthor?: (authorId: string) => void;
  /** Tighter padding/spacing and capped media height — used in profile/activity previews. */
  compact?: boolean;
}

export default function PostCard({ post, currentUser, onLike, onRepost, onCommentAdded, onDelete, onBlockAuthor, compact }: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isJustCreated = post.time === 'Just now';
  const isOwner = post.authorId === currentUser.id;

  const sharePost = async () => {
    const url = `${window.location.origin}/?post=${post.id}`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      document.body.removeChild(ta);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || deleting) return;
    setDeleting(true);
    try {
      await onDelete(post.id);
    } finally {
      setDeleting(false);
      setMenuOpen(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div
      className={`feed-post-card ${isJustCreated ? 'border-primary shadow-lg scale-[1.01]' : ''} ${compact ? 'compact' : ''}`}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: isJustCreated ? 'pulseNewPost 1s ease-in-out' : 'none',
        position: 'relative',
      }}
    >
      {post.repostedBy && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted-light)',
          paddingBottom: '10px', marginBottom: '4px',
          borderBottom: '1px solid var(--color-dark-border)',
        }}>
          <Repeat2 size={14} style={{ color: '#059669' }} />
          {post.repostedBy} reposted this
        </div>
      )}

      <div className="feed-post-header">
        <div className="feed-post-author-box">
          <Avatar name={post.author} avatarUrl={post.avatar} size={compact ? 36 : 48} />
          <div className="feed-post-author-details">
            <span className="feed-post-author-name">{post.author}</span>
            <span className="feed-post-author-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <GraduationCap size={12} />
              {post.college} • {post.role}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="feed-post-time">{post.time}</span>
          {((isOwner && onDelete) || (!isOwner && onBlockAuthor)) && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => { setMenuOpen(v => !v); setConfirmDelete(false); }}
                aria-label="Post options"
                className="feed-post-options-btn"
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => { setMenuOpen(false); setConfirmDelete(false); }} />
                  <div
                    style={{
                      position: 'absolute', right: 0, top: '32px', zIndex: 30,
                      background: 'var(--color-surface)', border: '1px solid var(--color-dark-border)',
                      borderRadius: '12px', boxShadow: 'var(--shadow-lg)', padding: '6px',
                      minWidth: confirmDelete ? '220px' : '160px', animation: 'fadeIn 0.15s ease',
                    }}
                  >
                    {!confirmDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer',
                          borderRadius: '8px', fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, textAlign: 'left',
                        }}
                        className="feed-post-menu-item"
                      >
                        {isOwner ? <Trash2 size={15} /> : <Ban size={15} />}
                        {isOwner ? 'Delete post' : `Block ${post.author}`}
                      </button>
                    ) : (
                      <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                          {isOwner
                            ? 'Delete this post permanently?'
                            : `Block ${post.author}? You will no longer see each other's posts.`}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-dark-border)', background: 'var(--color-surface-elevated)', color: 'var(--color-text-light)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={isOwner ? handleDelete : () => { onBlockAuthor?.(post.authorId); setMenuOpen(false); setConfirmDelete(false); }}
                            disabled={deleting}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            {deleting ? <Loader2 size={13} className="animate-spin" /> : isOwner ? <Trash2 size={13} /> : <Ban size={13} />}
                            {isOwner ? 'Delete' : 'Block'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="feed-post-body">
        {renderPostContent(post.content)}
      </div>

      {post.codeSnippet && (
        <div style={{ position: 'relative' }}>
          <pre style={{
            backgroundColor: '#0f172a', border: '1px solid #1f2937', borderRadius: '8px',
            padding: '12px 16px', fontSize: '0.8rem', color: '#a7f3d0', fontFamily: 'monospace', overflowX: 'auto',
          }}>
            <code>{post.codeSnippet}</code>
          </pre>
        </div>
      )}

      {post.images && post.images.length > 0 && (
        <ImageGrid images={post.images} compact={compact} />
      )}

      {post.videoUrl && <VideoPlayer src={post.videoUrl} maxHeight={compact ? 160 : 320} />}

      <div className="feed-post-tags">
        {post.tags.map((tag, idx) => (
          <span className="feed-post-tag-pill" key={idx}>{tag}</span>
        ))}
      </div>

      <div className="feed-post-ai-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          className={`feed-post-ai-badge ${post.aiDifficulty} ${isJustCreated ? 'animate-bounce' : ''}`}
          style={{
            animation: isJustCreated ? 'shimmerAI 1.2s ease-in-out infinite' : 'none',
            display: 'inline-flex', alignItems: 'center', gap: '5px',
          }}
        >
          <Bot size={13} />
          AI: {post.aiDifficulty.toUpperCase()} | +{post.aiPoints} pts
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-light)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Flame size={13} style={{ color: '#f97316' }} />
          Growth Points Verified
        </span>
      </div>

      <div className="feed-post-actions">
        <button
          type="button"
          className={`feed-action-btn ${post.hasLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
          style={{ transition: 'all 0.2s ease-in-out', transform: post.hasLiked ? 'scale(1.05)' : 'scale(1)' }}
        >
          <Heart size={16} fill={post.hasLiked ? '#e11d48' : 'none'} style={{ marginRight: '4px' }} />
          {post.likes} Applauds
        </button>

        <button
          type="button"
          className="feed-action-btn"
          onClick={() => setCommentsOpen(v => !v)}
          style={{ color: commentsOpen ? 'var(--color-primary)' : undefined }}
        >
          <MessageCircle size={16} style={{ marginRight: '4px' }} />
          {post.commentCount} Comment{post.commentCount === 1 ? '' : 's'}
        </button>

        <button
          type="button"
          className={`feed-action-btn ${post.hasReposted ? 'reposted' : ''}`}
          onClick={() => onRepost(post.id)}
          style={{ color: post.hasReposted ? '#059669' : undefined }}
        >
          <Repeat2 size={16} style={{ marginRight: '4px' }} />
          {post.reposts} Repost{post.reposts === 1 ? '' : 's'}
        </button>

        <button type="button" className="feed-action-btn" onClick={sharePost}>
          {copied ? <Check size={16} style={{ marginRight: '4px', color: '#059669' }} /> : <Send size={16} style={{ marginRight: '4px' }} />}
          {copied ? 'Copied!' : 'Share'}
        </button>

        {post.githubUrl && (
          <a
            href={post.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="feed-action-btn github"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Github size={16} />
            View Codebase
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      <PostComments postId={post.id} currentUser={currentUser} expanded={commentsOpen} onCommentAdded={() => onCommentAdded(post.id)} />
    </div>
  );
}
