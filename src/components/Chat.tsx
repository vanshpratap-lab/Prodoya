import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, Pin, ArrowDown, Plus } from 'lucide-react';
import Avatar from './Avatar';

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
}

interface ChatProps {
  chats: ChatItem[];
  selectedChatId: number;
  setSelectedChatId: (id: number) => void;
  typeMessage: string;
  setTypeMessage: (msg: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

export default function Chat({
  chats,
  selectedChatId,
  setSelectedChatId,
  typeMessage,
  setTypeMessage,
  handleSendMessage,
}: ChatProps) {
  const activeChat = chats.find(c => c.id === selectedChatId) || chats[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadContainerRef = useRef<HTMLDivElement>(null);
  
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages]);

  // Monitor scroll height to toggle the scroll-to-bottom button
  const handleScroll = () => {
    if (!threadContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = threadContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 300) {
      setShowScrollBtn(true);
    } else {
      setShowScrollBtn(false);
    }
  };

  // Typing indicator trigger when user starts writing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypeMessage(e.target.value);
    if (e.target.value.trim().length > 0) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  };

  // Filtered chats based on search
  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(localSearch.toLowerCase()) || 
    c.subtext.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <div className="chat-layout-container">
      {/* Chat Sidebar Panel */}
      <div className="telegram-chat-panel">
        <div className="tg-search-bar-row">
          <button className="tg-hamburger-btn" type="button" aria-label="Menu">
            <Search size={16} />
          </button>
          <div className="tg-search-input-wrapper">
            <Search size={14} className="tg-search-icon" />
            <input 
              type="text" 
              placeholder="Search channels..." 
              className="tg-search-input" 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              aria-label="Search chats"
            />
          </div>
        </div>

        <div className="tg-chat-list">
          {filteredChats.length === 0 ? (
            <div className="tg-no-results">
              <Search size={24} className="text-gray-600" />
              <p>No channels found</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div 
                className={`tg-chat-item ${chat.id === selectedChatId ? 'active' : ''}`}
                key={chat.id}
                onClick={() => {
                  setSelectedChatId(chat.id);
                  setIsTyping(false);
                }}
              >
                <div className="tg-chat-avatar" style={{ width: '48px', height: '48px', position: 'relative' }}>
                  <Avatar name={chat.name} avatarUrl={chat.avatar} size={48} />
                </div>
                <div className="tg-chat-details">
                  <div className="tg-chat-header">
                    <span className="tg-chat-name">{chat.name}</span>
                    <span className="tg-chat-time">{chat.time}</span>
                  </div>
                  <div className="tg-chat-footer">
                    <span className="tg-chat-preview">
                      {chat.messages[chat.messages.length - 1]?.text || chat.subtext}
                    </span>
                    {chat.badge && (
                      <span className={`tg-chat-badge ${chat.badgeColor || 'gray'}`}>
                        {chat.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          className="tg-pencil-fab" 
          type="button" 
          onClick={() => alert('New chat creation triggered!')}
          aria-label="Create new conversation"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Chat Window Main */}
      <div className="chat-window-main telegram-window relative">
        <div className="tg-window-header">
          <div className="tg-header-info">
            <div className="chat-user-avatar">
              <Avatar name={activeChat.name} avatarUrl={activeChat.avatar} size={40} />
            </div>
            <div className="tg-header-details">
              <div className="tg-header-title">{activeChat.name}</div>
              <div className="tg-header-subtitle">
                {activeChat.id === 1 ? '7 active developers' : 'Online'}
              </div>
            </div>
          </div>
          <div className="tg-header-actions">
            <button className="tg-header-action-btn" type="button" aria-label="Search messages"><Search size={16} /></button>
            <button className="tg-header-action-btn" type="button" aria-label="Options"><MoreVertical size={16} /></button>
          </div>
        </div>

        <div className="tg-pinned-bar">
          <div className="tg-pinned-content">
            <Pin size={13} style={{ transform: 'rotate(45deg)', marginRight: '6px' }} /> 
            <strong>Pinned Announcement:</strong> Collaborators must sync their GitHub repos before midnight!
          </div>
          <button className="tg-pinned-close-btn" type="button" onClick={() => alert('Pinned announcement dismissed')} aria-label="Dismiss pin">✕</button>
        </div>

        {/* Message Thread Scroll View */}
        <div 
          className="tg-messages-thread flex-grow"
          ref={threadContainerRef}
          onScroll={handleScroll}
        >
          {activeChat.messages.map(msg => {
            const isOutgoing = msg.sender === 'outgoing';
            return (
              <div className={`tg-msg-row ${isOutgoing ? 'outgoing' : ''}`} key={msg.id}>
                {!isOutgoing && (
                  <div className="tg-msg-avatar">
                    <Avatar name={msg.senderName || activeChat.name} avatarUrl={msg.senderAvatar || activeChat.avatar} size={36} />
                  </div>
                )}
                
                <div className="tg-msg-bubble-container">
                  <div 
                    className="tg-msg-bubble"
                    style={{
                      /* WCAG AA High Contrast alignment (more solid purple background) */
                      backgroundColor: isOutgoing ? '#8b5cf6' : 'rgba(30, 30, 30, 0.95)',
                      borderColor: isOutgoing ? 'transparent' : 'rgba(255, 255, 255, 0.04)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    {!isOutgoing && msg.senderName && (
                      <span className="tg-msg-sender-name" style={{ 
                        color: msg.senderName.includes('Blaze') ? '#a78bfa' : (msg.senderName.includes('SangMata') ? '#60a5fa' : '#fb7185')
                      }}>
                        {msg.senderName}
                      </span>
                    )}
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    <div className="tg-msg-meta">
                      <span>{msg.time}</span>
                      {isOutgoing && <span style={{ color: '#c084fc', marginLeft: '4px' }}>✓✓</span>}
                    </div>
                  </div>

                  {msg.inlineButtons && msg.inlineButtons.length > 0 && (
                    <div className="tg-inline-buttons-grid">
                      {msg.inlineButtons.map((btnText, idx) => (
                        <button 
                          key={idx} 
                          type="button" 
                          className="tg-inline-btn"
                          onClick={() => alert(`Triggered option: ${btnText}`)}
                        >
                          {btnText}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="tg-msg-row">
              <div className="tg-msg-avatar">
                <Avatar name="Emma Watson" avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" size={36} />
              </div>
              <div className="tg-msg-bubble-container">
                <div className="tg-msg-bubble bg-black/40 border border-white/5 py-2 px-3 text-xs text-gray-400">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Float Scroll to Bottom Button */}
        {showScrollBtn && (
          <button 
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-20 right-6 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2.5 shadow-lg flex items-center justify-center transition-transform hover:scale-105 border-none cursor-pointer"
            style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#121214',
              border: 'none',
              cursor: 'pointer',
              bottom: '76px',
              right: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={18} />
          </button>
        )}

        <form className="tg-input-bar-container" onSubmit={(e) => {
          handleSendMessage(e);
          setIsTyping(false);
        }}>
          <button className="tg-attachment-btn" type="button" onClick={() => alert('Attachments menu opened!')} aria-label="Attach file"><Paperclip size={18} /></button>
          <input 
            type="text" 
            placeholder="Write a message..." 
            className="tg-chat-input-field"
            value={typeMessage}
            onChange={handleInputChange}
            aria-label="Message text"
          />
          <button className="tg-emoji-trigger" type="button" onClick={() => setTypeMessage(typeMessage + ' 🚀')} aria-label="Insert emoji"><Smile size={18} /></button>
          <button type="submit" className="tg-voice-send-btn" aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
