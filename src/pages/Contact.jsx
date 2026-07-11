import React from 'react';

export default function Contact() {
  const handleBookingClick = () => {
    window.open('/#30min', '_blank');
  };

  return (
    <div className="contact-page animate-fade-in-up">
      {/* Page Header */}
      <section className="contact-header">
        <div className="container text-center">
          <h1 className="contact-title-main">CONTACT US</h1>
          <p className="contact-subtitle-main">
            Don't wait! Build your product now and transform your vision into reality.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="contact-body-section">
        <div className="container contact-container">
          <div className="contact-grid">
            
            {/* Left Content */}
            <div className="contact-left">
              <h2 className="contact-heading-left">
                LET'S BUILD SOMETHING<br />AMAZING TOGETHER
              </h2>
              <p className="contact-subtext-left">
                Ready to bring your app idea to life? Book a free consultation with our experts.
              </p>
              
              <button className="contact-booking-btn" onClick={handleBookingClick}>
                BOOK FREE CONSULTATION
              </button>

              {/* Steps Checklist */}
              <div className="contact-steps-list">
                <div className="contact-step-item">
                  <div className="step-badge-circle">01</div>
                  <span className="step-text">Share your app idea with us</span>
                </div>
                <div className="contact-step-divider"></div>
                <div className="contact-step-item">
                  <div className="step-badge-circle">02</div>
                  <span className="step-text">Get a free project assessment</span>
                </div>
                <div className="contact-step-divider"></div>
                <div className="contact-step-item">
                  <div className="step-badge-circle">03</div>
                  <span className="step-text">Receive a tailored development plan</span>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="contact-right">
              <div className="contact-info-card">
                <h3 className="contact-card-title">GET IN TOUCH</h3>
                
                <div className="contact-channels">
                  {/* WhatsApp */}
                  <div className="channel-item">
                    <div className="channel-icon-bg">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.99L2 22l5.233-1.371a9.942 9.942 0 0 0 4.779 1.218h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062C17.199 3.037 14.685 2 12.012 2zm5.727 14.13c-.244.688-1.427 1.251-1.956 1.305-.48.049-.961.082-2.73-.652-2.261-.937-3.697-3.238-3.811-3.388-.112-.15-1.002-1.332-1.002-2.54 0-1.209.633-1.803.857-2.046.224-.244.488-.305.651-.305.163 0 .325.002.467.009.148.007.348-.056.545.419.203.49.692 1.688.753 1.81.061.122.102.264.02.427-.082.163-.122.264-.244.407-.122.143-.257.319-.366.427-.122.122-.25.255-.107.502.143.244.636 1.05 1.365 1.701.937.836 1.73 1.096 1.974 1.218.244.122.387.102.53-.061.143-.163.611-.713.774-.956.163-.244.325-.203.549-.122.224.081 1.424.671 1.668.793.244.122.407.183.467.285.061.102.061.59-.183 1.278z"/>
                      </svg>
                    </div>
                    <div className="channel-details">
                      <span className="channel-label">WhatsApp</span>
                      <a href="https://wa.me/919754352051" target="_blank" rel="noreferrer" className="channel-val">
                        +91 9754352051
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="channel-item">
                    <div className="channel-icon-bg">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                    </div>
                    <div className="channel-details">
                      <span className="channel-label">Phone</span>
                      <a href="tel:+919754352051" className="channel-val">
                        +91 9754352051
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="channel-item">
                    <div className="channel-icon-bg">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div className="channel-details">
                      <span className="channel-label">Email</span>
                      <a href="mailto:info@flutteryourway.com" className="channel-val">
                        info@flutteryourway.com
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="channel-item">
                    <div className="channel-icon-bg">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div className="channel-details">
                      <span className="channel-label">Address</span>
                      <span className="channel-val-text">Working remotely worldwide</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        /* Contact page styles matching the prompt layout exactly */
        .contact-page {
          background-color: #f7f9fc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 80px 0 120px;
        }

        .contact-header {
          padding: 60px 0 40px;
        }

        .contact-title-main {
          font-size: 46px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 12px;
          letter-spacing: -1.5px;
          text-transform: uppercase;
        }

        .contact-subtitle-main {
          font-size: 16px;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .contact-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
          margin-top: 40px;
        }

        .contact-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .contact-heading-left {
          font-size: 40px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.15;
          margin-bottom: 20px;
          letter-spacing: -1.2px;
          text-transform: uppercase;
        }

        .contact-subtext-left {
          font-size: 16px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 30px;
          max-width: 480px;
        }

        .contact-booking-btn {
          background-color: #3b66f5;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          padding: 15px 36px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 14px rgba(59, 102, 245, 0.3);
          transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
          margin-bottom: 45px;
          text-transform: uppercase;
        }

        .contact-booking-btn:hover {
          background-color: #2b52d9;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 102, 245, 0.4);
        }

        .contact-booking-btn:active {
          transform: translateY(0);
        }

        /* Step checklist styling */
        .contact-steps-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          padding-left: 2px;
        }

        .contact-step-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .step-badge-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #1e293b;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
          z-index: 2;
        }

        .step-text {
          font-size: 14.5px;
          font-weight: 600;
          color: #334155;
        }

        .contact-step-divider {
          width: 1px;
          height: 18px;
          border-left: 1px dashed #cbd5e1;
          margin-left: 16px;
        }

        /* Right info card styling */
        .contact-info-card {
          background-color: #ffffff;
          border-radius: 24px;
          padding: 45px 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
          border: 1px solid #f1f5f9;
        }

        .contact-card-title {
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 30px;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }

        .contact-channels {
          display: flex;
          flex-direction: column;
          gap: 26px;
        }

        .channel-item {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .channel-icon-bg {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #f1f5f9;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 0.2s, color 0.2s;
        }

        .channel-item:hover .channel-icon-bg {
          background-color: #3b66f5;
          color: #ffffff;
        }

        .channel-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .channel-label {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
        }

        .channel-val {
          font-size: 14.5px;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          transition: color 0.15s;
        }

        .channel-val:hover {
          color: #3b66f5;
        }

        .channel-val-text {
          font-size: 14.5px;
          font-weight: 600;
          color: #64748b;
        }

        /* Responsive Design */
        @media (max-width: 991px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }
          .contact-left {
            align-items: center;
            text-align: center;
          }
          .contact-subtext-left {
            max-width: 100%;
          }
          .contact-steps-list {
            align-items: center;
          }
          .contact-step-divider {
            margin-left: 0;
          }
        }

        @media (max-width: 576px) {
          .contact-title-main {
            font-size: 34px;
          }
          .contact-heading-left {
            font-size: 30px;
          }
          .contact-info-card {
            padding: 30px 24px;
          }
        }
      `}</style>
    </div>
  );
}
