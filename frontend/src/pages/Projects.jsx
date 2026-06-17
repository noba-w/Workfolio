import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { getProjects, getClients } from "../lib/api";
import Layout from "../components/Layout";
import ProjectModal from "../components/ProjectModal";
import styles from "./Projects.module.css";

const STATUS_COLORS = {
  active:   { bg: "#dcfce7", color: "#16a34a" },
  paused:   { bg: "#fef3c7", color: "#d97706" },
  finished: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function Projects() {
  const { t } = useLang();
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(session.access_token),
    enabled: !!session?.access_token,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(session.access_token),
    enabled: !!session?.access_token,
  });

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  function formatHours(h) {
    if (h === 0) return "0";
    return Number.isInteger(h) ? String(h) : h.toFixed(1);
  }

  const filtered = projects.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (clientMap[p.client_id] ?? "").toLowerCase().includes(q)
    );
  });

  const statusLabels = {
    active:   t.statusActive,
    paused:   t.statusPaused,
    finished: t.statusFinished,
  };

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
                placeholder={t.projectsSearchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className={styles.addButton} onClick={() => setShowModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{t.projectsAddButton}</span>
            </button>
          </div>

          <div className={styles.list}>
            {isLoading ? (
              <p className={styles.emptyState}>…</p>
            ) : projects.length === 0 ? (
              <p className={styles.emptyState}>{t.projectsEmpty}</p>
            ) : filtered.length === 0 ? (
              <p className={styles.emptyState}>{t.projectsNoResults}</p>
            ) : (
              filtered.map((p) => {
                const sc = STATUS_COLORS[p.status] ?? STATUS_COLORS.finished;
                return (
                  <div key={p.id} className={styles.projectCard}>
                    <div className={styles.projectAvatar}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.projectInfo}>
                      <span className={styles.projectName}>{p.name}</span>
                      {clientMap[p.client_id] && (
                        <span className={styles.projectClient}>
                          {clientMap[p.client_id]}
                        </span>
                      )}
                      <span
                        className={styles.projectStatus}
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {statusLabels[p.status]}
                      </span>
                    </div>
                    <div className={styles.projectStats}>
                      <span className={styles.projectHoursValue}>
                        {formatHours(p.weekly_hours ?? 0)}
                        <span className={styles.projectHoursUnit}>h</span>
                      </span>
                      <span className={styles.projectHoursLabel}>{t.clientsWeekLabel}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ProjectModal onClose={() => setShowModal(false)} clients={clients} />
      )}
    </Layout>
  );
}
