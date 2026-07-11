import React from 'react';

export default function About({ setCurrentPage }) {
  const milestones = [
    {
      year: '2018',
      title: 'The Beginning',
      description: 'Founded by designers tired of the disconnect between beautiful work and business results.'
    },
    {
      year: '2020',
      title: 'The Pivot',
      description: 'Shifted from project-based agency to ecosystem approach — unifying brand, product, and growth.'
    },
    {
      year: '2022',
      title: 'AI Integration',
      description: 'Became early adopters of AI automation, building systems that scale without adding headcount.'
    },
    {
      year: '2024',
      title: 'Full-Stack Growth',
      description: 'Launched complete digital ecosystem offering — end-to-end execution from strategy to scale.'
    },
    {
      year: '2026',
      title: 'Today',
      description: '120+ brands built, 340+ projects delivered, recognized as a premium growth partner across 18 industries.'
    }
  ];

  const team = [
    {
      name: 'Rahul Sharma',
      role: 'Co-Founder & Head of Strategy',
      avatar: 'RS',
      bio: 'Ex-consultant who bridges the gap between creative execution and business metrics.'
    },
    {
      name: 'Priya Nair',
      role: 'Head of Product Design',
      avatar: 'PN',
      bio: 'Believes design must convert. 10+ years experience building SaaS and consumer products.'
    },
    {
      name: 'Vikram Malhotra',
      role: 'Head of Technology & AI',
      avatar: 'VM',
      bio: 'Full-stack engineer specializing in custom integrations, automation pipelines, and fast code.'
    },
    {
      name: 'Ananya Roy',
      role: 'Head of Growth Marketing',
      avatar: 'AR',
      bio: 'Acquisition strategist with a passion for multi-channel pipelines that convert leads to sales.'
    }
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="about-page animate-fade-in-up">
      {/* About Hero / Why Us Stats */}
      <section className="why-us-section" style={{ paddingTop: '140px' }}>
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title-large uppercase-title" style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '1px', marginBottom: '16px' }}>WHY US</h2>
            <p className="section-desc-large" style={{ margin: '0 auto 60px', maxWidth: '640px', color: '#64748b', fontSize: '15px' }}>
              Passionate app developers dedicated to empowering businesses with innovative tech.
            </p>
          </div>

          <div className="why-us-grid">
            {/* Card 1 — Projects Completed */}
            <div className="why-us-card bg-white-card">
              <div className="why-us-card-left">
                <div className="why-us-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="why-us-card-label">Projects Completed</span>
              </div>
              <div className="why-us-card-right">
                <span className="why-us-card-number">50+</span>
              </div>
            </div>

            {/* Card 2 — Followers */}
            <div className="why-us-card bg-white-card">
              <div className="why-us-card-left">
                <div className="why-us-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span className="why-us-card-label">Followers across all channels</span>
              </div>
              <div className="why-us-card-right">
                <span className="why-us-card-number">250K+</span>
              </div>
            </div>

            {/* Card 3 — Happy Clients */}
            <div className="why-us-card bg-white-card">
              <div className="why-us-card-left">
                <div className="why-us-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <span className="why-us-card-label">Happy Clients</span>
              </div>
              <div className="why-us-card-right">
                <span className="why-us-card-number">30+</span>
              </div>
            </div>

            {/* Card 4 — Years of Experience */}
            <div className="why-us-card bg-white-card">
              <div className="why-us-card-left">
                <div className="why-us-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                    <line x1="9" y1="18" x2="15" y2="18"></line>
                    <line x1="10" y1="22" x2="14" y2="22"></line>
                  </svg>
                </div>
                <span className="why-us-card-label">Years of Experience</span>
              </div>
              <div className="why-us-card-right">
                <span className="why-us-card-number">4+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="our-story-section section-grey">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">Our Story</span>
            <h2 className="section-title-large" style={{ margin: '0 auto 20px' }}>From Frustration to Innovation</h2>
            <p className="section-desc-large" style={{ margin: '0 auto 60px' }}>
              MarkZap was born from a simple frustration: watching brilliant creative work fail to move the needle for businesses. We knew there was a better way.
            </p>
          </div>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            {milestones.map((m, idx) => (
              <div key={m.year} className={`timeline-item ${idx % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-card bg-white-card">
                  <div className="timeline-year">{m.year}</div>
                  <h3 className="timeline-title">{m.title}</h3>
                  <p>{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision-section section-light">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mv-card bg-white-card">
              <span className="mv-icon">🎯</span>
              <h3>Our Mission</h3>
              <p>
                To eliminate the disconnect between design, development, and growth. We exist to build integrated digital ecosystems that deliver compounding, long-term returns for ambitious businesses.
              </p>
            </div>

            <div className="mv-card bg-white-card">
              <span className="mv-icon">👁️</span>
              <h3>Our Vision</h3>
              <p>
                To become the definitive growth partner for ambitious businesses — the team you call when you're ready to scale, not just check a box. We aim to define the standard for full-stack business building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section section-grey">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">What Makes Us Different</span>
            <h2 className="section-title-large" style={{ margin: '0 auto 50px' }}>Traditional Agency vs MarkZap</h2>
          </div>

          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Traditional Agencies</th>
                  <th className="highlight-col">The MarkZap Ecosystem</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-topic">Team Setup</td>
                  <td>Multiple disjointed vendors for design, dev, and marketing.</td>
                  <td className="highlight-col">Single unified senior team executing end-to-end.</td>
                </tr>
                <tr>
                  <td className="row-topic">Handoffs</td>
                  <td>Gaps and friction between strategy, design, and developer coding.</td>
                  <td className="highlight-col">Seamless integration where every step informs the next.</td>
                </tr>
                <tr>
                  <td className="row-topic">Tech Stack</td>
                  <td>Tools and integrations that don't talk to each other.</td>
                  <td className="highlight-col">Connected systems engineered to automate and pass data.</td>
                </tr>
                <tr>
                  <td className="row-topic">Focus</td>
                  <td>Campaign-based thinking centered on deliverables.</td>
                  <td className="highlight-col">Growth-focused systems built to compound over time.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section section-light">
        <div className="container">
          <div className="section-header">
            <span className="tag-badge">Our Philosophy</span>
            <h2 className="section-title-large">Core Beliefs</h2>
          </div>

          <div className="philosophy-grid">
            <div className="phil-card">
              <h4>01. Strategy Before Design</h4>
              <p>We refuse to design before we understand. Research and positioning always come first, ensuring every visual decision serves a strategic goal.</p>
            </div>
            <div className="phil-card">
              <h4>02. Simplicity Wins</h4>
              <p>The best solutions are obvious in hindsight. We cut complexity, not corners, to build interfaces that are intuitive and load immediately.</p>
            </div>
            <div className="phil-card">
              <h4>03. Data Informs Creativity</h4>
              <p>Beautiful work that doesn't convert is just decoration. We combine high-end aesthetic talent with rigorous conversion analytics.</p>
            </div>
            <div className="phil-card">
              <h4>04. Technology Enables Growth</h4>
              <p>The right automation, tooling, and integrations let business systems scale without linear headcount growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section section-grey">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">Our Team</span>
            <h2 className="section-title-large" style={{ margin: '0 auto 20px' }}>Meet the Experts</h2>
            <p className="section-desc-large" style={{ margin: '0 auto 60px' }}>
              A senior team of strategists, designers, and engineers who've shipped products for high-growth startups and Fortune 500 companies alike.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member) => (
              <div key={member.name} className="team-card bg-white-card">
                <div className="team-avatar">{member.avatar}</div>
                <h3 className="team-member-name">{member.name}</h3>
                <p className="team-member-role">{member.role}</p>
                <p className="team-member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inner CTA */}
      <section className="inner-cta-section section-dark">
        <div className="container text-center">
          <span className="tag-badge text-accent">Next Step</span>
          <h2 className="section-title-large">Let's Build Together</h2>
          <p className="section-desc-large" style={{ margin: '0 auto 40px', color: 'rgba(255,255,255,0.7)' }}>
            Ready to partner with a senior team that treats your business goals like their own? Start the conversation today.
          </p>
          <button className="btn btn-primary" onClick={() => handleNavClick('contact')}>
            Get in Touch <span className="arrow-icon">→</span>
          </button>
        </div>
      </section>

      <style>{`
        .why-us-section {
          background-color: #ffffff;
          padding: 80px 0;
        }
        .why-us-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .why-us-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          height: 140px;
        }
        .why-us-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
          border-color: #cbd5e1;
        }
        .why-us-card-left {
          flex: 1.3;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
        }
        .why-us-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(59, 102, 245, 0.08);
          color: #3b66f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .why-us-card-label {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-dark-blue);
        }
        .why-us-card-right {
          flex: 1;
          background-color: #f8fafc;
          border-left: 1px dashed #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background-image: linear-gradient(90deg, rgba(16, 24, 32, 0.03) 1px, transparent 1px);
          background-size: 8px 100%;
        }
        .why-us-card-number {
          font-family: var(--font-sans);
          font-size: 44px;
          font-weight: 900;
          color: #3b66f5;
          letter-spacing: -1.5px;
        }

        @media (max-width: 900px) {
          .why-us-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .why-us-grid {
            grid-template-columns: 1fr;
            max-width: 440px;
            margin: 0 auto;
          }
          .why-us-card {
            height: 120px;
          }
          .why-us-card-number {
            font-size: 34px;
          }
        }

        /* Timeline Styles */
        .timeline-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 0;
        }

        .timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: var(--color-border);
          transform: translateX(-50%);
        }

        .timeline-item {
          display: flex;
          justify-content: flex-end;
          width: 50%;
          position: relative;
          margin-bottom: 40px;
        }

        .timeline-item.left {
          align-self: flex-start;
          justify-content: flex-start;
          margin-left: 0;
        }

        .timeline-item.right {
          margin-left: 50%;
        }

        .timeline-dot {
          position: absolute;
          right: -6px;
          top: 30px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--color-accent-yellow);
          border: 2px solid var(--color-light-bg);
          z-index: 2;
        }

        .timeline-item.right .timeline-dot {
          left: -6px;
        }

        .timeline-card {
          width: 90%;
          padding: 30px;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .timeline-card:hover {
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border-color: var(--color-accent-yellow);
        }

        .timeline-year {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 800;
          color: var(--color-accent-gold);
          margin-bottom: 8px;
        }

        .timeline-title {
          font-family: var(--font-serif);
          font-size: 20px;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .timeline-line {
            left: 20px;
          }
          .timeline-item {
            width: 100%;
            margin-left: 0 !important;
            justify-content: flex-start;
            padding-left: 40px;
          }
          .timeline-dot {
            left: 14px !important;
          }
          .timeline-card {
            width: 100%;
          }
        }

        /* Mission / Vision */
        .mission-vision-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .mv-card {
          padding: 40px;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .mv-card:hover {
          border-color: var(--color-accent-yellow);
        }

        .mv-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 24px;
        }

        .mv-card h3 {
          font-size: 24px;
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .mission-vision-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Comparison Table */
        .table-responsive {
          overflow-x: auto;
          background-color: var(--color-white);
          border-radius: 4px;
          border: 1px solid var(--color-border);
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .comparison-table th, 
        .comparison-table td {
          padding: 24px 30px;
          border-bottom: 1px solid var(--color-border);
          font-family: var(--font-sans);
          font-size: 15px;
        }

        .comparison-table th {
          font-weight: 700;
          color: var(--color-text-dark-blue);
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 1px;
          background-color: rgba(16, 24, 32, 0.02);
        }

        .row-topic {
          font-weight: 700;
          color: var(--color-text-dark-blue);
        }

        .highlight-col {
          background-color: rgba(245, 200, 0, 0.03);
          font-weight: 500;
        }

        .comparison-table tr:last-child td {
          border-bottom: none;
        }

        /* Philosophy Section */
        .philosophy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 40px;
        }

        .phil-card h4 {
          font-family: var(--font-sans);
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--color-text-dark-blue);
        }

        @media (max-width: 768px) {
          .philosophy-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Team Grid */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        .team-card {
          padding: 30px;
          border-radius: 4px;
          text-align: center;
          transition: var(--transition-fast);
        }

        .team-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.04);
          border-color: var(--color-accent-yellow);
        }

        .team-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: var(--color-accent-yellow);
          color: var(--color-text-dark-blue);
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .team-member-name {
          font-family: var(--font-sans);
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .team-member-role {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-accent-gold);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .team-member-bio {
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .team-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
