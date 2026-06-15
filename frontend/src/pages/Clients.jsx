import { useState, useEffect } from "react";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { getClients } from "../lib/api";
import Layout from "../components/Layout";
import ClientModal from "../components/ClientModal";
import styles from "./Clients.module.css";

export default function Clients() {
  const { t } = useLang();
  const { session } = useAuth();
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!session?.access_token) return;
    getClients(session.access_token)
      .then(setClients)
      .catch(() => {});
  }, [session]);

  function formatHours(h) {
    if (h === 0) return "0";
    return Number.isInteger(h) ? String(h) : h.toFixed(1);
  }

  const filtered = clients.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q)
    );
  });

  function handleCreated(newClient) {
    setClients((prev) => [newClient, ...prev]);
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>
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
            <button className={styles.addButton} onClick={() => setShowModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{t.clientsAddButton}</span>
            </button>
          </div>

          <div className={styles.list}>
            {clients.length === 0 ? (
              <p className={styles.emptyState}>{t.clientsEmpty}</p>
            ) : filtered.length === 0 ? (
              <p className={styles.emptyState}>{t.clientsNoResults}</p>
            ) : (
              filtered.map((c) => (
                <div key={c.id} className={styles.clientCard}>
                  <div className={styles.clientAvatar}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.clientInfo}>
                    <span className={styles.clientName}>{c.name}</span>
                    {c.company && <span className={styles.clientCompany}>{c.company}</span>}
                    <span className={styles.clientEmail}>{c.email}</span>
                    {c.phone && <span className={styles.clientPhone}>{c.phone}</span>}
                  </div>
                  <div className={styles.clientWeeklyHours}>
                    <span className={styles.clientHoursValue}>
                      {formatHours(c.weekly_hours ?? 0)}<span className={styles.clientHoursUnit}>h</span>
                    </span>
                    <span className={styles.clientHoursLabel}>{t.clientsWeekLabel}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ClientModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </Layout>
  );
}
