import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { getMonthlyIncome } from "../lib/api";
import Layout from "../components/Layout";
import IncomeBreakdown from "../components/IncomeBreakdown";
import styles from "./Income.module.css";

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function Income() {
  const { t, lang } = useLang();
  const { session } = useAuth();
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;

  const { data, isLoading } = useQuery({
    queryKey: ["income", "monthly", year, month],
    queryFn: () => getMonthlyIncome(session.access_token, year, month),
    enabled: !!session?.access_token,
  });

  const monthLabel = monthDate
    .toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

  function changeMonth(delta) {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  const totalHours = data?.total_hours ?? 0;
  const totalIncome = data?.total_income ?? 0;
  const breakdown = data?.breakdown ?? [];

  function formatHours(h) {
    return Number.isInteger(h) ? String(h) : Number(h).toFixed(1);
  }

  function formatAmount(v) {
    return `${Number(v).toFixed(2)}€`;
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{t.pageIncome}</h1>
            <div className={styles.monthNav}>
              <button
                type="button"
                className={styles.monthNavBtn}
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
                className={styles.monthNavBtn}
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
            <p className={styles.emptyState}>…</p>
          ) : (
            <>
              <div className={styles.summary}>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryValue}>
                    {formatHours(totalHours)}<span className={styles.summaryUnit}>h</span>
                  </span>
                  <span className={styles.summaryLabel}>{t.incomeMonthTotalHours}</span>
                </div>
                <div className={styles.summaryCard}>
                  <span className={`${styles.summaryValue} ${styles.summaryValueMoney}`}>
                    {formatAmount(totalIncome)}
                  </span>
                  <span className={styles.summaryLabel}>{t.incomeMonthTotalIncome}</span>
                </div>
              </div>

              <div className={styles.breakdownSection}>
                <h2 className={styles.breakdownTitle}>{t.incomeBreakdownTitle}</h2>
                <IncomeBreakdown items={breakdown} />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
