import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getTimeEntries } from "../lib/api";
import styles from "./WeekHoursChart.module.css";

const DAY_LABEL_KEYS = ["dayMon", "dayTue", "dayWed", "dayThu", "dayFri", "daySat", "daySun"];

function getWeekDays() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WeekHoursChart({ projectId, active }) {
  const { session } = useAuth();
  const { t } = useLang();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["time-entries", projectId],
    queryFn: () => getTimeEntries(projectId, session.access_token),
    enabled: !!session?.access_token && active,
  });

  const days = getWeekDays();
  const hoursByDay = days.map((d) => {
    const iso = toIso(d);
    return entries
      .filter((e) => e.date === iso)
      .reduce((sum, e) => sum + Number(e.hours), 0);
  });

  const max = Math.max(1, ...hoursByDay);

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>{t.weekChartTitle}</span>
      {isLoading ? (
        <p className={styles.loading}>…</p>
      ) : (
        <div className={styles.chart}>
          {hoursByDay.map((h, i) => (
            <div key={i} className={styles.barCol}>
              <span className={styles.barValue}>{h > 0 ? h : ""}</span>
              <div className={styles.barTrack}>
                <div className={styles.bar} style={{ height: `${(h / max) * 100}%` }} />
              </div>
              <span className={styles.barLabel}>{t[DAY_LABEL_KEYS[i]]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
