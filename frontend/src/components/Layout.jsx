import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import LangSwitcher from "./LangSwitcher";
import BottomNav from "./BottomNav";
import styles from "./Layout.module.css";

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function Layout({ children }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.brandLogo} />
          <span>Workfolio</span>
        </div>
        <div className={styles.headerRight}>
          <LangSwitcher inline />
          <NavLink
            to="/ajustes"
            className={({ isActive }) =>
              `${styles.settingsBtn} ${isActive ? styles.settingsBtnActive : ""}`
            }
            aria-label="Ajustes"
          >
            <SettingsIcon />
          </NavLink>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
