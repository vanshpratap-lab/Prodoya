import { Bell, Sparkles, TrendingUp, Heart } from 'lucide-react';

interface NotificationItem {
  id: number;
  icon: string;
  text: string;
  time: string;
}

interface NotificationsProps {
  notifications: NotificationItem[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  const getLucideIcon = (emojiIcon: string) => {
    switch (emojiIcon) {
      case '🤖': return <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />;
      case '📈': return <TrendingUp size={18} style={{ color: '#059669' }} />;
      case '🤝': return <Heart size={18} style={{ color: '#2563eb' }} />;
      default: return <Bell size={18} style={{ color: 'var(--color-text-muted-light)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-text-strong)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bell size={22} style={{ color: 'var(--color-primary)' }} />
          Notifications
        </h2>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}
      >
        {notifications.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '60px 20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-soft)' }}>
              <Bell size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted-light)' }}>You're all caught up — no notifications yet.</span>
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <div
              key={notif.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '16px 20px',
                borderBottom: idx === notifications.length - 1 ? 'none' : '1px solid var(--color-dark-border)',
                transition: 'background-color 0.15s ease',
              }}
              className="notification-page-row"
            >
              <div
                style={{
                  backgroundColor: 'var(--color-primary-soft)',
                  padding: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getLucideIcon(notif.icon)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-strong)', lineHeight: 1.4 }}>{notif.text}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted-light)' }}>{notif.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
