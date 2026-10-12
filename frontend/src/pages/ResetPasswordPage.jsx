
import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import './PasswordRecovery.css';

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3" />
    </svg>
  );
}

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 9 7 9 7a14 14 0 0 1-3.2 3.8M6.2 6.2C4.1 7.7 3 12 3 12s3.5 7 9 7a10 10 0 0 0 3-.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Requirement({ met, children }) {
  return (
    <li className={met ? 'requirement-met' : ''}>
      <span className="requirement-check">{met ? '✓' : '○'}</span>
      {children}
    </li>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requirements = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordIsValid = Object.values(requirements).every(Boolean);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('This reset link is missing its token. Please request a new link.');
      return;
    }

    if (!passwordIsValid) {
      setError('Please meet all the password requirements below.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match. Please check them and try again.');
      return;
    }

    setLoading(true);

    try {
      const result = await api.post('/auth/reset-password', {
        token,
        new_password: password,
      });

      setMessage(result.message || 'Your password has been updated successfully.');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
    } catch (err) {
      setError(
        err.message || 'Unable to reset your password. Please request a new link.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="recovery-page">
      <div className="recovery-glow recovery-glow-one" />
      <div className="recovery-glow recovery-glow-two" />

      <section className="recovery-card recovery-card-reset">
        <Link to="/login" className="recovery-brand" aria-label="Campus Fix home">
          <span className="recovery-brand-mark">C</span>
          <span>
            <strong>Campus Fix</strong>
            <small>CAMPUS CARE, SIMPLIFIED</small>
          </span>
        </Link>

        <div className="recovery-icon recovery-icon-purple">
          <LockIcon />
        </div>

        <span className="recovery-eyebrow">SECURE YOUR ACCOUNT</span>
        <h1>Create a new password</h1>
        <p className="recovery-description">
          Choose a strong password you haven't used before to keep your
          Campus Fix account protected.
        </p>

        {!token ? (
          <div className="recovery-alert recovery-alert-error" role="alert">
            <span className="recovery-alert-symbol">!</span>
            <p>This reset link is missing its token. Please request a new link.</p>
          </div>
        ) : (
          <form className="recovery-form" onSubmit={handleSubmit}>
            <label htmlFor="new-password">New password</label>
            <div className="recovery-input-wrap">
              <LockIcon />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a new password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                className="recovery-visibility"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>

            <label htmlFor="confirm-password">Confirm new password</label>
            <div className="recovery-input-wrap">
              <LockIcon />
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                className="recovery-visibility"
                type="button"
                onClick={() => setShowConfirm((current) => !current)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                <EyeIcon hidden={showConfirm} />
              </button>
            </div>

            {confirmPassword && (
              <p
                className={`recovery-match ${
                  password === confirmPassword ? 'recovery-match-good' : ''
                }`}
                aria-live="polite"
              >
                {password === confirmPassword
                  ? '✓ Passwords match'
                  : 'Passwords do not match yet'}
              </p>
            )}

            <div className="recovery-requirements">
              <div className="recovery-requirements-heading">
                <strong>Password requirements</strong>
                <span>{Object.values(requirements).filter(Boolean).length}/5</span>
              </div>

              <div className="recovery-strength-track">
                <span
                  style={{
                    width: `${(Object.values(requirements).filter(Boolean).length / 5) * 100}%`,
                  }}
                />
              </div>

              <ul>
                <Requirement met={requirements.length}>
                  At least 8 characters
                </Requirement>
                <Requirement met={requirements.upper}>
                  One uppercase letter (A–Z)
                </Requirement>
                <Requirement met={requirements.lower}>
                  One lowercase letter (a–z)
                </Requirement>
                <Requirement met={requirements.number}>
                  One number (0–9)
                </Requirement>
                <Requirement met={requirements.special}>
                  One special character (e.g. !@#)
                </Requirement>
              </ul>
            </div>

            <button
              className="recovery-submit"
              type="submit"
              disabled={loading || !passwordIsValid || password !== confirmPassword}
            >
              {loading ? (
                <>
                  <span className="recovery-spinner" />
                  Updating password...
                </>
              ) : (
                <>
                  Update password
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
        )}

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
          <span>NEED A FRESH LINK?</span>
          <span />
        </div>

        <Link to="/forgot-password" className="recovery-back-link">
          Request a new reset link
        </Link>

        <footer className="recovery-footer">
          <span className="recovery-footer-dot" />
          Your account security matters
        </footer>
      </section>
    </main>
  );
}
