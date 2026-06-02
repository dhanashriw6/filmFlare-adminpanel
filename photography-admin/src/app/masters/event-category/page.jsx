"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { getCategory } from "@/api/category";

const CategoryList = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCategory();
      setCategories(res.data?.data || res.data || []);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="cat-page">
        {/* Header */}
        <div className="cat-header">
          <div className="cat-header-left">
            <h1 className="cat-title">Event Categories</h1>
            <p className="cat-subtitle">Manage master event categories</p>
          </div>
          <button
            className="cat-create-btn"
            onClick={() => router.push("/masters/event-category/create")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Create Category
          </button>
        </div>

        {/* Table Card */}
        <div className="cat-card">
          {loading ? (
            <div className="cat-state">
              <div className="cat-spinner" />
              <span>Loading categories…</span>
            </div>
          ) : error ? (
            <div className="cat-state cat-state--error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
              <button className="cat-retry-btn" onClick={fetchCategories}>Retry</button>
            </div>
          ) : categories.length === 0 ? (
            <div className="cat-state">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="10" width="28" height="22" rx="3" stroke="#BBBBBB" strokeWidth="1.5" />
                <path d="M13 16h14M13 21h8" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ color: "var(--color-gray)" }}>No categories yet.</span>
              <button
                className="cat-create-btn"
                onClick={() => router.push("/masters/event-category/create")}
              >
                Create your first category
              </button>
            </div>
          ) : (
            <table className="cat-table">
              <thead>
                <tr>
                  <th className="cat-th cat-th--num">#</th>
                  <th className="cat-th">Category Name</th>
                  <th className="cat-th cat-th--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat.id ?? idx} className="cat-tr">
                    <td className="cat-td cat-td--num">{idx + 1}</td>
                    <td className="cat-td">
                      <span className="cat-name-badge">{cat.name}</span>
                      {/* <span className="cat-name-badge">{cat.description}</span> */}
                    </td>
                    <td className="cat-td cat-td--right">
                      <button
                        className="cat-action-btn"
                        onClick={() =>
                          router.push(`/masters/event-category/edit/${cat.id}`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <style>{`
          .cat-page {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          /* Header */
          .cat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .cat-header-left { display: flex; flex-direction: column; gap: 2px; }
          .cat-title {
            font-size: 1.4rem;
            font-weight: 800;
            color: var(--color-midnight-blue);
            margin: 0;
            letter-spacing: -0.01em;
          }
          .cat-subtitle {
            font-size: 0.8125rem;
            color: var(--color-gray);
            margin: 0;
          }

          /* Create button */
          .cat-create-btn {
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
          .cat-create-btn:hover { background: #e09a00; }
          .cat-create-btn:active { transform: scale(0.97); }

          /* Card */
          .cat-card {
            background: var(--color-white, #fffefa);
            border-radius: 14px;
            border: 1px solid rgba(17,18,18,0.07);
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          }

          /* Empty / loading state */
          .cat-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 3.5rem 1rem;
            color: var(--color-gray);
            font-size: 0.875rem;
          }
          .cat-state--error { color: #dc2626; }

          .cat-spinner {
            width: 28px;
            height: 28px;
            border: 3px solid rgba(255,174,0,0.2);
            border-top-color: var(--color-orange);
            border-radius: 50%;
            animation: cat-spin 0.7s linear infinite;
          }
          @keyframes cat-spin { to { transform: rotate(360deg); } }

          .cat-retry-btn {
            padding: 0.4rem 1rem;
            border: 1.5px solid #dc2626;
            border-radius: 8px;
            background: none;
            color: #dc2626;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
          }
          .cat-retry-btn:hover { background: #fef2f2; }

          /* Table */
          .cat-table {
            width: 100%;
            border-collapse: collapse;
          }
          .cat-th {
            padding: 0.85rem 1.25rem;
            text-align: left;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--color-gray);
            background: var(--color-linen, #f7f4e9);
            border-bottom: 1px solid rgba(17,18,18,0.07);
          }
          .cat-th--num { width: 56px; }
          .cat-th--right { text-align: right; }

          .cat-tr {
            border-bottom: 1px solid rgba(17,18,18,0.05);
            transition: background 0.13s;
          }
          .cat-tr:last-child { border-bottom: none; }
          .cat-tr:hover { background: rgba(255,174,0,0.04); }

          .cat-td {
            padding: 0.9rem 1.25rem;
            font-size: 0.875rem;
            color: var(--color-dark-slate-gray);
            vertical-align: middle;
          }
          .cat-td--num {
            color: var(--color-silver);
            font-size: 0.8125rem;
          }
          .cat-td--right { text-align: right; }

          .cat-name-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-weight: 600;
            color: var(--color-midnight-blue);
          }
          .cat-name-badge::before {
            content: '';
            display: inline-block;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--color-orange);
            flex-shrink: 0;
          }

          .cat-action-btn {
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
          .cat-action-btn:hover {
            background: var(--color-linen);
            border-color: var(--color-orange);
            color: var(--color-midnight-blue);
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default CategoryList;