import React from 'react';

export default function Footer({ setCurrentPage }) {
  const handleNavClick = (pageId, e) => {
    e.preventDefault();
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo" onClick={(e) => handleNavClick('home', e)}>
              <span className="logo-icon">⚡</span>
              <span className="logo-text">MarkZap</span>
            </div>
            <p className="brand-tagline">
              A premium growth ecosystem for brands, products, and digital systems. We unify design, technology, and growth strategy.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="LinkedIn">LN</a>
              <a href="#" className="social-link" aria-label="Twitter">TW</a>
              <a href="#" className="social-link" aria-label="Instagram">IG</a>
              <a href="#" className="social-link" aria-label="Dribbble">DR</a>
            </div>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-title">Services</h4>
            <ul className="footer-links">
              <li><a href="#services" onClick={(e) => handleNavClick('services', e)}>Branding</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick('services', e)}>Product Design</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick('services', e)}>Development</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick('services', e)}>Growth Marketing</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick('services', e)}>AI Automation</a></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#about" onClick={(e) => handleNavClick('about', e)}>About Us</a></li>
              <li><a href="#about" onClick={(e) => handleNavClick('about', e)}>Our Story</a></li>
              <li><a href="#about" onClick={(e) => handleNavClick('about', e)}>Team</a></li>
              <li><a href="#about" onClick={(e) => handleNavClick('about', e)}>Culture</a></li>
              <li><a href="#about" onClick={(e) => handleNavClick('about', e)}>Careers</a></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-links contact-details">
              <li>
                <span className="contact-label">Email:</span>
                <a href="mailto:hello@markzap.io">hello@markzap.io</a>
              </li>
              <li>
                <span className="contact-label">Phone:</span>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li>
                <span className="contact-label">Office:</span>
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 MarkZap. All rights reserved.</p>
          <p className="footer-slogan">Design. Technology. Growth.</p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background-color: var(--color-dark-bg);
          color: var(--color-white);
          padding: 80px 0 40px;
          border-top: 1px solid var(--color-border-dark);
        }

        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 24px;
          color: var(--color-white);
        }

        .brand-tagline {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          max-width: 320px;
          line-height: 1.6;
        }

        .social-links {
          display: flex;
          gap: 12px;
        }

        .social-link {
          width: 36px;
          height: 36px;
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          transition: var(--transition-fast);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .social-link:hover {
          background-color: var(--color-accent-yellow);
          color: var(--color-text-dark-blue);
          border-color: var(--color-accent-yellow);
          transform: translateY(-2px);
        }

        .footer-title {
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 24px;
          color: var(--color-white);
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links a {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          transition: var(--transition-fast);
        }

        .footer-links a:hover {
          color: var(--color-accent-yellow);
          padding-left: 4px;
        }

        .contact-details li {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
        }

        .footer-slogan {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 900px) {
          .footer-top {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 600px) {
          .footer-top {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
