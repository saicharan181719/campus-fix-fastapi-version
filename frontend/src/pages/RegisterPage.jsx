import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Wrench, UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError('');
  };

  // Password validation rules
  const passwordRules = {
    minLength: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };

  const passwordValid = Object.values(passwordRules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError('Please fill in all fields.');
      return;
    }

    if (!passwordValid) {
      setError('Please meet all password requirements.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'student',
        specialization: null,
      });

      setSuccess('Account created successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login?role=student', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordRule = ({ valid, children }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 12,
        color: valid ? '#047857' : 'var(--gray-500)',
        marginTop: 5,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: valid ? '#d1fae5' : '#f3f4f6',
          color: valid ? '#047857' : '#9ca3af',
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {valid ? '✓' : '•'}
      </span>

      <span>{children}</span>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-logo-icon">
            <Wrench size={26} color="white" />
          </div>

          <div className="login-brand">Campus Fix</div>

          <div className="login-tagline">
            Create your student account
          </div>
        </div>

        {/* Body */}
        <div className="login-body">

          <div style={{ marginBottom: 20 }}>
            <Link
              to="/login?role=student"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--gray-500)',
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} />
              Back to Student Login
            </Link>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: '#ecfdf5',
                color: '#047857',
                fontSize: 13,
                marginBottom: 16,
                border: '1px solid #a7f3d0',
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">

            {/* Username */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="register-username"
              >
                Username
              </label>

              <input
                id="register-username"
                className="form-input"
                type="text"
                name="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="register-email"
              >
                Email
              </label>

              <input
                id="register-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="register-password"
              >
                Password
              </label>

              <input
                id="register-password"
                className="form-input"
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

              {/* Password Rules */}
              {form.password && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--gray-700)',
                      marginBottom: 7,
                    }}
                  >
                    Password requirements
                  </div>

                  <PasswordRule valid={passwordRules.minLength}>
                    At least 8 characters
                  </PasswordRule>

                  <PasswordRule valid={passwordRules.uppercase}>
                    At least one uppercase letter
                  </PasswordRule>

                  <PasswordRule valid={passwordRules.lowercase}>
                    At least one lowercase letter
                  </PasswordRule>

                  <PasswordRule valid={passwordRules.number}>
                    At least one number
                  </PasswordRule>

                  <PasswordRule valid={passwordRules.special}>
                    At least one special character
                  </PasswordRule>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="register-confirm-password"
              >
                Confirm Password
              </label>

              <input
                id="register-confirm-password"
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: 8,
                padding: '11px',
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner"
                    style={{
                      width: 16,
                      height: 16,
                      borderWidth: 2,
                      borderTopColor: 'white',
                    }}
                  />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Student Account
                </>
              )}
            </button>

          </form>

          <p
            className="login-footer-text"
            style={{ marginTop: 20 }}
          >
            Already have an account?{' '}
            <Link
              to="/login?role=student"
              style={{
                color: 'var(--student-600)',
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}