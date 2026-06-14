import { useLang } from "../context/LangContext";
import Layout from "../components/Layout";
import styles from "./Placeholder.module.css";

export default function Projects() {
  const { t } = useLang();
  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.title}>{t.pageProjects}</h1>
        <p className={styles.sub}>{t.comingSoon}</p>
      </div>
    </Layout>
  );
}
