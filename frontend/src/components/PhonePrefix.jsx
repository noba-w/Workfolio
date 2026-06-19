import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { COUNTRIES } from "../lib/countries";
import styles from "./PhonePrefix.module.css";

export default function PhonePrefix({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropStyle, setDropStyle] = useState({});
  const triggerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!open) { setSearch(""); return; }
    const rect = triggerRef.current.getBoundingClientRect();
    setDropStyle({
      top: rect.bottom + 4,
      left: rect.left,
      minWidth: Math.max(rect.width, 260),
    });
    setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (!triggerRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = COUNTRIES.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.dialCode.includes(q);
  });

  function select(country) {
    onChange(country);
    setOpen(false);
  }

  const dropdown = open && createPortal(
    <div className={styles.dropdown} style={{ ...dropStyle, position: "fixed", zIndex: 9999 }}>
      <div className={styles.searchBox}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={searchRef}
          className={styles.searchInput}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar país o código…"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
      <ul className={styles.list}>
        {filtered.length === 0 ? (
          <li className={styles.noResults}>Sin resultados</li>
        ) : (
          filtered.map((c) => (
            <li
              key={c.name}
              className={`${styles.item} ${c.dialCode === value.dialCode && c.name === value.name ? styles.itemActive : ""}`}
              onMouseDown={(e) => { e.preventDefault(); select(c); }}
            >
              <span className={styles.itemFlag}>{c.flag}</span>
              <span className={styles.itemName}>{c.name}</span>
              <span className={styles.itemCode}>{c.dialCode}</span>
            </li>
          ))
        )}
      </ul>
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.flag}>{value.flag}</span>
        <span className={styles.code}>{value.dialCode}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {dropdown}
    </div>
  );
}
