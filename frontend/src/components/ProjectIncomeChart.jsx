import { useMemo, useState } from "react";
import { useLang } from "../context/LangContext";
import styles from "./ProjectIncomeChart.module.css";

function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ProjectIncomeChart({ entries = [], hourlyRate }) {
  const { t, lang } = useLang();
  const [hoverIndex, setHoverIndex] = useState(null);

  const points = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayDay = now.getDate();

    const amountByIso = {};
    for (const e of entries) {
      const d = new Date(`${e.date}T00:00:00`);
      if (d.getFullYear() !== monthStart.getFullYear() || d.getMonth() !== monthStart.getMonth()) continue;
      const iso = e.date;
      amountByIso[iso] = (amountByIso[iso] || 0) + Number(e.hours) * Number(hourlyRate);
    }

    let cumulative = 0;
    const series = [];
    for (let day = 1; day <= todayDay; day++) {
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      const iso = toIso(d);
      const amount = amountByIso[iso] || 0;
      cumulative += amount;
      series.push({ day, iso, amount, cumulative });
    }
    return series;
  }, [entries, hourlyRate]);

  const total = points.length ? points[points.length - 1].cumulative : 0;
  const max = Math.max(1, ...points.map((p) => p.cumulative));

  const coords = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * 100 : 0;
    const y = 38 - (p.cumulative / max) * 34;
    return { ...p, x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(2)},40 L ${coords[0].x.toFixed(2)},40 Z`
      : "";

  function formatAmount(v) {
    return `${Number(v).toFixed(2)}€`;
  }

  function formatDay(iso) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      day: "numeric",
      month: "short",
    });
  }

  const hovered = hoverIndex != null ? coords[hoverIndex] : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>{t.projectIncomeChartTitle}</span>
        <span className={styles.accumulated}>
          {t.projectIncomeChartAccumulated}: <strong>{formatAmount(total)}</strong>
        </span>
      </div>

      {coords.length < 2 ? (
        <p className={styles.empty}>{t.projectIncomeChartEmpty}</p>
      ) : (
        <div className={styles.chartArea}>
          <svg
            className={styles.svg}
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-money)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-money)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className={styles.area} d={areaPath} fill="url(#incomeAreaGradient)" />
            <path className={styles.line} d={linePath} fill="none" />
            {coords.map((c, i) => (
              <circle
                key={c.iso}
                className={styles.point}
                cx={c.x}
                cy={c.y}
                r={hoverIndex === i ? 1.6 : 1}
                onMouseEnter={() => setHoverIndex(i)}
              />
            ))}
          </svg>
          {hovered && (
            <div
              className={styles.tooltip}
              style={{ left: `${hovered.x}%` }}
            >
              <span className={styles.tooltipDate}>{formatDay(hovered.iso)}</span>
              <span className={styles.tooltipAmount}>{formatAmount(hovered.cumulative)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
