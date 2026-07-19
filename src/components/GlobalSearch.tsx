import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, GraduationCap, FileText, X } from 'lucide-react';
import Avatar from './Avatar';
import { searchEverything, type SearchResults } from '../lib/hooks';
import type { Profile } from '../lib/supabase';

interface GlobalSearchProps {
  onOpenProfile: (profile: Profile) => void;
}

const EMPTY: SearchResults = { people: [], posts: [] };

export default function GlobalSearch({ onOpenProfile }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search — fires 250ms after typing stops, ignoring stale responses.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const t = setTimeout(async () => {
      const r = await searchEverything(q);
      if (!cancelled) {
        setResults(r);
        setLoading(false);
        setActiveIndex(-1);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Cmd/Ctrl-K focuses search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const flatPeople = results.people;
  const selectPerson = (p: Profile) => {
    onOpenProfile(p);
    setOpen(false);
    setQuery('');
    setResults(EMPTY);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (flatPeople.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatPeople.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectPerson(flatPeople[activeIndex]);
    }
  };

  const hasResults = results.people.length > 0 || results.posts.length > 0;
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 12px',
          borderRadius: '999px',
          border: '1px solid var(--color-dark-border)',
          background: 'var(--color-surface-elevated)',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
        }}
        className="global-search-box"
      >
        <Search size={16} style={{ color: 'var(--color-text-muted-light)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search people and posts…"
          aria-label="Search Engineering OS"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '0.85rem',
            color: 'var(--color-text-strong)',
            minWidth: 0,
          }}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults(EMPTY);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted-light)', display: 'flex', padding: 0 }}
          >
            <X size={15} />
          </button>
        ) : (
          <kbd
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: 'var(--color-text-muted-light)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '5px',
              padding: '1px 5px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {showDropdown && (
        <div
          className="global-search-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          {loading && !hasResults ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px' }}>
              {[0, 1, 2].map(n => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="skeleton-shimmer" style={{ width: '34px', height: '34px', borderRadius: '50%' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton-shimmer" style={{ width: '55%', height: '10px', borderRadius: '5px' }} />
                    <div className="skeleton-shimmer" style={{ width: '35%', height: '8px', borderRadius: '5px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasResults ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--color-text-muted-light)', fontSize: '0.85rem' }}>
              No people or posts match “{query.trim()}”.
            </div>
          ) : (
            <>
              {results.people.length > 0 && (
                <div style={{ padding: '8px 6px' }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '4px 10px' }}>
                    People
                  </div>
                  {results.people.map((person, idx) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => selectPerson(person)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeIndex === idx ? 'var(--color-primary-soft)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.12s ease',
                      }}
                    >
                      <Avatar name={person.full_name} avatarUrl={person.avatar_url} size={34} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {person.full_name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)', display: 'inline-flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <GraduationCap size={11} />
                          {person.role}{person.college ? ` · ${person.college}` : ''}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.posts.length > 0 && (
                <div style={{ padding: '8px 6px', borderTop: results.people.length > 0 ? '1px solid var(--color-dark-border)' : 'none' }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '4px 10px' }}>
                    Posts
                  </div>
                  {results.posts.map(post => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => selectPerson(post.author)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.12s ease',
                      }}
                      className="global-search-post"
                    >
                      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-text-muted-light)' }}>
                        <FileText size={16} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--color-text-strong)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.35,
                          }}
                        >
                          {post.content}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted-light)', marginTop: '2px' }}>
                          {post.author?.full_name ?? 'Unknown'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {loading && hasResults && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderTop: '1px solid var(--color-dark-border)' }}>
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
