import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    details: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const projectTypes = [
    'Branding',
    'Product Design',
    'Full-Stack Development',
    'Growth Marketing',
    'AI & Automation'
  ];

  const budgets = [
    'Under ₹5 Lakhs',
    '₹5 Lakhs - ₹15 Lakhs',
    '₹15 Lakhs - ₹30 Lakhs',
    'Above ₹30 Lakhs'
  ];

  const faqs = [
    {
      question: 'How quickly can we get started?',
      answer: 'We typically onboard new clients within 7 to 14 business days of signing a proposal. This allows us to set up communications, collect assets, and schedule the kickoff workshop.'
    },
    {
      question: 'Do we sign an NDA before discussing project details?',
      answer: 'Yes, we value confidentiality. We can sign a standard Mutual NDA before scheduling our discovery call if you require it.'
    },
    {
      question: 'Who will I be working with directly?',
      answer: 'You will work with a dedicated project strategist along with lead designers and developers. We do not outsource our work; everything is handled by our senior core team.'
    }
  ];

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Full Name is required';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email Address is invalid';
    }

    if (!formData.projectType) tempErrors.projectType = 'Please select a project type';
    if (!formData.budget) tempErrors.budget = 'Please select a budget range';
    if (!formData.details.trim()) tempErrors.details = 'Please tell us briefly about your project';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitted(true);
      // Simulate form submission
      console.log('Submitted contact form:', formData);
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        projectType: '',
        budget: '',
        details: ''
      });
    }
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="contact-page animate-fade-in-up">
      {/* Contact Hero */}
      <section className="contact-hero-section section-light">
        <div className="container">
          <div className="hero-content">
            <span className="tag-badge light">GET IN TOUCH</span>
            <h1 className="contact-hero-title">
              Let's Build Something <br />
              <span className="text-highlight">Great Together</span>
            </h1>
            <p className="hero-subtitle">
              Whether you're launching a new brand, scaling a product, or rethinking your growth strategy — we're ready to help. Let's start the conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="contact-form-section section-grey">
        <div className="container">
          <div className="contact-main-grid">
            {/* Form Column */}
            <div className="contact-form-card bg-white-card">
              {isSubmitted ? (
                <div className="success-message text-center">
                  <div className="success-icon">✓</div>
                  <h2>Message Sent Successfully!</h2>
                  <p>
                    Thank you for reaching out. A growth strategist from the MarkZap team will review your project details and get back to you within 24 hours with proposed next steps.
                  </p>
                  <button className="btn btn-primary" onClick={() => setIsSubmitted(false)}>
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h3 className="form-card-title">Start Your Project</h3>
                  <p className="form-card-subtitle">Tell us about your vision, and we'll get back to you within 24 hours.</p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Your Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        className={`form-input ${errors.name ? 'input-error' : ''}`}
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="john@example.com"
                        className={`form-input ${errors.email ? 'input-error' : ''}`}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="company">Company Name</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        placeholder="Acme Inc."
                        className="form-input"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="projectType">Project Type *</label>
                      <select
                        id="projectType"
                        name="projectType"
                        className={`form-input ${errors.projectType ? 'input-error' : ''}`}
                        value={formData.projectType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select service...</option>
                        {projectTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {errors.projectType && <span className="form-error">{errors.projectType}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="budget">Estimated Budget Range *</label>
                    <select
                      id="budget"
                      name="budget"
                      className={`form-input ${errors.budget ? 'input-error' : ''}`}
                      value={formData.budget}
                      onChange={handleInputChange}
                    >
                      <option value="">Select budget range...</option>
                      {budgets.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {errors.budget && <span className="form-error">{errors.budget}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="details">About the Project *</label>
                    <textarea
                      id="details"
                      name="details"
                      placeholder="Tell us briefly about your goals, timing, and what you would like to build..."
                      className={`form-textarea ${errors.details ? 'input-error' : ''}`}
                      value={formData.details}
                      onChange={handleInputChange}
                    ></textarea>
                    {errors.details && <span className="form-error">{errors.details}</span>}
                  </div>

                  <button type="submit" className="btn btn-primary submit-btn">
                    Start a Conversation <span className="arrow-icon">→</span>
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="contact-sidebar">
              <div className="info-block bg-white-card">
                <h3>Contact Information</h3>
                <ul className="info-list">
                  <li>
                    <span className="info-icon">✉</span>
                    <div>
                      <strong>Email Us</strong>
                      <a href="mailto:hello@markzap.io">hello@markzap.io</a>
                    </div>
                  </li>
                  <li>
                    <span className="info-icon">☎</span>
                    <div>
                      <strong>Call Us</strong>
                      <a href="tel:+919876543210">+91 98765 43210</a>
                    </div>
                  </li>
                  <li>
                    <span className="info-icon">📍</span>
                    <div>
                      <strong>Our Office</strong>
                      <span>Mumbai, India</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="process-mini-block bg-white-card">
                <h3>What Happens Next?</h3>
                <ol className="mini-steps">
                  <li>
                    <span className="step-badge">1</span>
                    <div>
                      <strong>Discovery Call</strong>
                      <p>We review your details and set up a 30-min call to understand your business objectives.</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-badge">2</span>
                    <div>
                      <strong>Scope & Proposal</strong>
                      <p>Within 3 days, we build a detailed scope proposal outlining tasks, timeline, and quote.</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-badge">3</span>
                    <div>
                      <strong>Kickoff Sprint</strong>
                      <p>Upon sign-off, we schedule our interactive workshops to align on strategy and design layout.</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Sales FAQs Accordion */}
      <section className="pre-sales-faqs section-light">
        <div className="container">
          <div className="section-header text-center">
            <span className="tag-badge">Pre-Sales FAQs</span>
            <h2 className="section-title-large" style={{ margin: '0 auto 20px' }}>Questions? Answered.</h2>
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

      <style>{`
        .contact-hero-section {
          padding-top: 160px;
          min-height: 400px;
          display: flex;
          align-items: center;
        }

        .contact-hero-title {
          font-size: 72px;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }

        /* Form Grid */
        .contact-main-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 50px;
          align-items: start;
        }

        .contact-form-card {
          padding: 50px;
          border-radius: 6px;
        }

        .form-card-title {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .form-card-subtitle {
          font-size: 15px;
          color: var(--color-text-muted);
          margin-bottom: 40px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-error {
          border-color: #d93838 !important;
        }

        .submit-btn {
          width: 100%;
          margin-top: 16px;
        }

        /* Sidebar info */
        .contact-sidebar {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .info-block, 
        .process-mini-block {
          padding: 40px;
          border-radius: 6px;
        }

        .info-block h3, 
        .process-mini-block h3 {
          font-family: var(--font-sans);
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
          color: var(--color-text-dark-blue);
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border);
        }

        .info-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-list li {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .info-icon {
          font-size: 20px;
          color: var(--color-accent-gold);
          background-color: var(--color-grey-bg);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .info-list strong {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-gray);
          margin-bottom: 4px;
        }

        .info-list a, 
        .info-list span {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text-dark-blue);
        }

        /* Process steps sidebar */
        .mini-steps {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .mini-steps li {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .mini-steps .step-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--color-accent-yellow);
          color: var(--color-text-dark-blue);
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .mini-steps strong {
          display: block;
          font-size: 14px;
          color: var(--color-text-dark-blue);
          margin-bottom: 4px;
        }

        .mini-steps p {
          font-size: 13px;
          line-height: 1.5;
        }

        /* Success screen */
        .success-message {
          padding: 40px 0;
        }

        .success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background-color: #27ae60;
          color: white;
          font-size: 32px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
        }

        .success-message h2 {
          font-size: 28px;
          margin-bottom: 16px;
        }

        .success-message p {
          font-size: 16px;
          max-width: 500px;
          margin: 0 auto 32px;
        }

        @media (max-width: 900px) {
          .contact-main-grid {
            grid-template-columns: 1fr;
          }
          .contact-form-card {
            padding: 30px;
          }
        }

        @media (max-width: 600px) {
          .contact-form-card {
            padding: 24px 16px;
          }
          .info-block, 
          .process-mini-block {
            padding: 24px 20px;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .form-group {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}
