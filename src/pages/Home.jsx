import React, { useState, useEffect } from 'react';
import FloatingCards from '../components/FloatingCards.jsx';

export default function Home({ setCurrentPage }) {
  const [activeWorkFilter, setActiveWorkFilter] = useState('All');
  
  // Looping sync animation state
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime = Date.now();
    const duration = 14000; // 14 seconds total cycle
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % duration;
      
      if (elapsed < 5000) {
        // 0s to 5s: count UP (0 to 100)
        setProgress(Math.round((elapsed / 5000) * 100));
      } else if (elapsed < 8000) {
        // 5s to 8s: hold at 100%
        setProgress(100);
      } else if (elapsed < 13000) {
        // 8s to 13s: count DOWN (100 to 0) smoothly in reverse
        const decElapsed = elapsed - 8000;
        setProgress(100 - Math.round((decElapsed / 5000) * 100));
      } else {
        // 13s to 14s: hold at 0%
        setProgress(0);
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, []);

  const workFilters = ['All', 'Branding', 'Website', 'Product', 'Marketing', 'AI'];

  const projects = [
    {
      id: 'nexahealth',
      name: 'NexaHealth',
      category: 'Website',
      tags: ['Healthcare', 'Brand + Web'],
      description: 'Full brand identity and conversion-optimised website for a leading healthcare provider.',
      metric: '340% patient inquiry growth',
      iconText: 'N',
      color: '#4A90E2'
    },
    {
      id: 'flowsaas',
      name: 'FlowSaaS',
      category: 'Product',
      tags: ['SaaS', 'Product Design'],
      description: 'End-to-end UX redesign and design system for a B2B workflow platform.',
      metric: '2.4× trial-to-paid conversion',
      iconText: 'F',
      color: '#50E3C2'
    },
    {
      id: 'urbannest',
      name: 'UrbanNest',
      category: 'Marketing',
      tags: ['Real Estate', 'Full Ecosystem'],
      description: 'Brand, web, and automated lead-gen ecosystem for a premium real estate developer.',
      metric: '₹4.2Cr leads in 90 days',
      iconText: 'U',
      color: '#F5A623'
    }
  ];

  const filteredProjects = activeWorkFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeWorkFilter || p.tags.some(t => t.includes(activeWorkFilter)));

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="home-page animate-fade-in-up">
      {/* Hero Section */}
      <section className="hero-section section-light">
        <div className="container">
          <div className="hero-row">

            {/* LEFT — headline, subtitle, buttons */}
            <div className="hero-content">
              <h1 className="hero-title">
                <span className="text-muted-grey">STOP PLANNING.</span> <span className="text-dark-navy">START</span><br className="desktop-only" />
                <span className="text-dark-navy">LAUNCHING. WE BUILD CRAZY SOFTWARE</span><br className="desktop-only" />
                <span className="text-dark-navy">THAT GO LIVE FAST</span>
              </h1>
              <p className="hero-subtitle">
                We craft AI-powered Flutter apps that help startups and SMEs move faster and grow smarter.
              </p>
              <div className="hero-actions">
                <button className="btn btn-hero-portfolio" onClick={() => handleNavClick('work')}>
                  VIEW PORTFOLIO
                </button>
                <button className="btn btn-hero-quote" onClick={() => handleNavClick('contact')}>
                  GET A QUOTE
                </button>
              </div>
            </div>

            {/* RIGHT — floating card deck */}
            <div className="hero-3d-canvas">
              <FloatingCards />
            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="what-we-do section-grey">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">Our Services</span>
            <h2 className="section-title-large uppercase-title">SERVICES WE PROVIDE</h2>
            <p className="section-desc-large" style={{ margin: '0 auto 60px', maxWidth: '640px' }}>
              We build robust apps through collaborative development that turns your vision into reality.
            </p>
          </div>

          <div className="pillars-grid">

            {/* Card 01 — Startup & MVP Development (Dashboard Progress Layout) */}
            <div className="pillar-card">
              <div className="pillar-visual pillar-visual-dashboard">
                <div className="pv-db-card">
                  <div className="pv-db-window-header">
                    <span className="pv-dot red"></span>
                    <span className="pv-dot yellow"></span>
                    <span className="pv-dot green"></span>
                    <span className="pv-db-title">App Analytics</span>
                  </div>
                  <div className="pv-db-body">
                    <div className="pv-circular-progress">
                      <svg className="progress-ring" width="60" height="60">
                        <circle className="progress-ring-bg" stroke="#f1f5f9" strokeWidth="5" fill="transparent" r="24" cx="30" cy="30" />
                        <circle 
                          className="progress-ring-fill-dynamic" 
                          stroke="#FFB600" 
                          strokeWidth="5" 
                          fill="transparent" 
                          r="24" 
                          cx="30" 
                          cy="30" 
                          style={{
                            strokeDasharray: '150.7',
                            strokeDashoffset: 150.7 - (150.7 * progress) / 100,
                            transform: 'rotate(-90deg)',
                            transformOrigin: '50% 50%',
                            transition: 'stroke-dashoffset 0.08s linear'
                          }}
                        />
                      </svg>
                      <span className="progress-value">{progress}%</span>
                    </div>
                    <div className="pv-db-stats">
                      <div className="pv-stat-row">
                        <span className="stat-label">Launch Time</span>
                        <span className="stat-val font-blue">14 Days</span>
                      </div>
                      <div className="pv-stat-row">
                        <span className="stat-label">Market Ready</span>
                        <span className="stat-val font-green">Passed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pillar-body">
                <h3 className="pillar-title-new uppercase-title-card">STARTUP & MVP DEVELOPMENT</h3>
                <p className="pillar-tagline-new">
                  Quickly validate your concept with a market-ready MVP that captures your core idea.
                </p>
              </div>
            </div>

            {/* Card 02 — Full-Cycle Development (Horizontal Development Pipeline) */}
            <div className="pillar-card">
              <div className="pillar-visual pillar-visual-pipeline">
                <div className="pv-pipeline-container">
                  <div className="pv-pipeline-track">
                    <div className="pv-pipeline-line-bg"></div>
                    <div 
                      className="pv-pipeline-line-active" 
                      style={{ 
                        width: `${progress}%`,
                        background: '#FFB600',
                        transition: 'width 0.08s linear'
                      }}
                    ></div>
                  </div>
                  
                  <div className={`pv-pipeline-step ${progress >= 0 ? 'step-done' : ''} ${progress < 33 ? 'step-active' : ''}`}>
                    <span className="step-badge">1</span>
                    <span className="step-tag">Scope</span>
                  </div>
                  
                  <div className={`pv-pipeline-step ${progress >= 33 ? 'step-done' : ''} ${(progress >= 33 && progress < 66) ? 'step-active' : ''}`}>
                    <span className="step-badge">2</span>
                    <span className="step-tag">Design</span>
                  </div>
                  
                  <div className={`pv-pipeline-step ${progress >= 66 ? 'step-done' : ''} ${(progress >= 66 && progress < 100) ? 'step-active' : ''}`}>
                    <span className="step-badge">3</span>
                    <span className="step-tag">Build</span>
                  </div>
                  
                  <div className={`pv-pipeline-step ${progress >= 100 ? 'step-done' : ''} ${progress === 100 ? 'step-active' : ''}`}>
                    <span className="step-badge">4</span>
                    <span className="step-tag">Launch</span>
                  </div>
                </div>
              </div>
              <div className="pillar-body">
                <h3 className="pillar-title-new uppercase-title-card">FULL-CYCLE DEVELOPMENT</h3>
                <p className="pillar-tagline-new">
                  End-to-end app creation: design, development, testing, and store deployment.
                </p>
              </div>
            </div>

            {/* Card 03 — Custom Solution (Central Connector Node integrations) */}
            <div className="pillar-card">
              <div className="pillar-visual pillar-visual-orbit">
                <div className="pv-orbit-container">
                  {/* Central Node */}
                  <div className="pv-hub-core">
                    <span className="hub-label">Core</span>
                  </div>
                  
                  {/* Connections */}
                  <div className="pv-branch-line line-nw"></div>
                  <div className="pv-branch-line line-ne"></div>
                  <div className="pv-branch-line line-sw"></div>
                  <div className="pv-branch-line line-se"></div>

                  {/* Satellite Badges */}
                  <div className="pv-sat-badge sat-nw" title="AI Core">
                    <div className="icon-net">
                      <span className="net-center"></span>
                      <span className="net-dot d1"></span>
                      <span className="net-dot d2"></span>
                      <span className="net-dot d3"></span>
                    </div>
                  </div>
                  <div className="pv-sat-badge sat-ne" title="API Webhook">
                    <div className="icon-plug">
                      <span className="plug-prong"></span>
                      <span className="plug-prong"></span>
                      <span className="plug-body"></span>
                    </div>
                  </div>
                  <div className="pv-sat-badge sat-sw" title="Database Integration">
                    <div className="icon-db">
                      <span className="db-cylinder"></span>
                      <span className="db-cylinder"></span>
                      <span className="db-cylinder"></span>
                    </div>
                  </div>
                  <div className="pv-sat-badge sat-se" title="Cloud Server">
                    <div className="icon-cloud">
                      <span className="cloud-bubble cb1"></span>
                      <span className="cloud-bubble cb2"></span>
                      <span className="cloud-base"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pillar-body">
                <h3 className="pillar-title-new uppercase-title-card">CUSTOM SOLUTION</h3>
                <p className="pillar-tagline-new">
                  Bespoke applications tailored to your unique business challenges and goals.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="ecosystem-section section-light">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">The MarkZap Ecosystem</span>
            <h2 className="section-title-large">Everything connects.</h2>
            <p className="section-desc-large" style={{ margin: '0 auto 50px' }}>
              Unlike agencies that hand off deliverables, we architect an integrated system where every service amplifies the next.
            </p>
          </div>

          {/* Flow Diagram */}
          <div className="flow-diagram-container">
            <div className="flow-step">
              <div className="flow-box">Brand</div>
              <div className="flow-arrow">→</div>
            </div>
            <div className="flow-step">
              <div className="flow-box">Product</div>
              <div className="flow-arrow">→</div>
            </div>
            <div className="flow-step">
              <div className="flow-box">Marketing</div>
              <div className="flow-arrow">→</div>
            </div>
            <div className="flow-step">
              <div className="flow-box">Conversion</div>
              <div className="flow-arrow">→</div>
            </div>
            <div className="flow-step">
              <div className="flow-box">Retention</div>
            </div>
          </div>

          {/* Component Details */}
          <div className="ecosystem-grid">
            <div className="ecosystem-card">
              <div className="eco-icon-wrapper">🤖</div>
              <h4>AI Automation</h4>
              <p>Workflows that never sleep — qualify leads, nurture clients, and scale ops autonomously.</p>
            </div>
            <div className="ecosystem-card">
              <div className="eco-icon-wrapper">💻</div>
              <h4>Website Development</h4>
              <p>Performance-first websites built to load fast, rank high, and convert visitors.</p>
            </div>
            <div className="ecosystem-card">
              <div className="eco-icon-wrapper">🎯</div>
              <h4>Lead Generation</h4>
              <p>Multi-channel pipelines engineered to fill your calendar with qualified prospects.</p>
            </div>
            <div className="ecosystem-card">
              <div className="eco-icon-wrapper">📊</div>
              <h4>Analytics & Data</h4>
              <p>Dashboards that turn raw numbers into actionable growth decisions.</p>
            </div>
            <div className="ecosystem-card">
              <div className="eco-icon-wrapper">🤝</div>
              <h4>Customer Engagement</h4>
              <p>CRM systems and touchpoints that turn buyers into lifelong advocates.</p>
            </div>
            <div className="ecosystem-card">
              <div className="eco-icon-wrapper">📱</div>
              <h4>Social Media</h4>
              <p>Consistent, high-quality presence that builds authority across every platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="featured-work section-grey">
        <div className="container">
          <div className="work-section-header">
            <div>
              <span className="tag-badge">Featured Work</span>
              <h2 className="section-title-large">Proof, not promises.</h2>
            </div>
            <div className="work-filters">
              {workFilters.map(filter => (
                <button 
                  key={filter} 
                  className={`filter-btn ${activeWorkFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveWorkFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="projects-grid">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <div key={project.id} className="project-card bg-white-card">
                  <div className="project-thumb" style={{ backgroundColor: project.color }}>
                    <div className="project-letter">{project.iconText}</div>
                    <span className="project-cat-badge">{project.category}</span>
                  </div>
                  <div className="project-details">
                    <span className="project-meta">{project.tags.join(' · ')}</span>
                    <h3 className="project-title">{project.name}</h3>
                    <p className="project-description">{project.description}</p>
                    <div className="project-metric">
                      <span className="metric-icon">📈</span>
                      <span className="metric-text">{project.metric}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-projects">No projects found in this category.</p>
            )}
          </div>

          <div className="text-center" style={{ marginTop: '50px' }}>
            <button className="btn btn-outline" onClick={() => handleNavClick('work')}>
              View All Projects <span className="arrow-icon">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="why-us-section" id="why-us">
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

      {/* Process Section */}
      <section className="process-section section-grey" id="process">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">Our Process</span>
            <h2 className="section-title-large uppercase-title">Five steps to scale.</h2>
          </div>

          <div className="process-grid-new">
            {/* Card 1 — Step 01 */}
            <div className="process-card-new">
              <span className="process-card-step-label">• Step 01</span>
              <div className="process-card-visual-box">
                <img src="/process/call_step_new.svg" alt="Discovery Call" />
              </div>
              <h3 className="process-card-title-new">DISCOVERY CALL</h3>
              <p className="process-card-desc-new">
                First, we learn your vision and requirements to define a clear project strategy.
              </p>
            </div>

            {/* Card 2 — Step 02 */}
            <div className="process-card-new">
              <span className="process-card-step-label">• Step 02</span>
              <div className="process-card-visual-box">
                <img src="/process/app_new.svg" alt="Design" />
              </div>
              <h3 className="process-card-title-new">DESIGN</h3>
              <p className="process-card-desc-new">
                We begin by understanding your vision and goals to craft the right strategy.
              </p>
            </div>

            {/* Card 3 — Step 03 */}
            <div className="process-card-new">
              <span className="process-card-step-label">• Step 03</span>
              <div className="process-card-visual-box">
                <img src="/process/development_new.svg" alt="Development" />
              </div>
              <h3 className="process-card-title-new">DEVELOPMENT</h3>
              <p className="process-card-desc-new">
                Our developers turn your designs into clean, scalable code built for the future.
              </p>
            </div>

            {/* Card 4 — Step 04 */}
            <div className="process-card-new">
              <span className="process-card-step-label">• Step 04</span>
              <div className="process-card-visual-box">
                <img src="/process/meter_new.svg" alt="Quality Assurance" />
              </div>
              <h3 className="process-card-title-new">QA & TESTING</h3>
              <p className="process-card-desc-new">
                We thoroughly test every feature, integration, and user flow to ensure flawless performance.
              </p>
            </div>

            {/* Card 5 — Step 05 */}
            <div className="process-card-new">
              <span className="process-card-step-label">• Step 05</span>
              <div className="process-card-visual-box">
                <img src="/process/deploy_new.svg" alt="Deployment" />
              </div>
              <h3 className="process-card-title-new">DEPLOYMENT</h3>
              <p className="process-card-desc-new">
                We handle server setups, app store submissions, and DNS configs for a seamless release.
              </p>
            </div>

            {/* Card 6 — CTA Card */}
            <div className="process-card-new cta-card-new" onClick={() => handleNavClick('contact')}>
              <div className="cta-card-title-new">
                LET'S TRANSFORM <br />
                YOUR IDEA INTO <br />
                REALITY
              </div>
              <button 
                className="cta-card-btn-new" 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('/#30min', '_blank');
                }}
              >
                BOOK A FREE CONSULTATION
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section section-light">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">Testimonials</span>
            <h2 className="section-title-large" style={{ margin: '0 auto 50px' }}>Our clients say it best.</h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card bg-white-card">
              <p className="testimonial-quote">
                "MarkZap didn't just redesign our website — they rebuilt how we acquire patients. The strategy was sharp, the execution was flawless, and our metrics speak for themselves."
              </p>
              <div className="client-info">
                <div className="client-avatar">AM</div>
                <div>
                  <h4 className="client-name">Aryan Mehta</h4>
                  <p className="client-role">CEO, NexaHealth</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card bg-white-card">
              <p className="testimonial-quote">
                "The design system they delivered is genuinely worth more than we paid for the entire project. Our dev team now ships features twice as fast, and our platform UX feels premium."
              </p>
              <div className="client-info">
                <div className="client-avatar">PS</div>
                <div>
                  <h4 className="client-name">Priya Sharma</h4>
                  <p className="client-role">Founder, FlowSaaS</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card bg-white-card">
              <p className="testimonial-quote">
                "In 90 days, MarkZap generated more qualified real estate leads than our previous marketing agency managed in two years. The automation setups run beautifully in the background."
              </p>
              <div className="client-info">
                <div className="client-avatar">RD</div>
                <div>
                  <h4 className="client-name">Rohan Das</h4>
                  <p className="client-role">MD, UrbanNest</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section section-dark">
        <div className="container text-center">
          <span className="tag-badge text-accent">Next Step</span>
          <h2 className="section-title-large">Ready to build something remarkable?</h2>
          <p className="section-desc-large" style={{ margin: '0 auto 40px', color: 'rgba(255,255,255,0.7)' }}>
            120+ brands trusted MarkZap to build their digital future. Let's make yours the next success story.
          </p>
          <div className="cta-actions">
            <button className="btn btn-primary" onClick={() => handleNavClick('contact')}>
              Start Your Project <span className="arrow-icon">→</span>
            </button>
            <button className="btn btn-outline-light" onClick={() => handleNavClick('contact')}>
              Schedule a Consultation
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .text-center {
          text-align: center !important;
        }
        .hero-section {
          padding-top: 140px;
          min-height: 92vh;
          display: flex;
          align-items: center;
          padding-bottom: 120px;
          background-image: radial-gradient(rgba(16, 24, 32, 0.06) 1.5px, transparent 1.5px);
          background-size: 30px 30px;
        }

        /* Two-column row */
        .hero-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          width: 100%;
        }

        .hero-content {
          flex: 0 0 auto;
          max-width: 520px;
          animation: fadeInUp 0.8s ease;
        }

        .hero-3d-canvas {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeInUp 1s ease 0.2s both;
        }

        @media (max-width: 900px) {
          .hero-section {
            padding-top: 100px;
            padding-bottom: 60px;
            min-height: auto;
            align-items: flex-start;
          }
          .hero-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 36px;
          }
          .hero-content {
            max-width: 100%;
          }
          .hero-3d-canvas {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding-top: 90px;
            padding-bottom: 50px;
          }
          .hero-row {
            gap: 28px;
          }
        }

        .hero-title {
          font-family: var(--font-accent);
          font-weight: 900;
          font-size: 46px;
          line-height: 1.25;
          letter-spacing: -1.5px;
          text-align: left;
          margin-bottom: 24px;
          display: block;
        }

        .hero-title .text-muted-grey {
          color: #a0aec0;
        }

        .hero-title .text-dark-navy {
          color: var(--color-text-dark-blue);
        }

        .hero-subtitle {
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: 15px;
          line-height: 1.6;
          max-width: 540px;
          margin-bottom: 24px;
          color: #718096;
          text-align: left;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
        }

        .desktop-only {
          display: inline;
        }

        .btn-hero-portfolio {
          background-color: var(--color-white);
          color: var(--color-text-dark-blue);
          border: 1px solid var(--color-border);
          padding: 10px 22px;
          font-weight: 700;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 12px;
          letter-spacing: 0.5px;
          transition: var(--transition-smooth);
          cursor: pointer;
        }
        
        .btn-hero-portfolio:hover {
          background-color: var(--color-grey-bg);
          border-color: #cbd5e0;
        }

        .btn-hero-quote {
          background-color: #3b66f5;
          color: var(--color-white);
          border: none;
          padding: 10px 22px;
          font-weight: 700;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 12px;
          letter-spacing: 0.5px;
          transition: var(--transition-smooth);
          cursor: pointer;
        }
        
        .btn-hero-quote:hover {
          background-color: #2a52d8;
          box-shadow: 0 6px 20px rgba(59, 102, 245, 0.4);
        }

        @media (max-width: 768px) {
          .hero-section {
            padding-top: 120px;
            min-height: auto;
          }
          .hero-title {
            font-size: 28px;
            line-height: 1.3;
            letter-spacing: -1px;
          }
          .hero-subtitle {
            font-size: 13px;
            margin-bottom: 20px;
          }
          .hero-actions {
            flex-direction: column;
            gap: 12px;
            margin-bottom: 60px;
          }
          .btn-hero-portfolio,
          .btn-hero-quote {
            width: 100%;
          }
          .desktop-only {
            display: none;
          }
        }

        /* ── Pillars Section ── */
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .pillar-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8eaf0;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pillar-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.08);
        }

        /* Visual panel container */
        .pillar-visual {
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background-color: #f3f4f6;
          background-image: radial-gradient(#d1d5db 1px, transparent 1px);
          background-size: 16px 16px;
        }

        /* ── Card 1: Dashboard Progress Mockup ── */
        .pillar-visual-dashboard {
          background-color: #f8fafc;
        }
        .pv-db-card {
          width: 170px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .pv-db-window-header {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .pv-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .pv-dot.red { background: #ef4444; }
        .pv-dot.yellow { background: #f59e0b; }
        .pv-dot.green { background: #10b981; }
        .pv-db-title {
          font-family: var(--font-sans);
          font-size: 8.5px;
          font-weight: 700;
          color: #64748b;
          margin-left: 6px;
        }
        .pv-db-body {
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pv-circular-progress {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .progress-ring-bg {
          stroke-dasharray: 150.7;
          stroke-dashoffset: 0;
        }
        .progress-ring-fill {
          stroke-dasharray: 150.7;
          stroke-dashoffset: 37.6; /* 75% progress */
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
        .progress-value {
          position: absolute;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
        }
        .pv-db-stats {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .pv-stat-row {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 7.5px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .stat-val {
          font-size: 10px;
          font-weight: 800;
        }
        .stat-val.font-blue { color: #2563eb; }
        .stat-val.font-green { color: #10b981; }

        /* ── Card 2: Development Pipeline Mockup ── */
        .pillar-visual-pipeline {
          background-color: #f8fafc;
        }
        .pv-pipeline-container {
          position: relative;
          width: 200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pv-pipeline-track {
          position: absolute;
          left: 14px;
          right: 14px;
          top: 14px;
          height: 2px;
          z-index: 1;
        }
        .pv-pipeline-line-bg {
          width: 100%;
          height: 100%;
          background: #e2e8f0;
          border-radius: 1px;
        }
        .pv-pipeline-line-active {
          height: 100%;
          background: #3b82f6;
          border-radius: 1px;
          transition: width 0.08s linear;
        }

        .pv-pipeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          position: relative;
          z-index: 2;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pv-pipeline-step .step-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s, border 0.3s, color 0.3s;
          cursor: pointer;
        }
        .pv-pipeline-step:hover .step-badge {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(59,130,246,0.15);
        }
        
        .pv-pipeline-step.step-done .step-badge {
          background: #FFB600;
          border-color: #FFB600;
          color: #ffffff;
        }
        .pv-pipeline-step.step-active {
          transform: scale(1.12);
        }
        .pv-pipeline-step.step-active .step-badge {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
        }
        .pv-pipeline-step.step-active .step-tag {
          color: #10b981;
        }
        .step-tag {
          font-family: var(--font-sans);
          font-size: 8.5px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          transition: color 0.25s ease;
        }
        .pv-pipeline-step:hover .step-tag {
          color: #1e293b;
        }
        .step-done .step-tag {
          color: #475569;
        }
        .step-active .step-tag.text-active {
          color: #10b981;
        }

        /* ── Card 3: Orbit Connector Mockup ── */
        .pillar-visual-orbit {
          background-color: #f8fafc;
        }
        .pv-orbit-container {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pv-hub-core {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #FFB600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255,182,0,0.15);
          z-index: 3;
        }
        .hub-label {
          font-family: var(--font-sans);
          font-size: 9px;
          font-weight: 800;
          color: #FFB600;
          text-transform: uppercase;
        }
        .pv-branch-line {
          position: absolute;
          background: #cbd5e1;
          height: 1.5px;
          z-index: 1;
        }
        .line-nw {
          width: 50px;
          transform: rotate(-45deg);
          top: 45px;
          left: 20px;
        }
        .line-ne {
          width: 50px;
          transform: rotate(45deg);
          top: 45px;
          right: 20px;
        }
        .line-sw {
          width: 50px;
          transform: rotate(45deg);
          bottom: 45px;
          left: 20px;
        }
        .line-se {
          width: 50px;
          transform: rotate(-45deg);
          bottom: 45px;
          right: 20px;
        }
        .pv-sat-badge {
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          overflow: hidden;
        }
        .sat-nw { top: 12px; left: 12px; }
        .sat-ne { top: 12px; right: 12px; }
        .sat-sw { bottom: 12px; left: 12px; }
        .sat-se { bottom: 12px; right: 12px; }

        /* Custom Vector Icon CSS shapes */
        
        /* 1. Network Node (AI) */
        .icon-net {
          position: relative;
          width: 14px;
          height: 14px;
        }
        .net-center {
          position: absolute;
          left: 5px; top: 5px;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #FFB600;
        }
        .net-dot {
          position: absolute;
          width: 2.5px; height: 2.5px;
          border-radius: 50%;
          background: #94a3b8;
        }
        .net-dot::before {
          content: '';
          position: absolute;
          background: #cbd5e1;
          height: 1px;
          transform-origin: left center;
        }
        .net-dot.d1 { top: 0; left: 1px; }
        .net-dot.d2 { top: 11px; left: 1px; }
        .net-dot.d3 { top: 6px; right: 0; }

        /* 2. Connection Plug (API) */
        .icon-plug {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          width: 12px;
          height: 14px;
          padding-top: 3px;
        }
        .plug-prong {
          position: absolute;
          width: 1.5px;
          height: 4px;
          background: #FFB600;
          top: 0px;
        }
        .plug-prong:first-child { left: 3px; }
        .plug-prong:last-child { right: 3px; }
        .plug-body {
          width: 8px;
          height: 8px;
          background: #0f172a;
          border-radius: 2px 2px 4px 4px;
        }

        /* 3. Database Cylinders */
        .icon-db {
          display: flex;
          flex-direction: column;
          gap: 1.5px;
          width: 10px;
        }
        .db-cylinder {
          height: 3px;
          background: #ffffff;
          border: 1.5px solid #FFB600;
          border-radius: 50% / 50%;
          box-shadow: inset 0 0 1px rgba(0,0,0,0.05);
        }

        /* 4. Cloud Shape */
        .icon-cloud {
          position: relative;
          width: 14px;
          height: 10px;
        }
        .cloud-bubble {
          position: absolute;
          background: #94a3b8;
          border-radius: 50%;
        }
        .cloud-bubble.cb1 {
          width: 8px; height: 8px;
          left: 0; top: 2px;
        }
        .cloud-bubble.cb2 {
          width: 9px; height: 9px;
          right: 0; top: 0px;
          background: #FFB600;
        }
        .cloud-base {
          position: absolute;
          bottom: 0; left: 2px;
          width: 10px; height: 4px;
          background: #FFB600;
          border-radius: 2px;
        }
        /* Card 1: Progress Ring (Static container, only path animations run) */
        .progress-ring-fill {
          animation: progress-draw 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes progress-draw {
          from { stroke-dashoffset: 150.7; }
          to { stroke-dashoffset: 37.6; }
        }

        /* Card 2: Stepper Node pulse */
        
        /* Card 3: Integrations Hub core glow */
        .pv-hub-core {
          animation: core-glow 3.5s ease-in-out infinite;
        }

        @keyframes core-glow {
          0%, 100% { box-shadow: 0 4px 15px rgba(255,182,0,0.15), 0 0 0 0 rgba(255,182,0,0.2); }
          50% { box-shadow: 0 4px 22px rgba(255,182,0,0.3), 0 0 0 8px rgba(255,182,0,0); }
        }

        /* Card body & title styles */
        .pillar-body {
          padding: 20px 24px 24px;
        }
        .pillar-title-new {
          font-family: var(--font-accent);
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--color-text-dark-blue);
          margin: 0 0 8px;
        }
        .pillar-tagline-new {
          font-size: 12px;
          line-height: 1.5;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .uppercase-title {
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .uppercase-title-card {
          text-transform: uppercase;
        }

        .pillar-list-new {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 16px;
        }
        .pillar-list-new li {
          font-size: 13px;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .check-new {
          color: #22c55e;
          font-weight: 800;
          font-size: 13px;
        }
        @media (max-width: 900px) {
          .pillars-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; }
        }

        /* Ecosystem Flow */
        .flow-diagram-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 900px;
          margin: 0 auto 60px;
          background: var(--color-grey-bg);
          padding: 24px 32px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          overflow-x: auto;
        }

        .flow-step {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .flow-box {
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-dark-blue);
          padding: 10px 20px;
          background-color: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          white-space: nowrap;
        }

        .flow-arrow {
          font-weight: 700;
          color: var(--color-accent-gold);
        }

        .ecosystem-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .ecosystem-card {
          background-color: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 30px;
          transition: var(--transition-smooth);
        }

        .ecosystem-card:hover {
          border-color: var(--color-accent-yellow);
          box-shadow: 0 10px 25px rgba(245, 200, 0, 0.05);
        }

        .eco-icon-wrapper {
          font-size: 28px;
          margin-bottom: 20px;
          background-color: var(--color-grey-bg);
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .ecosystem-card h4 {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .ecosystem-card p {
          font-size: 14px;
        }

        @media (max-width: 900px) {
          .ecosystem-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .ecosystem-grid {
            grid-template-columns: 1fr;
          }
          .flow-diagram-container {
            flex-direction: column;
            gap: 16px;
            align-items: center;
          }
          .flow-step {
            flex-direction: column;
            gap: 8px;
            align-items: center;
          }
          .flow-arrow {
            transform: rotate(90deg);
            margin: 4px 0;
          }
        }

        /* Featured Work */
        .work-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .work-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          background-color: transparent;
          border: 1px solid var(--color-border);
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-muted);
          transition: var(--transition-fast);
        }

        .filter-btn:hover,
        .filter-btn.active {
          background-color: var(--color-text-dark-blue);
          color: var(--color-white);
          border-color: var(--color-text-dark-blue);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .project-card {
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        .project-thumb {
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: var(--color-white);
        }

        .project-letter {
          font-family: var(--font-serif);
          font-size: 120px;
          font-weight: 700;
          opacity: 0.15;
        }

        .project-cat-badge {
          position: absolute;
          bottom: 20px;
          left: 24px;
          background-color: var(--color-white);
          color: var(--color-text-dark-blue);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .project-details {
          padding: 30px;
        }

        .project-meta {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-gray);
          display: block;
          margin-bottom: 12px;
        }

        .project-title {
          font-family: var(--font-serif);
          font-size: 24px;
          margin-bottom: 12px;
        }

        .project-description {
          font-size: 14px;
          margin-bottom: 20px;
        }

        .project-metric {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border);
        }

        .metric-text {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 13px;
          color: var(--color-text-dark-blue);
        }

        .no-projects {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 0;
          color: var(--color-text-muted);
        }

        @media (max-width: 900px) {
          .work-section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .projects-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Why Us Section */
        .why-us-section {
          background-color: #ffffff;
          padding: var(--section-padding);
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

        /* Process Steps */
        .process-grid-new {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin-top: 50px;
        }
        .process-card-new {
          background: #ffffff;
          border: 1px solid #e8eaf0;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        .process-card-new:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }
        .process-card-step-label {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          color: #3b66f5;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }
        .process-card-visual-box {
          height: 150px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        .process-card-visual-box img {
          width: 100%;
          height: 100%;
          padding: 4px;
          object-fit: contain;
          transition: transform 0.4s ease;
        }
        .process-card-new:hover .process-card-visual-box img {
          transform: scale(1.05);
        }
        .process-card-title-new {
          font-family: var(--font-accent);
          font-size: 16px;
          font-weight: 800;
          color: var(--color-text-dark-blue);
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .process-card-desc-new {
          font-size: 12.5px;
          line-height: 1.6;
          color: #64748b;
          margin: 0;
        }
        
        /* CTA Card Specific */
        .process-card-new.cta-card-new {
          background-color: #3b66f5;
          border-color: #3b66f5;
          justify-content: space-between;
          align-items: flex-start;
          text-align: left;
          cursor: pointer;
          min-height: 290px;
          position: relative;
          background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 8px 100%;
        }
        .process-card-new.cta-card-new:hover {
          background-color: #2a52d8;
          border-color: #2a52d8;
          box-shadow: 0 16px 36px rgba(59,102,245,0.3);
        }
        .cta-card-title-new {
          font-family: var(--font-accent);
          font-size: 24px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.35;
          text-transform: uppercase;
          margin-top: 10px;
          margin-bottom: 0;
        }
        .cta-card-btn-new {
          width: 100%;
          background-color: #1a1f26;
          color: #ffffff;
          border: 1.5px solid #ffffff;
          border-radius: 8px;
          padding: 12px 16px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease;
          margin-top: auto;
          text-align: center;
        }
        .cta-card-btn-new:hover {
          background-color: #0f1319;
          transform: scale(1.02);
        }

        @media (max-width: 1024px) {
          .process-grid-new {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .process-grid-new {
            grid-template-columns: 1fr;
            max-width: 440px;
            margin: 0 auto;
          }
        }

        /* Testimonials */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .testimonial-card {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .testimonial-card:hover {
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.04);
          transform: translateY(-4px);
        }

        .testimonial-quote {
          font-size: 15px;
          font-style: italic;
          color: var(--color-text-dark-blue);
          line-height: 1.7;
          margin-bottom: 30px;
          position: relative;
        }

        .client-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .client-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: var(--color-accent-yellow);
          color: var(--color-text-dark-blue);
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .client-name {
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .client-role {
          font-size: 12px;
          color: var(--color-text-gray);
        }

        @media (max-width: 900px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        /* Final CTA */
        .final-cta-section {
          padding: 120px 0;
        }

        .cta-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        @media (max-width: 600px) {
          .cta-actions {
            flex-direction: column;
            align-items: center;
          }
          .cta-actions .btn {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  );
}
