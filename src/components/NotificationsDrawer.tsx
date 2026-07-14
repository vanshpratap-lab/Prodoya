import { X, Bell, Sparkles, TrendingUp, Heart } from 'lucide-react';

interface NotificationItem {
  id: number;
  icon: string;
  text: string;
  time: string;
}

interface NotificationsDrawerProps {
  notifications: NotificationItem[];
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
}

export default function NotificationsDrawer({
  notifications,
  notificationsOpen,
  setNotificationsOpen,
}: NotificationsDrawerProps) {
  
  const getLucideIcon = (emojiIcon: string) => {
    switch (emojiIcon) {
      case '🤖': return <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />;
      case '📈': return <TrendingUp size={16} style={{ color: '#059669' }} />;
      case '🤝': return <Heart size={16} style={{ color: '#2563eb' }} />;
      default: return <Bell size={16} style={{ color: 'var(--color-text-muted-light)' }} />;
    }
  };

  return (
    <>
      <div 
        className={`notifications-backdrop ${notificationsOpen ? 'active' : ''}`}
        onClick={() => setNotificationsOpen(false)}
        style={{
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      ></div>
      <div 
        className={`notifications-overlay ${notificationsOpen ? 'active' : ''}`}
        style={{
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="notifications-header">
          <h2 className="notifications-title" style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} style={{ color: 'var(--color-primary)' }} />
            Workspace Alerts
          </h2>
          <button 
            className="notifications-close-btn"
            onClick={() => setNotificationsOpen(false)}
            type="button"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close notifications"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="notifications-list">
          {notifications.map(notif => (
            <div className="notification-item" key={notif.id}>
              <div
                style={{
                  backgroundColor: 'var(--color-primary-soft)',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getLucideIcon(notif.icon)}
              </div>
              <div className="notification-content-box">
                <span className="notification-text">{notif.text}</span>
                <span className="notification-time">{notif.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
