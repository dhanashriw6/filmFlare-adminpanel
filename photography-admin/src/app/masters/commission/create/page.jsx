"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { createCommission } from "@/api/commission";
import { getCategory } from "@/api/category";

const CreateCommission = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    category_id: "",
    type: "fixed",
    amount_per_hour: "",
    amount_per_half_day: "",
    amount_per_day: "",
    cap_per_hour: "",
    cap_per_half_day: "",
    cap_per_day: "",
  });

  useEffect(() => {
    getCategory()
      .then((res) => setCategories(res.data?.data || res.data || []))
      .catch(() => {});
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  const isPercentage = form.type === "percentage";

  const handleSubmit = async () => {
    if (!form.category_id) return setError("Please select a category.");
    if (!form.amount_per_hour || !form.amount_per_half_day || !form.amount_per_day)
      return setError("All amount fields are required.");
    if (isPercentage && (!form.cap_per_hour || !form.cap_per_half_day || !form.cap_per_day))
      return setError("All cap fields are required for percentage type.");

    const payload = {
      category_id: Number(form.category_id),
      type: form.type,
      amount_per_hour: Number(form.amount_per_hour),
      amount_per_half_day: Number(form.amount_per_half_day),
      amount_per_day: Number(form.amount_per_day),
      ...(isPercentage && {
        cap_per_hour: Number(form.cap_per_hour),
        cap_per_half_day: Number(form.cap_per_half_day),
        cap_per_day: Number(form.cap_per_day),
      }),
    };

    try {
      setLoading(true);
      setError(null);
      await createCommission(payload);
      setSuccess(true);
      setTimeout(() => router.push("/masters/commission"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create commission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="cc-page">
        {/* Back */}
        <button className="cc-back" onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Commissions
        </button>

        {/* Card */}
        <div className="cc-card">
          <div className="cc-card-accent" />

          <div className="cc-card-body">
            {/* Header */}
            <div className="cc-card-header">
              <div className="cc-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11 7v1.5M11 13.5V15M8.5 9.5C8.5 8.4 9.6 7.5 11 7.5s2.5.9 2.5 2c0 1-1 1.7-2.5 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="cc-title">New Commission</h2>
                <p className="cc-subtitle">Set commission rates for an event category</p>
              </div>
            </div>

            {/* Success */}
            {success && (
              <div className="cc-alert cc-alert--success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Commission created! Redirecting…
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="cc-alert cc-alert--error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* Row 1: Category + Type */}
            <div className="cc-row">
              <div className="cc-field">
                <label className="cc-label" htmlFor="com-cat">
                  Category <span className="cc-required">*</span>
                </label>
                <select
                  id="com-cat"
                  className="cc-input cc-select"
                  value={form.category_id}
                  onChange={(e) => setField("category_id", e.target.value)}
                  disabled={loading || success}
                >
                  <option value="">Select category…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="cc-field">
                <label className="cc-label">
                  Commission Type <span className="cc-required">*</span>
                </label>
                <div className="cc-toggle-group">
                  <button
                    type="button"
                    className={`cc-toggle ${form.type === "fixed" ? "cc-toggle--active" : ""}`}
                    onClick={() => setField("type", "fixed")}
                    disabled={loading || success}
                  >
                    Fixed (₹)
                  </button>
                  <button
                    type="button"
                    className={`cc-toggle ${form.type === "percentage" ? "cc-toggle--active" : ""}`}
                    onClick={() => setField("type", "percentage")}
                    disabled={loading || success}
                  >
                    Percentage (%)
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="cc-section-label">
              Amount {isPercentage ? "(%)" : "(₹)"}
            </div>

            {/* Row 2: Amounts */}
            <div className="cc-row cc-row--3">
              {[
                { key: "amount_per_hour", label: "Per Hour" },
                { key: "amount_per_half_day", label: "Per Half Day" },
                { key: "amount_per_day", label: "Per Day" },
              ].map(({ key, label }) => (
                <div className="cc-field" key={key}>
                  <label className="cc-label" htmlFor={key}>
                    {label} <span className="cc-required">*</span>
                  </label>
                  <div className="cc-input-wrap">
                    <span className="cc-input-prefix">
                      {isPercentage ? "₹" : "₹"}
                    </span>
                    <input
                      id={key}
                      className="cc-input cc-input--prefixed"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      disabled={loading || success}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Cap fields — only for percentage */}
            {isPercentage && (
              <>
                <div className="cc-section-label">Cap Amount (₹)</div>
                <div className="cc-row cc-row--3">
                  {[
                    { key: "cap_per_hour", label: "Cap Per Hour" },
                    { key: "cap_per_half_day", label: "Cap Per Half Day" },
                    { key: "cap_per_day", label: "Cap Per Day" },
                  ].map(({ key, label }) => (
                    <div className="cc-field" key={key}>
                      <label className="cc-label" htmlFor={key}>
                        {label} <span className="cc-required">*</span>
                      </label>
                      <div className="cc-input-wrap">
                        <span className="cc-input-prefix">₹</span>
                        <input
                          id={key}
                          className="cc-input cc-input--prefixed"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={form[key]}
                          onChange={(e) => setField(key, e.target.value)}
                          disabled={loading || success}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

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
                disabled={loading || success}
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
                    Create Commission
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

          /* Back */
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
            padding: 1.75rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          /* Header */
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

          /* Section label */
          .cc-section-label {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--color-gray);
            padding-bottom: 0.25rem;
            border-bottom: 1px solid rgba(17,18,18,0.06);
          }

          /* Rows */
          .cc-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .cc-row--3 {
            grid-template-columns: 1fr 1fr 1fr;
          }
          @media (max-width: 600px) {
            .cc-row, .cc-row--3 { grid-template-columns: 1fr; }
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

          /* Input */
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

          /* Select */
          .cc-select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.9rem center;
            padding-right: 2.5rem;
            cursor: pointer;
          }

          /* Prefixed input */
          .cc-input-wrap {
            position: relative;
            display: flex;
            align-items: center;
          }
          .cc-input-prefix {
            position: absolute;
            left: 0.9rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-gray);
            pointer-events: none;
            user-select: none;
          }
          .cc-input--prefixed {
            padding-left: 1.75rem;
          }

          /* Toggle group */
          .cc-toggle-group {
            display: flex;
            border: 1.5px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            height: 46px;
          }
          .cc-toggle {
            flex: 1;
            border: none;
            background: var(--color-ivory, #fffef5);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--color-gray);
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
          }
          .cc-toggle + .cc-toggle {
            border-left: 1.5px solid #e5e7eb;
          }
          .cc-toggle--active {
            background: var(--color-orange);
            color: var(--color-midnight-blue);
          }
          .cc-toggle:disabled { opacity: 0.6; cursor: not-allowed; }

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

export default CreateCommission;