import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { createClient, updateClient } from "../lib/api";
import { DEFAULT_COUNTRY, parsePhone } from "../lib/countries";
import PhonePrefix from "./PhonePrefix";
import styles from "./ClientModal.module.css";

const EMPTY = { name: "", email: "", phoneCountry: DEFAULT_COUNTRY, phoneNumber: "", company: "" };

function formFromClient(client) {
  const { country, number } = parsePhone(client.phone);
  return {
    name: client.name ?? "",
    email: client.email ?? "",
    phoneCountry: country,
    phoneNumber: number,
    company: client.company ?? "",
  };
}

export default function ClientModal({ onClose, client }) {
  const { t } = useLang();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!client;
  const [form, setForm] = useState(() => (isEdit ? formFromClient(client) : EMPTY));
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

  function handlePhoneNumber(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    const parts = [digits.slice(0, 3), digits.slice(3, 5), digits.slice(5, 7), digits.slice(7, 9)];
    setForm((prev) => ({ ...prev, phoneNumber: parts.filter(Boolean).join(" ") }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = t.clientsErrName;
    if (!form.email.trim()) errs.email = t.clientsErrEmail;
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const phone = form.phoneNumber.trim()
        ? `${form.phoneCountry.dialCode} ${form.phoneNumber.trim()}`
        : "";

      if (isEdit) {
        const body = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone,
          company: form.company.trim(),
        };
        await updateClient(client.id, body, session?.access_token);
      } else {
        const body = {
          name: form.name.trim(),
          email: form.email.trim(),
          ...(phone && { phone }),
          ...(form.company.trim() && { company: form.company.trim() }),
        };
        await createClient(body, session?.access_token);
      }
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
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
          <h2 className={styles.cardTitle}>{isEdit ? t.clientsEditModalTitle : t.clientsModalTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{t.clientsFieldName} <span className={styles.required}>*</span></label>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder={t.clientsFieldNamePlaceholder}
                autoFocus
              />
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.clientsFieldEmail} <span className={styles.required}>*</span></label>
              <input
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="cliente@ejemplo.com"
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{t.clientsFieldPhone}</label>
              <div className={styles.phoneGroup}>
                <PhonePrefix
                  value={form.phoneCountry}
                  onChange={(country) => setForm((prev) => ({ ...prev, phoneCountry: country }))}
                />
                <span className={styles.phoneDivider} />
                <input
                  className={styles.phoneNumber}
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handlePhoneNumber}
                  placeholder={t.clientsFieldPhonePlaceholder}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.clientsFieldCompany}</label>
              <input
                className={styles.input}
                type="text"
                value={form.company}
                onChange={set("company")}
                placeholder={t.clientsFieldCompanyPlaceholder}
              />
            </div>
          </div>

          {errors.submit && <p className={styles.submitError}>{errors.submit}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              {t.clientsCancel}
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {isEdit
                ? (saving ? t.clientsSavingEdit : t.clientsSaveEdit)
                : (saving ? t.clientsSaving : t.clientsSave)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
