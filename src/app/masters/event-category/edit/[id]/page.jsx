"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { getCategory, updateCategory } from "@/api/category";

const EditCategory = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id;

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCategory();
      const list = res.data?.data || res.data || [];
      const found = list.find((c) => String(c.id) === String(categoryId));
      if (!found) {
        setError("Category not found.");
        return;
      }
      setName(found.name || "");
      setOriginalName(found.name || "");
    } catch (err) {
      setError("Failed to load category. Please try again.");
    } finally {
      setLoading(false);
    }
  };
const handleSubmit = async () => {
  if (!name.trim()) {
    setError("Category name is required.");
    return;
  }

  try {
    setSaving(true);
    setError(null);

    await updateCategory(
      categoryId,
      { name: name.trim() }
    );

    setSuccess(true);
    setOriginalName(name.trim());
    setTimeout(() => router.push("/masters/event-category"), 1200);
  } catch (err) {
    setError(
      err?.response?.data?.message ||
      "Failed to update category. Please try again."
    );
  } finally {
    setSaving(false);
  }
};

  const isDirty = name.trim() !== originalName;

  return (
    <DashboardLayout>
      <div className="ec-page">
        {/* Back */}
        <button className="ec-back" onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Categories
        </button>

        {/* Card */}
        <div className="ec-card">
          <div className="ec-card-accent" />

          {loading ? (
            <div className="ec-state">
              <div className="ec-spinner" />
              <span>Loading category…</span>
            </div>
          ) : (
            <div className="ec-card-body">
              {/* Header */}
              <div className="ec-card-header">
                <div className="ec-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path
                      d="M15.5 3.5a2.121 2.121 0 013 3L7 18l-4 1 1-4L15.5 3.5z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="ec-title">Edit Category</h2>
                  <p className="ec-subtitle">
                    Update the name for <strong>{originalName}</strong>
                  </p>
                </div>
              </div>

              {/* Success */}
              {success && (
                <div className="ec-alert ec-alert--success">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Category updated! Redirecting…
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="ec-alert ec-alert--error">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Field */}
              <div className="ec-field">
                <label className="ec-label" htmlFor="edit-category-name">
                  Category Name <span className="ec-required">*</span>
                </label>
                <div className="ec-input-wrap">
                  <input
                    id="edit-category-name"
                    className="ec-input"
                    type="text"
                    placeholder="Enter category name…"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    disabled={saving || success}
                    autoFocus
                  />
                  {isDirty && (
                    <span className="ec-changed-badge">Modified</span>
                  )}
                </div>
                <span className="ec-hint">This name will appear across all event listings.</span>
              </div>

              {/* Actions */}
              <div className="ec-actions">
                <button
                  className="ec-btn ec-btn--ghost"
                  onClick={() => router.back()}
                  disabled={saving || success}
                >
                  Cancel
                </button>
                <button
                  className="ec-btn ec-btn--primary"
                  onClick={handleSubmit}
                  disabled={saving || success || !name.trim() || !isDirty}
                >
                  {saving ? (
                    <>
                      <span className="ec-spinner ec-spinner--sm" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M2 8l4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .ec-page {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          /* Back */
          .ec-back {
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
          .ec-back:hover { color: var(--color-midnight-blue); }

          /* Card */
          .ec-card {
            background: var(--color-white, #fffefa);
            border-radius: 16px;
            border: 1px solid rgba(17,18,18,0.07);
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            position: relative;
            overflow: hidden;
          }

          .ec-card-accent {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--color-orange), var(--color-khaki, #ffe24f));
            border-radius: 16px 16px 0 0;
          }

          .ec-card-body {
            padding: 1.75rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          /* Loading state */
          .ec-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 3rem 1rem;
            color: var(--color-gray);
            font-size: 0.875rem;
          }

          /* Header */
          .ec-card-header {
            display: flex;
            align-items: center;
            gap: 0.9rem;
          }

          .ec-icon-wrap {
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

          .ec-title {
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--color-midnight-blue);
            margin: 0 0 2px;
            letter-spacing: -0.01em;
          }

          .ec-subtitle {
            font-size: 0.8rem;
            color: var(--color-gray);
            margin: 0;
          }

          .ec-subtitle strong {
            color: var(--color-dark-slate-gray);
            font-weight: 700;
          }

          /* Alerts */
          .ec-alert {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.65rem 0.9rem;
            border-radius: 10px;
            font-size: 0.8125rem;
            font-weight: 500;
            line-height: 1.4;
          }
          .ec-alert--success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #15803d;
          }
          .ec-alert--error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
          }

          /* Field */
          .ec-field {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }

          .ec-label {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--color-dark-slate-gray);
          }

          .ec-required { color: #ef4444; }

          .ec-input-wrap {
            position: relative;
          }

          .ec-input {
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
          .ec-input::placeholder { color: var(--color-silver); }
          .ec-input:hover { border-color: #d1d5db; }
          .ec-input:focus {
            border-color: var(--color-orange);
            box-shadow: 0 0 0 3px rgba(255,174,0,0.15);
            background: #ffffff;
          }
          .ec-input:disabled { opacity: 0.6; cursor: not-allowed; }

          .ec-changed-badge {
            position: absolute;
            right: 0.7rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--color-orange);
            background: var(--color-cornsilk, #fff8e0);
            border: 1px solid rgba(255,174,0,0.3);
            border-radius: 5px;
            padding: 2px 7px;
            pointer-events: none;
          }

          .ec-hint {
            font-size: 0.75rem;
            color: var(--color-silver);
          }

          /* Actions */
          .ec-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
            padding-top: 0.25rem;
          }

          .ec-btn {
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
          .ec-btn:disabled { opacity: 0.55; cursor: not-allowed; }
          .ec-btn:active:not(:disabled) { transform: scale(0.97); }

          .ec-btn--primary {
            background: var(--color-orange);
            color: var(--color-midnight-blue);
          }
          .ec-btn--primary:hover:not(:disabled) { background: #e09a00; }

          .ec-btn--ghost {
            background: transparent;
            color: var(--color-dark-slate-gray);
            border: 1.5px solid #e5e7eb;
          }
          .ec-btn--ghost:hover:not(:disabled) {
            background: var(--color-linen);
            border-color: #d1d5db;
          }

          /* Spinners */
          .ec-spinner {
            width: 28px;
            height: 28px;
            border: 3px solid rgba(255,174,0,0.2);
            border-top-color: var(--color-orange);
            border-radius: 50%;
            animation: ec-spin 0.7s linear infinite;
          }
          .ec-spinner--sm {
            width: 16px;
            height: 16px;
            border-width: 2.5px;
            border-color: rgba(17,18,18,0.2);
            border-top-color: var(--color-midnight-blue);
          }
          @keyframes ec-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default EditCategory;