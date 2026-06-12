import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>Workfolio</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log out
        </button>
      </header>
      <main className={styles.main}>
        <h1 className={styles.welcome}>
          Welcome, {session?.user?.name || session?.user?.email}
        </h1>
        <p className={styles.sub}>Dashboard coming soon.</p>
      </main>
    </div>
  );
}
