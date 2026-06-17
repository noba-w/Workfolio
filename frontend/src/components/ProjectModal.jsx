import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { createProject } from "../lib/api";
import styles from "./ProjectModal.module.css";

const EMPTY = { name: "", client_id: "", hourly_rate: "", status: "active", description: "" };

export default function ProjectModal({ onClose, clients, defaultClientId }) {
  const { t } = useLang();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => ({ ...EMPTY, client_id: defaultClientId ?? "" }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    };
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = t.projectsErrName;
    if (!form.client_id) errs.client_id = t.projectsErrClient;
    if (!form.hourly_rate || isNaN(parseFloat(form.hourly_rate))) errs.hourly_rate = t.projectsErrRate;
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        client_id: form.client_id,
        hourly_rate: parseFloat(form.hourly_rate),
        status: form.status,
        ...(form.description.trim() && { description: form.description.trim() }),
      };
      await createProject(body, session?.access_token);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.card} role="dialog" aria-modal="true">
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{t.projectsModalTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{t.projectsFieldName} <span className={styles.required}>*</span></label>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder={t.projectsFieldNamePlaceholder}
                autoFocus
              />
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.projectsFieldClient} <span className={styles.required}>*</span></label>
              <select
                className={`${styles.input} ${errors.client_id ? styles.inputError : ""}`}
                value={form.client_id}
                onChange={set("client_id")}
              >
                <option value="">{t.projectsFieldClientSelect}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.client_id && <span className={styles.fieldError}>{errors.client_id}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{t.projectsFieldRate} <span className={styles.required}>*</span></label>
              <input
                className={`${styles.input} ${errors.hourly_rate ? styles.inputError : ""}`}
                type="number"
                min="0"
                step="0.01"
                value={form.hourly_rate}
                onChange={set("hourly_rate")}
                placeholder={t.projectsFieldRatePlaceholder}
              />
              {errors.hourly_rate && <span className={styles.fieldError}>{errors.hourly_rate}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.projectsFieldStatus}</label>
              <select className={styles.input} value={form.status} onChange={set("status")}>
                <option value="active">{t.statusActive}</option>
                <option value="paused">{t.statusPaused}</option>
                <option value="finished">{t.statusFinished}</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.projectsFieldDescription}</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={set("description")}
              placeholder={t.projectsFieldDescriptionPlaceholder}
              rows={2}
            />
          </div>

          {errors.submit && <p className={styles.submitError}>{errors.submit}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              {t.projectsCancel}
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? t.projectsSaving : t.projectsSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
