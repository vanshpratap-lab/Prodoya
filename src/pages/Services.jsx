import React, { useState } from 'react';

export default function Services({ setCurrentPage }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const servicesList = [
    {
      id: 'branding',
      num: '01',
      title: 'Branding',
      heading: 'Identity That Commands Attention',
      description: 'Build a strong, recognizable identity that sets your business apart. We craft cohesive brand systems that communicate trust, clarity, and long-term value.',
      deliverables: ['Brand Strategy', 'Visual Identity', 'Brand Guidelines', 'Logo Design', 'Pitch Decks', 'Packaging Design', 'Rebranding']
    },
    {
      id: 'design',
      num: '02',
      title: 'Product Design',
      heading: 'Experiences That Convert',
      description: 'We focus on usability, engagement, and conversions — not just visuals. Our designs are thoroughly researched, wireframed, and tested for real business outcomes.',
      deliverables: ['UX Research', 'UI Design', 'Wireframing & Prototyping', 'Design Systems', 'Mobile App Interfaces', 'Web Applications', 'Interactive Mockups']
    },
    {
      id: 'dev',
      num: '03',
      title: 'Development',
      heading: 'Built to Perform, Built to Scale',
      description: 'Clean, performant, and search-optimized code. We build robust frontends, backends, and custom APIs using modern frameworks that load immediately.',
      deliverables: ['Performance Websites', 'Web Applications', 'E-commerce Solutions', 'CMS Integrations', 'Custom APIs & Database Setup', 'SEO Optimization']
    },
    {
      id: 'growth',
      num: '04',
      title: 'Digital Growth',
      heading: 'Marketing That Compounds',
      description: 'Acquisition pipelines engineered to fill your pipeline with high-value clients. We tie marketing campaigns directly to conversion metrics.',
      deliverables: ['Search Engine Optimization (SEO)', 'Search Engine Marketing (SEM)', 'Paid Social Campaigns', 'Email Marketing Strategy', 'Conversion Rate Optimization (CRO)', 'Performance Dashboards']
    },
    {
      id: 'ai',
      num: '05',
      title: 'AI & Automation',
      heading: 'Scale Without Scaling Headcount',
      description: 'Workflows that run in the background. We integrate AI into your operations to qualify leads, nurture prospects, and automate repetitive tasks.',
      deliverables: ['Automated Lead Qualification', 'Client Nurturing Sequences', 'Data Enrichment Sprints', 'Automated Performance Reporting', 'CRM System Integrations']
    }
  ];

  const faqs = [
    {
      question: 'How long does a typical project take?',
      answer: 'A typical project takes anywhere from 4 to 12 weeks depending on the scope. Brand identity sprints usually take 4-6 weeks, while complex full-stack web application development takes 8-12 weeks.'
    },
    {
      question: 'What is your pricing model?',
      answer: 'Every project is scoped based on what you actually need, we don\'t believe in one-size-fits-all pricing. Book a free brand audit call and we\'ll give you a clear, honest quote within 24 hours. No vague estimates, no surprise additions.'
    },
    {
      question: 'Do you work with startups?',
      answer: 'Yes, we work with both early-stage startups trying to hit product-market fit, and established mid-market enterprises looking to optimize and scale their operations.'
    },
    {
      question: 'Do you offer post-launch support?',
      answer: 'Yes, we offer monthly retainer structures for maintenance, optimization, and continuous experiments (A/B testing, growth sprints, and feature expansions) as your business scales.'
    }
  ];

  const toggleFaq = (idx) => {
    if (activeFaq === idx) {
      setActiveFaq(null);
    } else {
      setActiveFaq(idx);
    }
  };

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="services-page animate-fade-in-up">
      {/* Services Hero */}
      <section className="services-hero section-light">
        <div className="container">
          <div className="hero-content">
            <span className="tag-badge light">OUR SERVICES</span>
            <h1 className="services-hero-title">
              Everything You Need to <br />
              <span className="text-highlight">Build and Scale Digitally</span>
            </h1>
            <p className="hero-subtitle">
              From brand strategy to AI automation, we offer a complete suite of services designed to work together as one integrated growth engine.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview Navigation cards */}
      <section className="services-nav section-grey">
        <div className="container">
          <div className="services-overview-grid">
            {servicesList.map((service) => (
              <a key={service.id} href={`#${service.id}`} className="overview-link-card bg-white-card">
                <span className="overview-num">{service.num}</span>
                <h3 className="overview-title">{service.title}</h3>
                <p className="overview-desc">{service.description.substring(0, 70)}...</p>
                <span className="overview-arrow">↓</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Service Detailed Sections */}
      {servicesList.map((service, idx) => (
        <section 
          key={service.id} 
          id={service.id} 
          className={`service-detail-section ${idx % 2 === 0 ? 'section-light' : 'section-grey'}`}
        >
          <div className="container">
            <div className="service-detail-grid">
              <div className="service-detail-text">
                <span className="service-detail-num">{service.num}</span>
                <span className="tag-badge">{service.title}</span>
                <h2 className="service-detail-title">{service.heading}</h2>
                <p className="service-detail-desc">{service.description}</p>
              </div>

              <div className="service-detail-deliverables bg-white-card">
                <h3 className="deliverables-title">What We Deliver</h3>
                <ul className="deliverables-list">
                  {service.deliverables.map((item) => (
                    <li key={item}>
                      <span className="check-icon">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* FAQs Section */}
      <section className="faqs-section section-light">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">FAQs</span>
            <h2 className="section-title-large" style={{ margin: '0 auto 20px' }}>Common Questions</h2>
            <p className="section-desc-large" style={{ margin: '0 auto 60px' }}>
              Everything you need to know about starting a project with us, timelines, and scaling.
            </p>
          </div>

          <div className="faq-accordion">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`faq-item ${activeFaq === idx ? 'active' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services CTA */}
      <section className="services-cta section-dark">
        <div className="container text-center">
          <span className="tag-badge text-accent">Next Step</span>
          <h2 className="section-title-large">Book a Strategy Call</h2>
          <p className="section-desc-large" style={{ margin: '0 auto 40px', color: 'rgba(255,255,255,0.7)' }}>
            Let's talk about your goals, current bottlenecks, and outline a tailored roadmap to scale your business.
          </p>
          <button className="btn btn-primary" onClick={() => handleNavClick('contact')}>
            Schedule Call Now <span className="arrow-icon">→</span>
          </button>
        </div>
      </section>

      <style>{`
        .services-hero {
          padding-top: 160px;
          min-height: 500px;
          display: flex;
          align-items: center;
        }

        .services-hero-title {
          font-size: 72px;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }

        /* Overview Link Grid */
        .services-overview-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .overview-link-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 220px;
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .overview-link-card:hover {
          transform: translateY(-6px);
          border-color: var(--color-accent-yellow);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.04);
        }

        .overview-num {
          font-size: 11px;
          font-weight: 800;
          color: var(--color-accent-gold);
        }

        .overview-title {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-dark-blue);
          margin: 16px 0 8px;
        }

        .overview-desc {
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .overview-arrow {
          font-weight: 700;
          color: var(--color-accent-gold);
          align-self: flex-end;
        }

        @media (max-width: 1024px) {
          .services-overview-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .services-overview-grid {
            grid-template-columns: 1fr;
          }
          .overview-link-card {
            height: auto;
            gap: 12px;
          }
        }

        /* Detailed sections */
        .service-detail-section {
          padding: 120px 0;
        }

        .service-detail-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .service-detail-num {
          font-family: var(--font-sans);
          font-size: 18px;
          font-weight: 800;
          color: var(--color-accent-gold);
          display: block;
          margin-bottom: 12px;
        }

        .service-detail-title {
          font-size: 44px;
          margin: 16px 0 24px;
          letter-spacing: -1px;
        }

        .service-detail-desc {
          font-size: 18px;
          line-height: 1.7;
        }

        .service-detail-deliverables {
          padding: 40px;
          border-radius: 4px;
        }

        .deliverables-title {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-dark-blue);
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border);
        }

        .deliverables-list {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .deliverables-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .check-icon {
          color: var(--color-accent-gold);
          font-weight: bold;
        }

        @media (max-width: 900px) {
          .service-detail-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
        @media (max-width: 768px) {
          .service-detail-title {
            font-size: 28px;
            margin: 12px 0 16px;
          }
          .service-detail-desc {
            font-size: 15px;
          }
          .service-detail-deliverables {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
