import React, { useState } from 'react';

export default function Work({ setCurrentPage }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Branding', 'Website', 'Product', 'Marketing', 'AI'];

  const projects = [
    {
      id: 'nexahealth',
      name: 'NexaHealth',
      category: 'Website',
      tags: ['Healthcare', 'Brand + Web'],
      description: 'Full brand identity and conversion-optimised website for a leading healthcare provider.',
      metric: '340% patient inquiry growth',
      iconText: 'N',
      color: '#34495e'
    },
    {
      id: 'flowsaas',
      name: 'FlowSaaS',
      category: 'Product',
      tags: ['SaaS', 'Product Design'],
      description: 'End-to-end UX redesign and design system for a B2B workflow platform.',
      metric: '2.4× trial-to-paid conversion',
      iconText: 'F',
      color: '#1abc9c'
    },
    {
      id: 'urbannest',
      name: 'UrbanNest',
      category: 'Marketing',
      tags: ['Real Estate', 'Full Ecosystem'],
      description: 'Brand, web, and automated lead-gen ecosystem for a premium real estate developer.',
      metric: '₹4.2Cr leads in 90 days',
      iconText: 'U',
      color: '#d35400'
    },
    {
      id: 'satva',
      name: 'Satva Organics',
      category: 'Branding',
      tags: ['D2C Brand', 'Branding + E-commerce'],
      description: 'Premium brand identity, packaging design, and high-performance Shopify storefront for an organic skincare line.',
      metric: '82% increase in average order value',
      iconText: 'S',
      color: '#27ae60'
    },
    {
      id: 'zenithai',
      name: 'Zenith AI',
      category: 'AI',
      tags: ['AI Tech', 'Branding & Web App'],
      description: 'Custom brand identity and dashboard interface design for an enterprise operations copilot.',
      metric: '60% reduction in customer setup time',
      iconText: 'Z',
      color: '#8e44ad'
    },
    {
      id: 'apexventures',
      name: 'Apex Ventures',
      category: 'Branding',
      tags: ['Fintech', 'Brand & Pitch Deck'],
      description: 'Brand overhaul, communication guidelines, and investor pitch decks for a growth-stage venture capital firm.',
      metric: 'Raised $50M in Series B round',
      iconText: 'A',
      color: '#2980b9'
    }
  ];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category === activeFilter || p.tags.some(t => t.includes(activeFilter)));

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="work-page animate-fade-in-up">
      {/* Work Hero */}
      <section className="work-hero section-light">
        <div className="container">
          <div className="hero-content">
            <span className="tag-badge light">PORTFOLIO</span>
            <h1 className="work-hero-title">Work Showcase</h1>
            <p className="hero-subtitle">
              A curated selection of our recent projects bridging design, technology, and growth strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Grid */}
      <section className="portfolio-section section-grey">
        <div className="container">
          <div className="filter-tabs-wrapper">
            <div className="filter-tabs">
              {filters.map(filter => (
                <button
                  key={filter}
                  className={`filter-tab-btn ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span className="projects-count">{filteredProjects.length} Projects Shown</span>
          </div>

          <div className="work-showcase-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="showcase-card bg-white-card">
                <div className="showcase-thumb" style={{ backgroundColor: project.color }}>
                  <div className="showcase-letter">{project.iconText}</div>
                  <span className="showcase-cat">{project.category}</span>
                </div>
                <div className="showcase-details">
                  <span className="showcase-tags">{project.tags.join(' · ')}</span>
                  <h3 className="showcase-title">{project.name}</h3>
                  <p className="showcase-desc">{project.description}</p>
                  <div className="showcase-metric">
                    <span className="showcase-metric-icon">📈</span>
                    <span className="showcase-metric-text">{project.metric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Consultation CTA */}
      <section className="work-cta section-light">
        <div className="container bg-white-card cta-box-nested">
          <div className="cta-grid">
            <div className="cta-left">
              <span className="tag-badge">Ready to Start?</span>
              <h2>Schedule a Consultation</h2>
              <p>
                Book a 30-minute discovery call with our team. We'll discuss your goals, audit your current setups, and outline a custom growth roadmap for your project.
              </p>
            </div>
            <div className="cta-right">
              <button className="btn btn-primary" onClick={() => handleNavClick('contact')}>
                Schedule Now <span className="arrow-icon">→</span>
              </button>
              <a href="mailto:hello@markzap.io" className="btn btn-outline">
                Email Us Instead
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .work-hero {
          padding-top: 160px;
          min-height: 400px;
          display: flex;
          align-items: center;
        }

        .work-hero-title {
          font-size: 72px;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }

        /* Filters */
        .filter-tabs-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 50px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 20px;
        }

        .filter-tabs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-tab-btn {
          background-color: transparent;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-gray);
          transition: var(--transition-fast);
          position: relative;
        }

        .filter-tab-btn:hover {
          color: var(--color-text-dark-blue);
        }

        .filter-tab-btn.active {
          color: var(--color-text-dark-blue);
          font-weight: 700;
        }

        .filter-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -21px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--color-accent-yellow);
        }

        .projects-count {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-gray);
        }

        /* Showcase Grid */
        .work-showcase-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }

        .showcase-card {
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .showcase-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border-color: var(--color-accent-yellow);
        }

        .showcase-thumb {
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: var(--color-white);
        }

        .showcase-letter {
          font-family: var(--font-serif);
          font-size: 160px;
          font-weight: 700;
          opacity: 0.18;
        }

        .showcase-cat {
          position: absolute;
          bottom: 24px;
          left: 30px;
          background-color: var(--color-white);
          color: var(--color-text-dark-blue);
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .showcase-details {
          padding: 40px;
        }

        .showcase-tags {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-gray);
          display: block;
          margin-bottom: 12px;
        }

        .showcase-title {
          font-family: var(--font-serif);
          font-size: 28px;
          margin-bottom: 16px;
        }

        .showcase-desc {
          font-size: 15px;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .showcase-metric {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
        }

        .showcase-metric-text {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 14px;
          color: var(--color-text-dark-blue);
        }

        @media (max-width: 900px) {
          .work-showcase-grid {
            grid-template-columns: 1fr;
          }
          .filter-tabs-wrapper {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .filter-tab-btn.active::after {
            display: none;
          }
        }
        @media (max-width: 768px) {
          .showcase-thumb {
            height: 240px;
          }
          .showcase-letter {
            font-size: 100px;
          }
          .showcase-details {
            padding: 24px;
          }
          .showcase-title {
            font-size: 22px;
            margin-bottom: 10px;
          }
          .showcase-desc {
            font-size: 14px;
            margin-bottom: 16px;
          }
        }

        /* Nested CTA Box */
        .cta-box-nested {
          border: 1px solid var(--color-border);
          padding: 60px !important;
          border-radius: 6px;
          transition: var(--transition-fast);
        }

        .cta-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .cta-left h2 {
          font-size: 36px;
          margin-top: 16px;
          margin-bottom: 16px;
        }

        .cta-left p {
          max-width: 500px;
          font-size: 15px;
        }

        .cta-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
        }

        @media (max-width: 768px) {
          .cta-grid {
            grid-template-columns: 1fr;
          }
          .cta-box-nested {
            padding: 30px !important;
          }
        }
      `}</style>
    </div>
  );
}
