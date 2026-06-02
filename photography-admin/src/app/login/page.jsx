'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '@/api/auth';
import { storeTokens, getStoredToken } from '@/api/client';

const LoginPage = () => {
  const router = useRouter();

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) {
      router.push('/');
    }
  }, [router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter your email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);

      const res = await login({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      const { access_token, refresh_token } = res?.data?.data || {};

      if (!access_token) {
        throw new Error('Login response missing access_token');
      }

      storeTokens(access_token, refresh_token ?? '');
      router.push('/');
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Login failed. Please check your credentials.';

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-logo">
          <Image
            src="/logo.png"
            alt="FilmFlare"
            width={200}
            height={200}
          />
        </div>

        <div className="login-banner">
          <Image
            src="/logobanner.png"
            alt="Photography illustration"
            width={400}
            height={400}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-top-bar" />

          <h1 className="login-title">LOGIN</h1>

          {error && (
            <div className="login-error" role="alert">
              <span className="login-error-label">Error:</span> {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="login-form"
            noValidate
          >
            {/* Email */}
            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email Address{' '}
                <span
                  aria-hidden="true"
                  className="login-required"
                >
                  *
                </span>
              </label>

              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password{' '}
                <span
                  aria-hidden="true"
                  className="login-required"
                >
                  *
                </span>
              </label>

              <div className="login-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-input--password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={32}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="login-meta">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="login-checkbox"
                />
                <span>Remember me</span>
              </label>

              <a
                href="/forgot-password"
                className="login-forgot"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="login-btn-loading">
                  <svg
                    className="login-spinner"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="login-spinner-track"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="login-spinner-fill"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="login-footer">
            Secure admin access · Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;