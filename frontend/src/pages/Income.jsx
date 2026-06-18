import { useQuery } from "@tanstack/react-query";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { getMonthlyIncome } from "../lib/api";
import Layout from "../components/Layout";
import IncomeBreakdown from "../components/IncomeBreakdown";
import styles from "./Income.module.css";

export default function Income() {
  const { t } = useLang();
  const { session } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["income", "monthly"],
    queryFn: () => getMonthlyIncome(session.access_token),
    enabled: !!session?.access_token,
  });

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
          <h1 className={styles.title}>{t.pageIncome}</h1>

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
                  <span className={styles.summaryValue}>{formatAmount(totalIncome)}</span>
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
