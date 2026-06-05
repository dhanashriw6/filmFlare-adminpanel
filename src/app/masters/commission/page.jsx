"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { getCommission, deleteCommission } from "@/api/commission";

const CommissionList = () => {
  const router = useRouter();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCommission();
      setCommissions(res.data?.data || res.data || []);
    } catch (err) {
      setError("Failed to load commissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this commission?")) return;
    try {
      setDeletingId(id);
      await deleteCommission(id);
      setCommissions((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete commission. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (val) =>
    val !== undefined && val !== null ? `₹${Number(val).toLocaleString()}` : "—";

  return (
    <DashboardLayout>
      <div className="com-page">
        {/* Header */}
        <div className="com-header">
          <div className="com-header-left">
            <h1 className="com-title">Commissions</h1>
            <p className="com-subtitle">Manage event category commission rules</p>
          </div>
          <button
            className="com-create-btn"
            onClick={() => router.push("/masters/commission/create")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1v14M1 8h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Create Commission
          </button>
        </div>

        {/* Table Card */}
        <div className="com-card">
          {loading ? (
            <div className="com-state">
              <div className="com-spinner" />
              <span>Loading commissions…</span>
            </div>
          ) : error ? (
            <div className="com-state com-state--error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>{error}</span>
              <button className="com-retry-btn" onClick={fetchCommissions}>
                Retry
              </button>
            </div>
          ) : commissions.length === 0 ? (
            <div className="com-state">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="10" width="28" height="22" rx="3" stroke="#BBBBBB" strokeWidth="1.5" />
                <path
                  d="M13 16h14M13 21h8"
                  stroke="#BBBBBB"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ color: "var(--color-gray)" }}>No commissions yet.</span>
              <button
                className="com-create-btn"
                onClick={() => router.push("/masters/commission/create")}
              >
                Create your first commission
              </button>
            </div>
          ) : (
            <div className="com-table-wrap">
              <table className="com-table">
                <thead>
                  <tr>
                    <th className="com-th com-th--num">#</th>
                    <th className="com-th">Category</th>
                    <th className="com-th">Type</th>
                    <th className="com-th com-th--center">Per Hour</th>
                    <th className="com-th com-th--center">Per Half Day</th>
                    <th className="com-th com-th--center">Per Day</th>
                    <th className="com-th com-th--right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((com, idx) => (
                    <tr key={com.id} className="com-tr">
                      <td className="com-td com-td--num">{idx + 1}</td>

                      {/* Category */}
                      <td className="com-td">
                        <span className="com-name-badge">
                          {com.category?.name ?? `Category #${com.category_id}`}
                        </span>
                      </td>

                      {/* Type badge */}
                      <td className="com-td">
                        <span className={`com-type-badge com-type-badge--${com.type}`}>
                          {com.type === "fixed" ? "Fixed" : "Percentage"}
                        </span>
                      </td>

                      {/* Amounts */}
                      <td className="com-td com-td--center">
                        <span className="com-amount">{fmt(com.amount_per_hour)}</span>
                        {com.type === "percentage" && com.cap_per_hour != null && (
                          <span className="com-cap">cap {fmt(com.cap_per_hour)}</span>
                        )}
                      </td>
                      <td className="com-td com-td--center">
                        <span className="com-amount">{fmt(com.amount_per_half_day)}</span>
                        {com.type === "percentage" && com.cap_per_half_day != null && (
                          <span className="com-cap">cap {fmt(com.cap_per_half_day)}</span>
                        )}
                      </td>
                      <td className="com-td com-td--center">
                        <span className="com-amount">{fmt(com.amount_per_day)}</span>
                        {com.type === "percentage" && com.cap_per_day != null && (
                          <span className="com-cap">cap {fmt(com.cap_per_day)}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="com-td com-td--right">
                        <div className="com-actions">
                          <button
                            className="com-action-btn"
                            onClick={() =>
                              router.push(`/masters/commission/edit/${com.id}`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="com-action-btn com-action-btn--danger"
                            onClick={() => handleDelete(com.id)}
                            disabled={deletingId === com.id}
                          >
                            {deletingId === com.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <style>{`
          .com-page {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .com-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .com-header-left { display: flex; flex-direction: column; gap: 2px; }
          .com-title {
            font-size: 1.4rem;
            font-weight: 800;
            color: var(--color-midnight-blue);
            margin: 0;
            letter-spacing: -0.01em;
          }
          .com-subtitle {
            font-size: 0.8125rem;
            color: var(--color-gray);
            margin: 0;
          }
          .com-create-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.55rem 1.1rem;
            background: var(--color-orange);
            color: var(--color-midnight-blue);
            border: none;
            border-radius: 10px;
            font-size: 0.875rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.18s, transform 0.12s;
            white-space: nowrap;
          }
          .com-create-btn:hover { background: #e09a00; }
          .com-create-btn:active { transform: scale(0.97); }
          .com-card {
            background: var(--color-white, #fffefa);
            border-radius: 14px;
            border: 1px solid rgba(17,18,18,0.07);
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          }
          .com-table-wrap { overflow-x: auto; }
          .com-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 3.5rem 1rem;
            color: var(--color-gray);
            font-size: 0.875rem;
          }
          .com-state--error { color: #dc2626; }
          .com-spinner {
            width: 28px;
            height: 28px;
            border: 3px solid rgba(255,174,0,0.2);
            border-top-color: var(--color-orange);
            border-radius: 50%;
            animation: com-spin 0.7s linear infinite;
          }
          @keyframes com-spin { to { transform: rotate(360deg); } }
          .com-retry-btn {
            padding: 0.4rem 1rem;
            border: 1.5px solid #dc2626;
            border-radius: 8px;
            background: none;
            color: #dc2626;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
          }
          .com-retry-btn:hover { background: #fef2f2; }
          .com-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 700px;
          }
          .com-th {
            padding: 0.85rem 1.25rem;
            text-align: left;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--color-gray);
            background: var(--color-linen, #f7f4e9);
            border-bottom: 1px solid rgba(17,18,18,0.07);
            white-space: nowrap;
          }
          .com-th--num    { width: 56px; }
          .com-th--center { text-align: center; }
          .com-th--right  { text-align: right; }
          .com-tr {
            border-bottom: 1px solid rgba(17,18,18,0.05);
            transition: background 0.13s;
          }
          .com-tr:last-child { border-bottom: none; }
          .com-tr:hover { background: rgba(255,174,0,0.04); }
          .com-td {
            padding: 0.9rem 1.25rem;
            font-size: 0.875rem;
            color: var(--color-dark-slate-gray);
            vertical-align: middle;
          }
          .com-td--num    { color: var(--color-silver); font-size: 0.8125rem; }
          .com-td--center { text-align: center; }
          .com-td--right  { text-align: right; }
          .com-name-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-weight: 600;
            color: var(--color-midnight-blue);
          }
          .com-name-badge::before {
            content: '';
            display: inline-block;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--color-orange);
            flex-shrink: 0;
          }
          .com-type-badge {
            display: inline-block;
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.04em;
          }
          .com-type-badge--fixed {
            background: rgba(34,197,94,0.1);
            color: #15803d;
          }
          .com-type-badge--percentage {
            background: rgba(99,102,241,0.1);
            color: #4338ca;
          }
          .com-amount {
            display: block;
            font-weight: 600;
            color: var(--color-midnight-blue);
          }
          .com-cap {
            display: block;
            font-size: 0.72rem;
            color: var(--color-gray);
            margin-top: 1px;
          }
          .com-actions {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: flex-end;
          }
          .com-action-btn {
            padding: 0.35rem 0.85rem;
            border: 1.5px solid rgba(17,18,18,0.1);
            border-radius: 8px;
            background: none;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--color-dark-slate-gray);
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s, color 0.15s;
          }
          .com-action-btn:hover {
            background: var(--color-linen);
            border-color: var(--color-orange);
            color: var(--color-midnight-blue);
          }
          .com-action-btn--danger {
            color: #dc2626;
            border-color: rgba(220,38,38,0.2);
          }
          .com-action-btn--danger:hover {
            background: #fef2f2;
            border-color: #dc2626;
            color: #dc2626;
          }
          .com-action-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default CommissionList;