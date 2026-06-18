import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getTimeEntries } from "../lib/api";
import styles from "./ProjectCalendar.module.css";

const DAY_LABEL_KEYS = ["dayMon", "dayTue", "dayWed", "dayThu", "dayFri", "daySat", "daySun"];

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - leading + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return new Date(first.getFullYear(), first.getMonth(), dayNum);
  });
}

function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function levelFor(hours, max) {
  if (hours <= 0 || max <= 0) return 0;
  const ratio = hours / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

export default function ProjectCalendar({ projectId, active }) {
  const { session } = useAuth();
  const { t, lang } = useLang();
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [selectedIso, setSelectedIso] = useState(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["time-entries", projectId],
    queryFn: () => getTimeEntries(projectId, session.access_token),
    enabled: !!session?.access_token && active,
  });

  const entriesByDate = useMemo(() => {
    const map = {};
    for (const e of entries) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [entries]);

  const cells = useMemo(() => buildMonthGrid(monthDate), [monthDate]);

  const hoursByIso = useMemo(() => {
    const map = {};
    for (const day of cells) {
      if (!day) continue;
      const iso = toIso(day);
      const dayEntries = entriesByDate[iso] || [];
      map[iso] = dayEntries.reduce((sum, e) => sum + Number(e.hours), 0);
    }
    return map;
  }, [cells, entriesByDate]);

  const maxHours = Math.max(0, ...Object.values(hoursByIso));

  const monthLabel = monthDate.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(delta) {
    setSelectedIso(null);
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  const selectedEntries = selectedIso ? entriesByDate[selectedIso] || [] : [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>{t.calendarTitle}</span>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => changeMonth(-1)}
            aria-label={t.calendarPrevMonth}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className={styles.monthLabel}>{monthLabel}</span>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => changeMonth(1)}
            aria-label={t.calendarNextMonth}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.loading}>…</p>
      ) : (
        <>
          <div className={styles.weekdays}>
            {DAY_LABEL_KEYS.map((key) => (
              <span key={key} className={styles.weekday}>{t[key]}</span>
            ))}
          </div>
          <div className={styles.grid}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} className={styles.cellEmpty} />;
              const iso = toIso(day);
              const hours = hoursByIso[iso] || 0;
              const level = levelFor(hours, maxHours);
              const isToday = toIso(new Date()) === iso;
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.cell} ${styles[`level${level}`]} ${isToday ? styles.today : ""}`}
                  disabled={hours <= 0}
                  onClick={() => setSelectedIso(iso)}
                  title={hours > 0 ? `${day.getDate()} · ${hours}${t.calendarHoursUnit}` : undefined}
                >
                  <span className={styles.cellDay}>{day.getDate()}</span>
                  {hours > 0 && <span className={styles.cellHours}>{hours}{t.calendarHoursUnit}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {selectedIso && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && setSelectedIso(null)}
        >
          <div className={styles.popover}>
            <div className={styles.popoverHeader}>
              <span className={styles.popoverDate}>
                {new Date(selectedIso).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <button
                type="button"
                className={styles.popoverClose}
                onClick={() => setSelectedIso(null)}
                aria-label={t.calendarClose}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className={styles.popoverBody}>
              {selectedEntries.length === 0 ? (
                <p className={styles.popoverEmpty}>{t.calendarNoEntries}</p>
              ) : (
                selectedEntries.map((e) => (
                  <div key={e.id} className={styles.entryRow}>
                    <span className={styles.entryHours}>{e.hours}{t.calendarHoursUnit}</span>
                    {e.description && <span className={styles.entryDesc}>{e.description}</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
