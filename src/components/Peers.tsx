import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import Avatar from './Avatar';
import PeerProfileView from './PeerProfileView';

interface Connection {
  id: number;
  name: string;
  role: string;
  college: string;
  avatar: string;
  connected: boolean;
}

interface PeersProps {
  connections: Connection[];
  handleToggleConnect: (id: number) => void;
  searchQuery: string;
}

export default function Peers({ connections, handleToggleConnect, searchQuery }: PeersProps) {
  const [loading, setLoading] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState<Connection | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Local loading skeleton simulation on tab mount
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(timer);
  }, []);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Keep selected peer state in sync if connections connection state changes
  const activePeer = selectedPeer 
    ? connections.find(c => c.id === selectedPeer.id) || selectedPeer 
    : null;

  const filteredConnections = connections.filter(conn => 
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    conn.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredConnections.length / itemsPerPage));
  const paginatedConnections = filteredConnections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (activePeer) {
    return (
      <PeerProfileView 
        peer={activePeer}
        onBack={() => setSelectedPeer(null)}
        onToggleConnect={handleToggleConnect}
      />
    );
  }

  return (
    <div>
      {loading ? (
        /* Loading Skeletons */
        <div className="network-grid-container">
          {[1, 2, 3].map(n => (
            <div key={n} className="network-user-card animate-pulse" style={{ height: '190px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ height: '60px', backgroundColor: 'rgba(255,255,255,0.03)' }} />
              <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', margin: '-34px auto 8px auto' }} />
              <div style={{ height: '14px', backgroundColor: 'rgba(255,255,255,0.04)', margin: '8px 24px', borderRadius: '4px' }} />
              <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.04)', margin: '0 36px 16px 36px', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      ) : filteredConnections.length === 0 ? (
        /* Empty State with hero.png */
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="animate-bounce" style={{ width: '120px', height: '120px', overflow: 'hidden' }}>
            <img src="/hero.png" alt="Hero proof of work card illustration" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h3 className="text-white font-medium" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>No matching peers found</h3>
          <p className="text-gray-400 text-sm max-w-sm">Try search filters, tech stack tags, or browse the complete list of mentors.</p>
        </div>
      ) : (
        /* Connections Grid */
        <div>
          <div className="network-grid-container">
            {paginatedConnections.map(conn => (
              <div 
                className="network-user-card relative overflow-hidden" 
                key={conn.id}
                onClick={() => setSelectedPeer(conn)}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                <div className="network-card-header" style={{ position: 'relative' }} />
                
                <div className="network-card-avatar-wrapper">
                  <Avatar name={conn.name} avatarUrl={conn.avatar} size={68} />
                </div>
                
                <div className="network-card-body">
                  <div>
                    <div className="network-user-name">{conn.name}</div>
                    <div className="network-user-role">{conn.role}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)', marginTop: '4px' }}>
                      🏫 {conn.college}
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className={`network-connect-btn ${conn.connected ? 'connected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card profile click navigation
                      handleToggleConnect(conn.id);
                    }}
                    style={{
                      marginTop: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      width: '100%',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {conn.connected ? (
                      <>
                        <UserCheck size={14} />
                        Connected
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        Connect
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Fully Functional Pagination Grid */}
          {totalPages > 1 && (
            <div className="network-pagination" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button 
                    key={pageNum}
                    type="button" 
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      backgroundColor: currentPage === pageNum ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: currentPage === pageNum ? '#121214' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted-light)', marginLeft: '12px' }}>
                Showing Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
