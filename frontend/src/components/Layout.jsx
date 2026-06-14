import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import BottomNav from "./BottomNav";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.brandLogo} />
          <span>Workfolio</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          {session ? "Log out" : ""}
        </button>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
