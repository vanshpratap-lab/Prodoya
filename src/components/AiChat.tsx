import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Loader2, Plus, Search, MessageSquare, Send, Paperclip } from 'lucide-react';
import { api } from '../lib/api';
import type { Profile } from '../lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}

interface AiChatProps {
  currentUser: Profile;
  sidebarOpen: boolean;
}

export default function AiChat({ currentUser, sidebarOpen }: AiChatProps) {
  const storageKey = `ai-convos-${currentUser.id}`;
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as Conversation[];
    } catch {
      /* ignore */
    }
    return [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find(c => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const hasStarted = messages.length > 0;

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    } catch {
      /* ignore */
    }
  }, [conversations, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const newChat = () => {
    setActiveId(null);
    setInput('');
    setError(null);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);

    let convId = activeId;
    let baseMessages: ChatMessage[] = messages;
    const wasNew = !convId;

    if (!convId) {
      convId = crypto.randomUUID();
      const conv: Conversation = { id: convId, title: trimmed.slice(0, 42), messages: [] };
      setConversations(prev => [conv, ...prev]);
      setActiveId(convId);
      baseMessages = [];
    }

    const nextMessages: ChatMessage[] = [...baseMessages, { role: 'user', content: trimmed }];
    const cid = convId;
    setConversations(prev => prev.map(c => (c.id === cid ? { ...c, messages: nextMessages } : c)));
    setInput('');
    setSending(true);

    try {
      const { reply } = await api.post<{ reply: string }>('/ai_chat', { messages: nextMessages });
      if (!reply) throw new Error('No reply');
      setConversations(prev =>
        prev.map(c => (c.id === cid ? { ...c, messages: [...nextMessages, { role: 'assistant', content: reply || 'I could not generate a response.' }] } : c)),
      );
    } catch (err) {
      // Roll back on failure so the user can retry.
      if (wasNew) {
        setConversations(prev => prev.filter(c => c.id !== cid));
        setActiveId(null);
      } else {
        setConversations(prev => prev.map(c => (c.id === cid ? { ...c, messages: baseMessages } : c)));
      }
      setInput(trimmed);
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'The AI assistant is not available yet. Set ANTHROPIC_API_KEY on the Rails server.',
      );
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const filteredConvos = conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const inputBox = (centered: boolean) => (
    <div style={{ position: 'relative', width: '100%', maxWidth: '720px', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
      {/* Peach glow left */}
      <div style={{
        position: 'absolute',
        left: '12%',
        top: '-20px',
        width: '180px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255, 127, 80, 0.18)',
        filter: 'blur(45px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      {/* Light blue glow right */}
      <div style={{
        position: 'absolute',
        right: '12%',
        top: '-20px',
        width: '180px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(100, 149, 237, 0.22)',
        filter: 'blur(45px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Main glass input form */}
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(147, 112, 219, 0.28)',
          borderRadius: '24px',
          padding: '20px 20px 14px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask anything"
          rows={centered ? 2 : 1}
          style={{
            flex: 1,
            resize: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#1a1d20',
            fontSize: '0.96rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            lineHeight: 1.5,
            maxHeight: '180px',
          }}
        />

        {/* Action Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px'
        }}>
          {/* Left Buttons Row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Paperclip Attachment button */}
            <button
              type="button"
              onClick={() => alert('Attachments triggered')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                background: '#ffffff',
                color: '#343a40',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f3f5'}
              onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <Paperclip size={14} />
            </button>

            {/* Plus button */}
            <button
              type="button"
              onClick={() => alert('Add tool triggered')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                background: '#ffffff',
                color: '#343a40',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f3f5'}
              onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Right Button: Send or Voice input */}
          <button
            type="submit"
            disabled={sending}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              background: input.trim() && !sending ? 'var(--color-primary)' : '#ffffff',
              color: input.trim() && !sending ? 'var(--color-on-primary)' : '#343a40',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!input.trim() || sending) {
                e.currentTarget.style.background = '#f1f3f5';
              }
            }}
            onMouseOut={(e) => {
              if (!input.trim() || sending) {
                e.currentTarget.style.background = '#ffffff';
              }
            }}
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : input.trim() ? (
              <Send size={13} />
            ) : (
              /* Custom dynamic waveform SVG */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="9" x2="4" y2="15" />
                <line x1="9" y1="6" x2="9" y2="18" />
                <line x1="14" y1="4" x2="14" y2="20" />
                <line x1="19" y1="8" x2="19" y2="16" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 72px)', background: 'var(--color-bg-home)' }}>
      {/* AI conversation sidebar (toggled by the top-bar hamburger, AI page only) */}
      <aside
        style={{
          width: '264px',
          flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-dark-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          gap: '12px',
          overflow: 'hidden',
          marginLeft: sidebarOpen ? 0 : '-265px',
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          transition: 'margin-left 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s ease',
        }}
      >
          <button
            type="button"
            onClick={newChat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid var(--color-dark-border)',
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text-strong)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            New chat
          </button>

          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted-light)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats"
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '10px',
                border: '1px solid var(--color-dark-border)',
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text-light)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 6px' }}>
            Previous chats
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', flex: 1 }}>
            {filteredConvos.length === 0 ? (
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted-light)', padding: '6px' }}>No conversations yet.</span>
            ) : (
              filteredConvos.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setActiveId(c.id); setError(null); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: c.id === activeId ? 'var(--color-primary-soft)' : 'transparent',
                    color: c.id === activeId ? 'var(--color-primary)' : 'var(--color-text-light)',
                    fontSize: '0.85rem',
                    fontWeight: c.id === activeId ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <MessageSquare size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                </button>
              ))
            )}
          </div>
      </aside>

      {/* Main chat column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
        {!hasStarted ? (
          <div
            style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              padding: '0 20px',
              animation: 'fadeIn 0.4s ease',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ color: 'var(--color-text-strong)', fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: 0, textAlign: 'center' }}>
                Hi {currentUser.full_name.split(' ')[0]}, ask the network anything
              </h1>
            </div>

            {inputBox(true)}

            {/* Centered Send message button under typing bar */}
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim() || sending}
              style={{
                background: input.trim() && !sending ? '#000000' : '#e9ecef',
                color: input.trim() && !sending ? '#ffffff' : '#8a8d91',
                border: 'none',
                borderRadius: '16px',
                padding: '10px 24px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: input.trim() && !sending ? 'pointer' : 'default',
                transition: 'opacity 0.2s',
                boxShadow: input.trim() && !sending ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseOver={(e) => {
                if (input.trim() && !sending) e.currentTarget.style.opacity = '0.85';
              }}
              onMouseOut={(e) => {
                if (input.trim() && !sending) e.currentTarget.style.opacity = '1';
              }}
            >
              Send message
            </button>

            {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.82rem', maxWidth: '620px', textAlign: 'center', marginTop: '-6px' }}>{error}</div>}
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                width: '100%',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '28px 20px 20px',
              }}
            >
              <div style={{ width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: m.role === 'user' ? '78%' : '100%',
                        background: m.role === 'user' ? 'var(--color-primary)' : 'transparent',
                        color: m.role === 'user' ? 'var(--color-on-primary)' : 'var(--color-text-strong)',
                        padding: m.role === 'user' ? '11px 15px' : '2px 0',
                        borderRadius: '16px',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted-light)', fontSize: '0.9rem' }}>
                    <Loader2 size={16} className="animate-spin" />
                    Thinking…
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px 22px',
                animation: 'slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.82rem', maxWidth: '720px', textAlign: 'center' }}>{error}</div>}
              {inputBox(false)}
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim() || sending}
                style={{
                  background: input.trim() && !sending ? '#000000' : '#e9ecef',
                  color: input.trim() && !sending ? '#ffffff' : '#8a8d91',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '8px 20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: input.trim() && !sending ? 'pointer' : 'default',
                  transition: 'opacity 0.2s',
                  boxShadow: input.trim() && !sending ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (input.trim() && !sending) e.currentTarget.style.opacity = '0.85';
                }}
                onMouseOut={(e) => {
                  if (input.trim() && !sending) e.currentTarget.style.opacity = '1';
                }}
              >
                Send message
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
