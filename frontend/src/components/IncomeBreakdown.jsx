import { useLang } from "../context/LangContext";
import styles from "./IncomeBreakdown.module.css";

export default function IncomeBreakdown({ items = [] }) {
  const { t } = useLang();

  function formatAmount(v) {
    return `${Number(v).toFixed(2)}€`;
  }

  function formatHours(h) {
    return Number.isInteger(h) ? String(h) : Number(h).toFixed(1);
  }

  if (items.length === 0) {
    return <p className={styles.empty}>{t.incomeBreakdownEmpty}</p>;
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div key={item.project_id} className={styles.row}>
          <div className={styles.rowHeader}>
            <div className={styles.names}>
              <span className={styles.projectName}>{item.project_name}</span>
              <span className={styles.clientName}>
                {item.client_name || t.incomeBreakdownNoClient}
              </span>
            </div>
            <div className={styles.stats}>
              <span className={styles.stat}>
                {formatHours(item.hours)}{t.calendarHoursUnit} · {item.hourly_rate}€/h
              </span>
              <span className={styles.amount}>{formatAmount(item.amount)}</span>
            </div>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.bar} style={{ width: `${item.percentage}%` }} />
          </div>
          <span className={styles.percentage}>{item.percentage.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}
