"use client";

import React, { useState, useEffect } from "react";
import { getBankDetails } from "@/api/bank";
import DashboardLayout from "@/app/components/DashboardLayout";

const PAGE_SIZE = 10;

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "pending_verification", label: "Pending" },
    { key: "verified", label: "Verified" },
    { key: "rejected", label: "Rejected" },
];

const BankAccountsList = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { fetchAccounts(); }, []);
    useEffect(() => { setCurrentPage(1); }, [search, activeTab]);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getBankDetails();
            const list = res.data?.data || res.data || [];
            setRecords(Array.isArray(list) ? list : []);
        } catch {
            setError("Failed to load bank accounts. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
            });
        } catch { return dateStr; }
    };

    const maskAccount = (num) => {
        if (!num) return "—";
        return "•••• " + num.slice(-4);
    };

    const filteredRecords = records.filter((rec) => {
        const matchTab = activeTab === "all" || rec.status === activeTab;
        const q = search.toLowerCase();
        const matchSearch =
            rec.account_holder_name?.toLowerCase().includes(q) ||
            rec.account_number?.includes(q) ||
            rec.ifsc_code?.toLowerCase().includes(q) ||
            rec.upi_id?.toLowerCase().includes(q) ||
            `${rec.user?.first_name} ${rec.user?.last_name}`.toLowerCase().includes(q) ||
            rec.user?.email?.toLowerCase().includes(q) ||
            rec.user?.phone_no?.includes(q);
        return matchTab && matchSearch;
    });

    const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
    const paginated = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getCount = (key) =>
        key === "all" ? records.length : records.filter((r) => r.status === key).length;

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);
        range.push(1);
        if (left > 2) range.push("...");
        for (let i = left; i <= right; i++) range.push(i);
        if (right < totalPages - 1) range.push("...");
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    return (
        <DashboardLayout>
            <div className="bk-page">

                {/* Header */}
                <div className="bk-header">
                    <div>
                        <h1 className="bk-title">Bank Accounts</h1>
                        <p className="bk-subtitle">Review and verify user bank account details</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bk-controls">
                    <div className="bk-search-wrap">
                        <svg className="bk-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search holder, account no, IFSC, user…"
                            className="bk-search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="bk-tabs">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`bk-tab${activeTab === tab.key ? " bk-tab--active" : ""}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                                <span className={`bk-tab-count bk-tab-count--${tab.key}`}>
                                    {getCount(tab.key)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Card */}
                <div className="bk-card">
                    {loading ? (
                        <div className="bk-state">
                            <div className="bk-spinner" />
                            <span>Loading bank accounts…</span>
                        </div>
                    ) : error ? (
                        <div className="bk-state bk-state--error">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                            </svg>
                            <span>{error}</span>
                            <button className="bk-retry-btn" onClick={fetchAccounts}>Retry</button>
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="bk-state">
                            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-silver)" }}>
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <span style={{ color: "var(--color-gray)" }}>No bank accounts found.</span>
                        </div>
                    ) : (
                        <>
                            <div className="bk-table-wrap">
                                <table className="bk-table">
                                    <thead>
                                        <tr>
                                            <th className="bk-th">#</th>
                                            <th className="bk-th">Account Holder</th>
                                            <th className="bk-th">Account Number</th>
                                            <th className="bk-th">IFSC Code</th>
                                            <th className="bk-th">UPI ID</th>
                                            <th className="bk-th">Type</th>
                                            <th className="bk-th">Primary</th>
                                            <th className="bk-th">Status</th>
                                            <th className="bk-th">User</th>
                                            <th className="bk-th">Verified By</th>
                                            <th className="bk-th">Verified At</th>
                                            <th className="bk-th">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((rec, idx) => (
                                            <tr key={rec.id} className="bk-tr">
                                                <td className="bk-td bk-td--num">
                                                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                                </td>

                                                {/* Account Holder */}
                                                <td className="bk-td">
                                                    <div className="bk-holder-name">{rec.account_holder_name || "—"}</div>
                                                    {rec.rejection_reason && (
                                                        <div className="bk-rejection">⚠ {rec.rejection_reason}</div>
                                                    )}
                                                </td>

                                                {/* Account Number */}
                                                <td className="bk-td">
                                                    <span className="bk-mono bk-acct-num">{(rec.account_number)}</span>
                                                </td>

                                                {/* IFSC */}
                                                <td className="bk-td">
                                                    <span className="bk-mono bk-ifsc">{rec.ifsc_code || "—"}</span>
                                                </td>

                                                {/* UPI */}
                                                <td className="bk-td">
                                                    {rec.upi_id ? (
                                                        <span className="bk-mono">{rec.upi_id}</span>
                                                    ) : (
                                                        <span className="bk-na">—</span>
                                                    )}
                                                </td>

                                                {/* Type */}
                                                <td className="bk-td">
                                                    <span className="bk-type-badge">{rec.account_type}</span>
                                                </td>

                                                {/* Primary */}
                                                <td className="bk-td bk-td--center">
                                                    {rec.is_primary ? (
                                                        <span className="bk-primary-badge">Primary</span>
                                                    ) : (
                                                        <span className="bk-na">—</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="bk-td">
                                                    <span className={`bk-status bk-status--${rec.status}`}>
                                                        {rec.status === "pending_verification" ? "Pending" : rec.status}
                                                    </span>
                                                </td>

                                                {/* User */}
                                                <td className="bk-td">
                                                    {rec.user ? (
                                                        <div className="bk-user-cell">
                                                            <span className="bk-user-name">{rec.user.first_name} {rec.user.last_name}</span>
                                                            <span className="bk-user-email">{rec.user.email}</span>
                                                            <span className="bk-user-phone bk-mono">{rec.user.phone_code} {rec.user.phone_no}</span>
                                                        </div>
                                                    ) : <span className="bk-na">—</span>}
                                                </td>

                                                {/* Verified By */}
                                                <td className="bk-td">
                                                    {rec.verifiedBy ? (
                                                        <span className="bk-verifier">{rec.verifiedBy.first_name} {rec.verifiedBy.last_name}</span>
                                                    ) : <span className="bk-na">—</span>}
                                                </td>

                                                {/* Verified At */}
                                                <td className="bk-td bk-td--date">{formatDate(rec.verified_at)}</td>

                                                {/* Created */}
                                                <td className="bk-td bk-td--date">{formatDate(rec.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bk-pagination">
                                    <span className="bk-page-info">
                                        Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}
                                    </span>
                                    <div className="bk-page-btns">
                                        <button className="bk-page-btn bk-page-btn--nav" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                                        {getPageNumbers().map((p, i) =>
                                            p === "..." ? (
                                                <span key={`e${i}`} className="bk-page-ellipsis">…</span>
                                            ) : (
                                                <button key={p} className={`bk-page-btn${currentPage === p ? " bk-page-btn--active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
                                            )
                                        )}
                                        <button className="bk-page-btn bk-page-btn--nav" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>

            <style>{`
                .bk-page { display: flex; flex-direction: column; gap: 1.5rem; }

                /* Header */
                .bk-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
                .bk-title { font-size: 1.4rem; font-weight: 800; color: var(--color-midnight-blue); margin: 0; letter-spacing: -0.01em; }
                .bk-subtitle { font-size: 0.8125rem; color: var(--color-gray); margin: 0; }

                /* Controls */
                .bk-controls { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
                .bk-search-wrap { position: relative; flex: 1; max-width: 340px; min-width: 220px; }
                .bk-search-input { width: 100%; height: 42px; padding: 0 1rem 0 2.4rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.875rem; color: var(--color-midnight-blue); background: var(--color-ivory, #fffef5); outline: none; transition: border-color 0.18s, box-shadow 0.18s; box-sizing: border-box; }
                .bk-search-input:focus { border-color: var(--color-orange); box-shadow: 0 0 0 3px rgba(255,174,0,0.15); background: #fff; }
                .bk-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--color-silver); pointer-events: none; }

                /* Tabs */
                .bk-tabs { display: flex; gap: 0.3rem; background: rgba(17,18,18,0.03); padding: 4px; border-radius: 12px; border: 1px solid rgba(17,18,18,0.05); }
                .bk-tab { padding: 0.45rem 1rem; font-size: 0.8rem; font-weight: 700; color: var(--color-gray); border: none; background: none; cursor: pointer; border-radius: 9px; display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s, color 0.15s; }
                .bk-tab:hover { color: var(--color-midnight-blue); }
                .bk-tab--active { background: var(--color-orange); color: var(--color-midnight-blue); box-shadow: 0 2px 6px rgba(255,174,0,0.18); }
                .bk-tab-count { font-size: 0.68rem; font-weight: 800; background: rgba(17,18,18,0.07); color: var(--color-dark-slate-gray); padding: 1px 6px; border-radius: 6px; }
                .bk-tab--active .bk-tab-count { background: rgba(17,18,18,0.12); }
                .bk-tab-count--pending_verification { background: #fff7e6; color: #b45309; }
                .bk-tab-count--verified { background: #dcfce7; color: #166534; }
                .bk-tab-count--rejected { background: #fee2e2; color: #991b1b; }

                /* Card */
                .bk-card { background: var(--color-white, #fffefa); border-radius: 14px; border: 1px solid rgba(17,18,18,0.07); overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
                .bk-table-wrap { overflow-x: auto; }

                /* States */
                .bk-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 4.5rem 1rem; color: var(--color-gray); font-size: 0.875rem; }
                .bk-state--error { color: #dc2626; }
                .bk-spinner { width: 28px; height: 28px; border: 3px solid rgba(255,174,0,0.2); border-top-color: var(--color-orange); border-radius: 50%; animation: bk-spin 0.7s linear infinite; }
                @keyframes bk-spin { to { transform: rotate(360deg); } }
                .bk-retry-btn { padding: 0.4rem 1rem; border: 1.5px solid #dc2626; border-radius: 8px; background: none; color: #dc2626; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
                .bk-retry-btn:hover { background: #fef2f2; }

                /* Table */
                .bk-table { width: 100%; border-collapse: collapse; }
                .bk-th { padding: 0.8rem 1.1rem; text-align: left; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-gray); background: var(--color-linen, #f7f4e9); border-bottom: 1px solid rgba(17,18,18,0.07); white-space: nowrap; }
                .bk-tr { border-bottom: 1px solid rgba(17,18,18,0.05); transition: background 0.12s; }
                .bk-tr:last-child { border-bottom: none; }
                .bk-tr:hover { background: rgba(255,174,0,0.04); }
                .bk-td { padding: 0.9rem 1.1rem; font-size: 0.875rem; color: var(--color-dark-slate-gray); vertical-align: middle; white-space: nowrap; }
                .bk-td--num { color: var(--color-silver); font-size: 0.78rem; font-weight: 600; }
                .bk-td--center { text-align: center; }
                .bk-td--date { font-size: 0.8rem; color: var(--color-gray); }

                /* Cell content */
                .bk-holder-name { font-weight: 700; color: var(--color-midnight-blue); }
                .bk-rejection { font-size: 0.72rem; color: #dc2626; margin-top: 2px; font-weight: 500; }
                .bk-mono { font-family: monospace; font-size: 0.8125rem; }
                .bk-acct-num { background: rgba(17,18,18,0.05); padding: 2px 8px; border-radius: 6px; letter-spacing: 0.05em; }
                .bk-ifsc { color: var(--color-midnight-blue); font-weight: 600; letter-spacing: 0.04em; }
                .bk-na { color: var(--color-silver); }

                /* Badges */
                .bk-type-badge { display: inline-flex; padding: 3px 9px; background: rgba(17,18,18,0.05); border-radius: 999px; font-size: 0.72rem; font-weight: 700; color: var(--color-dark-slate-gray); text-transform: capitalize; }
                .bk-primary-badge { display: inline-flex; padding: 3px 9px; background: #eff6ff; border-radius: 999px; font-size: 0.72rem; font-weight: 700; color: #1d4ed8; }

                .bk-status { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; white-space: nowrap; }
                .bk-status--verified { background: #dcfce7; color: #166534; }
                .bk-status--pending_verification { background: #fff7e6; color: #b45309; }
                .bk-status--rejected { background: #fee2e2; color: #991b1b; }

                /* User cell */
                .bk-user-cell { display: flex; flex-direction: column; gap: 1px; }
                .bk-user-name { font-weight: 700; color: var(--color-midnight-blue); font-size: 0.8125rem; }
                .bk-user-email { font-size: 0.75rem; color: var(--color-gray); }
                .bk-user-phone { font-size: 0.72rem; color: var(--color-silver); }
                .bk-verifier { font-size: 0.8125rem; font-weight: 600; color: var(--color-midnight-blue); }

                /* Pagination */
                .bk-pagination { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-top: 1px solid rgba(17,18,18,0.06); flex-wrap: wrap; gap: 0.75rem; }
                .bk-page-info { font-size: 0.8rem; color: var(--color-gray); font-weight: 500; }
                .bk-page-btns { display: flex; align-items: center; gap: 0.3rem; }
                .bk-page-btn { min-width: 34px; height: 34px; padding: 0 0.5rem; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 0.8125rem; font-weight: 600; color: var(--color-dark-slate-gray); cursor: pointer; transition: background 0.15s, border-color 0.15s; display: inline-flex; align-items: center; justify-content: center; }
                .bk-page-btn:hover:not(:disabled) { background: var(--color-linen); border-color: var(--color-orange); color: var(--color-midnight-blue); }
                .bk-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .bk-page-btn--active { background: var(--color-orange); border-color: var(--color-orange); color: var(--color-midnight-blue); }
                .bk-page-btn--nav { font-size: 1.1rem; }
                .bk-page-ellipsis { padding: 0 0.2rem; color: var(--color-silver); }
            `}</style>
        </DashboardLayout>
    );
};

export default BankAccountsList;