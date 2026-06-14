import { useLang } from "../context/LangContext";
import Layout from "../components/Layout";
import styles from "./Placeholder.module.css";

export default function Clients() {
  const { t } = useLang();
  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.title}>{t.pageClients}</h1>
        <p className={styles.sub}>{t.comingSoon}</p>
      </div>
    </Layout>
  );
}
