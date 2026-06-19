import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import styles from "./Settings.module.css";

export default function Settings() {
  const { logout } = useAuth();
  const { t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.title}>{t.settingsTitle}</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settingsAppearance}</h2>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>{t.settingsDarkMode}</span>
              <span className={styles.rowDesc}>{t.settingsDarkModeDesc}</span>
            </div>
            <button
              className={`${styles.switch} ${theme === "dark" ? styles.switchOn : ""}`}
              role="switch"
              aria-checked={theme === "dark"}
              aria-label={t.settingsDarkMode}
              onClick={toggleTheme}
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settingsAccount}</h2>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t.settingsLogout}
          </button>
        </section>
      </div>
    </Layout>
  );
}
