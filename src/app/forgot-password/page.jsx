'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { forgotPassword, verifyOtp, resetPassword } from '@/api/auth';


/* ─── OTP digit input ───────────────────────────────────────── */
const OTP_LENGTH = 6;

const OtpInput = ({ value, onChange }) => {
  const refs = useRef([]);

  // value is always a plain string of digits, e.g. "123" (no padding)
  const getDigit = (i) => (value[i] ?? '');

  const handleChange = (e, idx) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    // Insert digit at position idx
    const arr = Array.from({ length: OTP_LENGTH }, (_, i) => getDigit(i));
    arr[idx] = char;
    onChange(arr.join(''));
    if (idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus();
  };

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const arr = Array.from({ length: OTP_LENGTH }, (_, i) => getDigit(i));
      if (arr[idx]) {
        // Clear current cell
        arr[idx] = '';
      } else if (idx > 0) {
        // Current already empty — clear previous and move focus back
        arr[idx - 1] = '';
        refs.current[idx - 1]?.focus();
      }
      onChange(arr.join('').trimEnd()); // strip trailing empty slots
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(pasted);
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="fp-otp-row" onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`fp-otp-cell${getDigit(i) ? ' fp-otp-cell--filled' : ''}`}
          value={getDigit(i)}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};;

/* ─── Main Component ────────────────────────────────────────── */
const ForgotPasswordPage = () => {
  const router = useRouter();

const [step, setStep] = useState('email');
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  /* Countdown for resend */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = async () => {
    clearMessages();
    const trimmed = email.trim();
    if (!trimmed) { setError('Please enter your email address.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError('Please enter a valid email address.'); return; }

    try {
      setLoading(true);
      await forgotPassword({ email: trimmed });
      setSuccess('OTP sent! Please check your inbox.');
      setStep('otp');
      setResendTimer(60);
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendTimer > 0) return;
    clearMessages();
    try {
      setLoading(true);
      await forgotPassword({ email: email.trim() });
      setSuccess('OTP resent successfully.');
      setResendTimer(60);
      setOtp('');
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOtp = async () => {
    clearMessages();
    if (otp.length < OTP_LENGTH) { setError(`Please enter the full ${OTP_LENGTH}-digit OTP.`); return; }

    try {
      setLoading(true);
      const res = await verifyOtp({ email: email.trim(), otp });
      /* API may return a reset_token; store it for the next step */
      const token = res?.data?.data?.reset_token || res?.data?.data?.token || otp;
      setResetToken(token);
      setStep('reset');
      setSuccess('');
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: Reset Password ── */
  const handleResetPassword = async () => {
    clearMessages();
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPass) { setError('Passwords do not match.'); return; }

    try {
      setLoading(true);
      await resetPassword({ new_password: newPassword, reset_token: resetToken });
      setSuccess('Password reset successfully! Redirecting to login…');
      setTimeout(() => router.push('/login'), 1800);
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Step labels ── */
const stepMeta = [
  { key: 'email', label: 'Email' },
  { key: 'otp', label: 'Verify' },
  { key: 'reset', label: 'Reset' },
];
  const currentIdx = stepMeta.findIndex((s) => s.key === step);

  return (
    <div className="fp-shell">

      {/* ── Left Panel ── */}
      <div className="fp-left">
        <div className="fp-logo">
           <Image
                      src="/logo.png"
                      alt="FilmFlare"
                      width={200}
                      height={200}
                    />
        </div>
        <div className="fp-illustration">
          <Image
                    src="/logobanner.png"
                    alt="Photography illustration"
                    width={400}
                    height={400}
                  />
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="fp-right">
        <div className="fp-card">
          <div className="fp-card-accent" />

          {/* Step progress */}
          <div className="fp-steps">
            {stepMeta.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className={`fp-step${i <= currentIdx ? ' fp-step--done' : ''}`}>
                  <div className="fp-step-dot">
                    {i < currentIdx ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span className="fp-step-label">{s.label}</span>
                </div>
                {i < stepMeta.length - 1 && (
                  <div className={`fp-step-line${i < currentIdx ? ' fp-step-line--done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <h1 className="fp-title">
            {step === 'email' && 'Forgot Password'}
            {step === 'otp'   && 'Enter OTP'}
            {step === 'reset' && 'New Password'}
          </h1>
          <p className="fp-subtitle">
            {step === 'email' && 'Enter your registered email to receive a one-time password.'}
            {step === 'otp'   && `We've sent a ${OTP_LENGTH}-digit code to ${email}`}
            {step === 'reset' && 'Choose a strong new password for your account.'}
          </p>

          {/* Messages */}
          {error && (
            <div className="fp-alert fp-alert--error" role="alert">
              <span className="fp-alert-icon">!</span>
              {error}
            </div>
          )}
          {success && (
            <div className="fp-alert fp-alert--success" role="status">
              <span className="fp-alert-icon">✓</span>
              {success}
            </div>
          )}

          {/* ── STEP: Email ── */}
          {step === 'email' && (
            <div className="fp-body">
              <div className="fp-field">
                <label htmlFor="fp-email" className="fp-label">
                  Email Address <span className="fp-required">*</span>
                </label>
                <input
                  id="fp-email"
                  type="email"
                  className="fp-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button
                className="fp-btn fp-btn--primary"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? <span className="fp-spinner" /> : null}
                {loading ? 'Sending…' : 'Send OTP'}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* ── STEP: OTP ── */}
          {step === 'otp' && (
            <div className="fp-body">
              <OtpInput value={otp} onChange={setOtp} />

              <div className="fp-resend-row">
                <span className="fp-resend-text">Didn't receive it?</span>
                <button
                  className={`fp-resend-btn${resendTimer > 0 ? ' fp-resend-btn--disabled' : ''}`}
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                className="fp-btn fp-btn--primary"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < OTP_LENGTH}
              >
                {loading ? <span className="fp-spinner" /> : null}
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>

              <button
                className="fp-btn fp-btn--ghost"
                onClick={() => { clearMessages(); setStep('email'); setOtp(''); }}
                disabled={loading}
              >
                ← Change Email
              </button>
            </div>
          )}

          {/* ── STEP: Reset Password ── */}
          {step === 'reset' && (
            <div className="fp-body">
              <div className="fp-field">
                <label htmlFor="fp-new" className="fp-label">
                  New Password <span className="fp-required">*</span>
                </label>
                <div className="fp-input-wrap">
                  <input
                    id="fp-new"
                    type={showNew ? 'text' : 'password'}
                    className="fp-input fp-input--password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    maxLength={32}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="fp-eye"
                    onClick={() => setShowNew((p) => !p)}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="fp-field">
                <label htmlFor="fp-confirm" className="fp-label">
                  Confirm Password <span className="fp-required">*</span>
                </label>
                <div className="fp-input-wrap">
                  <input
                    id="fp-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className="fp-input fp-input--password"
                    placeholder="Re-enter your password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    minLength={8}
                    maxLength={32}
                  />
                  <button
                    type="button"
                    className="fp-eye"
                    onClick={() => setShowConfirm((p) => !p)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {newPassword.length > 0 && (
                <div className="fp-strength">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`fp-strength-bar${getStrength(newPassword) > i ? ` fp-strength-bar--${getStrengthLabel(newPassword)}` : ''}`}
                    />
                  ))}
                  <span className="fp-strength-text">{getStrengthLabel(newPassword)}</span>
                </div>
              )}

              <button
                className="fp-btn fp-btn--primary"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? <span className="fp-spinner" /> : null}
                {loading ? 'Saving…' : 'Save New Password'}
              </button>
            </div>
          )}

          {/* Back to login */}
          <a href="/login" className="fp-back">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── Helpers ─────────────────────────────────────────────────── */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
function getStrengthLabel(pw) {
  const s = getStrength(pw);
  if (s <= 1) return 'weak';
  if (s === 2) return 'fair';
  if (s === 3) return 'good';
  return 'strong';
}

export default ForgotPasswordPage;