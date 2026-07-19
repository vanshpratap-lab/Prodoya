import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Plus,
  ArrowLeft,
  ArrowRight,
  Settings,
  GraduationCap,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';

interface Message {
  id: number;
  text: string;
  time: string;
  sender: 'incoming' | 'outgoing';
  senderName?: string;
  senderAvatar?: string;
  inlineButtons?: string[];
}

interface ChatItem {
  id: number;
  name: string;
  role: string;
  avatar: string;
  messages: Message[];
  badge?: string;
  badgeColor?: 'purple' | 'gray';
  subtext: string;
  avatarBg?: string;
  avatarText?: string;
  time: string;
  /** Set only for real 1-on-1 DMs. Null for public/community channels. */
  peerId: string | null;
}

interface PeerCard {
  id: string;
  name: string;
  role: string;
  college: string;
  avatar: string;
  connected: boolean;
}

interface ChatProps {
  chats: ChatItem[];
  selectedChatId: number;
  setSelectedChatId: (id: number) => void;
  typeMessage: string;
  setTypeMessage: (msg: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  currentUser: Profile;
  connections: PeerCard[];
  startDirectChat: (peerId: string) => Promise<number | null>;
}

export default function Chat({
  chats,
  selectedChatId,
  setSelectedChatId,
  typeMessage,
  setTypeMessage,
  handleSendMessage,
  currentUser,
  connections,
  startDirectChat,
}: ChatProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  // Real 1-on-1 DMs only — server-tagged via chats.peerId (public/community
  // channels have peerId === null and are excluded from this inbox).
  const mappedDMs = chats
    .filter((c): c is ChatItem & { peerId: string } => c.peerId !== null)
    .map(c => {
      const peer = connections.find(p => p.id === c.peerId);
      return {
        ...c,
        name: peer?.name ?? c.name,
        avatar: peer?.avatar ?? c.avatar,
        connected: peer?.connected ?? false,
      };
    });

  // Select active chat fallback to first active DM, or null if empty
  const activeChat = mappedDMs.find(c => c.id === selectedChatId) || mappedDMs[0] || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Open (or create) a private DM with a connected peer. Server-enforced:
  // only works between users who are actually connected.
  const handleSelectPeerForChat = async (peer: PeerCard) => {
    const existing = mappedDMs.find(dm => dm.peerId === peer.id);
    if (existing) {
      setSelectedChatId(existing.id);
      setLocalSearch('');
      return;
    }
    setStartingChat(true);
    try {
      const chatId = await startDirectChat(peer.id);
      if (chatId) setSelectedChatId(chatId);
    } finally {
      setStartingChat(false);
      setLocalSearch('');
    }
  };

  // Chat item DMs shown when search is empty: DMs with connected peers
  const defaultChats = mappedDMs.filter(dm => dm.connected);

  // Connected peers who do not have a DM channel yet
  const availablePeers = connections.filter(p => 
    p.connected && 
    !mappedDMs.some(dm => dm.peerId === p.id)
  );

  // Chats matching search query
  const searchedActiveChats = localSearch.trim()
    ? mappedDMs.filter(dm => dm.name.toLowerCase().includes(localSearch.toLowerCase()))
    : [];

  // Peers from connections matching search query who don't have an active chat yet
  const searchedPeersToStart = localSearch.trim()
    ? connections.filter(p => 
        p.name.toLowerCase().includes(localSearch.toLowerCase()) && 
        !mappedDMs.some(dm => dm.peerId === p.id)
      )
    : [];



  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `310px 1fr ${showRightSidebar ? '330px' : '0px'}`,
      height: '100%',
      width: '100%',
      background: '#f0f2f5',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid var(--color-dark-border)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'grid-template-columns 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    }}>
      
      {/* COLUMN 1: LEFT CHAT LIST & USER PROFILE CARD */}
      <div style={{
        background: '#ffffff',
        borderRight: '1px solid var(--color-dark-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px 16px',
        gap: '16px'
      }}>
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{
              background: '#f1f3f5',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-muted-light)'
            }}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-strong)', margin: 0 }}>
              Chat
            </h2>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted-light)', cursor: 'pointer' }}>
            <Settings size={18} />
          </button>
        </div>

        {/* User Profile Block */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '8px',
          padding: '12px 0',
          borderBottom: '1px solid #f1f3f5'
        }}>
          <Avatar name={currentUser.full_name} avatarUrl={currentUser.avatar_url} size={72} />
          <div style={{ marginTop: '2px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-strong)', margin: 0 }}>
              {currentUser.full_name}
            </h3>
            {/* Available Dropdown button pill */}
            <div style={{
              background: '#d4edda',
              color: '#155724',
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '6px',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#28a745' }} />
              <span>available</span>
              <span style={{ fontSize: '0.62rem', marginLeft: '2px' }}>▼</span>
            </div>
          </div>
        </div>

        {/* Search input bar */}
        <div style={{
          background: '#f1f3f5',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          gap: '8px'
        }}>
          <Search size={16} style={{ color: 'var(--color-text-muted-light)' }} />
          <input 
            type="text" 
            placeholder="Search name" 
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              width: '100%',
              color: 'var(--color-text-light)'
            }}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        {startingChat && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted-light)', padding: '0 2px' }}>
            <Loader2 size={13} className="animate-spin" />
            Starting conversation…
          </div>
        )}

        {/* Last chats header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted-light)', letterSpacing: '0.5px' }}>
            {localSearch.trim() ? 'Search Results' : 'Last chats'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{
              background: '#e3faf2',
              color: '#0ca678',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Plus size={14} />
            </button>
            <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted-light)', cursor: 'pointer' }}>
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Chats list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          margin: '0 -8px',
          padding: '0 8px'
        }}>
          {!localSearch.trim() ? (
            /* DEFAULT LIST: DM threads with connected users + available connected peers */
            <>
              {defaultChats.map(chat => {
                const isSelected = chat.id === selectedChatId;
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <div 
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-primary-soft)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Avatar name={chat.name} avatarUrl={chat.avatar} size={42} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.name}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          {chat.time}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '0.76rem', 
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted-light)', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        marginTop: '2px' 
                      }}>
                        {lastMsg ? lastMsg.text : chat.subtext}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Available connected peers to start new chat */}
              {availablePeers.length > 0 && (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', padding: '14px 12px 6px 12px', textAlign: 'left' }}>
                    Available to Chat
                  </div>
                  {availablePeers.map(peer => (
                    <div 
                      key={peer.id}
                      onClick={() => handleSelectPeerForChat(peer)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f1f3f5'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Avatar name={peer.name} avatarUrl={peer.avatar} size={42} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                          {peer.name}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {peer.role || 'Peer Developer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {defaultChats.length === 0 && availablePeers.length === 0 && (
                <div style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--color-text-muted-light)', fontSize: '0.82rem' }}>
                  No DMs with connected peers yet. Search their name above to start chatting!
                </div>
              )}
            </>
          ) : (
            /* SEARCH MODE: Search matching DMs + Search matching unconnected/connected peers */
            <>
              {/* Searched DMs */}
              {searchedActiveChats.map(chat => {
                const isSelected = chat.id === selectedChatId;
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <div 
                    key={chat.id}
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      setLocalSearch('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-primary-soft)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Avatar name={chat.name} avatarUrl={chat.avatar} size={42} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                        {chat.name}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {lastMsg ? lastMsg.text : chat.subtext}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Searched peers in network to start new chat */}
              {searchedPeersToStart.length > 0 && (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', padding: '10px 12px 4px 12px', textAlign: 'left' }}>
                    Network Peers
                  </div>
                  {searchedPeersToStart.map(peer => (
                    <div 
                      key={peer.id}
                      onClick={() => handleSelectPeerForChat(peer)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f1f3f5'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Avatar name={peer.name} avatarUrl={peer.avatar} size={42} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                          {peer.name}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {peer.role || 'Peer Developer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {searchedActiveChats.length === 0 && searchedPeersToStart.length === 0 && (
                <div style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--color-text-muted-light)', fontSize: '0.82rem' }}>
                  No peers match "{localSearch}"
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* COLUMN 2: MIDDLE CHAT WINDOW WINDOW */}
      <div style={{
        background: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}>
        {!activeChat ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            background: '#f8f9fa',
            height: '100%'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '360px',
              margin: 'auto'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8a8d91'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-strong)', margin: 0 }}>
                No conversation selected
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted-light)', margin: 0, lineHeight: '1.5' }}>
                Select a connected peer or search their name on the left sidebar to start messaging.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Window Header */}
            <div style={{
              height: '60px',
              background: '#ffffff',
              borderBottom: '1px solid var(--color-dark-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              zIndex: 10
            }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-strong)', margin: 0 }}>
              {activeChat.name}
            </h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>
              Direct message
            </span>
          </div>
        </div>

        {/* Message Thread Scroll View */}
        <div 
          ref={threadContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {activeChat.messages.map(msg => {
            const isOutgoing = msg.sender === 'outgoing';
            return (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '10px',
                  width: '100%'
                }}
              >
                {!isOutgoing && (
                  <Avatar name={msg.senderName || activeChat.name} avatarUrl={msg.senderAvatar || activeChat.avatar} size={36} />
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '65%', gap: '4px' }}>
                  {/* Sender Name + Time above bubbles */}
                  <span style={{ 
                    fontSize: '0.68rem', 
                    color: 'var(--color-text-muted-light)', 
                    alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                    padding: '0 4px'
                  }}>
                    {isOutgoing ? `You, ${msg.time}` : `${msg.senderName || activeChat.name}, ${msg.time}`}
                  </span>
                  
                  {/* Bubble card */}
                  <div style={{
                    background: isOutgoing ? '#eef0f6' : '#ffffff',
                    border: isOutgoing ? 'none' : '1px solid var(--color-dark-border)',
                    color: 'var(--color-text-light)',
                    borderRadius: isOutgoing ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                    padding: '12px 16px',
                    fontSize: '0.86rem',
                    lineHeight: '1.4',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                    textAlign: 'left'
                  }}>
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input area bar at the bottom */}
        <form 
          onSubmit={handleSendMessage}
          style={{
            padding: '16px 24px',
            background: '#ffffff',
            borderTop: '1px solid var(--color-dark-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{
            flex: 1,
            background: '#f1f3f5',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            padding: '6px 16px',
            gap: '10px'
          }}>
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted-light)', cursor: 'pointer', display: 'flex' }}
              onClick={() => setTypeMessage(typeMessage + ' 😊')}
            >
              <Smile size={20} />
            </button>
            <input 
              type="text" 
              placeholder="Write your message..." 
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '0.88rem',
                width: '100%',
                color: 'var(--color-text-light)'
              }}
              value={typeMessage}
              onChange={(e) => setTypeMessage(e.target.value)}
            />
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted-light)', cursor: 'pointer', display: 'flex' }}
            >
              <Paperclip size={20} />
            </button>
          </div>

          <button 
            type="submit" 
            style={{
              background: '#0ca678',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Send size={16} />
          </button>
        </form>

        {/* Small floating right sidebar toggler */}
        {!showRightSidebar && (
          <button 
            onClick={() => setShowRightSidebar(true)}
            style={{
              position: 'absolute',
              top: '14px',
              right: '20px',
              background: '#ffffff',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 20
            }}
          >
            <ArrowLeft size={14} />
          </button>
        )}
          </>
        )}
      </div>

      {/* COLUMN 3: RIGHT SIDEBAR — REAL PEER INFO (not a mock file browser) */}
      {showRightSidebar && activeChat && (
        <div style={{
          background: '#ffffff',
          borderLeft: '1px solid var(--color-dark-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '20px 16px',
          gap: '20px',
          overflowY: 'auto'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowRightSidebar(false)}
              style={{
                background: '#f1f3f5',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text-muted-light)'
              }}
            >
              <ArrowRight size={16} />
            </button>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-strong)', margin: 0 }}>
              About
            </h2>
          </div>

          {(() => {
            const peer = connections.find(p => p.id === activeChat.peerId);
            return (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '10px',
                padding: '8px 0'
              }}>
                <Avatar name={activeChat.name} avatarUrl={activeChat.avatar} size={82} />
                <div style={{ marginTop: '2px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-strong)', margin: 0 }}>
                    {activeChat.name}
                  </h3>
                  {peer?.role && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted-light)' }}>
                      {peer.role}
                    </span>
                  )}
                </div>
                {peer?.college && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--color-text-muted-light)' }}>
                    <GraduationCap size={13} />
                    {peer.college}
                  </div>
                )}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    marginTop: '4px',
                    background: peer?.connected ? '#d4edda' : '#f1f3f5',
                    color: peer?.connected ? '#155724' : 'var(--color-text-muted-light)',
                  }}
                >
                  {peer?.connected ? <UserCheck size={12} /> : <UserX size={12} />}
                  {peer?.connected ? 'Connected' : 'Not connected'}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
