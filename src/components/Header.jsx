import React, { useState } from 'react';

export default function Header({ currentPage, setCurrentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'HOME', id: 'home' },
    { name: 'SERVICES', id: 'services' },
    { name: 'WHY US', id: 'about' },
    { name: 'PROJECTS', id: 'work' },
    { name: 'CONTACT', id: 'contact' }
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo" onClick={() => handleNavClick('home')}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">MarkZap</span>
        </div>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <ul>
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={currentPage === link.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id);
                  }}
                >
                  {link.name}
                  {currentPage === link.id && <span className="nav-indicator" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-cta">
          <button className="btn btn-primary" onClick={() => handleNavClick('contact')} style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px' }}>
            Book Free Consultation
          </button>
        </div>

        {/* Hamburger Menu Icon */}
        <button
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          <ul>
            {navLinks.map((link) => (
              <li key={link.id} style={{ animationDelay: `${navLinks.indexOf(link) * 0.1}s` }}>
                <a
                  href={`#${link.id}`}
                  className={currentPage === link.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id);
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <button className="btn btn-primary mobile-cta-btn" onClick={() => handleNavClick('contact')} style={{ textTransform: 'uppercase', fontWeight: 700 }}>
            Book Free Consultation
          </button>
        </nav>
      </div>

      <style>{`
        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background-color: rgba(250, 250, 248, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
          z-index: 1000;
          display: flex;
          align-items: center;
          transition: var(--transition-smooth);
        }

        .header-container {
          max-width: var(--container-width);
          margin: 0 auto;
          padding: 0 40px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 22px;
          color: var(--color-text-dark-blue);
          user-select: none;
        }

        .logo-icon {
          font-size: 20px;
          background: var(--color-accent-yellow);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .logo-text {
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .desktop-nav ul {
          display: flex;
          list-style: none;
          gap: 32px;
        }

        .desktop-nav a {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.5px;
          color: var(--color-text-muted);
          position: relative;
          padding: 8px 0;
          display: inline-block;
          text-transform: uppercase;
        }

        .desktop-nav a:hover,
        .desktop-nav a.active {
          color: var(--color-text-dark-blue);
        }

        .nav-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--color-accent-yellow);
          border-radius: 2px;
        }

        .header-cta {
          display: block;
        }

        .header-cta .btn {
          padding: 10px 20px;
          font-size: 13px;
        }

        .arrow {
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .header-cta .btn:hover .arrow {
          transform: translateX(4px);
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 1001;
          padding: 0;
        }

        .mobile-menu-toggle span {
          width: 100%;
          height: 2px;
          background-color: var(--color-text-dark-blue);
          transition: var(--transition-smooth);
        }

        .mobile-menu-toggle.open span:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }

        .mobile-menu-toggle.open span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-toggle.open span:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }

        /* Mobile Nav Overlay */
        .mobile-nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: var(--color-light-bg);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition-smooth);
        }

        .mobile-nav-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-nav ul {
          list-style: none;
          text-align: center;
          margin-bottom: 40px;
        }

        .mobile-nav li {
          margin-bottom: 24px;
          opacity: 0;
          transform: translateY(20px);
        }

        .mobile-nav-overlay.open .mobile-nav li {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .mobile-nav a {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 32px;
          color: var(--color-text-dark-blue);
          transition: var(--transition-fast);
        }

        .mobile-nav a:hover,
        .mobile-nav a.active {
          color: var(--color-accent-yellow);
        }

        .mobile-cta-btn {
          width: 100%;
          max-width: 280px;
        }

        @media (max-width: 900px) {
          .desktop-nav,
          .header-cta {
            display: none;
          }
          .mobile-menu-toggle {
            display: flex;
          }
          .header-container {
            padding: 0 20px;
          }
        }
      `}</style>
    </header>
  );
}
