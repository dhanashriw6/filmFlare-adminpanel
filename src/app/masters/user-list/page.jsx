"use client";

import React, { useState, useEffect } from "react";
import { getUserList } from "@/api/users";
import DashboardLayout from "@/app/components/DashboardLayout";
import UserDetails from "./userDetails/page";

const PAGE_SIZE = 10;

const UsersList = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Reset to page 1 on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getUserList();
            const list = res.data?.data?.records || res.data?.records || res.data?.data || res.data || [];
            setRecords(Array.isArray(list) ? list : []);
        } catch (err) {
            setError("Failed to load users. Please try again.");
        } finally {
            setLoading(false);
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

    const filteredRecords = records.filter((user) => {
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
        const phone = `${user.phone_code || ""}${user.phone_no || ""}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        return (
            fullName.includes(search.toLowerCase()) ||
            phone.includes(search.toLowerCase()) ||
            email.includes(search.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Page range for pagination buttons (show up to 5 page numbers)
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

    if (selectedUserId !== null) {
        return <UserDetails userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
    }

    return (
        <DashboardLayout>
            <div className="usr-page">
                {/* Header */}
                <div className="usr-header">
                    <div className="usr-header-left">
                        <h1 className="usr-title">User KYC Verifications</h1>
                        <p className="usr-subtitle">Review and approve user identification documents</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="usr-controls">
                    <div className="usr-search-wrap">
                        <svg className="usr-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search name, phone, email…"
                            className="usr-search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {!loading && !error && (
                        <span className="usr-count-label">
                            {filteredRecords.length} user{filteredRecords.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Table Card */}
                <div className="usr-card">
                    {loading ? (
                        <div className="usr-state">
                            <div className="usr-spinner" />
                            <span>Loading users…</span>
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
                    ) : paginatedRecords.length === 0 ? (
                        <div className="usr-state">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-silver)" }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span style={{ color: "var(--color-gray)" }}>No users found.</span>
                        </div>
                    ) : (
                        <>
                            <div className="usr-table-wrap">
                                <table className="usr-table">
                                    <thead>
                                        <tr>
                                            <th className="usr-th">Action</th>

                                            <th className="usr-th">#</th>
                                            <th className="usr-th">Profile</th>
                                            <th className="usr-th">Name</th>
                                            <th className="usr-th">Email</th>
                                            <th className="usr-th">Phone</th>
                                            <th className="usr-th">User Type</th>
                                            <th className="usr-th">Skills</th>
                                            <th className="usr-th">Account</th>
                                            <th className="usr-th">KYC</th>
                                            <th className="usr-th">Verified</th>
                                            <th className="usr-th">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedRecords.map((user, idx) => (
                                            <tr key={user.id} className="usr-tr">
                                                <td className="usr-td usr-td--num">
                                                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                                </td>
                                                <td className="usr-td">
                                                    <button
                                                        className="usr-view-btn"
                                                        onClick={() => setSelectedUserId(user.id)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                                <td className="usr-td">
                                                    <img
                                                        src={user.profile_image || "/default-avatar.png"}
                                                        alt={`${user.first_name} ${user.last_name}`}
                                                        className="usr-avatar"
                                                    />
                                                </td>
                                                <td className="usr-td">
                                                    <div className="usr-name">{user.first_name} {user.last_name}</div>
                                                </td>
                                                <td className="usr-td">{user.email}</td>
                                                <td className="usr-td usr-td--phone">{user.phone_code} {user.phone_no}</td>
                                                <td className="usr-td">{user.user_type?.replace("_", " ")}</td>
                                                <td className="usr-td">{user.skills?.map((s) => s.skill).join(", ") || "—"}</td>
                                                <td className="usr-td">
                                                    <span className={`usr-status usr-status--${user.account_status}`}>
                                                        {user.account_status}
                                                    </span>
                                                </td>
                                                <td className="usr-td">
                                                    <span className={`usr-status usr-status--${user.kyc_status ?? "none"}`}>
                                                        {user.kyc_status ?? "—"}
                                                    </span>
                                                </td>
                                                <td className="usr-td">
                                                    {user.is_verified_user ? "✅" : "❌"}
                                                </td>
                                                <td className="usr-td">{formatDate(user.created_at)}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="usr-pagination">
                                    <span className="usr-page-info">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div className="usr-page-btns">
                                        <button
                                            className="usr-page-btn usr-page-btn--nav"
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            aria-label="Previous page"
                                        >
                                            ‹
                                        </button>
                                        {getPageNumbers().map((p, i) =>
                                            p === "..." ? (
                                                <span key={`ellipsis-${i}`} className="usr-page-ellipsis">…</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    className={`usr-page-btn${currentPage === p ? " usr-page-btn--active" : ""}`}
                                                    onClick={() => goToPage(p)}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        )}
                                        <button
                                            className="usr-page-btn usr-page-btn--nav"
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            aria-label="Next page"
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <style>{`
                    .usr-page { display: flex; flex-direction: column; gap: 1.5rem; }

                    .usr-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
                    .usr-header-left { display: flex; flex-direction: column; gap: 2px; }
                    .usr-title { font-size: 1.4rem; font-weight: 800; color: var(--color-midnight-blue); margin: 0; letter-spacing: -0.01em; }
                    .usr-subtitle { font-size: 0.8125rem; color: var(--color-gray); margin: 0; }

                    .usr-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
                    .usr-count-label { font-size: 0.8125rem; font-weight: 600; color: var(--color-gray); white-space: nowrap; }

                    .usr-search-wrap { position: relative; flex: 1; max-width: 320px; min-width: 240px; }
                    .usr-search-input { width: 100%; height: 42px; padding: 0 1rem 0 2.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.875rem; color: var(--color-midnight-blue); background: var(--color-ivory, #fffef5); outline: none; transition: border-color 0.18s, box-shadow 0.18s; box-sizing: border-box; }
                    .usr-search-input:focus { border-color: var(--color-orange); box-shadow: 0 0 0 3px rgba(255,174,0,0.15); background: #ffffff; }
                    .usr-search-icon { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: var(--color-silver); pointer-events: none; }

                    .usr-card { background: var(--color-white, #fffefa); border-radius: 14px; border: 1px solid rgba(17,18,18,0.07); overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }

                    .usr-table-wrap { overflow-x: auto; }

                    .usr-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 4.5rem 1rem; color: var(--color-gray); font-size: 0.875rem; }
                    .usr-state--error { color: #dc2626; }
                    .usr-spinner { width: 28px; height: 28px; border: 3px solid rgba(255,174,0,0.2); border-top-color: var(--color-orange); border-radius: 50%; animation: usr-spin 0.7s linear infinite; }
                    @keyframes usr-spin { to { transform: rotate(360deg); } }

                    .usr-retry-btn { padding: 0.4rem 1rem; border: 1.5px solid #dc2626; border-radius: 8px; background: none; color: #dc2626; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
                    .usr-retry-btn:hover { background: #fef2f2; }

                    .usr-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb; }

                    .usr-table { width: 100%; border-collapse: collapse; }
                    .usr-th { padding: 0.85rem 1.1rem; text-align: left; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-gray); background: var(--color-linen, #f7f4e9); border-bottom: 1px solid rgba(17,18,18,0.07); white-space: nowrap; }

                    .usr-tr { border-bottom: 1px solid rgba(17,18,18,0.05); transition: background 0.12s; }
                    .usr-tr:last-child { border-bottom: none; }
                    .usr-tr:hover { background: rgba(255,174,0,0.04); }

                    .usr-td { padding: 0.85rem 1.1rem; font-size: 0.875rem; color: var(--color-dark-slate-gray); vertical-align: middle; white-space: nowrap; }
                    .usr-td--num { color: var(--color-silver); font-size: 0.8rem; font-weight: 600; }
                    .usr-td--phone { font-family: monospace; font-size: 0.8125rem; }

                    .usr-name { font-weight: 700; color: var(--color-midnight-blue); }

                    .usr-status { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
                    .usr-status--active { background: #dcfce7; color: #166534; }
                    .usr-status--approved { background: #dcfce7; color: #166534; }
                    .usr-status--pending { background: #fff7e6; color: #b45309; }
                    .usr-status--rejected { background: #fee2e2; color: #991b1b; }
                    .usr-status--none { background: rgba(17,18,18,0.05); color: var(--color-silver); }

                    .usr-view-btn { padding: 0.3rem 0.85rem; border: 1.5px solid rgba(17,18,18,0.1); border-radius: 8px; background: none; font-size: 0.8125rem; font-weight: 700; color: var(--color-dark-slate-gray); cursor: pointer; transition: background 0.15s, border-color 0.15s, color 0.15s; }
                    .usr-view-btn:hover { background: var(--color-linen); border-color: var(--color-orange); color: var(--color-midnight-blue); }

                    /* Pagination */
                    .usr-pagination { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-top: 1px solid rgba(17,18,18,0.06); flex-wrap: wrap; gap: 0.75rem; }
                    .usr-page-info { font-size: 0.8125rem; color: var(--color-gray); font-weight: 500; }
                    .usr-page-btns { display: flex; align-items: center; gap: 0.3rem; }
                    .usr-page-btn { min-width: 34px; height: 34px; padding: 0 0.5rem; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 0.8125rem; font-weight: 600; color: var(--color-dark-slate-gray); cursor: pointer; transition: background 0.15s, border-color 0.15s, color 0.15s; display: inline-flex; align-items: center; justify-content: center; }
                    .usr-page-btn:hover:not(:disabled) { background: var(--color-linen); border-color: var(--color-orange); color: var(--color-midnight-blue); }
                    .usr-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                    .usr-page-btn--active { background: var(--color-orange); border-color: var(--color-orange); color: var(--color-midnight-blue); }
                    .usr-page-btn--nav { font-size: 1.1rem; }
                    .usr-page-ellipsis { padding: 0 0.25rem; color: var(--color-silver); font-size: 0.875rem; }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default UsersList;