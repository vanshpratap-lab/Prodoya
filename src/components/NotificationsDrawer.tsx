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
      case '🤖': return <Sparkles size={16} className="text-purple-400" />;
      case '📈': return <TrendingUp size={16} className="text-emerald-400" />;
      case '🤝': return <Heart size={16} className="text-blue-400" />;
      default: return <Bell size={16} className="text-gray-400" />;
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
            <Bell size={20} className="text-purple-400" />
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
                  backgroundColor: 'rgba(255,255,255,0.05)', 
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
