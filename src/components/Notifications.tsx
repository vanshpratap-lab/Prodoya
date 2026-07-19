import { useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, Heart, Mail, Sparkles, Trash2, Users } from 'lucide-react';
import Avatar from './Avatar';
import type { NotificationView, NotificationCategory } from '../lib/hooks';

interface NotificationsProps {
  notifications: NotificationView[];
  loading: boolean;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

type FilterTab = 'all' | 'unread' | NotificationCategory;

const CATEGORY_META: Record<NotificationCategory, { label: string; icon: typeof Bell; color: string; bg: string }> = {
  community: { label: 'Community', icon: Heart, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
  network: { label: 'Network', icon: Users, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' },
  message: { label: 'Messages', icon: Mail, color: '#059669', bg: 'rgba(5, 150, 105, 0.08)' },
  ai: { label: 'AI', icon: Sparkles, color: 'var(--color-primary)', bg: 'var(--color-primary-soft)' },
  system: { label: 'System', icon: Bell, color: 'var(--color-text-muted-light)', bg: 'var(--color-surface-elevated)' },
};

function groupLabel(createdAt: string): 'Today' | 'Yesterday' | 'This week' | 'Earlier' {
  const then = new Date(createdAt);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(then)) / 86400000);
  if (dayDiff <= 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff < 7) return 'This week';
  return 'Earlier';
}

const GROUP_ORDER: Array<'Today' | 'Yesterday' | 'This week' | 'Earlier'> = ['Today', 'Yesterday', 'This week', 'Earlier'];

export default function Notifications({ notifications, loading, markRead, markAllRead, deleteNotification }: NotificationsProps) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  // Only show category tabs that actually have notifications — no empty shells.
  const presentCategories = useMemo(() => {
    const set = new Set<NotificationCategory>();
    notifications.forEach(n => set.add(n.category));
    return (Object.keys(CATEGORY_META) as NotificationCategory[]).filter(c => set.has(c));
  }, [notifications]);

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.category === filter);
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, NotificationView[]>();
    filtered.forEach(n => {
      const label = groupLabel(n.createdAt);
      const arr = map.get(label) ?? [];
      arr.push(n);
      map.set(label, arr);
    });
    return GROUP_ORDER.filter(g => map.has(g)).map(g => ({ label: g, items: map.get(g)! }));
  }, [filtered]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: '999px',
    border: active ? '1.5px solid var(--color-primary)' : '1px solid var(--color-dark-border)',
    background: active ? 'var(--color-primary-soft)' : 'var(--color-surface)',
    color: active ? 'var(--color-primary)' : 'var(--color-text-light)',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.18s ease',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '680px', margin: '0 auto', paddingBottom: '40px' }} className="anim-rise">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-text-strong)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bell size={22} style={{ color: 'var(--color-primary)' }} />
          Notifications
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-on-primary)',
                background: 'var(--color-primary)',
                borderRadius: '999px',
                padding: '2px 9px',
                letterSpacing: '0.3px',
              }}
            >
              {unreadCount} new
            </span>
          )}
        </h2>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '999px',
              border: '1px solid var(--color-dark-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-light)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            className="hover-lift"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" style={tabStyle(filter === 'all')} onClick={() => setFilter('all')}>
          All
          <span style={{ opacity: 0.65, fontWeight: 600 }}>{notifications.length}</span>
        </button>
        <button type="button" style={tabStyle(filter === 'unread')} onClick={() => setFilter('unread')}>
          Unread
          {unreadCount > 0 && <span style={{ opacity: 0.65, fontWeight: 600 }}>{unreadCount}</span>}
        </button>
        {presentCategories.map(cat => {
          const Meta = CATEGORY_META[cat];
          const Icon = Meta.icon;
          return (
            <button key={cat} type="button" style={tabStyle(filter === cat)} onClick={() => setFilter(cat)}>
              <Icon size={13} />
              {Meta.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      {loading ? (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
          }}
        >
          {[0, 1, 2, 3].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: n === 3 ? 'none' : '1px solid var(--color-dark-border)' }}>
              <div className="skeleton-shimmer" style={{ width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div className="skeleton-shimmer" style={{ width: '70%', height: '12px', borderRadius: '6px' }} />
                <div className="skeleton-shimmer" style={{ width: '30%', height: '9px', borderRadius: '6px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            padding: '64px 20px',
          }}
        >
          <div style={{ width: '68px', height: '68px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-soft)' }}>
            {filter === 'unread' ? <CheckCheck size={30} style={{ color: 'var(--color-primary)' }} /> : <Bell size={30} style={{ color: 'var(--color-primary)' }} />}
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
            {filter === 'unread' ? "You're all caught up" : 'Nothing here yet'}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted-light)', textAlign: 'center', maxWidth: '340px', lineHeight: 1.5 }}>
            {filter === 'unread'
              ? 'Every notification has been read. New applauds, comments, and messages will appear here live.'
              : 'When peers applaud, comment on, or repost your work — or message you — it shows up here in real time.'}
          </span>
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-text-muted-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                paddingLeft: '4px',
              }}
            >
              {group.label}
            </span>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              {group.items.map((notif, idx) => {
                const Meta = CATEGORY_META[notif.category];
                const Icon = Meta.icon;
                return (
                  <div
                    key={notif.id}
                    className="notif-row"
                    onClick={() => {
                      if (!notif.read) markRead(notif.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '15px 20px',
                      borderBottom: idx === group.items.length - 1 ? 'none' : '1px solid var(--color-dark-border)',
                      background: notif.read ? 'transparent' : 'var(--color-primary-soft)',
                      cursor: notif.read ? 'default' : 'pointer',
                      transition: 'background-color 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--color-primary)',
                        }}
                        aria-label="Unread"
                      />
                    )}

                    {/* Actor avatar with category badge, or category icon bubble */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {notif.actor ? (
                        <>
                          <Avatar name={notif.actor.name} avatarUrl={notif.actor.avatar} size={42} />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '-3px',
                              right: '-3px',
                              width: '19px',
                              height: '19px',
                              borderRadius: '50%',
                              background: Meta.bg,
                              border: '2px solid var(--color-surface)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: Meta.color,
                            }}
                          >
                            <Icon size={10} />
                          </span>
                        </>
                      ) : (
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: Meta.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: Meta.color,
                          }}
                        >
                          <Icon size={18} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-text-strong)', lineHeight: 1.45, fontWeight: notif.read ? 500 : 700 }}>
                        {notif.text}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted-light)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {notif.time}
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--color-text-muted-light)', display: 'inline-block' }} />
                        {Meta.label}
                      </span>
                    </div>

                    {/* Hover actions */}
                    <div className="notif-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            markRead(notif.id);
                          }}
                          aria-label="Mark as read"
                          title="Mark as read"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid var(--color-dark-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Check size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        aria-label="Delete notification"
                        title="Delete"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '1px solid var(--color-dark-border)',
                          background: 'var(--color-surface)',
                          color: 'var(--color-danger)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
