import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Wrench,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Shield,
} from 'lucide-react';

const ROLE_ROUTES = {
  student: '/student',
  faculty: '/faculty',
  maintenance: '/maintenance',
  administrator: '/admin',
};

const ROLE_INFO = {
  student: {
    label: 'Student',
    icon: GraduationCap,
    description: 'Report and track campus issues',
  },
  faculty: {
    label: 'Faculty',
    icon: Briefcase,
    description: 'Report and monitor facility issues',
  },
  maintenance: {
    label: 'Maintenance',
    icon: Wrench,
    description: 'Manage assigned maintenance tasks',
  },
  administrator: {
    label: 'Administrator',
    icon: Shield,
    description: 'Manage campus operations',
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const roleFromUrl = searchParams.get('role');

  const [selectedRole, setSelectedRole] = useState(
    ROLE_INFO[roleFromUrl] ? roleFromUrl : ''
  );

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleInfo = ROLE_INFO[selectedRole];

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError('');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setForm({
      username: '',
      password: '',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      setError('Please select your role.');
      return;
    }

    if (!form.username.trim() || !form.password.trim()) {
      setError('Please enter username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.post('/auth/login', {
        username: form.username,
        password: form.password,
      });

      /*
       * Make sure the account actually belongs to
       * the role selected on the login screen.
       */
      if (data.role !== selectedRole) {
        setError(
          `This account is not registered as ${roleInfo.label}. Please select the correct role.`
        );
        return;
      }

      login(data);

      const route = ROLE_ROUTES[data.role] || '/';

      navigate(route, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Header */}
        <div className="login-header">

          <div className="login-logo-icon">
            <Wrench size={26} color="white" />
          </div>

          <div className="login-brand">
            Campus Fix
          </div>

          <div className="login-tagline">
            Campus Issue Reporting & Management
          </div>

        </div>

        <div className="login-body">

          {/* BACK TO HOME BUTTON */}
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--gray-500)',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>

          {/* ROLE SELECTION */}
          {!selectedRole ? (
            <>
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 22,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: 'var(--gray-900)',
                    fontSize: 21,
                  }}
                >
                  Who are you?
                </h2>

                <p
                  style={{
                    margin: '7px 0 0',
                    color: 'var(--gray-500)',
                    fontSize: 13,
                  }}
                >
                  Select your role to continue
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >

                {Object.entries(ROLE_INFO).map(
                  ([role, info]) => {
                    const Icon = info.icon;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() =>
                          handleRoleSelect(role)
                        }
                        style={{
                          border: '1px solid var(--gray-200)',
                          background: 'white',
                          borderRadius: 12,
                          padding: '18px 12px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            'var(--student-400)';
                          e.currentTarget.style.background =
                            'var(--student-50)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            'var(--gray-200)';
                          e.currentTarget.style.background =
                            'white';
                        }}
                      >

                        <Icon
                          size={25}
                          style={{
                            color:
                              role === 'student'
                                ? 'var(--student-500)'
                                : role === 'faculty'
                                ? 'var(--faculty-500)'
                                : role === 'maintenance'
                                ? 'var(--maint-500)'
                                : 'var(--admin-500)',
                            marginBottom: 8,
                          }}
                        />

                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--gray-900)',
                            fontSize: 14,
                          }}
                        >
                          {info.label}
                        </div>

                        <div
                          style={{
                            color: 'var(--gray-400)',
                            fontSize: 11,
                            marginTop: 4,
                            lineHeight: 1.4,
                          }}
                        >
                          {info.description}
                        </div>

                      </button>
                    );
                  }
                )}

              </div>

              <p
                className="login-footer-text"
                style={{ marginTop: 22 }}
              >
                Select your role to access the appropriate portal.
              </p>
            </>
          ) : (

            /* LOGIN FORM */
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('');
                  setError('');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--gray-500)',
                  fontSize: 13,
                  marginBottom: 18,
                }}
              >
                <ArrowLeft size={14} />
                Change role
              </button>

              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >

                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    margin: '0 auto 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      selectedRole === 'student'
                        ? 'var(--student-50)'
                        : selectedRole === 'faculty'
                        ? 'var(--faculty-50)'
                        : selectedRole === 'maintenance'
                        ? 'var(--maint-50)'
                        : 'var(--admin-50)',
                  }}
                >
                  {React.createElement(
                    roleInfo.icon,
                    {
                      size: 23,
                      style: {
                        color:
                          selectedRole === 'student'
                            ? 'var(--student-500)'
                            : selectedRole === 'faculty'
                            ? 'var(--faculty-500)'
                            : selectedRole === 'maintenance'
                            ? 'var(--maint-500)'
                            : 'var(--admin-500)',
                      },
                    }
                  )}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    color: 'var(--gray-900)',
                  }}
                >
                  {roleInfo.label} Login
                </h2>

                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: 13,
                    color: 'var(--gray-500)',
                  }}
                >
                  {roleInfo.description}
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                autoComplete="off"
              >

                {error && (
                  <div className="login-error">
                    {error}
                  </div>
                )}

                {/* Username */}
                <div className="form-group">

                  <label
                    className="form-label"
                    htmlFor="login-username"
                  >
                    Username
                  </label>

                  <input
                    id="login-username"
                    className="form-input"
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={handleChange}
                    autoFocus
                    autoComplete="username"
                  />

                </div>

                {/* Password */}
                <div className="form-group">

                  <label
                    className="form-label"
                    htmlFor="login-password"
                  >
                    Password
                  </label>

                  <input
                    id="login-password"
                    className="form-input"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                </div>

                <button
                  id="login-submit-btn"
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

                      Signing in…
                    </>
                  ) : (
                    'Sign In'
                  )}

                </button>

              </form>

              {/* Student registration */}
              {selectedRole === 'student' && (
                <p
                  className="login-footer-text"
                  style={{
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  Don't have a student account?{' '}

                  <Link
                    to="/register"
                    style={{
                      color: 'var(--student-600)',
                      fontWeight: 600,
                    }}
                  >
                    Register
                  </Link>
                </p>
              )}

              {selectedRole !== 'student' && (
                <p
                  className="login-footer-text"
                  style={{
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  Account access is managed by the administrator.
                </p>
              )}

            </>
          )}

        </div>

      </div>

    </div>
  );
}