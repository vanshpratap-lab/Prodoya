import { useState } from 'react';
import { ArrowLeft, Github, Award, ShieldCheck, Lock, Flame, Trophy, Sparkles, Code, Cpu, Layers, UserPlus, UserCheck } from 'lucide-react';
import Avatar from './Avatar';

interface Connection {
  id: number;
  name: string;
  role: string;
  college: string;
  avatar: string;
  connected: boolean;
}

interface PeerProfileViewProps {
  peer: Connection;
  onBack: () => void;
  onToggleConnect: (id: number) => void;
}

export default function PeerProfileView({ peer, onBack, onToggleConnect }: PeerProfileViewProps) {
  const [selectedYear, setSelectedYear] = useState<2026 | 2025>(2026);

  // Generate a distinct mock contribution grid based on peer's name length to make it unique
  const generatePeerContributions = () => {
    const grid: number[][] = [];
    const seed = peer.name.length;
    for (let w = 0; w < 53; w++) {
      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        let val = 0;
        const randomFactor = Math.random();
        // Shift active spots depending on the seed to give each user a different heat map
        const activeWeek = (w + seed) % 7 === 0 || (w >= 20 && w <= 26);
        if (activeWeek) {
          val = randomFactor > 0.7 ? 3 : (randomFactor > 0.4 ? 2 : 1);
        } else {
          val = randomFactor > 0.94 ? 2 : (randomFactor > 0.8 ? 1 : 0);
        }
        week.push(val);
      }
      grid.push(week);
    }
    return grid;
  };

  const contributionGrid = generatePeerContributions();

  const getCellColor = (level: number) => {
    switch (level) {
      case 0: return '#161b22'; 
      case 1: return '#0e4429'; 
      case 2: return '#006d32'; 
      case 3: return '#26a641'; 
      case 4: return '#39d353'; 
      default: return '#161b22';
    }
  };

  // Get dynamic skills tailored to their roles
  const getPeerSkills = () => {
    const roleLower = peer.role.toLowerCase();
    if (roleLower.includes('ai') || roleLower.includes('ml') || roleLower.includes('machine')) {
      return [
        { name: 'PyTorch & TensorFlow', val: '92%', num: 92, color: '#ec4899' },
        { name: 'Data Pipeline Design', val: '85%', num: 85, color: 'var(--color-primary)' },
        { name: 'Python Engineering', val: '95%', num: 95, color: '#10b981' },
        { name: 'Statistical Modeling', val: '80%', num: 80, color: '#3b82f6' }
      ];
    }
    if (roleLower.includes('mentor') || roleLower.includes('lead')) {
      return [
        { name: 'System Architecture', val: '96%', num: 96, color: 'var(--color-primary)' },
        { name: 'Cloud Infrastructure', val: '90%', num: 90, color: '#3b82f6' },
        { name: 'Engineering Leadership', val: '95%', num: 95, color: '#10b981' },
        { name: 'Agile Mentorship', val: '98%', num: 98, color: '#ec4899' }
      ];
    }
    if (roleLower.includes('design') || roleLower.includes('product') || roleLower.includes('hci')) {
      return [
        { name: 'UI/UX Design Systems', val: '95%', num: 95, color: '#3b82f6' },
        { name: 'Product Prototyping', val: '88%', num: 88, color: '#ec4899' },
        { name: 'HCI User Testing', val: '90%', num: 90, color: 'var(--color-primary)' },
        { name: 'CSS & Typography', val: '92%', num: 92, color: '#10b981' }
      ];
    }
    // Default fallback
    return [
      { name: 'Data Structures & Algos', val: '88%', num: 88, color: 'var(--color-primary)' },
      { name: 'Full-Stack Development', val: '82%', num: 82, color: '#10b981' },
      { name: 'Git Workflow & CI/CD', val: '85%', num: 85, color: '#3b82f6' },
      { name: 'API Design Patterns', val: '78%', num: 78, color: '#ec4899' }
    ];
  };

  // Get dynamic milestone details
  const getPeerMilestones = () => {
    const roleLower = peer.role.toLowerCase();
    if (roleLower.includes('ai') || roleLower.includes('ml')) {
      return [
        { title: 'Trained ResNet on ImageNet Subsets', desc: 'Achieved 89% top-5 accuracy inside localized training cluster', time: 'Yesterday' },
        { title: 'Synced PyTorch DataLoader Optimization', desc: 'Reduced queue latency by 45% using customized prefetching', time: '3 days ago' },
        { title: 'Unlocked ML Explorer Badge', desc: 'Successfully synchronized 3 model files to public workspaces', time: '1 week ago' }
      ];
    }
    if (roleLower.includes('mentor') || roleLower.includes('lead')) {
      return [
        { title: 'Conducted Architecture Office Hours', desc: 'Reviewed distributed caching protocols with 12 peer engineers', time: 'Today' },
        { title: 'Merged AWS VPC Security Group Audits', desc: 'Secured offline microservice networks with zero service downtime', time: '2 days ago' },
        { title: 'Unlocked Technical Mentor Badge', desc: 'Guided 5 engineering networks into verified code review states', time: '4 days ago' }
      ];
    }
    return [
      { title: 'Completed Daily Algorithm Challenge', desc: 'Solved Red-Black tree insertion balance updates in under 20 mins', time: 'Today' },
      { title: 'Integrated WebSocket Chat Room syncs', desc: 'Refactored state triggers using transactional locks', time: 'Yesterday' },
      { title: 'Unlocked Code Warrior Badge', desc: 'Earned 10+ positive review tags in collaborative workspaces', time: '5 days ago' }
    ];
  };

  const skills = getPeerSkills();
  const milestones = getPeerMilestones();
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto', paddingBottom: '40px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Back button link */}
      <div>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 0',
            transition: 'opacity 0.2s'
          }}
          className="hover:opacity-80"
        >
          <ArrowLeft size={16} />
          Back to Connections
        </button>
      </div>

      {/* Header Profile Summary */}
      <div 
        className="profile-card-widget relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.6), rgba(20, 20, 20, 0.85))',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <Avatar 
            name={peer.name} 
            avatarUrl={peer.avatar} 
            size={84} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {peer.name}
              <ShieldCheck size={20} style={{ color: '#34d399' }} />
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 500 }}>
              {peer.role} • {peer.college}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)' }}>
              Verified Peer Network
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => onToggleConnect(peer.id)}
            className={`network-connect-btn ${peer.connected ? 'connected' : ''}`}
            style={{ 
              padding: '8px 18px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.25s ease'
            }}
          >
            {peer.connected ? (
              <>
                <UserCheck size={15} />
                Connected
              </>
            ) : (
              <>
                <UserPlus size={15} />
                Connect
              </>
            )}
          </button>

          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="feed-action-btn github"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <Github size={15} />
            GitHub
          </a>
        </div>
      </div>

      {/* GitHub Contributions Grid */}
      <div 
        style={{ 
          backgroundColor: 'rgba(24, 24, 26, 0.94)', 
          border: '1px solid var(--color-dark-border)', 
          borderRadius: '20px', 
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 600 }}>
            Contributions in the last year
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px' }}>
              <button 
                type="button" 
                onClick={() => setSelectedYear(2026)}
                style={{ 
                  background: selectedYear === 2026 ? 'var(--color-primary)' : 'none', 
                  color: selectedYear === 2026 ? '#121214' : 'var(--color-text-muted-light)',
                  border: 'none', 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                2026
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedYear(2025)}
                style={{ 
                  background: selectedYear === 2025 ? 'var(--color-primary)' : 'none', 
                  color: selectedYear === 2025 ? '#121214' : 'var(--color-text-muted-light)',
                  border: 'none', 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                2025
              </button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '780px' }}>
            
            <div style={{ display: 'flex', paddingLeft: '32px', marginBottom: '4px' }}>
              {months.map((m, idx) => (
                <div key={idx} style={{ flexGrow: 1, fontSize: '0.7rem', color: 'var(--color-text-muted-light)' }}>
                  {m}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted-light)', height: '85px', paddingTop: '2px' }}>
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div style={{ display: 'flex', gap: '3px', flexGrow: 1 }}>
                {contributionGrid.map((week, wIdx) => (
                  <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {week.map((level, dIdx) => (
                      <div 
                        key={dIdx}
                        style={{ 
                          width: '10px', 
                          height: '10px', 
                          backgroundColor: getCellColor(level), 
                          borderRadius: '2px',
                          transition: 'background-color 0.2s ease'
                        }}
                        title={`Level ${level} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '32px', fontSize: '0.72rem', color: 'var(--color-text-muted-light)', marginTop: '8px' }}>
              <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Learn how we count contributions</a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Less</span>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#161b22', borderRadius: '2px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: '#0e4429', borderRadius: '2px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: '#006d32', borderRadius: '2px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: '#26a641', borderRadius: '2px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: '#39d353', borderRadius: '2px' }} />
                <span>More</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Developer Stats & Progression Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Progression & Streak Metrics Panel */}
        <div 
          style={{ 
            backgroundColor: 'rgba(24, 24, 26, 0.94)', 
            border: '1px solid var(--color-dark-border)', 
            borderRadius: '20px', 
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backdropFilter: 'blur(20px)'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="text-amber-400" size={20} />
            Progression & Streaks
          </h3>
          
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame className="text-orange-500" size={22} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>Active Streak</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Commit consistency</span>
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316' }}>{peer.name.length * 2} Days</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy className="text-yellow-500" size={22} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>Platform Rank</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Standings group</span>
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>Top {peer.name.length > 10 ? '5%' : '12%'}</span>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-text-muted-light)', fontWeight: 600 }}>Experience Points</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{peer.name.length * 1200} XP</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: '65%', height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Skill Mastery Levels */}
        <div 
          style={{ 
            backgroundColor: 'rgba(24, 24, 26, 0.94)', 
            border: '1px solid var(--color-dark-border)', 
            borderRadius: '20px', 
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backdropFilter: 'blur(20px)'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu className="text-purple-400" size={20} />
            Skill Mastery Metrics
          </h3>
          
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {skills.map((skill, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#eeeeee' }}>
                  <span>{skill.name}</span>
                  <span style={{ color: skill.color, fontWeight: 700 }}>{skill.val}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${skill.num}%`, height: '100%', backgroundColor: skill.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tech Stack Interests & Milestones Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Tech Stack Panel */}
        <div 
          style={{ 
            backgroundColor: 'rgba(24, 24, 26, 0.94)', 
            border: '1px solid var(--color-dark-border)', 
            borderRadius: '20px', 
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backdropFilter: 'blur(20px)'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code className="text-purple-400" size={20} />
            Stack & Tech Focus
          </h3>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(peer.role.toLowerCase().includes('ai') ? ['Python', 'PyTorch', 'NumPy', 'TensorFlow', 'CUDA', 'Docker'] : ['React', 'TypeScript', 'Node.js', 'Next.js', 'Vite', 'Three.js']).map((tech, idx) => (
              <span 
                key={idx}
                style={{ 
                  fontSize: '0.8rem', 
                  backgroundColor: 'rgba(167, 139, 250, 0.06)', 
                  border: '1.5px solid rgba(167, 139, 250, 0.18)', 
                  color: '#c084fc', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontWeight: 600
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '0.82rem', color: 'var(--color-text-muted-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
              Active in collaborative study groups.
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div 
          style={{ 
            backgroundColor: 'rgba(24, 24, 26, 0.94)', 
            border: '1px solid var(--color-dark-border)', 
            borderRadius: '20px', 
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backdropFilter: 'blur(20px)'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers className="text-purple-400" size={20} />
            Recent Milestones
          </h3>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '20px' }}>
            <div style={{ position: 'absolute', left: '7px', top: '4px', bottom: '4px', width: '2px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

            {milestones.map((milestone, idx) => (
              <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ position: 'absolute', left: '-18px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{milestone.title}</span>
                  <span style={{ color: 'var(--color-text-muted-light)' }}>{milestone.time}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>{milestone.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Achievements Section */}
      <div 
        style={{ 
          backgroundColor: 'rgba(24, 24, 26, 0.94)', 
          border: '1px solid var(--color-dark-border)', 
          borderRadius: '20px', 
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backdropFilter: 'blur(20px)'
        }}
      >
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award className="text-amber-400" size={20} />
          Achievements
        </h3>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '8px' }}>
          
          {/* Badge 1: Pull Shark (Earned / Active) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                border: '2.5px solid var(--color-primary)',
                overflow: 'hidden',
                boxShadow: '0 0 15px rgba(167, 139, 250, 0.4)',
                position: 'relative'
              }}
            >
              <img 
                src="/pull_shark.jpg" 
                alt="Pull Shark Badge" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 600 }}>Pull Shark</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600 }}>Active</span>
          </div>

          {/* Badge 2: YOLO (Locked) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
            <div 
              style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <Lock size={20} className="text-gray-400" />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#aaaaaa', fontWeight: 600 }}>YOLO</span>
            <span style={{ fontSize: '0.65rem', color: '#888888' }}>Locked</span>
          </div>

          {/* Badge 3: Quickdraw (Locked) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
            <div 
              style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <Lock size={20} className="text-gray-400" />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#aaaaaa', fontWeight: 600 }}>Quickdraw</span>
            <span style={{ fontSize: '0.65rem', color: '#888888' }}>Locked</span>
          </div>

        </div>
      </div>

      {/* Bottom Actions Area */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
        <button 
          type="button"
          onClick={onBack}
          style={{
            padding: '12px 32px',
            borderRadius: '24px',
            border: '1.5px solid var(--color-primary)',
            backgroundColor: 'rgba(167, 139, 250, 0.05)',
            color: 'var(--color-primary)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="hover:scale-105"
        >
          <ArrowLeft size={16} />
          Explore More Peers
        </button>
      </div>

    </div>
  );
}
