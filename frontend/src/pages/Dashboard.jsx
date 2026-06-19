import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getClients, getProjects, getMonthlyIncome, getTimeEntries } from "../lib/api";
import Layout from "../components/Layout";
import WeekHoursChart from "../components/WeekHoursChart";
import TimeEntryModal from "../components/TimeEntryModal";
import styles from "./Dashboard.module.css";

const MOTIVATIONAL_KEYS = [
  "dashboardMotivational1",
  "dashboardMotivational2",
  "dashboardMotivational3",
  "dashboardMotivational4",
  "dashboardMotivational5",
  "dashboardMotivational6",
  "dashboardMotivational7",
  "dashboardMotivational8",
];

const ROTATE_MS = 6000;

function mostRecent(items) {
  if (!items.length) return null;
  return [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
}

function formatRelative(isoDate, t) {
  const d = new Date(isoDate);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return t.dashboardToday;
  if (days === 1) return t.dashboardYesterday;
  return t.dashboardDaysAgo.replace("{n}", days);
}

function formatAmount(v) {
  return `${Number(v).toFixed(2)}€`;
}

function formatActivityDate(iso, lang) {
  return new Date(iso).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

export default function Dashboard() {
  const { session } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showTimeEntry, setShowTimeEntry] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_KEYS.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(session.access_token),
    enabled: !!session?.access_token,
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(session.access_token),
    enabled: !!session?.access_token,
  });

  const { data: income, isLoading: loadingIncome } = useQuery({
    queryKey: ["income", "monthly", now.getFullYear(), now.getMonth() + 1],
    queryFn: () => getMonthlyIncome(session.access_token, now.getFullYear(), now.getMonth() + 1),
    enabled: !!session?.access_token,
  });

  const { data: prevIncome } = useQuery({
    queryKey: ["income", "monthly", prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1],
    queryFn: () => getMonthlyIncome(session.access_token, prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1),
    enabled: !!session?.access_token,
  });

  const { data: allEntries = [] } = useQuery({
    queryKey: ["time-entries", undefined],
    queryFn: () => getTimeEntries(undefined, session.access_token),
    enabled: !!session?.access_token,
  });

  const latestClient = useMemo(() => mostRecent(clients), [clients]);
  const latestProject = useMemo(() => mostRecent(projects), [projects]);

  const projectNameById = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  );

  const recentActivity = useMemo(
    () =>
      [...allEntries]
        .sort((a, b) => {
          if (a.date !== b.date) return a.date < b.date ? 1 : -1;
          return a.id < b.id ? 1 : -1;
        })
        .slice(0, 5),
    [allEntries]
  );

  const activeProjects = projects.filter((p) => p.status === "active");
  const idleActiveProject = activeProjects.find((p) => (p.weekly_hours ?? 0) <= 0);

  const totalIncome = income?.total_income ?? 0;
  const prevTotalIncome = prevIncome?.total_income ?? 0;
  const hasPrevIncome = prevIncome != null && prevTotalIncome > 0;
  const incomeDiffPct = hasPrevIncome
    ? Math.round(((totalIncome - prevTotalIncome) / prevTotalIncome) * 100)
    : null;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.headerRow}>
            <h1 className={styles.welcome}>
              {t.welcome}, {session?.user?.name || session?.user?.email}
            </h1>
            {projects.length > 0 && (
              <button
                type="button"
                className={styles.quickAddBtn}
                onClick={() => setShowTimeEntry(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t.dashboardQuickAddCta}
              </button>
            )}
          </div>

          <div className={styles.quoteBox} key={quoteIndex}>
            <span className={styles.quoteText}>{t[MOTIVATIONAL_KEYS[quoteIndex]]}</span>
          </div>

          <div className={styles.grid}>
            <div className={styles.card} onClick={() => navigate("/clientes")} role="button" tabIndex={0}>
              <span className={styles.cardTitle}>{t.dashboardClientsTitle}</span>
              {loadingClients ? (
                <p className={styles.cardLoading}>…</p>
              ) : clients.length === 0 ? (
                <p className={styles.cardSuggestion}>{t.dashboardClientsSuggestion}</p>
              ) : (
                <>
                  <div className={styles.cardStat}>
                    <span className={styles.cardStatValue}>{clients.length}</span>
                    <span className={styles.cardStatLabel}>{t.dashboardClientsTotal}</span>
                  </div>
                  {latestClient && (
                    <div className={styles.cardRecent}>
                      <span className={styles.cardRecentLabel}>{t.dashboardClientsLatest}</span>
                      <span className={styles.cardRecentValue}>
                        {latestClient.name} · {formatRelative(latestClient.created_at, t)}
                      </span>
                    </div>
                  )}
                </>
              )}
              <span className={styles.cardCta}>{t.dashboardClientsCta} →</span>
            </div>

            <div className={styles.card} onClick={() => navigate("/proyectos")} role="button" tabIndex={0}>
              <span className={styles.cardTitle}>{t.dashboardProjectsTitle}</span>
              {loadingProjects ? (
                <p className={styles.cardLoading}>…</p>
              ) : projects.length === 0 ? (
                <p className={styles.cardSuggestion}>{t.dashboardProjectsSuggestionGeneric}</p>
              ) : (
                <>
                  <div className={styles.cardStat}>
                    <span className={styles.cardStatValue}>{activeProjects.length}</span>
                    <span className={styles.cardStatLabel}>{t.dashboardProjectsActive}</span>
                  </div>
                  {latestProject && (
                    <div className={styles.cardRecent}>
                      <span className={styles.cardRecentLabel}>{t.dashboardProjectsLatest}</span>
                      <span className={styles.cardRecentValue}>
                        {latestProject.name} · {formatRelative(latestProject.created_at, t)}
                      </span>
                    </div>
                  )}
                  {idleActiveProject && (
                    <p className={styles.cardSuggestion}>
                      {t.dashboardProjectsSuggestionIdle.replace("{name}", idleActiveProject.name)}
                    </p>
                  )}
                </>
              )}
              <span className={styles.cardCta}>{t.dashboardProjectsCta} →</span>
            </div>

            <div className={styles.card} onClick={() => navigate("/ingresos")} role="button" tabIndex={0}>
              <span className={styles.cardTitle}>{t.dashboardIncomeTitle}</span>
              {loadingIncome ? (
                <p className={styles.cardLoading}>…</p>
              ) : (
                <>
                  <div className={styles.cardStat}>
                    <span className={`${styles.cardStatValue} ${styles.cardStatMoney}`}>
                      {formatAmount(totalIncome)}
                    </span>
                    <span className={styles.cardStatLabel}>{t.dashboardIncomeThisMonth}</span>
                  </div>
                  {hasPrevIncome ? (
                    <div className={styles.cardRecent}>
                      <span
                        className={`${styles.cardCompare} ${
                          incomeDiffPct >= 0 ? styles.cardCompareUp : styles.cardCompareDown
                        }`}
                      >
                        {incomeDiffPct >= 0 ? "▲" : "▼"} {Math.abs(incomeDiffPct)}%
                      </span>
                      <span className={styles.cardRecentLabel}>{t.dashboardIncomeVsPrev}</span>
                    </div>
                  ) : (
                    <p className={styles.cardSuggestion}>{t.dashboardIncomeNoPrev}</p>
                  )}
                </>
              )}
              <span className={styles.cardCta}>{t.dashboardIncomeCta} →</span>
            </div>
          </div>

          <div className={styles.bottomGrid}>
            <div className={styles.panel}>
              <WeekHoursChart active={true} />
            </div>

            <div className={styles.panel}>
              <span className={styles.panelTitle}>{t.dashboardActivityTitle}</span>
              {recentActivity.length === 0 ? (
                <p className={styles.panelEmpty}>{t.activityEmpty}</p>
              ) : (
                <div className={styles.activityList}>
                  {recentActivity.map((e) => (
                    <div key={e.id} className={styles.activityRow}>
                      <span className={styles.activityDate}>{formatActivityDate(e.date, lang)}</span>
                      <span className={styles.activityProject}>{projectNameById[e.project_id]}</span>
                      <span className={styles.activityHours}>{e.hours}{t.calendarHoursUnit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTimeEntry && (
        <TimeEntryModal projects={projects} onClose={() => setShowTimeEntry(false)} />
      )}
    </Layout>
  );
}
