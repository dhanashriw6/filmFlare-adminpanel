"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { getUploadUrl } from "@/api/documents";
import { getPackages, updatePackage } from "@/api/package";
import { getCategory } from "@/api/category";

const SKILLS = ["photographer", "videographer", "cinematographer", "drone_operator"];
const TIME_UNITS = ["hours", "days", "half_day"];

const EditPackage = () => {
    const router = useRouter();
    const params = useParams();
    const packageId = params?.id;

    const fileInputRef = useRef(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        name: "",
        time_unit: "days",
        time_required: "",
        is_active: true,
        category_id: "",
        requirements: [{ skill: "photographer", count: 1 }],
        images: [], // New images mutations
    });

    const [categories, setCategories] = useState([]);
    const [imageSlots, setImageSlots] = useState([]);
    const [deletedImageIds, setDeletedImageIds] = useState([]);

    useEffect(() => {
        // Load categories
        getCategory({})
            .then((res) => setCategories(res.data?.data || res.data || []))
            .catch(() => {});

        // Fetch package data if we have an ID
        if (packageId) {
            fetchPackage();
        }
    }, [packageId]);

    const fetchPackage = async () => {
        try {
            setPageLoading(true);
            setError(null);
            const res = await getPackages();
            const list = res.data?.data || res.data || [];
            const pkg = list.find((item) => String(item.id) === String(packageId));
            if (!pkg) {
                setError("Package not found.");
                return;
            }

            setForm({
                name: pkg.name || "",
                time_unit: pkg.time_unit || "days",
                time_required: pkg.time_required || "",
                is_active: pkg.is_active !== undefined ? pkg.is_active : true,
                category_id: pkg.category_id || pkg.category?.id || "",
                requirements: pkg.requirements?.length
                    ? pkg.requirements.map((r) => ({ skill: r.skill, count: r.count }))
                    : [{ skill: "photographer", count: 1 }],
                images: [], // Start with empty mutations
            });

            if (pkg.images?.length) {
                const slots = pkg.images.map((img) => ({
                    id: img.id,
                    preview: img.url,
                    status: "done",
                    key: img.key || img.image || img.url,
                    isExisting: true,
                }));
                setImageSlots(slots);
            }
        } catch (err) {
            setError("Failed to load package details. Please try again.");
        } finally {
            setPageLoading(false);
        }
    };

    const setField = (key, value) => {
        setForm((f) => ({ ...f, [key]: value }));
        if (error) setError(null);
    };

    // ── Requirements ──────────────────────────────────────────────
    const addRequirement = () =>
        setForm((f) => ({ ...f, requirements: [...f.requirements, { skill: "photographer", count: 1 }] }));

    const removeRequirement = (i) =>
        setForm((f) => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }));

    const updateRequirement = (i, key, value) =>
        setForm((f) => ({
            ...f,
            requirements: f.requirements.map((r, idx) =>
                idx === i ? { ...r, [key]: key === "count" ? Math.max(1, Number(value)) : value } : r
            ),
        }));

    // ── Image upload ──────────────────────────────────────────────
    const handleFilePick = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const newSlots = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            status: "idle",
            key: null,
            isExisting: false,
        }));
        setImageSlots((prev) => [...prev, ...newSlots]);
        e.target.value = "";
        newSlots.forEach((slot) => uploadImage(slot));
    };

    const uploadImage = async (slot) => {
        setImageSlots((prev) =>
            prev.map((s) => (s.id === slot.id ? { ...s, status: "uploading" } : s))
        );
        try {
            const res = await getUploadUrl({
                document_for: "event_package",
                document_type: "image",
                mimetype: slot.file.type || "image/jpeg",
                side: "front",
            });
            const { presignedUrl, key } = res.data.data;

            await fetch(presignedUrl, {
                method: "PUT",
                headers: { "Content-Type": slot.file.type || "image/jpeg" },
                body: slot.file,
            });

            setImageSlots((prev) =>
                prev.map((s) => (s.id === slot.id ? { ...s, status: "done", key } : s))
            );
            setForm((f) => ({
                ...f,
                images: [...f.images, { type: "insert", key, document_type: "image" }],
            }));
        } catch {
            setImageSlots((prev) =>
                prev.map((s) => (s.id === slot.id ? { ...s, status: "error" } : s))
            );
        }
    };

    const retryUpload = (slot) => uploadImage(slot);

    const removeImage = (slot) => {
        if (slot.isExisting) {
            setDeletedImageIds((prev) => [...prev, slot.id]);
        } else {
            URL.revokeObjectURL(slot.preview);
            if (slot.key) {
                setForm((f) => ({ ...f, images: f.images.filter((img) => img.key !== slot.key) }));
            }
        }
        setImageSlots((prev) => prev.filter((s) => s.id !== slot.id));
    };

    // ── Validation ────────────────────────────────────────────────
    const validate = () => {
        if (!form.name.trim()) return "Package name is required.";
        if (!form.category_id) return "Category is required.";
        if (!form.time_required || Number(form.time_required) < 1) return "Time required must be at least 1.";
        if (form.requirements.length === 0) return "Add at least one skill requirement.";
        if (imageSlots.some((s) => s.status === "uploading")) return "Please wait for images to finish uploading.";
        if (imageSlots.some((s) => s.status === "error")) return "Some images failed to upload. Retry or remove them.";
        return null;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        try {
            setSaving(true);
            setError(null);

            // Construct image operations payload (deletes + inserts)
            const finalImages = [];
            deletedImageIds.forEach((id) => {
                finalImages.push({ type: "delete", id });
            });
            form.images.forEach((img) => {
                finalImages.push(img);
            });

            const payload = {
                name: form.name.trim(),
                time_unit: form.time_unit,
                time_required: Number(form.time_required),
                is_active: form.is_active,
                category_id: Number(form.category_id),
                requirements: form.requirements,
                images: finalImages,
            };

            await updatePackage(packageId, payload);
            setSuccess(true);
            setTimeout(() => router.push("/masters/event-package"), 1200);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to update package. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="ep-page">
                {/* Back */}
                <button className="ep-back" onClick={() => router.back()} id="ep-btn-back">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Packages
                </button>

                <div className="ep-card">
                    <div className="ep-card-accent" />
                    
                    {pageLoading ? (
                        <div className="ep-state">
                            <div className="ep-spinner ep-spinner--large" />
                            <span>Loading package details…</span>
                        </div>
                    ) : (
                        <div className="ep-card-body">
                            {/* Header */}
                            <div className="ep-card-header">
                                <div className="ep-icon-wrap">
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
                                    <h2 className="ep-title">Edit Event Package</h2>
                                    <p className="ep-subtitle">Update event package configuration</p>
                                </div>
                            </div>

                            {success && (
                                <div className="ep-alert ep-alert--success" id="ep-alert-success">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Package updated! Redirecting…
                                </div>
                            )}

                            {error && (
                                <div className="ep-alert ep-alert--error" id="ep-alert-error">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* ── Basic Info ── */}
                            <div className="ep-section-label">Basic info</div>

                            <div className="ep-field">
                                <label className="ep-label" htmlFor="ep-pkg-name">
                                    Package name <span className="ep-required">*</span>
                                </label>
                                <input
                                    id="ep-pkg-name"
                                    className="ep-input"
                                    type="text"
                                    placeholder="e.g. Full Wedding Package"
                                    value={form.name}
                                    onChange={(e) => setField("name", e.target.value)}
                                    disabled={saving || success}
                                />
                            </div>

                            <div className="ep-row">
                                <div className="ep-field">
                                    <label className="ep-label" htmlFor="ep-pkg-cat">
                                        Category <span className="ep-required">*</span>
                                    </label>
                                    <select
                                        id="ep-pkg-cat"
                                        className="ep-input ep-select"
                                        value={form.category_id}
                                        onChange={(e) => setField("category_id", e.target.value)}
                                        disabled={saving || success}
                                    >
                                        <option value="">Select category…</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="ep-field">
                                    <label className="ep-label">Status</label>
                                    <button
                                        type="button"
                                        className={`ep-toggle ${form.is_active ? "ep-toggle--on" : "ep-toggle--off"}`}
                                        onClick={() => setField("is_active", !form.is_active)}
                                        disabled={saving || success}
                                        id="ep-btn-toggle-status"
                                    >
                                        <span className="ep-toggle-thumb" />
                                        <span>{form.is_active ? "Active" : "Inactive"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* ── Duration ── */}
                            <div className="ep-section-label">Duration</div>

                            <div className="ep-row">
                                <div className="ep-field">
                                    <label className="ep-label" htmlFor="ep-pkg-time">
                                        Time required <span className="ep-required">*</span>
                                    </label>
                                    <input
                                        id="ep-pkg-time"
                                        className="ep-input"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 5"
                                        value={form.time_required}
                                        onChange={(e) => setField("time_required", e.target.value)}
                                        disabled={saving || success}
                                    />
                                </div>
                                <div className="ep-field">
                                    <label className="ep-label" htmlFor="ep-pkg-unit">Time unit</label>
                                    <select
                                        id="ep-pkg-unit"
                                        className="ep-input ep-select"
                                        value={form.time_unit}
                                        onChange={(e) => setField("time_unit", e.target.value)}
                                        disabled={saving || success}
                                    >
                                        {TIME_UNITS.map((u) => (
                                            <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* ── Skill Requirements ── */}
                            <div className="ep-section-row">
                                <div className="ep-section-label">Skill requirements</div>
                                <button type="button" className="ep-add-btn" onClick={addRequirement} disabled={saving || success} id="ep-btn-add-skill">
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Add skill
                                </button>
                            </div>

                            <div className="ep-requirements">
                                {form.requirements.map((req, i) => (
                                    <div key={i} className="ep-req-row">
                                        <select
                                            className="ep-input ep-select ep-req-skill"
                                            value={req.skill}
                                            onChange={(e) => updateRequirement(i, "skill", e.target.value)}
                                            disabled={saving || success}
                                        >
                                            {SKILLS.map((s) => (
                                                <option key={s} value={s}>
                                                    {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="ep-count-wrap">
                                            <button type="button" className="ep-count-btn" onClick={() => updateRequirement(i, "count", req.count - 1)} disabled={req.count <= 1 || saving || success}>−</button>
                                            <span className="ep-count-val">{req.count}</span>
                                            <button type="button" className="ep-count-btn" onClick={() => updateRequirement(i, "count", req.count + 1)} disabled={saving || success}>+</button>
                                        </div>
                                        {form.requirements.length > 1 && (
                                            <button type="button" className="ep-remove-btn" onClick={() => removeRequirement(i)} disabled={saving || success} aria-label="Remove">
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <path d="M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ── Images ── */}
                            <div className="ep-section-label">Package images</div>

                            {/* Drop zone */}
                            <div
                                className="ep-dropzone"
                                onClick={() => !saving && !success && fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const dt = e.dataTransfer;
                                    if (dt.files.length) handleFilePick({ target: { files: dt.files, value: "" } });
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={handleFilePick}
                                    disabled={saving || success}
                                />
                                <div className="ep-dropzone-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <p className="ep-dropzone-title">Click or drag images here</p>
                                <p className="ep-dropzone-hint">JPEG, PNG, WEBP — multiple allowed</p>
                            </div>

                            {/* Image grid */}
                            {imageSlots.length > 0 && (
                                <div className="ep-img-grid">
                                    {imageSlots.map((slot) => (
                                        <div key={slot.id} className={`ep-img-tile ep-img-tile--${slot.status}`}>
                                            <img src={slot.preview} alt="" className="ep-img-thumb" />

                                            {/* Overlay for uploading */}
                                            {slot.status === "uploading" && (
                                                <div className="ep-img-overlay">
                                                    <span className="ep-spinner ep-spinner--white" />
                                                </div>
                                            )}

                                            {/* Overlay for error */}
                                            {slot.status === "error" && (
                                                <div className="ep-img-overlay ep-img-overlay--error">
                                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                        <circle cx="9" cy="9" r="8" stroke="#fff" strokeWidth="1.5" />
                                                        <path d="M9 5v4M9 12h.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Done badge */}
                                            {slot.status === "done" && (
                                                <div className="ep-img-badge">
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                        <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="ep-img-actions">
                                                {slot.status === "error" && (
                                                    <button type="button" className="ep-img-btn ep-img-btn--retry" onClick={() => retryUpload(slot)} title="Retry">
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                            <path d="M10 6A4 4 0 112 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            <path d="M10 3v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button type="button" className="ep-img-btn ep-img-btn--remove" onClick={() => removeImage(slot)} title="Remove">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="ep-actions">
                                <button className="ep-btn ep-btn--ghost" onClick={() => router.back()} disabled={saving || success} id="ep-btn-cancel">
                                    Cancel
                                </button>
                                <button
                                    className="ep-btn ep-btn--primary"
                                    onClick={handleSubmit}
                                    disabled={saving || success || !form.name.trim()}
                                    id="ep-btn-submit"
                                >
                                    {saving ? (
                                        <><span className="ep-spinner" />Saving…</>
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
                    .ep-page { display: flex; flex-direction: column; gap: 1.25rem;}

                    .ep-back { display: inline-flex; align-items: center; gap: 0.4rem; background: none; border: none; cursor: pointer; font-size: 0.8125rem; font-weight: 600; color: var(--color-gray); padding: 0; transition: color 0.15s; }
                    .ep-back:hover { color: var(--color-midnight-blue); }

                    .ep-card { background: var(--color-white, #fffefa); border-radius: 16px; border: 1px solid rgba(17,18,18,0.07); box-shadow: 0 4px 20px rgba(0,0,0,0.06); position: relative; overflow: hidden; }
                    .ep-card-accent { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--color-orange), var(--color-khaki, #ffe24f)); border-radius: 16px 16px 0 0; }
                    .ep-card-body { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.1rem; }

                    .ep-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 4rem 1rem; color: var(--color-gray); font-size: 0.875rem; }

                    .ep-card-header { display: flex; align-items: center; gap: 0.9rem; }
                    .ep-icon-wrap { width: 46px; height: 46px; border-radius: 12px; background: var(--color-cornsilk, #fff8e0); border: 1.5px solid rgba(255,174,0,0.25); display: flex; align-items: center; justify-content: center; color: var(--color-orange); flex-shrink: 0; }
                    .ep-title { font-size: 1.15rem; font-weight: 800; color: var(--color-midnight-blue); margin: 0 0 2px; letter-spacing: -0.01em; }
                    .ep-subtitle { font-size: 0.8rem; color: var(--color-gray); margin: 0; }

                    .ep-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.9rem; border-radius: 10px; font-size: 0.8125rem; font-weight: 500; line-height: 1.4; }
                    .ep-alert--success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
                    .ep-alert--error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

                    .ep-section-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--color-gray); }
                    .ep-section-row { display: flex; align-items: center; justify-content: space-between; }
                    .ep-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
                    .ep-field { display: flex; flex-direction: column; gap: 0.35rem; }
                    .ep-label { font-size: 0.8125rem; font-weight: 600; color: var(--color-dark-slate-gray); }
                    .ep-required { color: #ef4444; }

                    .ep-input { width: 100%; height: 46px; padding: 0 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9375rem; color: var(--color-midnight-blue); background: var(--color-ivory, #fffef5); outline: none; transition: border-color 0.18s, box-shadow 0.18s; box-sizing: border-box; }
                    .ep-input::placeholder { color: var(--color-silver); }
                    .ep-input:hover { border-color: #d1d5db; }
                    .ep-input:focus { border-color: var(--color-orange); box-shadow: 0 0 0 3px rgba(255,174,0,0.15); background: #ffffff; }
                    .ep-input:disabled { opacity: 0.6; cursor: not-allowed; }
                    .ep-select { cursor: pointer; padding-right: 2rem; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; }

                    .ep-toggle { display: inline-flex; align-items: center; gap: 0.5rem; height: 46px; padding: 0 1rem; border-radius: 10px; border: 1.5px solid #e5e7eb; background: var(--color-ivory, #fffef5); cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: border-color 0.18s, background 0.18s; width: 100%; }
                    .ep-toggle:disabled { opacity: 0.6; cursor: not-allowed; }
                    .ep-toggle--on { border-color: rgba(255,174,0,0.5); background: var(--color-cornsilk, #fff8e0); color: var(--color-orange); }
                    .ep-toggle--off { color: var(--color-gray); }
                    .ep-toggle-thumb { width: 32px; height: 18px; border-radius: 9px; background: #e5e7eb; position: relative; transition: background 0.2s; flex-shrink: 0; }
                    .ep-toggle--on .ep-toggle-thumb { background: var(--color-orange); }
                    .ep-toggle-thumb::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
                    .ep-toggle--on .ep-toggle-thumb::after { transform: translateX(14px); }

                    .ep-requirements { display: flex; flex-direction: column; gap: 0.5rem; }
                    .ep-req-row { display: flex; align-items: center; gap: 0.6rem; }
                    .ep-req-skill { flex: 1; }
                    .ep-count-wrap { display: flex; align-items: center; border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden; background: var(--color-ivory, #fffef5); flex-shrink: 0; }
                    .ep-count-btn { width: 34px; height: 44px; border: none; background: none; font-size: 1.1rem; color: var(--color-gray); cursor: pointer; transition: background 0.15s; line-height: 1; }
                    .ep-count-btn:hover:not(:disabled) { background: var(--color-cornsilk, #fff8e0); color: var(--color-orange); }
                    .ep-count-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                    .ep-count-val { width: 30px; text-align: center; font-size: 0.9rem; font-weight: 700; color: var(--color-midnight-blue); border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; line-height: 44px; }
                    .ep-remove-btn { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
                    .ep-remove-btn:hover:not(:disabled) { background: #fee2e2; }
                    .ep-remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                    .ep-add-btn { display: inline-flex; align-items: center; gap: 0.35rem; background: none; border: none; cursor: pointer; font-size: 0.8rem; font-weight: 700; color: var(--color-orange); padding: 0; transition: opacity 0.15s; }
                    .ep-add-btn:hover:not(:disabled) { opacity: 0.75; }
                    .ep-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                    /* Drop zone */
                    .ep-dropzone { border: 1.5px dashed #d1d5db; border-radius: 12px; background: var(--color-ivory, #fffef5); padding: 1.5rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; cursor: pointer; transition: border-color 0.18s, background 0.18s; }
                    .ep-dropzone:hover { border-color: var(--color-orange); background: var(--color-cornsilk, #fff8e0); }
                    .ep-dropzone-icon { color: var(--color-gray); opacity: 0.7; }
                    .ep-dropzone-title { font-size: 0.875rem; font-weight: 600; color: var(--color-dark-slate-gray); margin: 0; }
                    .ep-dropzone-hint { font-size: 0.75rem; color: var(--color-silver); margin: 0; }

                    /* Image grid */
                    .ep-img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.6rem; }
                    .ep-img-tile { position: relative; border-radius: 10px; overflow: hidden; aspect-ratio: 1; border: 1.5px solid #e5e7eb; }
                    .ep-img-tile--uploading { opacity: 0.8; }
                    .ep-img-tile--error { border-color: #fecaca; }
                    .ep-img-tile--done { border-color: rgba(255,174,0,0.4); }
                    .ep-img-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
                    .ep-img-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; }
                    .ep-img-overlay--error { background: rgba(220,38,38,0.6); }
                    .ep-img-badge { position: absolute; top: 5px; left: 5px; width: 18px; height: 18px; border-radius: 50%; background: var(--color-orange); display: flex; align-items: center; justify-content: center; }
                    .ep-img-actions { position: absolute; top: 4px; right: 4px; display: flex; gap: 3px; opacity: 0; transition: opacity 0.15s; }
                    .ep-img-tile:hover .ep-img-actions { opacity: 1; }
                    .ep-img-btn { width: 22px; height: 22px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                    .ep-img-btn--remove { background: rgba(220,38,38,0.85); color: #fff; }
                    .ep-img-btn--retry { background: rgba(255,174,0,0.9); color: #111; }

                    .ep-actions { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.4rem; }
                    .ep-btn { display: inline-flex; align-items: center; gap: 0.45rem; height: 44px; padding: 0 1.25rem; border-radius: 10px; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: background 0.18s, transform 0.12s, opacity 0.15s; border: none; }
                    .ep-btn:disabled { opacity: 0.55; cursor: not-allowed; }
                    .ep-btn:active:not(:disabled) { transform: scale(0.97); }
                    .ep-btn--primary { background: var(--color-orange); color: var(--color-midnight-blue); }
                    .ep-btn--primary:hover:not(:disabled) { background: #e09a00; }
                    .ep-btn--ghost { background: transparent; color: var(--color-dark-slate-gray); border: 1.5px solid #e5e7eb; }
                    .ep-btn--ghost:hover:not(:disabled) { background: var(--color-linen); border-color: #d1d5db; }

                    .ep-spinner { width: 16px; height: 16px; border: 2.5px solid rgba(17,18,18,0.2); border-top-color: var(--color-midnight-blue); border-radius: 50%; animation: ep-spin 0.7s linear infinite; flex-shrink: 0; }
                    .ep-spinner--white { border-color: rgba(255,255,255,0.3); border-top-color: #fff; }
                    .ep-spinner--large { width: 32px; height: 32px; border-width: 3px; border-top-color: var(--color-orange); }
                    @keyframes ep-spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

const PageWrapper = () => {
    return <EditPackage />;
};

export default PageWrapper;