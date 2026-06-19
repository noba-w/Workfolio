import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import { DICEBEAR_STYLES, dicebearUrl, randomSeeds } from "../lib/dicebear";
import styles from "./AvatarPickerModal.module.css";

const GRID_SIZE = 9;

export default function AvatarPickerModal({ onClose, onChooseFile, onSelectAvatar }) {
  const { t } = useLang();
  const [style, setStyle] = useState(DICEBEAR_STYLES[0].id);
  const [seeds, setSeeds] = useState(() => randomSeeds(GRID_SIZE));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSelect(seed) {
    setSaving(true);
    try {
      await onSelectAvatar(dicebearUrl(style, seed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className={styles.card} role="dialog" aria-modal="true">
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{t.avatarPickerTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={saving} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <button type="button" className={styles.uploadBtn} onClick={onChooseFile} disabled={saving}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {t.avatarPickerUpload}
          </button>

          <div className={styles.divider}>
            <span>{t.avatarPickerOr}</span>
          </div>

          <div className={styles.styleTabs}>
            {DICEBEAR_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.styleTab} ${style === s.id ? styles.styleTabActive : ""}`}
                onClick={() => setStyle(s.id)}
                disabled={saving}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {seeds.map((seed) => (
              <button
                key={seed}
                type="button"
                className={styles.avatarCell}
                onClick={() => handleSelect(seed)}
                disabled={saving}
                aria-label="Elegir avatar"
              >
                <img src={dicebearUrl(style, seed)} alt="" />
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.regenerateBtn}
            onClick={() => setSeeds(randomSeeds(GRID_SIZE))}
            disabled={saving}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {t.avatarPickerRegenerate}
          </button>
        </div>
      </div>
    </div>
  );
}
