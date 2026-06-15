import { useState } from "react";
import { useLang } from "../context/LangContext";
import Layout from "../components/Layout";
import styles from "./Clients.module.css";

const MOCK_CLIENTS = [];

export default function Clients() {
  const { t } = useLang();
  const [query, setQuery] = useState("");

  const filtered = MOCK_CLIENTS.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder={t.clientsSearchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className={styles.addButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{t.clientsAddButton}</span>
          </button>
        </div>

        <div className={styles.list}>
          {MOCK_CLIENTS.length === 0 ? (
            <p className={styles.emptyState}>{t.clientsEmpty}</p>
          ) : filtered.length === 0 ? (
            <p className={styles.emptyState}>{t.clientsNoResults}</p>
          ) : (
            filtered.map((c) => (
              <div key={c.id}>{c.name}</div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
