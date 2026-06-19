import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { getClients } from "../lib/api";
import Layout from "../components/Layout";
import ClientModal from "../components/ClientModal";
import styles from "./Clients.module.css";

export default function Clients() {
  const { t } = useLang();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(session.access_token),
    enabled: !!session?.access_token,
  });

  function formatHours(h) {
    if (h === 0) return "0";
    return Number.isInteger(h) ? String(h) : h.toFixed(1);
  }

  const filtered = clients.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().replace(/\s+/g, "").includes(q.replace(/\s+/g, ""))
    );
  });

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
            {isLoading ? (
              <p className={styles.emptyState}>…</p>
            ) : clients.length === 0 ? (
              <p className={styles.emptyState}>{t.clientsEmpty}</p>
            ) : filtered.length === 0 ? (
              <p className={styles.emptyState}>{t.clientsNoResults}</p>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  className={styles.clientCard}
                  onClick={() => navigate(`/clientes/${c.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/clientes/${c.id}`)}
                >
                  {c.photo_url ? (
                    <img src={c.photo_url} alt="" className={styles.clientAvatarImg} />
                  ) : (
                    <div className={styles.clientAvatar}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.clientInfo}>
                    <span className={styles.clientName}>{c.name}</span>
                    {c.company && <span className={styles.clientCompany}>{c.company}</span>}
                    <span className={styles.clientEmail}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      {c.email}
                    </span>
                    {c.phone && (
                      <span className={styles.clientPhone}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {c.phone}
                      </span>
                    )}
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
        <ClientModal onClose={() => setShowModal(false)} />
      )}
    </Layout>
  );
}
