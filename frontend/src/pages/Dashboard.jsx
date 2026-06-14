import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { session } = useAuth();

  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.welcome}>
          Bienvenido, {session?.user?.name || session?.user?.email}
        </h1>
        <p className={styles.sub}>Dashboard coming soon.</p>
      </div>
    </Layout>
  );
}
