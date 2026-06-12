import { useState, useRef, useEffect } from "react";
import { useLang } from "../context/LangContext";
import styles from "./LangSwitcher.module.css";

const LANGS = [
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "en", flag: "🇬🇧", label: "EN" },
];

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGS.find((l) => l.code === lang);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label="Cambiar idioma"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`${styles.option} ${l.code === lang ? styles.optionActive : ""}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
