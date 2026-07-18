import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import Avatar from './Avatar';
import type { PeerCard } from '../lib/hooks';

interface RightSidebarProps {
  connections: PeerCard[];
  handleToggleConnect: (id: string) => void;
  activeTab?: 'home' | 'network' | 'rank' | 'messages' | 'profile' | 'activity' | 'notifications' | 'ai';
  setActiveTab: (tab: 'home' | 'network' | 'rank' | 'messages' | 'profile' | 'activity' | 'notifications' | 'ai') => void;
}

export default function RightSidebar({
  connections,
  handleToggleConnect,
  activeTab: _activeTab,
  setActiveTab
}: RightSidebarProps) {
  const [showModal, setShowModal] = useState(false);

  // Filter connected vs non-connected peers
  const connectedPeers = connections.filter(c => c.connected);
  const suggestedPeers = connections.filter(c => !c.connected).slice(0, 5);

  // Overlapping avatar stack from connected peers
  const followerStack = connectedPeers.slice(0, 6);

  return (
    <aside className="right-sidebar-container" style={{
      width: '340px',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      background: 'var(--color-bg-home)',
      borderLeft: '1px solid var(--color-dark-border)',
      overflowY: 'auto',
      height: '100%',
      flexShrink: 0
    }}>
      {/* Suggestions for you Widget */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
            Suggestions for you
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {suggestedPeers.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)' }}>No suggested peers</span>
          ) : (
            suggestedPeers.map(peer => (
              <div key={peer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={peer.name} avatarUrl={peer.avatar} size={38} />
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                      {peer.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {peer.college || peer.role}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleConnect(peer.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)'
                  }}
                  className="peer-follow-btn"
                  title="Add Peer"
                >
                  <UserPlus size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {connections.filter(c => !c.connected).length > 5 && (
          <button
            type="button"
            onClick={() => setActiveTab('network')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              padding: 0
            }}
          >
            View All
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--color-dark-border)' }} />

      {/* 3. Follower Activity Widget (Converts inline on click) */}
      <div 
        onClick={() => {
          if (!showModal) setShowModal(true);
        }}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '24px',
          padding: showModal ? '20px 16px' : '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: showModal ? '18px' : '12px',
          boxShadow: 'var(--shadow-sm)',
          cursor: !showModal ? 'pointer' : 'default',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseOver={(e) => {
          if (!showModal) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }
        }}
        onMouseOut={(e) => {
          if (!showModal) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }
        }}
      >
        {!showModal ? (
          /* Collapsed Content */
          <>
            {/* Overlapping circle avatar stack */}
            {followerStack.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', paddingLeft: '12px' }}>
                {followerStack.map((f, idx) => (
                  <div key={f.id} style={{
                    marginLeft: idx === 0 ? '0px' : '-12px',
                    border: '2px solid var(--color-surface)',
                    borderRadius: '50%',
                    position: 'relative',
                    zIndex: 10 - idx
                  }}>
                    <Avatar name={f.name} avatarUrl={f.avatar} size={32} />
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-strong)', display: 'block' }}>
                {connectedPeers.length > 0 ? `${connectedPeers.length} Peers` : 'Build connections'}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted-light)', marginTop: '2px', display: 'block' }}>
                Active now in your network
              </span>
            </div>
          </>
        ) : (
          /* Expanded Content (Inline Conversion) */
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '18px',
            animation: 'scaleFromTop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Header bar with close button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '100%',
              margin: '-4px -4px 0 0'
            }}>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8a8d91',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#050505'}
                onMouseOut={(e) => e.currentTarget.style.color = '#8a8d91'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Overlapping avatars rows */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
              width: '100%'
            }}>
              {/* Real connected peers, up to 7, split across two overlapping rows */}
              {connectedPeers.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)', padding: '8px 0' }}>
                  You haven't connected with anyone yet.
                </span>
              ) : (
                [connectedPeers.slice(0, 4), connectedPeers.slice(4, 7)]
                  .filter(row => row.length > 0)
                  .map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        paddingLeft: '14px',
                      }}
                    >
                      {row.map((peer, idx) => (
                        <div key={peer.id} style={{
                          borderRadius: '50%',
                          border: '3px solid #ffffff',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.10)',
                          width: '60px',
                          height: '60px',
                          marginLeft: idx === 0 ? '0px' : '-14px',
                          zIndex: 10 - idx,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fff'
                        }}>
                          <Avatar name={peer.name} avatarUrl={peer.avatar} size={54} />
                        </div>
                      ))}
                    </div>
                  ))
              )}
            </div>

            {/* Bottom solid black pill button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(false);
                setActiveTab('network');
              }}
              style={{
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px',
                height: '42px',
                width: '100%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 700,
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              View all peers
            </button>
          </div>
        )}
      </div>

      {/* Footer metadata links */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px 14px',
        fontSize: '0.74rem',
        color: 'var(--color-text-muted-light)',
        paddingTop: '20px'
      }}>
        <a href="#about" style={{ textDecoration: 'none', color: 'inherit' }}>About</a>
        <a href="#accessibility" style={{ textDecoration: 'none', color: 'inherit' }}>Accessibility</a>
        <a href="#help" style={{ textDecoration: 'none', color: 'inherit' }}>Help Center</a>
        <a href="#privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy & Terms</a>
        <a href="#advertising" style={{ textDecoration: 'none', color: 'inherit' }}>Advertising</a>
      </div>
    </aside>
  );
}
