import { useState, useEffect } from 'react';
import { Github, Sparkles, Terminal, Heart, ExternalLink } from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';

interface FeedPost {
  id: number;
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
  time: string;
  githubUrl?: string;
  projectShowcase?: string;
  codeSnippet?: string;
  githubRepoName?: string;
}

interface FeedProps {
  feedPosts: FeedPost[];
  handleLikePost: (id: number) => void;
  handleCreatePost: (text: string, difficulty: 'beginner' | 'intermediate' | 'advanced', category: string, extraData?: { codeSnippet?: string; githubUrl?: string }) => void;
  searchQuery: string;
  feedFilter: 'all' | 'aiml' | 'webdev' | 'opensource' | 'hackathons';
  setFeedFilter: (filter: 'all' | 'aiml' | 'webdev' | 'opensource' | 'hackathons') => void;
  currentUser: Profile;
}

export default function Feed({
  feedPosts,
  handleLikePost,
  handleCreatePost,
  searchQuery,
  feedFilter,
  setFeedFilter,
  currentUser,
}: FeedProps) {
  const [newPostText, setNewPostText] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [category, setCategory] = useState('webdev');
  
  // Composer extra modes: 'text' | 'code' | 'github'
  const [composerMode, setComposerMode] = useState<'text' | 'code' | 'github'>('text');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // Local loading skeleton simulation on tab mount
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [feedFilter]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    handleCreatePost(
      newPostText,
      difficulty,
      category,
      {
        codeSnippet: composerMode === 'code' ? codeSnippet : undefined,
        githubUrl: composerMode === 'github' ? githubUrl : undefined
      }
    );

    setNewPostText('');
    setCodeSnippet('');
    setGithubUrl('');
    setComposerMode('text');
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

      {/* Composer Adaptations */}
      <form className="feed-create-post-widget" onSubmit={onSubmit}>
        <div className="feed-create-input-row">
          <div className="feed-create-avatar">
            <Avatar
              name={currentUser.full_name}
              avatarUrl={currentUser.avatar_url}
              size={42}
            />
          </div>
          <textarea 
            className="feed-create-textarea"
            placeholder="Share a project update, code snippet, or AI learning milestone..."
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            required
          />
        </div>

        {/* Monospace Code Preview Box */}
        {composerMode === 'code' && (
          <div style={{ padding: '0 0 0 54px' }}>
            <textarea
              className="font-mono text-xs w-full rounded-lg p-3 outline-none h-28"
              style={{ backgroundColor: '#0f172a', color: '#a7f3d0', border: '1px solid #1f2937', width: '100%', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem' }}
              placeholder="// Paste your code snippet here..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
            />
          </div>
        )}

        {/* Github Repository Input Card */}
        {composerMode === 'github' && (
          <div style={{ padding: '0 0 0 54px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-dark-border)', borderRadius: '8px', padding: '8px', gap: '8px' }}>
              <Github size={16} style={{ color: 'var(--color-text-muted-light)' }} />
              <input
                type="url"
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: '#0369a1', flexGrow: 1 }}
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="feed-create-controls">
          <div className="feed-create-options">
            <button 
              type="button" 
              onClick={() => setComposerMode(composerMode === 'code' ? 'text' : 'code')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: composerMode === 'code' ? 'var(--color-primary)' : 'var(--color-text-muted-light)', fontSize: '0.8rem' }}
              aria-label="Add code snippet"
            >
              <Terminal size={15} />
              Code
            </button>
            <button 
              type="button" 
              onClick={() => setComposerMode(composerMode === 'github' ? 'text' : 'github')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: composerMode === 'github' ? 'var(--color-primary)' : 'var(--color-text-muted-light)', fontSize: '0.8rem' }}
              aria-label="Link Github repo"
            >
              <Github size={15} />
              GitHub
            </button>
            <select 
              className="feed-create-select" 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value as any)}
              style={{ marginLeft: '8px' }}
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
          <button type="submit" className="feed-post-btn">Post Update</button>
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
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-soft)' }}>
            <Sparkles size={48} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-text-strong)', fontWeight: 500 }}>No proof-of-work posts found</h3>
          <p style={{ color: 'var(--color-text-muted-light)', fontSize: '0.9rem', maxWidth: '380px' }}>There are no learning activities registered under this tag or matching your search. Be the first to share an update!</p>
        </div>
      ) : (
        /* Posts Feed */
        filteredFeedPosts.map(post => {
          const isJustCreated = post.time === 'Just now';
          return (
            <div 
              className={`feed-post-card ${isJustCreated ? 'border-primary shadow-lg scale-[1.01]' : ''}`} 
              key={post.id}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: isJustCreated ? 'pulseNewPost 1s ease-in-out' : 'none'
              }}
            >
              <div className="feed-post-header">
                <div className="feed-post-author-box">
                  <Avatar name={post.author} avatarUrl={post.avatar} size={48} />
                  <div className="feed-post-author-details">
                    <span className="feed-post-author-name">{post.author}</span>
                    <span className="feed-post-author-sub">🏫 {post.college} • {post.role}</span>
                  </div>
                </div>
                <span className="feed-post-time">{post.time}</span>
              </div>

              <div className="feed-post-body">
                {post.content}
              </div>

              {/* Code Snippet monospaced block if present */}
              {post.codeSnippet && (
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '0.8rem',
                    color: '#a7f3d0',
                    fontFamily: 'monospace',
                    overflowX: 'auto'
                  }}>
                    <code>{post.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {post.projectShowcase && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-dark-border)' }}>
                  <img src={post.projectShowcase} alt="Project Showcase" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }} />
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
                    animation: isJustCreated ? 'shimmerAI 1.2s ease-in-out infinite' : 'none'
                  }}
                >
                  <Sparkles size={13} style={{ marginRight: '4px' }} />
                  🤖 AI: {post.aiDifficulty.toUpperCase()} | +{post.aiPoints} pts
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-light)' }}>
                  🔥 Growth Points Verified
                </span>
              </div>

              <div className="feed-post-actions">
                <button 
                  type="button" 
                  className={`feed-action-btn ${post.hasLiked ? 'liked' : ''}`}
                  onClick={() => handleLikePost(post.id)}
                  style={{
                    transition: 'all 0.2s ease-in-out',
                    transform: post.hasLiked ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <Heart size={16} fill={post.hasLiked ? '#e11d48' : 'none'} style={{ marginRight: '4px' }} />
                  {post.likes} Applauds
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
            </div>
          );
        })
      )}
    </div>
  );
}
