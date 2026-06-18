import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { createTimeEntry } from "../lib/api";
import styles from "./TimeEntryModal.module.css";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const EMPTY = { date: todayISO(), startTime: "", endTime: "", description: "" };

export default function TimeEntryModal({ onClose, project }) {
  const { t } = useLang();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
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
    if (!form.date) errs.date = t.timeEntryErrDate;
    if (!form.startTime) errs.startTime = t.timeEntryErrStart;
    if (!form.endTime) errs.endTime = t.timeEntryErrEnd;
    if (form.startTime && form.endTime && toMinutes(form.endTime) <= toMinutes(form.startTime)) {
      errs.endTime = t.timeEntryErrRange;
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const hours = Math.round(((toMinutes(form.endTime) - toMinutes(form.startTime)) / 60) * 100) / 100;
      const body = { project_id: project.id, date: form.date, hours, description: form.description.trim() || null };
      await createTimeEntry(body, session?.access_token);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["clients"] }),
        queryClient.invalidateQueries({ queryKey: ["time-entries", project.id] }),
      ]);
      onClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true">
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{t.timeEntryModalTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>{t.timeEntryFieldDate} <span className={styles.required}>*</span></label>
            <input
              className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
              type="date"
              value={form.date}
              onChange={set("date")}
              autoFocus
            />
            {errors.date && <span className={styles.fieldError}>{errors.date}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.timeEntryFieldStart} <span className={styles.required}>*</span></label>
            <input
              className={`${styles.input} ${errors.startTime ? styles.inputError : ""}`}
              type="time"
              value={form.startTime}
              onChange={set("startTime")}
            />
            {errors.startTime && <span className={styles.fieldError}>{errors.startTime}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.timeEntryFieldEnd} <span className={styles.required}>*</span></label>
            <input
              className={`${styles.input} ${errors.endTime ? styles.inputError : ""}`}
              type="time"
              value={form.endTime}
              onChange={set("endTime")}
            />
            {errors.endTime && <span className={styles.fieldError}>{errors.endTime}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.timeEntryFieldDescription}</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={set("description")}
              placeholder={t.timeEntryFieldDescriptionPlaceholder}
              rows={3}
            />
          </div>

          {errors.submit && <p className={styles.submitError}>{errors.submit}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              {t.timeEntryCancel}
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? t.timeEntrySaving : t.timeEntrySave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
