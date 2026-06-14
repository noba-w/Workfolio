import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import Layout from "../components/Layout";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { session } = useAuth();
  const { t } = useLang();

  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.welcome}>
          {t.welcome}, {session?.user?.name || session?.user?.email}
        </h1>
        <p className={styles.sub}>{t.comingSoon}</p>
      </div>
    </Layout>
  );
}
