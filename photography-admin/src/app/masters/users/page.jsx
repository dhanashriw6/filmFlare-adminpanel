"use client";

import React, { useState, useEffect } from "react";
import { approveKycStatus, getUsers, rejectKycStatus, updateKycStatus } from "@/api/users";
import DashboardLayout from "@/app/components/DashboardLayout";


const UsersKycList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers();
      // Safe extraction of records array from response
      const list = res.data?.data?.records || res.data?.records || res.data?.data || res.data || [];
      setRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      setError("Failed to load users KYC list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setUpdatingId(id);
      setActionError(null);
      setActionSuccess(null);
      
      await approveKycStatus(id);
      fetchUsers();
      
      setActionSuccess(`KYC successfully approved!`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err) {
      setActionError(err?.response?.data?.message || `Failed to update status to approved.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setUpdatingId(id);
      setActionError(null);
      setActionSuccess(null);
      
      await rejectKycStatus(id);
      fetchUsers();
      
      setActionSuccess(`KYC successfully rejected!`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err) {
      setActionError(err?.response?.data?.message || `Failed to update status to rejected.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDocType = (type) => {
    if (!type) return "N/A";
    if (type.toLowerCase() === "aadhar") return "Aadhar Card";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Filter computation
  const filteredRecords = records.filter((rec) => {
    const firstName = rec.user?.first_name || "";
    const lastName = rec.user?.last_name || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const phone = `${rec.user?.phone_code || ""}${rec.user?.phone_no || ""}`.toLowerCase();
    const docNo = (rec.document_no || "").toLowerCase();
    const docType = (rec.kyc_doc_type || "").toLowerCase();
    
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      phone.includes(search.toLowerCase()) ||
      docNo.includes(search.toLowerCase()) ||
      docType.includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Count computation for badges
  const getCount = (status) => {
    if (status === "all") return records.length;
    return records.filter((rec) => rec.status === status).length;
  };

  return (
    <DashboardLayout>
      <div className="usr-page">
        {/* Header */}
        <div className="usr-header">
          <div className="usr-header-left">
            <h1 className="usr-title">User KYC Verifications</h1>
            <p className="usr-subtitle">
              Review and approve user identification documents
            </p>
          </div>
        </div>

        {/* Controls: Search and Tabs */}
        <div className="usr-controls">
          <div className="usr-search-wrap">
            <svg
              className="usr-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search name, phone, document no…"
              className="usr-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="usr-search-field"
            />
          </div>

          <div className="usr-tabs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`usr-tab ${statusFilter === "all" ? "usr-tab--active" : ""}`}
              id="usr-tab-all"
            >
              All <span className="usr-tab-count">{getCount("all")}</span>
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`usr-tab ${statusFilter === "pending" ? "usr-tab--active" : ""}`}
              id="usr-tab-pending"
            >
              Pending <span className="usr-tab-count usr-tab-count--pending">{getCount("pending")}</span>
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`usr-tab ${statusFilter === "approved" ? "usr-tab--active" : ""}`}
              id="usr-tab-approved"
            >
              Approved <span className="usr-tab-count usr-tab-count--approved">{getCount("approved")}</span>
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`usr-tab ${statusFilter === "rejected" ? "usr-tab--active" : ""}`}
              id="usr-tab-rejected"
            >
              Rejected <span className="usr-tab-count usr-tab-count--rejected">{getCount("rejected")}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="usr-card">
          {loading ? (
            <div className="usr-state">
              <div className="usr-spinner" />
              <span>Loading KYC verifications…</span>
            </div>
          ) : error ? (
            <div className="usr-state usr-state--error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
              <button className="usr-retry-btn" onClick={fetchUsers}>Retry</button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="usr-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-silver)" }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span style={{ color: "var(--color-gray)" }}>No KYC verifications found.</span>
            </div>
          ) : (
            <table className="usr-table">
              <thead>
                <tr>
                  <th className="usr-th usr-th--num">ID</th>
                  <th className="usr-th">User Details</th>
                  <th className="usr-th">Contact</th>
                  <th className="usr-th">Document Type</th>
                  <th className="usr-th">Document No</th>
                  <th className="usr-th">Submitted Date</th>
                  <th className="usr-th">Status</th>
                  <th className="usr-th usr-th--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="usr-tr">
                    <td className="usr-td usr-td--num">#{rec.id}</td>
                    <td className="usr-td">
                      <div className="usr-name">
                        {rec.user ? `${rec.user.first_name || ""} ${rec.user.last_name || ""}` : "N/A"}
                      </div>
                    </td>
                    <td className="usr-td usr-td--phone">
                      {rec.user ? `${rec.user.phone_code || ""} ${rec.user.phone_no || ""}` : "N/A"}
                    </td>
                    <td className="usr-td">{formatDocType(rec.kyc_doc_type)}</td>
                    <td className="usr-td">
                      <code className="usr-code">{rec.document_no || "N/A"}</code>
                    </td>
                    <td className="usr-td">{formatDate(rec.created_at)}</td>
                    <td className="usr-td">
                      <span className={`usr-status usr-status--${rec.status}`}>
                        {rec.status ? rec.status.charAt(0).toUpperCase() + rec.status.slice(1) : "Pending"}
                      </span>
                    </td>
                    <td className="usr-td usr-td--right">
                      <button
                        className="usr-action-btn"
                        onClick={() => {
                          setSelectedRecord(rec);
                          setActionError(null);
                          setActionSuccess(null);
                        }}
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* KYC Verification Details Modal */}
        {selectedRecord && (
          <div className="usr-modal-overlay" onClick={() => setSelectedRecord(null)}>
            <div className="usr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="usr-modal-header">
                <h3>KYC Verification Details</h3>
                <button className="usr-modal-close" onClick={() => setSelectedRecord(null)} aria-label="Close modal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="usr-modal-body">
                {actionError && (
                  <div className="usr-modal-alert usr-modal-alert--error">
                    {actionError}
                  </div>
                )}
                {actionSuccess && (
                  <div className="usr-modal-alert usr-modal-alert--success">
                    {actionSuccess}
                  </div>
                )}

                <div className="usr-modal-grid">
                  <div className="usr-modal-info">
                    <h4 className="usr-modal-section-title">User Info</h4>
                    <div className="usr-modal-item">
                      <span className="usr-modal-label">Full Name</span>
                      <span className="usr-modal-value">
                        {selectedRecord.user
                          ? `${selectedRecord.user.first_name || ""} ${selectedRecord.user.last_name || ""}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="usr-modal-item">
                      <span className="usr-modal-label">User ID</span>
                      <span className="usr-modal-value">#{selectedRecord.user?.id || "N/A"}</span>
                    </div>
                    <div className="usr-modal-item">
                      <span className="usr-modal-label">Phone Contact</span>
                      <span className="usr-modal-value">
                        {selectedRecord.user
                          ? `${selectedRecord.user.phone_code || ""} ${selectedRecord.user.phone_no || ""}`
                          : "N/A"}
                      </span>
                    </div>

                    <h4 className="usr-modal-section-title" style={{ marginTop: "1.25rem" }}>Document Details</h4>
                    <div className="usr-modal-item">
                      <span className="usr-modal-label">Document Type</span>
                      <span className="usr-modal-value">{formatDocType(selectedRecord.kyc_doc_type)}</span>
                    </div>
                    <div className="usr-modal-item">
                      <span className="usr-modal-label">Document No</span>
                      <span className="usr-modal-value">
                        <code className="usr-code">{selectedRecord.document_no || "N/A"}</code>
                      </span>
                    </div>
                    <div className="usr-modal-item">
                      <span className="usr-modal-label">Submitted On</span>
                      <span className="usr-modal-value">{formatDate(selectedRecord.created_at)}</span>
                    </div>
                    <div className="usr-modal-item">
                      <span className="usr-modal-label">Verification Status</span>
                      <span className="usr-modal-value">
                        <span className={`usr-status usr-status--${selectedRecord.status}`}>
                          {selectedRecord.status
                            ? selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)
                            : "Pending"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="usr-modal-preview">
                    <h4 className="usr-modal-section-title">Document Attachment</h4>
                    {selectedRecord.document_url || selectedRecord.url || selectedRecord.image ? (
                      <div className="usr-doc-container">
                        <img
                          src={selectedRecord.document_url || selectedRecord.url || selectedRecord.image}
                          alt="KYC Document Preview"
                          className="usr-doc-img"
                        />
                        <a
                          href={selectedRecord.document_url || selectedRecord.url || selectedRecord.image}
                          target="_blank"
                          rel="noreferrer"
                          className="usr-doc-link"
                        >
                          View Full Image
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px" }}>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      <div className="usr-doc-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M20.4 14.5L16 10 9 17l-3-3-3.4 3.4" />
                        </svg>
                        <span>No document image attached</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="usr-modal-footer">
                <button
                  className="usr-btn usr-btn--ghost"
                  onClick={() => setSelectedRecord(null)}
                  disabled={updatingId !== null}
                >
                  Close
                </button>
                {selectedRecord.status === "pending" && (
                  <div className="usr-modal-actions">
                    <button
                      className="usr-btn usr-btn--danger"
                      onClick={() => handleReject(selectedRecord?.id)}
                      disabled={updatingId !== null}
                      id="usr-modal-btn-reject"
                    >
                      {updatingId === selectedRecord.id ? "Processing…" : "Reject"}
                    </button>
                    <button
                      className="usr-btn usr-btn--primary"
                      onClick={() => handleApprove(selectedRecord?.id)}
                      disabled={updatingId !== null}
                      id="usr-modal-btn-approve"
                    >
                      {updatingId === selectedRecord.id ? "Processing…" : "Approve"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <style>{`
          .usr-page {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          /* Header */
          .usr-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .usr-header-left { display: flex; flex-direction: column; gap: 2px; }
          .usr-title {
            font-size: 1.4rem;
            font-weight: 800;
            color: var(--color-midnight-blue);
            margin: 0;
            letter-spacing: -0.01em;
          }
          .usr-subtitle {
            font-size: 0.8125rem;
            color: var(--color-gray);
            margin: 0;
          }

          /* Controls */
          .usr-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .usr-search-wrap {
            position: relative;
            flex: 1;
            max-width: 320px;
            min-width: 240px;
          }
          .usr-search-input {
            width: 100%;
            height: 42px;
            padding: 0 1rem 0 2.5rem;
            border: 1.5px solid #e5e7eb;
            border-radius: 10px;
            font-size: 0.875rem;
            color: var(--color-midnight-blue);
            background: var(--color-ivory, #fffef5);
            outline: none;
            transition: border-color 0.18s, box-shadow 0.18s;
            box-sizing: border-box;
          }
          .usr-search-input:focus {
            border-color: var(--color-orange);
            box-shadow: 0 0 0 3px rgba(255,174,0,0.15);
            background: #ffffff;
          }
          .usr-search-icon {
            position: absolute;
            left: 0.9rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-silver);
            pointer-events: none;
          }

          /* Tabs */
          .usr-tabs {
            display: flex;
            gap: 0.35rem;
            background: rgba(17,18,18,0.03);
            padding: 4px;
            border-radius: 12px;
            border: 1px solid rgba(17,18,18,0.05);
          }
          .usr-tab {
            padding: 0.5rem 1.1rem;
            font-size: 0.8125rem;
            font-weight: 700;
            color: var(--color-gray);
            border: none;
            background: none;
            cursor: pointer;
            border-radius: 9px;
            transition: background 0.18s, color 0.18s;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }
          .usr-tab:hover {
            color: var(--color-midnight-blue);
          }
          .usr-tab--active {
            background: var(--color-orange);
            color: var(--color-midnight-blue);
            box-shadow: 0 2px 6px rgba(255,174,0,0.15);
          }
          .usr-tab-count {
            font-size: 0.7rem;
            font-weight: 800;
            background: rgba(17,18,18,0.07);
            color: var(--color-dark-slate-gray);
            padding: 1px 6px;
            border-radius: 6px;
          }
          .usr-tab--active .usr-tab-count {
            background: rgba(17,18,18,0.12);
            color: var(--color-midnight-blue);
          }
          .usr-tab-count--pending { background: #fff7e6; color: #b45309; }
          .usr-tab-count--approved { background: #f0fdf4; color: #166534; }
          .usr-tab-count--rejected { background: #fef2f2; color: #991b1b; }

          /* Card */
          .usr-card {
            background: var(--color-white, #fffefa);
            border-radius: 14px;
            border: 1px solid rgba(17,18,18,0.07);
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          }

          /* States */
          .usr-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 4.5rem 1rem;
            color: var(--color-gray);
            font-size: 0.875rem;
          }
          .usr-state--error { color: #dc2626; }
          .usr-spinner {
            width: 28px;
            height: 28px;
            border: 3px solid rgba(255,174,0,0.2);
            border-top-color: var(--color-orange);
            border-radius: 50%;
            animation: usr-spin 0.7s linear infinite;
          }
          @keyframes usr-spin { to { transform: rotate(360deg); } }

          .usr-retry-btn {
            padding: 0.4rem 1rem;
            border: 1.5px solid #dc2626;
            border-radius: 8px;
            background: none;
            color: #dc2626;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
          }
          .usr-retry-btn:hover { background: #fef2f2; }

          /* Table */
          .usr-table {
            width: 100%;
            border-collapse: collapse;
          }
          .usr-th {
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
          .usr-th--num { width: 70px; }
          .usr-th--right { text-align: right; }

          .usr-tr {
            border-bottom: 1px solid rgba(17,18,18,0.05);
            transition: background 0.12s;
          }
          .usr-tr:last-child { border-bottom: none; }
          .usr-tr:hover { background: rgba(255,174,0,0.03); }

          .usr-td {
            padding: 1rem 1.25rem;
            font-size: 0.875rem;
            color: var(--color-dark-slate-gray);
            vertical-align: middle;
          }
          .usr-td--num {
            color: var(--color-silver);
            font-size: 0.8125rem;
            font-weight: 600;
          }
          .usr-td--phone {
            font-family: monospace;
            font-size: 0.8125rem;
          }
          .usr-td--right { text-align: right; }

          .usr-name {
            font-weight: 700;
            color: var(--color-midnight-blue);
          }

          .usr-code {
            font-family: monospace;
            font-size: 0.8125rem;
            background: rgba(17,18,18,0.05);
            padding: 2px 6px;
            border-radius: 4px;
            color: var(--color-midnight-blue);
          }

          /* Badges */
          .usr-status {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
          }
          .usr-status--approved { background: #dcfce7; color: #166534; }
          .usr-status--pending { background: #fff7e6; color: #b45309; }
          .usr-status--rejected { background: #fee2e2; color: #991b1b; }

          .usr-action-btn {
            padding: 0.35rem 0.85rem;
            border: 1.5px solid rgba(17,18,18,0.1);
            border-radius: 8px;
            background: none;
            font-size: 0.8125rem;
            font-weight: 700;
            color: var(--color-dark-slate-gray);
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s, color 0.15s;
          }
          .usr-action-btn:hover {
            background: var(--color-linen);
            border-color: var(--color-orange);
            color: var(--color-midnight-blue);
          }

          /* Modal Styling */
          .usr-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(17, 18, 18, 0.45);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }

          .usr-modal {
            background: var(--color-white, #fffefa);
            border-radius: 16px;
            width: 100%;
            max-width: 680px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(17,18,18,0.08);
            animation: usr-scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes usr-scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          .usr-modal-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid rgba(17,18,18,0.07);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .usr-modal-header h3 {
            margin: 0;
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--color-midnight-blue);
            letter-spacing: -0.01em;
          }
          .usr-modal-close {
            background: none;
            border: none;
            color: var(--color-gray);
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s, color 0.15s;
          }
          .usr-modal-close:hover {
            background: rgba(17,18,18,0.05);
            color: var(--color-midnight-blue);
          }

          .usr-modal-body {
            padding: 1.5rem;
            max-height: 70vh;
            overflow-y: auto;
          }

          .usr-modal-alert {
            padding: 0.65rem 0.9rem;
            border-radius: 10px;
            font-size: 0.8125rem;
            font-weight: 600;
            margin-bottom: 1.25rem;
          }
          .usr-modal-alert--error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
          .usr-modal-alert--success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }

          .usr-modal-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
          @media (max-width: 580px) {
            .usr-modal-grid { grid-template-columns: 1fr; }
          }

          .usr-modal-section-title {
            margin: 0 0 0.85rem;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--color-gray);
            border-bottom: 1.5px solid rgba(17,18,18,0.05);
            padding-bottom: 4px;
          }

          .usr-modal-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-bottom: 0.75rem;
          }
          .usr-modal-label {
            font-size: 0.75rem;
            color: var(--color-silver);
            font-weight: 500;
          }
          .usr-modal-value {
            font-size: 0.875rem;
            color: var(--color-midnight-blue);
            font-weight: 700;
          }

          /* Document Preview */
          .usr-modal-preview {
            display: flex;
            flex-direction: column;
          }
          .usr-doc-container {
            border: 1px solid rgba(17,18,18,0.07);
            border-radius: 10px;
            padding: 6px;
            background: rgba(17,18,18,0.02);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .usr-doc-img {
            width: 100%;
            max-height: 220px;
            object-fit: contain;
            border-radius: 8px;
            background: #ffffff;
            display: block;
          }
          .usr-doc-link {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--color-orange);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            padding: 6px;
            border-radius: 6px;
            transition: background 0.15s;
          }
          .usr-doc-link:hover {
            background: var(--color-cornsilk);
          }

          .usr-doc-placeholder {
            border: 1.5px dashed #d1d5db;
            border-radius: 12px;
            background: var(--color-ivory, #fffef5);
            padding: 2.5rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: var(--color-silver);
            font-size: 0.8125rem;
            text-align: center;
            height: 100%;
            min-height: 180px;
            box-sizing: border-box;
          }

          .usr-modal-footer {
            padding: 1.25rem 1.5rem;
            border-top: 1px solid rgba(17,18,18,0.07);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .usr-modal-actions {
            display: flex;
            gap: 0.75rem;
          }

          /* Buttons */
          .usr-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            padding: 0 1.25rem;
            border-radius: 10px;
            font-size: 0.875rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.18s, transform 0.12s, opacity 0.15s;
            border: none;
          }
          .usr-btn:disabled { opacity: 0.55; cursor: not-allowed; }
          .usr-btn:active:not(:disabled) { transform: scale(0.97); }

          .usr-btn--primary {
            background: var(--color-orange);
            color: var(--color-midnight-blue);
          }
          .usr-btn--primary:hover:not(:disabled) { background: #e09a00; }

          .usr-btn--danger {
            background: #ef4444;
            color: #ffffff;
          }
          .usr-btn--danger:hover:not(:disabled) { background: #dc2626; }

          .usr-btn--ghost {
            background: transparent;
            color: var(--color-dark-slate-gray);
            border: 1.5px solid #e5e7eb;
          }
          .usr-btn--ghost:hover:not(:disabled) {
            background: var(--color-linen);
            border-color: #d1d5db;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default UsersKycList;
