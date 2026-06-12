"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { getUploadUrl } from "@/api/documents";
import { createEditingPackage, EditingPackageFeature } from "@/api/editingPackage";

const FEATURE_KEY_OPTIONS = [
  { key: "edited_photos", label: "Edited Photos" },
  { key: "reels", label: "Reels" },
  { key: "albums", label: "Albums" },
  { key: "highlight_video", label: "Highlight Video" },
  { key: "raw_photos", label: "Raw Photos" },
  { key: "cinematic_film", label: "Cinematic Film" },
];

const defaultFeature = () => ({
  feature_key: "edited_photos",
  quantity: 1,
  label: "",
  sort_order: 0,
});

const CreateEditingPackage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    is_active: true,
    features: [{ ...defaultFeature() }],
    images: [],
  });

  // image slots: { id, file, preview, status, key }
  const [imageSlots, setImageSlots] = useState(
    []
  );

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (error) setError(null);
  };

  // ── Features ──────────────────────────────────────────────────
  const addFeature = () =>
    setForm((f) => ({
      ...f,
      features: [...f.features, { ...defaultFeature(), sort_order: f.features.length }],
    }));

  const removeFeature = (i) =>
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, idx) => idx !== i).map((feat, idx) => ({ ...feat, sort_order: idx })),
    }));

  const updateFeature = (i, key, value) => {
    setForm((f) => ({
      ...f,
      features: f.features.map((feat, idx) =>
        idx === i
          ? {
              ...feat,
              [key]: key === "quantity" ? Math.max(1, Number(value)) : value,
              // Auto-populate label when feature_key changes
              ...(key === "feature_key" && !feat.label
                ? { label: FEATURE_KEY_OPTIONS.find((o) => o.key === value)?.label || "" }
                : {}),
            }
          : feat
      ),
    }));
  };

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
    }));
    setImageSlots((prev) => [...prev, ...newSlots]);
    (e.target).value = "";
    newSlots.forEach((slot) => uploadImage(slot));
  };

  const uploadImage = async (slot) => {
    setImageSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: "uploading" } : s)));
    try {
      const res = await getUploadUrl({
        document_for: "editing_package",
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
      setImageSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: "done", key } : s)));
      setForm((f) => ({
        ...f,
        images: [...f.images, { type: "insert", key, document_type: "image" }],
      }));
    } catch {
      setImageSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: "error" } : s)));
    }
  };

  const retryUpload = (slot) => uploadImage(slot);

  const removeImage = (slot) => {
    URL.revokeObjectURL(slot.preview);
    setImageSlots((prev) => prev.filter((s) => s.id !== slot.id));
    if (slot.key) setForm((f) => ({ ...f, images: f.images.filter((img) => img.key !== slot.key) }));
  };

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim()) return "Package name is required.";
    if (!form.price || Number(form.price) <= 0) return "A valid price is required.";
    if (form.features.length === 0) return "Add at least one feature.";
    if (form.features.some((f) => !f.label.trim())) return "All features need a label.";
    if (imageSlots.some((s) => s.status === "uploading")) return "Please wait for images to finish uploading.";
    if (imageSlots.some((s) => s.status === "error")) return "Some images failed to upload. Retry or remove them.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    try {
      setLoading(true);
      setError(null);
      await createEditingPackage({
        ...form,
        price: Number(form.price),
      });
      setSuccess(true);
      setTimeout(() => router.push("/masters/editing-package"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || success;

  return (
    <DashboardLayout>
      <div className="cp-page">
        <button className="cp-back" onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Editing Packages
        </button>

        <div className="cp-card">
          <div className="cp-card-accent" />
          <div className="cp-card-body">

            {/* Header */}
            <div className="cp-card-header">
              <div className="cp-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="3" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 8h8M7 12h5M14 15l2-2-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2 className="cp-title">New Editing Package</h2>
                <p className="cp-subtitle">Configure a reusable editing package with features and pricing</p>
              </div>
            </div>

            {success && (
              <div className="cp-alert cp-alert--success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Package created! Redirecting…
              </div>
            )}

            {error && (
              <div className="cp-alert cp-alert--error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* ── Basic Info ── */}
            <div className="cp-section-label">Basic info</div>

            <div className="cp-field">
              <label className="cp-label" htmlFor="pkg-name">
                Package name <span className="cp-required">*</span>
              </label>
              <input
                id="pkg-name"
                className="cp-input"
                type="text"
                placeholder="e.g. Basic Editing Package"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                disabled={disabled}
                autoFocus
              />
            </div>

            <div className="cp-row">
              <div className="cp-field">
                <label className="cp-label" htmlFor="pkg-price">
                  Price (₹) <span className="cp-required">*</span>
                </label>
                <input
                  id="pkg-price"
                  className="cp-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1999"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="cp-field">
                <label className="cp-label">Status</label>
                <button
                  type="button"
                  className={`cp-toggle ${form.is_active ? "cp-toggle--on" : "cp-toggle--off"}`}
                  onClick={() => setField("is_active", !form.is_active)}
                  disabled={disabled}
                >
                  <span className="cp-toggle-thumb" />
                  <span>{form.is_active ? "Active" : "Inactive"}</span>
                </button>
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label" htmlFor="pkg-desc">Description</label>
              <textarea
                id="pkg-desc"
                className="cp-input cp-textarea"
                placeholder="e.g. Standard photo editing package with colour grading and retouching"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                disabled={disabled}
                rows={3}
              />
            </div>

            {/* ── Features ── */}
            <div className="cp-section-row">
              <div className="cp-section-label">Features</div>
              <button type="button" className="cp-add-btn" onClick={addFeature} disabled={disabled}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add feature
              </button>
            </div>

            <div className="cp-features">
              {form.features.map((feat, i) => (
                <div key={i} className="cp-feat-row">
                  <div className="cp-feat-row-inner">
                    <div className="cp-feat-fields">
                      <select
                        className="cp-input cp-select cp-feat-key"
                        value={feat.feature_key}
                        onChange={(e) => updateFeature(i, "feature_key", e.target.value)}
                        disabled={disabled}
                      >
                        {FEATURE_KEY_OPTIONS.map((o) => (
                          <option key={o.key} value={o.key}>{o.label}</option>
                        ))}
                      </select>

                      <input
                        className="cp-input cp-feat-label"
                        type="text"
                        placeholder="Display label, e.g. 50 Edited Photos"
                        value={feat.label}
                        onChange={(e) => updateFeature(i, "label", e.target.value)}
                        disabled={disabled}
                      />
                    </div>

                    <div className="cp-feat-right">
                      <div className="cp-count-wrap">
                        <button
                          type="button"
                          className="cp-count-btn"
                          onClick={() => updateFeature(i, "quantity", feat.quantity - 1)}
                          disabled={feat.quantity <= 1 || disabled}
                        >−</button>
                        <span className="cp-count-val">{feat.quantity}</span>
                        <button
                          type="button"
                          className="cp-count-btn"
                          onClick={() => updateFeature(i, "quantity", feat.quantity + 1)}
                          disabled={disabled}
                        >+</button>
                      </div>

                      {form.features.length > 1 && (
                        <button
                          type="button"
                          className="cp-remove-btn"
                          onClick={() => removeFeature(i)}
                          disabled={disabled}
                          aria-label="Remove feature"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Images ── */}
            <div className="cp-section-label">Package images</div>

            <div
              className="cp-dropzone"
              onClick={() => !disabled && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length)
                  handleFilePick({ target: { files: e.dataTransfer.files, value: "" } });
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={handleFilePick}
                disabled={disabled}
              />
              <div className="cp-dropzone-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="cp-dropzone-title">Click or drag images here</p>
              <p className="cp-dropzone-hint">JPEG, PNG, WEBP — multiple allowed</p>
            </div>

            {imageSlots.length > 0 && (
              <div className="cp-img-grid">
                {imageSlots.map((slot) => (
                  <div key={slot.id} className={`cp-img-tile cp-img-tile--${slot.status}`}>
                    <img src={slot.preview} alt="" className="cp-img-thumb" />
                    {slot.status === "uploading" && (
                      <div className="cp-img-overlay"><span className="cp-spinner cp-spinner--white" /></div>
                    )}
                    {slot.status === "error" && (
                      <div className="cp-img-overlay cp-img-overlay--error">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <circle cx="9" cy="9" r="8" stroke="#fff" strokeWidth="1.5" />
                          <path d="M9 5v4M9 12h.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                    {slot.status === "done" && (
                      <div className="cp-img-badge">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <div className="cp-img-actions">
                      {slot.status === "error" && (
                        <button type="button" className="cp-img-btn cp-img-btn--retry" onClick={() => retryUpload(slot)} title="Retry">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M10 6A4 4 0 112 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M10 3v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                      <button type="button" className="cp-img-btn cp-img-btn--remove" onClick={() => removeImage(slot)} title="Remove">
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
            <div className="cp-actions">
              <button className="cp-btn cp-btn--ghost" onClick={() => router.back()} disabled={disabled}>Cancel</button>
              <button
                className="cp-btn cp-btn--primary"
                onClick={handleSubmit}
                disabled={disabled || !form.name.trim()}
              >
                {loading ? (
                  <><span className="cp-spinner" />Creating…</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Create Package
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        <style>{`
          .cp-page { display: flex; flex-direction: column; gap: 1.25rem; }

          .cp-back { display: inline-flex; align-items: center; gap: 0.4rem; background: none; border: none; cursor: pointer; font-size: 0.8125rem; font-weight: 600; color: var(--color-gray); padding: 0; transition: color 0.15s; }
          .cp-back:hover { color: var(--color-midnight-blue); }

          .cp-card { background: var(--color-white, #fffefa); border-radius: 16px; border: 1px solid rgba(17,18,18,0.07); box-shadow: 0 4px 20px rgba(0,0,0,0.06); position: relative; overflow: hidden; }
          .cp-card-accent { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--color-orange), var(--color-khaki, #ffe24f)); border-radius: 16px 16px 0 0; }
          .cp-card-body { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.1rem; }

          .cp-card-header { display: flex; align-items: center; gap: 0.9rem; }
          .cp-icon-wrap { width: 46px; height: 46px; border-radius: 12px; background: var(--color-cornsilk, #fff8e0); border: 1.5px solid rgba(255,174,0,0.25); display: flex; align-items: center; justify-content: center; color: var(--color-orange); flex-shrink: 0; }
          .cp-title { font-size: 1.15rem; font-weight: 800; color: var(--color-midnight-blue); margin: 0 0 2px; letter-spacing: -0.01em; }
          .cp-subtitle { font-size: 0.8rem; color: var(--color-gray); margin: 0; }

          .cp-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.9rem; border-radius: 10px; font-size: 0.8125rem; font-weight: 500; line-height: 1.4; }
          .cp-alert--success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
          .cp-alert--error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

          .cp-section-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--color-gray); }
          .cp-section-row { display: flex; align-items: center; justify-content: space-between; }
          .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
          .cp-field { display: flex; flex-direction: column; gap: 0.35rem; }
          .cp-label { font-size: 0.8125rem; font-weight: 600; color: var(--color-dark-slate-gray); }
          .cp-required { color: #ef4444; }

          .cp-input { width: 100%; height: 46px; padding: 0 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9375rem; color: var(--color-midnight-blue); background: var(--color-ivory, #fffef5); outline: none; transition: border-color 0.18s, box-shadow 0.18s; box-sizing: border-box; font-family: inherit; }
          .cp-input::placeholder { color: var(--color-silver); }
          .cp-input:hover { border-color: #d1d5db; }
          .cp-input:focus { border-color: var(--color-orange); box-shadow: 0 0 0 3px rgba(255,174,0,0.15); background: #ffffff; }
          .cp-input:disabled { opacity: 0.6; cursor: not-allowed; }
          .cp-textarea { height: auto; padding: 0.75rem 0.9rem; resize: vertical; line-height: 1.5; }
          .cp-select { cursor: pointer; padding-right: 2rem; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; }

          .cp-toggle { display: inline-flex; align-items: center; gap: 0.5rem; height: 46px; padding: 0 1rem; border-radius: 10px; border: 1.5px solid #e5e7eb; background: var(--color-ivory, #fffef5); cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: border-color 0.18s, background 0.18s; width: 100%; }
          .cp-toggle:disabled { opacity: 0.6; cursor: not-allowed; }
          .cp-toggle--on { border-color: rgba(255,174,0,0.5); background: var(--color-cornsilk, #fff8e0); color: var(--color-orange); }
          .cp-toggle--off { color: var(--color-gray); }
          .cp-toggle-thumb { width: 32px; height: 18px; border-radius: 9px; background: #e5e7eb; position: relative; transition: background 0.2s; flex-shrink: 0; }
          .cp-toggle--on .cp-toggle-thumb { background: var(--color-orange); }
          .cp-toggle-thumb::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
          .cp-toggle--on .cp-toggle-thumb::after { transform: translateX(14px); }

          /* Features */
          .cp-features { display: flex; flex-direction: column; gap: 0.6rem; }
          .cp-feat-row { background: var(--color-linen, #f7f4e9); border-radius: 10px; padding: 0.65rem 0.75rem; border: 1px solid rgba(17,18,18,0.06); }
          .cp-feat-row-inner { display: flex; align-items: center; gap: 0.6rem; }
          .cp-feat-fields { display: flex; gap: 0.5rem; flex: 1; min-width: 0; }
          .cp-feat-key { width: 160px; flex-shrink: 0; }
          .cp-feat-label { flex: 1; min-width: 0; }
          .cp-feat-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }

          .cp-count-wrap { display: flex; align-items: center; border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden; background: var(--color-ivory, #fffef5); flex-shrink: 0; }
          .cp-count-btn { width: 34px; height: 44px; border: none; background: none; font-size: 1.1rem; color: var(--color-gray); cursor: pointer; transition: background 0.15s; line-height: 1; }
          .cp-count-btn:hover:not(:disabled) { background: var(--color-cornsilk, #fff8e0); color: var(--color-orange); }
          .cp-count-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .cp-count-val { width: 36px; text-align: center; font-size: 0.9rem; font-weight: 700; color: var(--color-midnight-blue); border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; line-height: 44px; }
          .cp-remove-btn { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
          .cp-remove-btn:hover:not(:disabled) { background: #fee2e2; }
          .cp-remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .cp-add-btn { display: inline-flex; align-items: center; gap: 0.35rem; background: none; border: none; cursor: pointer; font-size: 0.8rem; font-weight: 700; color: var(--color-orange); padding: 0; transition: opacity 0.15s; }
          .cp-add-btn:hover:not(:disabled) { opacity: 0.75; }
          .cp-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

          /* Drop zone */
          .cp-dropzone { border: 1.5px dashed #d1d5db; border-radius: 12px; background: var(--color-ivory, #fffef5); padding: 1.5rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; cursor: pointer; transition: border-color 0.18s, background 0.18s; }
          .cp-dropzone:hover { border-color: var(--color-orange); background: var(--color-cornsilk, #fff8e0); }
          .cp-dropzone-icon { color: var(--color-gray); opacity: 0.7; }
          .cp-dropzone-title { font-size: 0.875rem; font-weight: 600; color: var(--color-dark-slate-gray); margin: 0; }
          .cp-dropzone-hint { font-size: 0.75rem; color: var(--color-silver); margin: 0; }

          /* Image grid */
          .cp-img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.6rem; }
          .cp-img-tile { position: relative; border-radius: 10px; overflow: hidden; aspect-ratio: 1; border: 1.5px solid #e5e7eb; }
          .cp-img-tile--uploading { opacity: 0.8; }
          .cp-img-tile--error { border-color: #fecaca; }
          .cp-img-tile--done { border-color: rgba(255,174,0,0.4); }
          .cp-img-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
          .cp-img-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; }
          .cp-img-overlay--error { background: rgba(220,38,38,0.6); }
          .cp-img-badge { position: absolute; top: 5px; left: 5px; width: 18px; height: 18px; border-radius: 50%; background: var(--color-orange); display: flex; align-items: center; justify-content: center; }
          .cp-img-actions { position: absolute; top: 4px; right: 4px; display: flex; gap: 3px; opacity: 0; transition: opacity 0.15s; }
          .cp-img-tile:hover .cp-img-actions { opacity: 1; }
          .cp-img-btn { width: 22px; height: 22px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
          .cp-img-btn--remove { background: rgba(220,38,38,0.85); color: #fff; }
          .cp-img-btn--retry { background: rgba(255,174,0,0.9); color: #111; }

          .cp-actions { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.4rem; }
          .cp-btn { display: inline-flex; align-items: center; gap: 0.45rem; height: 44px; padding: 0 1.25rem; border-radius: 10px; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: background 0.18s, transform 0.12s, opacity 0.15s; border: none; }
          .cp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
          .cp-btn:active:not(:disabled) { transform: scale(0.97); }
          .cp-btn--primary { background: var(--color-orange); color: var(--color-midnight-blue); }
          .cp-btn--primary:hover:not(:disabled) { background: #e09a00; }
          .cp-btn--ghost { background: transparent; color: var(--color-dark-slate-gray); border: 1.5px solid #e5e7eb; }
          .cp-btn--ghost:hover:not(:disabled) { background: var(--color-linen); border-color: #d1d5db; }

          .cp-spinner { width: 16px; height: 16px; border: 2.5px solid rgba(17,18,18,0.2); border-top-color: var(--color-midnight-blue); border-radius: 50%; animation: cp-spin 0.7s linear infinite; flex-shrink: 0; }
          .cp-spinner--white { border-color: rgba(255,255,255,0.3); border-top-color: #fff; }
          @keyframes cp-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default CreateEditingPackage;