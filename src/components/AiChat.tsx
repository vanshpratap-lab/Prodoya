import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Sparkles, ArrowUp, Loader2, Plus, Search, MessageSquare } from 'lucide-react';
import { supabase, type Profile } from '../lib/supabase';

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

const SUGGESTIONS = [
  'Who has the highest proof-of-work score right now?',
  'Find engineers who work with AI/ML.',
  'Summarize what people are building this week.',
  'Who should I connect with for a web-dev project?',
];

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
      const { data, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: { messages: nextMessages },
      });
      if (fnError) throw fnError;
      const reply = (data as { reply?: string })?.reply?.trim();
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
          : 'The AI assistant is not available yet. Add your ANTHROPIC_API_KEY to the Supabase project secrets.',
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
    <form
      onSubmit={onSubmit}
      style={{
        width: '100%',
        maxWidth: '720px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-dark-border)',
        borderRadius: '20px',
        padding: '16px 16px 12px',
        minHeight: centered ? '112px' : undefined,
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
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
        placeholder="Ask anything about the network…"
        rows={centered ? 2 : 1}
        style={{
          flex: 1,
          resize: 'none',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--color-text-strong)',
          fontSize: '1rem',
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.5,
          maxHeight: '180px',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Send message"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: input.trim() && !sending ? 'none' : '1px solid var(--color-dark-border)',
            background: input.trim() && !sending ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
            color: input.trim() && !sending ? 'var(--color-on-primary)' : 'var(--color-text-muted-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !sending ? 'pointer' : 'default',
            transition: 'background 0.2s ease',
          }}
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
        </button>
      </div>
    </form>
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
              gap: '28px',
              padding: '0 20px',
              animation: 'fadeIn 0.4s ease',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={26} style={{ color: '#fff' }} />
              </div>
              <h1 style={{ color: 'var(--color-text-strong)', fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: 0, textAlign: 'center' }}>
                Hi {currentUser.full_name.split(' ')[0]}, ask the network anything
              </h1>
            </div>

            {inputBox(true)}

            {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.82rem', maxWidth: '620px', textAlign: 'center', marginTop: '-14px' }}>{error}</div>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '720px' }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    color: 'var(--color-text-light)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
