import { useState, type FormEvent } from 'react';
import {
  Github, Heart, ExternalLink, Loader2, GraduationCap, Bot, Flame,
  MessageCircle, Repeat2, Send, Check, MoreHorizontal, Trash2,
} from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';
import { usePostComments } from '../lib/hooks';

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
  projectShowcase?: string;
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
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Write a comment…"
          maxLength={1000}
          style={{
            flex: 1, padding: '8px 14px', borderRadius: '18px',
            border: '1px solid var(--color-dark-border)', outline: 'none',
            fontSize: '0.84rem', background: 'var(--color-surface-elevated)', color: 'var(--color-text-light)',
          }}
        />
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
}

export default function PostCard({ post, currentUser, onLike, onRepost, onCommentAdded, onDelete }: PostCardProps) {
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
      className={`feed-post-card ${isJustCreated ? 'border-primary shadow-lg scale-[1.01]' : ''}`}
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
          <Avatar name={post.author} avatarUrl={post.avatar} size={48} />
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
          {isOwner && onDelete && (
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
                        <Trash2 size={15} />
                        Delete post
                      </button>
                    ) : (
                      <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>Delete this post permanently?</span>
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
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Delete
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
        {post.content}
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

      {post.projectShowcase && (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
          <img src={post.projectShowcase} alt="Project Showcase" style={{ width: '100%', maxHeight: '350px', objectFit: 'cover' }} />
        </div>
      )}

      {post.videoUrl && (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
          <video src={post.videoUrl} controls style={{ width: '100%', maxHeight: '350px', background: '#000' }} />
        </div>
      )}

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
