"use client";

import React, { useState, useEffect } from "react";
import { getUserDetails } from "@/api/users";
import DashboardLayout from "@/app/components/DashboardLayout";

const UserDetails = ({ userId, onBack }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDetails();
    }, [userId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getUserDetails({ id: userId });
            // API returns { data: { user: {...} } }
            const data = res.data?.data?.user || res.data?.data || res.data || null;
            setUser(data);
        } catch (err) {
            setError("Failed to load user details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const formatAddress = (addr) => {
        if (!addr) return "—";
        const parts = [
            addr.address_line1,
            addr.address_line2,
            addr.address_line3,
            addr.city,
            addr.state,
            addr.postal_code,
            addr.country,
        ].filter(Boolean);
        return parts.join(", ");
    };

    const kycStatus = (user?.kyc && user.kyc.length > 0) ? user.kyc[0].status : null;

    return (
        <DashboardLayout>
            <div className="ud-page">
                {/* Header */}
                <div className="ud-header">
                    <button className="ud-back-btn" onClick={onBack}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        Back to Users
                    </button>
                    <div className="ud-header-title">
                        <h1 className="ud-title">User Details</h1>
                        <p className="ud-subtitle">Full profile and KYC information</p>
                    </div>
                </div>

                {loading ? (
                    <div className="ud-state">
                        <div className="ud-spinner" />
                        <span>Loading user details…</span>
                    </div>
                ) : error ? (
                    <div className="ud-state ud-state--error">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                        </svg>
                        <span>{error}</span>
                        <button className="ud-retry-btn" onClick={fetchDetails}>Retry</button>
                    </div>
                ) : !user ? (
                    <div className="ud-state"><span>User not found.</span></div>
                ) : (
                    <div className="ud-content">

                        {/* ── Profile Hero Card ── */}
                        <div className="ud-card ud-profile-card">
                            <div className="ud-avatar-wrap">
                                <img
                                    src={user.profile_image?.url || "/default-avatar.png"}
                                    alt={`${user.first_name} ${user.last_name}`}
                                    className="ud-avatar"
                                />
                                <span className={`ud-verified-badge ${user.is_verified_user ? "ud-verified-badge--yes" : "ud-verified-badge--no"}`}>
                                    {user.is_verified_user ? "✅ Verified" : "❌ Unverified"}
                                </span>
                            </div>
                            <div className="ud-profile-info">
                                <h2 className="ud-full-name">
                                    {user.first_name} {user.middle_name ? user.middle_name + " " : ""}{user.last_name}
                                </h2>
                                <p className="ud-user-type">{user.user_type?.replace("_", " ")}</p>
                                {user.bio && <p className="ud-bio">"{user.bio}"</p>}
                                <div className="ud-badges">
                                    <span className={`ud-status ud-status--${user.account_status}`}>
                                        Account: {user.account_status}
                                    </span>
                                    <span className={`ud-status ud-status--${kycStatus ?? "none"}`}>
                                        KYC: {kycStatus ?? "Not submitted"}
                                    </span>
                                </div>
                            </div>
                            {/* Social Links */}
                            {user.social_links?.length > 0 && (
                                <div className="ud-social-links">
                                    {user.social_links.filter((s) => s.is_active).map((s, i) => (
                                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="ud-social-chip">
                                            {s.link_type}
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                <polyline points="15 3 21 3 21 9" />
                                                <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Main Grid ── */}
                        <div className="ud-grid">

                            {/* Contact */}
                            <div className="ud-card">
                                <h3 className="ud-section-title">Contact Information</h3>
                                <div className="ud-fields">
                                    <div className="ud-field">
                                        <span className="ud-field-label">Email</span>
                                        <span className="ud-field-value">{user.email || "—"}</span>
                                    </div>
                                    <div className="ud-field">
                                        <span className="ud-field-label">Phone</span>
                                        <span className="ud-field-value ud-mono">{user.phone_code} {user.phone_no}</span>
                                    </div>
                                    {user.alt_phone_no && (
                                        <div className="ud-field">
                                            <span className="ud-field-label">Alt Phone</span>
                                            <span className="ud-field-value ud-mono">{user.alt_phone_code} {user.alt_phone_no}</span>
                                        </div>
                                    )}
                                    <div className="ud-field">
                                        <span className="ud-field-label">Joined</span>
                                        <span className="ud-field-value">{formatDate(user.created_at)}</span>
                                    </div>
                                    {user.years_of_exp && (
                                        <div className="ud-field">
                                            <span className="ud-field-label">Experience</span>
                                            <span className="ud-field-value">{user.years_of_exp} years</span>
                                        </div>
                                    )}
                                    {user.portfolio_link && (
                                        <div className="ud-field">
                                            <span className="ud-field-label">Portfolio</span>
                                            <a href={user.portfolio_link} target="_blank" rel="noopener noreferrer" className="ud-link">{user.portfolio_link}</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="ud-card">
                                <h3 className="ud-section-title">Skills</h3>
                                {user.skills?.length > 0 ? (
                                    <div className="ud-skills-list">
                                        {user.skills.map((s, i) => (
                                            <div key={i} className="ud-skill-item">
                                                <span className="ud-skill-name">{s.skill?.replace(/_/g, " ")}</span>
                                                {s.is_primary && <span className="ud-skill-primary">Primary</span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="ud-empty-text">No skills listed.</p>
                                )}
                            </div>

                            {/* Languages */}
                            {user.user_languages?.length > 0 && (
                                <div className="ud-card">
                                    <h3 className="ud-section-title">Languages</h3>
                                    <div className="ud-skills-list">
                                        {user.user_languages.map((l, i) => (
                                            <div key={i} className="ud-skill-item">
                                                <span className="ud-skill-name">{l.language?.name}</span>
                                                <span className="ud-tag">{l.proficiency}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Casts */}
                            {user.casts?.length > 0 && (
                                <div className="ud-card">
                                    <h3 className="ud-section-title">Caste / Community</h3>
                                    <div className="ud-tag-group">
                                        {user.casts.map((c, i) => (
                                            <span key={i} className="ud-tag">{c.cast?.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Packages */}
                            {user.packages?.length > 0 && (
                                <div className="ud-card ud-card--full">
                                    <h3 className="ud-section-title">Service Packages</h3>
                                    <div className="ud-packages-grid">
                                        {user.packages.map((pkg) => (
                                            <div key={pkg.id} className="ud-package-item">
                                                <p className="ud-package-category">{pkg.category?.name}</p>
                                                <div className="ud-package-prices">
                                                    <div className="ud-price-cell">
                                                        <span className="ud-price-label">Per Hour</span>
                                                        <span className="ud-price-value">₹{pkg.price_per_hour}</span>
                                                    </div>
                                                    <div className="ud-price-cell">
                                                        <span className="ud-price-label">Half Day</span>
                                                        <span className="ud-price-value">₹{pkg.price_per_half_day}</span>
                                                    </div>
                                                    <div className="ud-price-cell">
                                                        <span className="ud-price-label">Full Day</span>
                                                        <span className="ud-price-value">₹{pkg.price_per_day}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* KYC */}
                            {user.kyc?.length > 0 && user.kyc.map((kyc) => (
                                <div key={kyc.id} className="ud-card ud-card--full">
                                    <h3 className="ud-section-title">KYC Documents</h3>
                                    <div className="ud-kyc-layout">
                                        <div className="ud-fields">
                                            <div className="ud-field">
                                                <span className="ud-field-label">Document Type</span>
                                                <span className="ud-field-value" style={{ textTransform: "capitalize" }}>{kyc.kyc_doc_type}</span>
                                            </div>
                                            <div className="ud-field">
                                                <span className="ud-field-label">Document Number</span>
                                                <span className="ud-field-value ud-mono">{kyc.document_no}</span>
                                            </div>
                                            <div className="ud-field">
                                                <span className="ud-field-label">Status</span>
                                                <span className={`ud-status ud-status--${kyc.status}`}>{kyc.status}</span>
                                            </div>
                                            <div className="ud-field">
                                                <span className="ud-field-label">Submitted</span>
                                                <span className="ud-field-value">{formatDate(kyc.created_at)}</span>
                                            </div>
                                            {kyc.updated_at !== kyc.created_at && (
                                                <div className="ud-field">
                                                    <span className="ud-field-label">Last Updated</span>
                                                    <span className="ud-field-value">{formatDate(kyc.updated_at)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ud-doc-images">
                                            {kyc.documents?.length > 0 ? kyc.documents.map((doc) => (
                                                <div key={doc.id} className="ud-doc-img-wrap">
                                                    <span className="ud-doc-label">{doc.side || "Document"}</span>
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                        <img src={doc.url} alt={`KYC ${doc.side}`} className="ud-doc-img" />
                                                    </a>
                                                </div>
                                            )) : (
                                                <div className="ud-doc-placeholder">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                    <span>No document images uploaded</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Portfolio */}
                            {user.portfolio_documents?.length > 0 && (
                                <div className="ud-card ud-card--full">
                                    <h3 className="ud-section-title">Portfolio</h3>
                                    <div className="ud-portfolio-grid">
                                        {user.portfolio_documents.map((doc) => (
                                            <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="ud-portfolio-item">
                                                <img src={doc.url} alt="Portfolio" className="ud-portfolio-img" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video Links */}
                            {user.video_links?.filter((v) => v.is_active).length > 0 && (
                                <div className="ud-card ud-card--full">
                                    <h3 className="ud-section-title">Video Links</h3>
                                    <div className="ud-video-list">
                                        {user.video_links.filter((v) => v.is_active).map((v) => (
                                            <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="ud-video-item">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="5 3 19 12 5 21 5 3" />
                                                </svg>
                                                {v.title || v.url}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Address */}
                            {(user.current_address || user.permanent_address) && (
                                <div className="ud-card ud-card--full">
                                    <h3 className="ud-section-title">Address</h3>
                                    <div className="ud-address-grid">
                                        {user.current_address && (
                                            <div className="ud-address-block">
                                                <p className="ud-address-type">Current Address</p>
                                                <p className="ud-address-text">{formatAddress(user.current_address)}</p>
                                                {user.current_address.service_area_radius_meters && (
                                                    <p className="ud-address-meta">
                                                        Service radius: {(user.current_address.service_area_radius_meters / 1000).toFixed(0)} km
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {user.permanent_address && (
                                            <div className="ud-address-block">
                                                <p className="ud-address-type">Permanent Address</p>
                                                <p className="ud-address-text">{formatAddress(user.permanent_address)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                <style>{`
                    .ud-page { display: flex; flex-direction: column; gap: 1.5rem; }

                    .ud-header { display: flex; flex-direction: column; gap: 0.5rem; }
                    .ud-back-btn { display: inline-flex; align-items: center; gap: 0.4rem; background: none; border: none; font-size: 0.8125rem; font-weight: 700; color: var(--color-gray); cursor: pointer; padding: 0; width: fit-content; transition: color 0.15s; }
                    .ud-back-btn:hover { color: var(--color-midnight-blue); }
                    .ud-header-title { display: flex; flex-direction: column; gap: 2px; }
                    .ud-title { font-size: 1.4rem; font-weight: 800; color: var(--color-midnight-blue); margin: 0; letter-spacing: -0.01em; }
                    .ud-subtitle { font-size: 0.8125rem; color: var(--color-gray); margin: 0; }

                    /* States */
                    .ud-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 4.5rem 1rem; color: var(--color-gray); font-size: 0.875rem; background: #fff; border-radius: 14px; border: 1px solid rgba(17,18,18,0.07); }
                    .ud-state--error { color: #dc2626; }
                    .ud-spinner { width: 28px; height: 28px; border: 3px solid rgba(255,174,0,0.2); border-top-color: var(--color-orange); border-radius: 50%; animation: ud-spin 0.7s linear infinite; }
                    @keyframes ud-spin { to { transform: rotate(360deg); } }
                    .ud-retry-btn { padding: 0.4rem 1rem; border: 1.5px solid #dc2626; border-radius: 8px; background: none; color: #dc2626; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }

                    /* Cards */
                    .ud-card { background: #fff; border-radius: 14px; border: 1px solid rgba(17,18,18,0.07); padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                    .ud-card--full { grid-column: 1 / -1; }

                    /* Profile Card */
                    .ud-profile-card { display: flex; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
                    .ud-avatar-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex-shrink: 0; }
                    .ud-avatar { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; }
                    .ud-verified-badge { font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
                    .ud-verified-badge--yes { background: #dcfce7; color: #166534; }
                    .ud-verified-badge--no { background: #fee2e2; color: #991b1b; }
                    .ud-profile-info { display: flex; flex-direction: column; gap: 0.45rem; flex: 1; min-width: 220px; }
                    .ud-full-name { font-size: 1.3rem; font-weight: 800; color: var(--color-midnight-blue); margin: 0; }
                    .ud-user-type { font-size: 0.875rem; color: var(--color-gray); margin: 0; text-transform: capitalize; }
                    .ud-bio { font-size: 0.875rem; color: var(--color-dark-slate-gray); margin: 0; font-style: italic; }
                    .ud-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
                    .ud-social-links { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-left: auto; align-self: flex-start; }
                    .ud-social-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 5px 12px; background: var(--color-linen, #f7f4e9); border: 1px solid rgba(17,18,18,0.08); border-radius: 999px; font-size: 0.75rem; font-weight: 700; color: var(--color-midnight-blue); text-decoration: none; text-transform: capitalize; transition: background 0.15s; }
                    .ud-social-chip:hover { background: var(--color-cornsilk, #fff8dc); }

                    /* Status badges */
                    .ud-status { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
                    .ud-status--active { background: #dcfce7; color: #166534; }
                    .ud-status--approved { background: #dcfce7; color: #166534; }
                    .ud-status--pending { background: #fff7e6; color: #b45309; }
                    .ud-status--rejected { background: #fee2e2; color: #991b1b; }
                    .ud-status--none { background: rgba(17,18,18,0.05); color: var(--color-silver); }

                    /* Grid */
                    .ud-content { display: flex; flex-direction: column; gap: 1.25rem; }
                    .ud-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }

                    /* Section title */
                    .ud-section-title { margin: 0 0 1rem; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-gray); border-bottom: 1.5px solid rgba(17,18,18,0.06); padding-bottom: 0.5rem; }

                    /* Fields */
                    .ud-fields { display: flex; flex-direction: column; gap: 0.85rem; }
                    .ud-field { display: flex; flex-direction: column; gap: 2px; }
                    .ud-field-label { font-size: 0.72rem; color: var(--color-silver); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
                    .ud-field-value { font-size: 0.875rem; color: var(--color-midnight-blue); font-weight: 600; }
                    .ud-mono { font-family: monospace; }
                    .ud-link { font-size: 0.8125rem; color: var(--color-orange); font-weight: 600; text-decoration: none; word-break: break-all; }
                    .ud-link:hover { text-decoration: underline; }

                    /* Tags */
                    .ud-tag-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                    .ud-tag { display: inline-flex; align-items: center; padding: 3px 10px; background: rgba(17,18,18,0.05); border-radius: 999px; font-size: 0.75rem; font-weight: 600; color: var(--color-dark-slate-gray); text-transform: capitalize; }

                    /* Skills */
                    .ud-skills-list { display: flex; flex-direction: column; gap: 0.5rem; }
                    .ud-skill-item { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: var(--color-linen, #f7f4e9); border-radius: 8px; }
                    .ud-skill-name { font-size: 0.875rem; font-weight: 600; color: var(--color-midnight-blue); text-transform: capitalize; }
                    .ud-skill-primary { font-size: 0.7rem; font-weight: 700; background: var(--color-orange); color: var(--color-midnight-blue); padding: 2px 8px; border-radius: 999px; }
                    .ud-empty-text { font-size: 0.875rem; color: var(--color-silver); margin: 0; }

                    /* Packages */
                    .ud-packages-grid { display: flex; flex-direction: column; gap: 0.75rem; }
                    .ud-package-item { border: 1px solid rgba(17,18,18,0.07); border-radius: 10px; padding: 1rem; }
                    .ud-package-category { margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 700; color: var(--color-midnight-blue); }
                    .ud-package-prices { display: flex; gap: 1rem; flex-wrap: wrap; }
                    .ud-price-cell { display: flex; flex-direction: column; gap: 2px; min-width: 90px; }
                    .ud-price-label { font-size: 0.7rem; color: var(--color-silver); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }
                    .ud-price-value { font-size: 1rem; font-weight: 800; color: var(--color-midnight-blue); }

                    /* KYC */
                    .ud-kyc-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                    @media (max-width: 600px) { .ud-kyc-layout { grid-template-columns: 1fr; } }
                    .ud-doc-images { display: flex; gap: 1rem; flex-wrap: wrap; }
                    .ud-doc-img-wrap { display: flex; flex-direction: column; gap: 0.35rem; flex: 1; min-width: 140px; }
                    .ud-doc-label { font-size: 0.72rem; font-weight: 700; color: var(--color-gray); text-transform: uppercase; letter-spacing: 0.06em; }
                    .ud-doc-img { width: 100%; max-height: 200px; object-fit: contain; border-radius: 10px; border: 1px solid #e5e7eb; background: #f9f9f9; display: block; cursor: pointer; transition: opacity 0.15s; }
                    .ud-doc-img:hover { opacity: 0.85; }
                    .ud-doc-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; min-height: 140px; border: 1.5px dashed #d1d5db; border-radius: 10px; color: var(--color-silver); font-size: 0.8125rem; text-align: center; padding: 1rem; }

                    /* Portfolio */
                    .ud-portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
                    .ud-portfolio-item { border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; display: block; }
                    .ud-portfolio-img { width: 100%; height: 140px; object-fit: cover; display: block; transition: transform 0.2s; }
                    .ud-portfolio-item:hover .ud-portfolio-img { transform: scale(1.03); }

                    /* Video Links */
                    .ud-video-list { display: flex; flex-direction: column; gap: 0.5rem; }
                    .ud-video-item { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; background: var(--color-linen, #f7f4e9); border-radius: 8px; font-size: 0.875rem; font-weight: 600; color: var(--color-midnight-blue); text-decoration: none; transition: background 0.15s; word-break: break-all; }
                    .ud-video-item:hover { background: var(--color-cornsilk, #fff8dc); }

                    /* Address */
                    .ud-address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                    @media (max-width: 600px) { .ud-address-grid { grid-template-columns: 1fr; } }
                    .ud-address-block { display: flex; flex-direction: column; gap: 0.35rem; }
                    .ud-address-type { margin: 0; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-silver); }
                    .ud-address-text { margin: 0; font-size: 0.875rem; font-weight: 600; color: var(--color-midnight-blue); line-height: 1.5; }
                    .ud-address-meta { margin: 0; font-size: 0.75rem; color: var(--color-gray); }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default UserDetails;