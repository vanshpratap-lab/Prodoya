import { useState } from 'react';
import { Github, Linkedin, Twitter, Award, ShieldCheck, Lock, Flame, Trophy, Sparkles, Code, Cpu, Layers } from 'lucide-react';
import Avatar from './Avatar';

export default function ProfileView() {
  const [selectedYear, setSelectedYear] = useState<2026 | 2025>(2026);

  // Generate a mock dataset for 53 weeks x 7 days contribution grid
  const generateMockContributions = () => {
    const grid: number[][] = [];
    for (let w = 0; w < 53; w++) {
      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        let val = 0;
        const randomFactor = Math.random();
        
        if (w >= 30 && w <= 38) {
          val = randomFactor > 0.8 ? 4 : (randomFactor > 0.5 ? 3 : (randomFactor > 0.2 ? 2 : 1));
        } else if (w >= 10 && w <= 18) {
          val = randomFactor > 0.85 ? 4 : (randomFactor > 0.6 ? 3 : (randomFactor > 0.3 ? 2 : 1));
        } else {
          val = randomFactor > 0.95 ? 3 : (randomFactor > 0.75 ? 2 : (randomFactor > 0.4 ? 1 : 0));
        }
        week.push(val);
      }
      grid.push(week);
    }
    return grid;
  };

  const contributionGrid = generateMockContributions();

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

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto', paddingBottom: '40px' }}>
      
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
            name="Emma Watson" 
            avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
            size={84} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Emma Watson
              <ShieldCheck size={20} style={{ color: '#60a5fa' }} />
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 500 }}>
              Lead Product Architect • Oxford Engineering
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)' }}>
              📍 Oxford, United Kingdom
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a 
            href="https://github.com/vanshpratap-lab" 
            target="_blank" 
            rel="noopener noreferrer"
            className="feed-action-btn github"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            <Github size={15} />
            GitHub
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="feed-action-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}
          >
            <Linkedin size={15} />
            LinkedIn
          </a>
          <a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="feed-action-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}
          >
            <Twitter size={14} />
            Twitter/X
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
            844 contributions in the last year
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted-light)', cursor: 'pointer' }}>
              Contribution settings ▼
            </span>
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
            {/* Stat Row 1: Streak */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame className="text-orange-500" size={22} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>Active Streak</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Syncing commits daily</span>
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316' }}>14 Days</span>
            </div>

            {/* Stat Row 2: Rank */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy className="text-yellow-500" size={22} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>Platform Rank</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Global standings</span>
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>Top 2%</span>
            </div>

            {/* Stat Row 3: XP Progress */}
            <div style={{ padding: '14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-text-muted-light)', fontWeight: 600 }}>Total Experience</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>18,400 XP</span>
              </div>
              {/* Progress Bar */}
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px', boxShadow: '0 0 8px var(--color-primary)' }} />
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted-light)', textAlign: 'right' }}>
                1,600 XP to next level (Level 28 Architect)
              </span>
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
            {/* Skill 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#eeeeee' }}>
                <span>System Architecture</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>95%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '95%', height: '100%', backgroundColor: 'var(--color-primary)' }} />
              </div>
            </div>

            {/* Skill 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#eeeeee' }}>
                <span>3D Graphics & WebGL</span>
                <span style={{ color: '#ec4899', fontWeight: 700 }}>90%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '90%', height: '100%', backgroundColor: '#ec4899' }} />
              </div>
            </div>

            {/* Skill 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#eeeeee' }}>
                <span>Distributed ML Inference</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>80%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '80%', height: '100%', backgroundColor: '#10b981' }} />
              </div>
            </div>

            {/* Skill 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#eeeeee' }}>
                <span>UI/UX Design Systems</span>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>85%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: '#3b82f6' }} />
              </div>
            </div>
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
            {['React', 'TypeScript', 'Three.js', 'C++', 'CUDA', 'Python', 'Node.js', 'WebGL', 'GLSL', 'Rust', 'Docker', 'Git'].map((tech, idx) => (
              <span 
                key={idx}
                style={{ 
                  fontSize: '0.8rem', 
                  backgroundColor: 'rgba(167, 139, 250, 0.06)', 
                  border: '1.5px solid rgba(167, 139, 250, 0.18)', 
                  color: '#c084fc', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '0.82rem', color: 'var(--color-text-muted-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
              Active learning in distributed GPU pipelines.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
              Contributing weekly to experimental 3D render pipelines.
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
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '7px', top: '4px', bottom: '4px', width: '2px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

            {/* Event 1 */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ position: 'absolute', left: '-18px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>Design Patterns in C++ Completed</span>
                <span style={{ color: 'var(--color-text-muted-light)' }}>Today</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Earned +200 XP from lessons</span>
            </div>

            {/* Event 2 */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ position: 'absolute', left: '-18px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>Synced Matrix Optimizations</span>
                <span style={{ color: 'var(--color-text-muted-light)' }}>Yesterday</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Merged local memory buffers into ADA-LOCAL-RUN</span>
            </div>

            {/* Event 3 */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ position: 'absolute', left: '-18px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>Pull Shark Achievement Unlocked</span>
                <span style={{ color: 'var(--color-text-muted-light)' }}>3 days ago</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>Successfully merged 5 pull requests in a week</span>
            </div>
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
                transition: 'transform 0.25s ease',
                position: 'relative'
              }}
              className="hover:scale-105"
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

          {/* Badge 2: YOLO (Locked / Empty) */}
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
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                position: 'relative'
              }}
            >
              <Lock size={20} className="text-gray-400" />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#aaaaaa', fontWeight: 600 }}>YOLO</span>
            <span style={{ fontSize: '0.65rem', color: '#888888' }}>Locked</span>
          </div>

          {/* Badge 3: Quickdraw (Locked / Empty) */}
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
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                position: 'relative'
              }}
            >
              <Lock size={20} className="text-gray-400" />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#aaaaaa', fontWeight: 600 }}>Quickdraw</span>
            <span style={{ fontSize: '0.65rem', color: '#888888' }}>Locked</span>
          </div>

        </div>
      </div>

    </div>
  );
}
