"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { createCategory } from "@/api/category";

const CreateCategory = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await createCategory({ name: name.trim() });
      setSuccess(true);
      setTimeout(() => router.push("/masters/event-category"), 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to create category. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="cc-page">
        {/* Back navigation */}
        <button className="cc-back" onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Categories
        </button>

        {/* Card */}
        <div className="cc-card">
          <div className="cc-card-accent" />

          <div className="cc-card-body">
            <div className="cc-card-header">
              <div className="cc-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 5V4a2 2 0 014 0v1M11 10v4M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="cc-title">New Event Category</h2>
                <p className="cc-subtitle">Add a master category for events</p>
              </div>
            </div>

            {/* Success banner */}
            {success && (
              <div className="cc-alert cc-alert--success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Category created! Redirecting…
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="cc-alert cc-alert--error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* Field */}
            <div className="cc-field">
              <label className="cc-label" htmlFor="category-name">
                Category Name <span className="cc-required">*</span>
              </label>
              <input
                id="category-name"
                className="cc-input"
                type="text"
                placeholder="e.g. Music, Sports, Tech…"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={loading || success}
                autoFocus
              />
              <span className="cc-hint">This name will appear across all event listings.</span>
            </div>

            {/* Actions */}
            <div className="cc-actions">
              <button
                className="cc-btn cc-btn--ghost"
                onClick={() => router.back()}
                disabled={loading || success}
              >
                Cancel
              </button>
              <button
                className="cc-btn cc-btn--primary"
                onClick={handleSubmit}
                disabled={loading || success || !name.trim()}
              >
                {loading ? (
                  <>
                    <span className="cc-spinner" />
                    Creating…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Create Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .cc-page {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          /* Back link */
          .cc-back {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--color-gray);
            padding: 0;
            transition: color 0.15s;
          }
          .cc-back:hover { color: var(--color-midnight-blue); }

          /* Card */
          .cc-card {
            background: var(--color-white, #fffefa);
            border-radius: 16px;
            border: 1px solid rgba(17,18,18,0.07);
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            position: relative;
            overflow: hidden;
          }

          .cc-card-accent {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--color-orange), var(--color-khaki, #ffe24f));
            border-radius: 16px 16px 0 0;
          }

          .cc-card-body {
            padding: 1.75rem 1.75rem 1.75rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          /* Card header */
          .cc-card-header {
            display: flex;
            align-items: center;
            gap: 0.9rem;
          }

          .cc-icon-wrap {
            width: 46px;
            height: 46px;
            border-radius: 12px;
            background: var(--color-cornsilk, #fff8e0);
            border: 1.5px solid rgba(255,174,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-orange);
            flex-shrink: 0;
          }

          .cc-title {
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--color-midnight-blue);
            margin: 0 0 2px;
            letter-spacing: -0.01em;
          }

          .cc-subtitle {
            font-size: 0.8rem;
            color: var(--color-gray);
            margin: 0;
          }

          /* Alerts */
          .cc-alert {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.65rem 0.9rem;
            border-radius: 10px;
            font-size: 0.8125rem;
            font-weight: 500;
            line-height: 1.4;
          }
          .cc-alert--success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #15803d;
          }
          .cc-alert--error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
          }

          /* Field */
          .cc-field {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }

          .cc-label {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--color-dark-slate-gray);
          }

          .cc-required { color: #ef4444; }

          .cc-input {
            width: 100%;
            height: 46px;
            padding: 0 0.9rem;
            border: 1.5px solid #e5e7eb;
            border-radius: 10px;
            font-size: 0.9375rem;
            color: var(--color-midnight-blue);
            background: var(--color-ivory, #fffef5);
            outline: none;
            transition: border-color 0.18s, box-shadow 0.18s;
            box-sizing: border-box;
          }
          .cc-input::placeholder { color: var(--color-silver); }
          .cc-input:hover { border-color: #d1d5db; }
          .cc-input:focus {
            border-color: var(--color-orange);
            box-shadow: 0 0 0 3px rgba(255,174,0,0.15);
            background: #ffffff;
          }
          .cc-input:disabled { opacity: 0.6; cursor: not-allowed; }

          .cc-hint {
            font-size: 0.75rem;
            color: var(--color-silver);
          }

          /* Actions */
          .cc-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
            padding-top: 0.25rem;
          }

          .cc-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            height: 44px;
            padding: 0 1.25rem;
            border-radius: 10px;
            font-size: 0.875rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.18s, transform 0.12s, opacity 0.15s;
            border: none;
          }
          .cc-btn:disabled { opacity: 0.55; cursor: not-allowed; }
          .cc-btn:active:not(:disabled) { transform: scale(0.97); }

          .cc-btn--primary {
            background: var(--color-orange);
            color: var(--color-midnight-blue);
          }
          .cc-btn--primary:hover:not(:disabled) { background: #e09a00; }

          .cc-btn--ghost {
            background: transparent;
            color: var(--color-dark-slate-gray);
            border: 1.5px solid #e5e7eb;
          }
          .cc-btn--ghost:hover:not(:disabled) {
            background: var(--color-linen);
            border-color: #d1d5db;
          }

          /* Spinner */
          .cc-spinner {
            width: 16px;
            height: 16px;
            border: 2.5px solid rgba(17,18,18,0.2);
            border-top-color: var(--color-midnight-blue);
            border-radius: 50%;
            animation: cc-spin 0.7s linear infinite;
            flex-shrink: 0;
          }
          @keyframes cc-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default CreateCategory;