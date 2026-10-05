import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  AlertCircle,
  FileText,
  Activity,
  Layers,
  Star,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Sliders,
  Check,
  Building,
  UserCheck,
} from 'lucide-react';
import '../styles/landing.css';

const ROLE_ROUTES = {
  student: '/student',
  faculty: '/faculty',
  maintenance: '/maintenance',
  administrator: '/admin',
};

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardRoute = user ? (ROLE_ROUTES[user.role] || '/login') : '/login';

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* ========================================================
          STICKY NAVBAR
          ======================================================== */}
      <header className="landing-nav-wrapper">
        <div className="landing-container">
          <nav className="landing-nav" aria-label="Main Navigation">
            {/* Logo */}
            <Link to="/" className="landing-logo">
              <div className="landing-logo-icon">
                <Wrench size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="landing-logo-text">Campus Fix</span>
                <span className="landing-logo-badge" style={{ marginLeft: 8 }}>SaaS</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="landing-nav-links">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('hero')}
                  className="landing-nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="landing-nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="landing-nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('roles')}
                  className="landing-nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Roles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('workflow')}
                  className="landing-nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Workflow
                </button>
              </li>
            </ul>

            {/* Right Action */}
            <div className="landing-nav-actions">
              {user ? (
                <Link to={dashboardRoute} className="hero-btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                  <span>Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link to="/login" className="hero-btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </Link>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                className="landing-hamburger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Slide Menu */}
        {mobileMenuOpen && (
          <div className="landing-mobile-menu open">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', padding: '8px 0', cursor: 'pointer' }}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', padding: '8px 0', cursor: 'pointer' }}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', padding: '8px 0', cursor: 'pointer' }}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('roles')}
              style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', padding: '8px 0', cursor: 'pointer' }}
            >
              Roles
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('workflow')}
              style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', padding: '8px 0', cursor: 'pointer' }}
            >
              Workflow
            </button>
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--gray-200)' }}>
              <Link
                to={dashboardRoute}
                className="hero-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {user ? 'Go to Dashboard' : 'Login to Campus Fix'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <section id="hero" className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-content">
            {/* Pill */}
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              <span>Smart Campus Issue Management Platform</span>
            </div>

            {/* Headline */}
            <h1 className="hero-headline">
              Making campus issues easier to <span>report, track and resolve.</span>
            </h1>

            {/* Supporting Description */}
            <p className="hero-description">
              Campus Fix allows students and faculty to report campus issues, maintenance teams to
              resolve them, and administrators to manage the complete workflow.
            </p>

            {/* CTAs */}
            <div className="hero-ctas">
              <Link to="/login" className="hero-btn-primary">
                <span>Login to Campus Fix</span>
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="hero-btn-secondary"
              >
                <span>How It Works</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Trust / Quick Stats Strip */}
            <div className="hero-trust-strip">
              <div className="trust-item">
                <span className="trust-val">4 Portals</span>
                <span className="trust-lbl">Student, Faculty, Staff & Admin</span>
              </div>
              <div className="trust-item">
                <span className="trust-val">&lt; 30 Sec</span>
                <span className="trust-lbl">Rapid Ticket Submission</span>
              </div>
              <div className="trust-item">
                <span className="trust-val">100% Digital</span>
                <span className="trust-lbl">Zero Paperwork or Lost Notes</span>
              </div>
              <div className="trust-item">
                <span className="trust-val">Real-Time</span>
                <span className="trust-lbl">Status & SLA Updates</span>
              </div>
            </div>

            {/* Hero SaaS Product Mockup Visual */}
            <div className="hero-mockup-wrapper">
              {/* Floating micro widgets */}
              <div className="floating-badge badge-top-right">
                <Clock size={16} color="#3b82f6" />
                <span>Avg. Resolution: 2.4 hrs</span>
              </div>
              <div className="floating-badge badge-bottom-left">
                <CheckCircle2 size={16} color="#10b981" />
                <span>98.4% Satisfaction Rate</span>
              </div>

              {/* Mockup Card */}
              <div className="hero-mockup-card">
                <div className="mockup-top-bar">
                  <div className="mockup-dots">
                    <span className="mockup-dot red" />
                    <span className="mockup-dot yellow" />
                    <span className="mockup-dot green" />
                  </div>
                  <span className="mockup-title">campusfix.internal/issues/CF-2026-0842</span>
                  <div style={{ width: 40 }} />
                </div>

                <div className="mockup-body">
                  {/* Left Column: Issue Details */}
                  <div className="mockup-ticket-box">
                    <div className="mockup-ticket-header">
                      <span className="mockup-badge-ticket">TICKET #CF-2026-0842</span>
                      <span className="mockup-badge-live">
                        <span className="hero-pill-dot" style={{ background: '#d97706' }} />
                        In Progress
                      </span>
                    </div>

                    <h3 className="mockup-ticket-title">
                      Projector Display Flickering & Audio Distortion
                    </h3>
                    <p className="mockup-ticket-desc">
                      The primary HDMI overhead projector in Seminar Hall 204 keeps disconnecting
                      intermittently during morning lectures. Needs urgent diagnostic testing.
                    </p>

                    <div className="mockup-meta-grid">
                      <div className="mockup-meta-item">
                        <div className="mockup-meta-lbl">Category</div>
                        <div className="mockup-meta-val">Classroom Equipment</div>
                      </div>
                      <div className="mockup-meta-item">
                        <div className="mockup-meta-lbl">Location</div>
                        <div className="mockup-meta-val">Academic Block, Hall 204</div>
                      </div>
                      <div className="mockup-meta-item">
                        <div className="mockup-meta-lbl">Priority</div>
                        <div className="mockup-meta-val" style={{ color: '#f97316' }}>High Priority</div>
                      </div>
                      <div className="mockup-meta-item">
                        <div className="mockup-meta-lbl">Reported By</div>
                        <div className="mockup-meta-val">Prof. Ananya Sharma</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Workflow Activity Preview */}
                  <div className="mockup-side-stats">
                    <div className="mockup-side-card">
                      <div className="mockup-side-card-title">
                        <span>Assigned Technician</span>
                        <UserCheck size={14} color="var(--maint-500)" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: 'var(--maint-100)',
                            color: 'var(--maint-600)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                          }}
                        >
                          RK
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>
                            Rajesh Kumar
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                            IT & AV Specialist • Maintenance
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mockup-side-card">
                      <div className="mockup-side-card-title">
                        <span>Live Ticket Lifecycle</span>
                        <Activity size={14} color="var(--faculty-500)" />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div className="mockup-timeline-item">
                          <div className="mockup-timeline-icon done">✓</div>
                          <div className="mockup-timeline-text">
                            <div className="mockup-timeline-name">Issue Reported</div>
                            <div className="mockup-timeline-time">Today, 09:15 AM</div>
                          </div>
                        </div>
                        <div className="mockup-timeline-item">
                          <div className="mockup-timeline-icon done">✓</div>
                          <div className="mockup-timeline-text">
                            <div className="mockup-timeline-name">Assigned to AV Team</div>
                            <div className="mockup-timeline-time">Today, 09:30 AM</div>
                          </div>
                        </div>
                        <div className="mockup-timeline-item">
                          <div className="mockup-timeline-icon active">●</div>
                          <div className="mockup-timeline-text">
                            <div className="mockup-timeline-name">Technician On-Site</div>
                            <div className="mockup-timeline-time">In Progress</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          HOW IT WORKS SECTION
          ======================================================== */}
      <section id="how-it-works" className="landing-steps">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-pill">How It Works</span>
            <h2 className="section-title">Four simple steps from complaint to resolution</h2>
            <p className="section-desc">
              Campus Fix simplifies facility operations into a transparent, friction-free loop
              connecting users directly with maintenance personnel.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <span className="step-num">01</span>
              <div className="step-icon-wrap" style={{ color: 'var(--student-500)' }}>
                <FileText size={22} />
              </div>
              <h3 className="step-title">Report</h3>
              <p className="step-desc">
                Report a campus issue with its category, location, priority and description.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <span className="step-num">02</span>
              <div className="step-icon-wrap" style={{ color: 'var(--faculty-500)' }}>
                <Activity size={22} />
              </div>
              <h3 className="step-title">Track</h3>
              <p className="step-desc">
                Track the issue as it moves through the resolution process in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <span className="step-num">03</span>
              <div className="step-icon-wrap" style={{ color: 'var(--maint-500)' }}>
                <Wrench size={22} />
              </div>
              <h3 className="step-title">Resolve</h3>
              <p className="step-desc">
                Maintenance teams receive assigned issues and update their progress.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <span className="step-num">04</span>
              <div className="step-icon-wrap" style={{ color: 'var(--admin-500)' }}>
                <Star size={22} />
              </div>
              <h3 className="step-title">Verify</h3>
              <p className="step-desc">
                Students and faculty can confirm the resolution and provide feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FEATURES SECTION
          ======================================================== */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-pill">Core Features</span>
            <h2 className="section-title">Engineered for seamless campus operations</h2>
            <p className="section-desc">
              Everything your institution needs to eliminate downtime, maintain accountability,
              and keep facilities in peak condition.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'var(--student-50)', color: 'var(--student-500)' }}>
                <AlertCircle size={22} />
              </div>
              <h3 className="feature-title">Easy Issue Reporting</h3>
              <p className="feature-desc">
                Submit problems in seconds with guided category selectors, location drill-downs,
                severity levels, and photo attachments.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'var(--faculty-50)', color: 'var(--faculty-500)' }}>
                <Activity size={22} />
              </div>
              <h3 className="feature-title">Issue Tracking</h3>
              <p className="feature-desc">
                Follow progress with live timeline milestones. Receive updates as issues progress
                from reported to under review and in progress.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'var(--maint-50)', color: 'var(--maint-500)' }}>
                <Wrench size={22} />
              </div>
              <h3 className="feature-title">Maintenance Assignment</h3>
              <p className="feature-desc">
                Auto-route tickets based on technical discipline (Electrical, Plumbing, IT, Equipment)
                or allow admins to manually reassign specialists.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                <Shield size={22} />
              </div>
              <h3 className="feature-title">Role-Based Access</h3>
              <p className="feature-desc">
                Strict authentication and access boundary guards ensure students, faculty,
                technicians, and admins only see what they need to see.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'var(--admin-50)', color: 'var(--admin-500)' }}>
                <Sliders size={22} />
              </div>
              <h3 className="feature-title">Admin Management</h3>
              <p className="feature-desc">
                Bird’s-eye visibility across all campus blocks. Manage user accounts, customize
                building locations, monitor resolution SLAs, and audit logs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Star size={22} />
              </div>
              <h3 className="feature-title">Resolution Feedback</h3>
              <p className="feature-desc">
                Close the loop with confidence. Requesters confirm work completion, submit star
                ratings, and write feedback or reopen unsatisfied tickets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ROLE SECTION (4 Roles with Color Identities)
          ======================================================== */}
      <section id="roles" className="landing-roles">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-pill">Role-Based Portals</span>
            <h2 className="section-title">Tailored dashboards for every stakeholder</h2>
            <p className="section-desc">
              Each user group receives a purpose-built workspace designed for their specific role in
              campus upkeep.
            </p>
          </div>

          <div className="roles-grid">
            {/* Student Role */}
            <div className="role-card role-student">
              <div className="role-header">
                <div className="role-icon">
                  <GraduationCap size={22} />
                </div>
                <span className="role-badge">Student</span>
              </div>
              <h3 className="role-name">Student Portal</h3>
              <p className="role-desc">
                Quickly report issues with hostel facilities, classroom projectors, library Wi-Fi,
                or campus grounds, and track updates on the go.
              </p>
              <ul className="role-points">
                <li className="role-point">
                  <Check size={14} color="var(--student-500)" />
                  <span>One-click issue submission</span>
                </li>
                <li className="role-point">
                  <Check size={14} color="var(--student-500)" />
                  <span>Real-time status tracking</span>
                </li>
                <li className="role-point">
                  <Check size={14} color="var(--student-500)" />
                  <span>Resolution rating & feedback</span>
                </li>
              </ul>
            </div>

            {/* Faculty Role */}
            <div className="role-card role-faculty">
              <div className="role-header">
                <div className="role-icon">
                  <Briefcase size={22} />
                </div>
                <span className="role-badge">Faculty</span>
              </div>
              <h3 className="role-name">Faculty Portal</h3>
              <p className="role-desc">
                High-priority reporting for laboratory hardware, teaching equipment, departmental
                offices, and critical lecture hall infrastructure.
              </p>
              <ul className="role-points">
                <li className="role-point">
                  <Check size={14} color="var(--faculty-500)" />
                  <span>Priority classroom reporting</span>
                </li>
                <li className="role-point">
                  <Check size={14} color="var(--faculty-500)" />
                  <span>Academic facility logging</span>
                </li>
                <li className="role-point">
                  <Check size={14} color="var(--faculty-500)" />
                  <span>Direct technician oversight</span>
                </li>
              </ul>
            </div>

            {/* Maintenance Role */}
            <div className="role-card role-maintenance">
              <div className="role-header">
                <div className="role-icon">
                  <Wrench size={22} />
                </div>
                <span className="role-badge">Maintenance</span>
              </div>
              <h3 className="role-name">Maintenance Staff</h3>
              <p className="role-desc">
                Dedicated task queue customized by trade specialization. Mark work in-progress,
                document repairs, and upload resolution proof photos.
              </p>
              <ul className="role-points">
                <li className="role-point">
                  <Check size={14} color="var(--maint-500)" />
                  <span>Specialization-based queues</span>
                </li>
                <li className="role-point">
                  <Check size={14} color="var(--maint-500)" />
                  <span>Instant status updates</span>
                </li>
                <li className="role-point">
                  <Check size={14} color="var(--maint-500)" />
                  <span>Proof of work attachment</span>
                </li>
              </ul>
            </div>

            {/* Administrator Role */}
            <div className="role-card role-administrator">
              <div className="role-header">
                <div className="role-icon">
                  <Sliders size={22} />
                </div>
                <span className="role-badge">Admin</span>
              </div>
              <h3 className="role-name">Administrator</h3>
              <p className="role-desc">
                Central command tower. Review campus-wide issue volume, reassign tasks to technicians,
                manage locations, and oversee user authorizations.
              </p>
              <ul className="role-points">
                <li className="role-point">
                  <Check size={14} color="var(--admin-500)" />
                  <span>Campus-wide analytics</span>
                </li>
                <li className="role-point">
                  <Check size={14} color="var(--admin-500)" />
                  <span>Technician ticket dispatch</span>
                </li>
                <li className="role-point">
                  <Check size={14} color="var(--admin-500)" />
                  <span>Building & user management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          WORKFLOW VISUAL (Issue Lifecycle)
          ======================================================== */}
      <section id="workflow" className="landing-workflow">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-pill">Issue Lifecycle</span>
            <h2 className="section-title">An end-to-end resolution pipeline</h2>
            <p className="section-desc">
              Every issue follows a clear, auditable lifecycle from initial submission until verified
              closure.
            </p>
          </div>

          <div className="workflow-pipeline">
            {/* 1. Reported */}
            <div className="workflow-node">
              <div className="workflow-icon" style={{ background: '#f3f4f6', color: '#4b5563' }}>
                <FileText size={18} />
              </div>
              <div className="workflow-step-name">1. Reported</div>
              <div className="workflow-step-desc">
                Student or faculty submits ticket with location and details.
              </div>
            </div>

            {/* 2. Reviewed */}
            <div className="workflow-node">
              <div className="workflow-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Layers size={18} />
              </div>
              <div className="workflow-step-name">2. Reviewed</div>
              <div className="workflow-step-desc">
                System or admin verifies severity and categorized trade.
              </div>
            </div>

            {/* 3. Assigned */}
            <div className="workflow-node">
              <div className="workflow-icon" style={{ background: 'var(--faculty-50)', color: 'var(--faculty-500)' }}>
                <UserCheck size={18} />
              </div>
              <div className="workflow-step-name">3. Assigned</div>
              <div className="workflow-step-desc">
                Dispatched to a specialized maintenance technician.
              </div>
            </div>

            {/* 4. In Progress */}
            <div className="workflow-node">
              <div className="workflow-icon" style={{ background: 'var(--maint-50)', color: 'var(--maint-500)' }}>
                <Wrench size={18} />
              </div>
              <div className="workflow-step-name">4. In Progress</div>
              <div className="workflow-step-desc">
                Technician arrives on-site and initiates repair work.
              </div>
            </div>

            {/* 5. Resolved */}
            <div className="workflow-node">
              <div className="workflow-icon" style={{ background: 'var(--student-50)', color: 'var(--student-500)' }}>
                <CheckCircle2 size={18} />
              </div>
              <div className="workflow-step-name">5. Resolved</div>
              <div className="workflow-step-desc">
                Maintenance uploads fix proof and marks ticket solved.
              </div>
            </div>

            {/* 6. Closed */}
            <div className="workflow-node">
              <div className="workflow-icon" style={{ background: '#f0fdf4', color: '#166534' }}>
                <Star size={18} />
              </div>
              <div className="workflow-step-name">6. Closed</div>
              <div className="workflow-step-desc">
                Requester confirms fix with satisfaction rating and feedback.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FINAL CTA SECTION
          ======================================================== */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="cta-box">
            <h2 className="cta-title">
              Make your campus better, one issue at a time.
            </h2>
            <p className="cta-desc">
              Empower your campus community with transparent issue tracking, faster resolution
              times, and superior campus facilities.
            </p>
            <Link to="/login" className="cta-btn">
              <span>Get Started</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER
          ======================================================== */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top">
            <div>
              <div className="footer-brand">
                <div className="landing-logo-icon" style={{ width: 32, height: 32 }}>
                  <Wrench size={16} />
                </div>
                <span className="landing-logo-text" style={{ fontSize: 17 }}>Campus Fix</span>
              </div>
              <p className="footer-desc">
                Smart campus issue reporting, technician assignment, and resolution management system.
              </p>
            </div>

            <ul className="footer-links">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('hero')}
                  className="footer-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="footer-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="footer-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('roles')}
                  className="footer-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Roles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('workflow')}
                  className="footer-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Workflow
                </button>
              </li>
              <li>
                <Link to="/login" className="footer-link">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} Campus Fix. All rights reserved.</span>
            <span>Campus Maintenance & Facility Operations Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
