import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { getTimeEntries } from "../lib/api";
import styles from "./ProjectActivityList.module.css";

export default function ProjectActivityList({ projectId, active }) {
  const { session } = useAuth();
  const { t, lang } = useLang();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["time-entries", projectId],
    queryFn: () => getTimeEntries(projectId, session.access_token),
    enabled: !!session?.access_token && active,
  });

  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return a.id < b.id ? 1 : -1;
      }),
    [entries]
  );

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      day: "numeric",
      month: "short",
    });
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>{t.activityTitle}</span>
      {isLoading ? (
        <p className={styles.loading}>…</p>
      ) : sorted.length === 0 ? (
        <p className={styles.empty}>{t.activityEmpty}</p>
      ) : (
        <div className={styles.list}>
          {sorted.map((e) => (
            <div key={e.id} className={styles.row}>
              <span className={styles.date}>{formatDate(e.date)}</span>
              <span className={styles.hours}>{e.hours}{t.calendarHoursUnit}</span>
              <span className={styles.desc}>{e.description || t.activityNoDescription}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
