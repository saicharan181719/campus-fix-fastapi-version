
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './PasswordRecovery.css';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const result = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });
      setMessage(
        result.message ||
          'If an account exists for this email, a reset link will be sent.'
      );
    } catch (err) {
      setError(
        err.message || 'Unable to process your request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="recovery-page">
      <div className="recovery-glow recovery-glow-one" />
      <div className="recovery-glow recovery-glow-two" />

      <section className="recovery-card">
        <Link to="/login" className="recovery-brand" aria-label="Campus Fix home">
          <span className="recovery-brand-mark">C</span>
          <span>
            <strong>Campus Fix</strong>
            <small>CAMPUS CARE, SIMPLIFIED</small>
          </span>
        </Link>

        <div className="recovery-icon recovery-icon-blue">
          <MailIcon />
        </div>

        <span className="recovery-eyebrow">ACCOUNT RECOVERY</span>
        <h1>Forgot your password?</h1>
        <p className="recovery-description">
          It happens. Enter the email address associated with your account
          and we'll help you get back in.
        </p>

        <form className="recovery-form" onSubmit={handleSubmit}>
          <label htmlFor="reset-email">Email address</label>

          <div className="recovery-input-wrap">
            <MailIcon />
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <button
            className="recovery-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="recovery-spinner" />
                Sending reset link...
              </>
            ) : (
              <>
                Send reset link
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        {message && (
          <div className="recovery-alert recovery-alert-success" role="status">
            <span className="recovery-alert-symbol">✓</span>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="recovery-alert recovery-alert-error" role="alert">
            <span className="recovery-alert-symbol">!</span>
            <p>{error}</p>
          </div>
        )}

        <div className="recovery-divider">
          <span />
          <span>REMEMBERED YOUR PASSWORD?</span>
          <span />
        </div>

        <Link to="/login" className="recovery-back-link">
          <ArrowLeftIcon />
          Back to login
        </Link>

        <footer className="recovery-footer">
          <span className="recovery-footer-dot" />
          A safer, simpler campus experience
        </footer>
      </section>
    </main>
  );
}
