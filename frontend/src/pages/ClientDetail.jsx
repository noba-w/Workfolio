import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { getClients, getProjects, updateClient, deleteClientPhoto } from "../lib/api";
import { resizeImageToDataUrl } from "../lib/image";
import Layout from "../components/Layout";
import ClientModal from "../components/ClientModal";
import styles from "./ClientDetail.module.css";

const STATUS_COLORS = {
  active:   { bg: "#dcfce7", color: "#16a34a" },
  paused:   { bg: "#fef3c7", color: "#d97706" },
  finished: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(session.access_token),
    enabled: !!session?.access_token,
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(session.access_token),
    enabled: !!session?.access_token,
  });

  const client = clients.find((c) => c.id === id);
  const clientProjects = projects.filter((p) => p.client_id === id);

  const statusLabels = {
    active:   t.statusActive,
    paused:   t.statusPaused,
    finished: t.statusFinished,
  };

  function formatHours(h) {
    if (h === 0) return "0";
    return Number.isInteger(h) ? String(h) : h.toFixed(1);
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const photo_url = await resizeImageToDataUrl(file);
      await updateClient(id, { photo_url }, session.access_token);
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    setRemoving(true);
    try {
      await deleteClientPhoto(id, session.access_token);
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    } finally {
      setRemoving(false);
      setShowRemoveConfirm(false);
    }
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>
          <button className={styles.backBtn} onClick={() => navigate("/clientes")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t.clientDetailBack}
          </button>

          {loadingClients ? (
            <p className={styles.emptyState}>…</p>
          ) : !client ? (
            <p className={styles.emptyState}>{t.clientsEmpty}</p>
          ) : (
            <>
              <div className={styles.clientCard}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handlePhotoChange}
                />
                <div className={styles.avatarWrapper}>
                  <button
                    type="button"
                    className={styles.avatarButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label={t.clientDetailChangePhoto}
                  >
                    {client.photo_url ? (
                      <img src={client.photo_url} alt="" className={styles.clientAvatarImg} />
                    ) : (
                      <div className={styles.clientAvatar}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={styles.avatarOverlay}>
                      {uploading ? "…" : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      )}
                    </span>
                  </button>

                  {client.photo_url && (
                    <button
                      type="button"
                      className={styles.deletePhotoBtn}
                      onClick={() => setShowRemoveConfirm(true)}
                      disabled={uploading || removing}
                      aria-label={t.clientDetailRemovePhoto}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" /><path d="M14 11v6" />
                        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className={styles.clientInfo}>
                  <div className={styles.clientNameRow}>
                    <span className={styles.clientName}>{client.name}</span>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => setShowEditModal(true)}
                      aria-label={t.clientDetailEdit}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                  </div>
                  {client.company && <span className={styles.clientCompany}>{client.company}</span>}
                  <span className={styles.clientEmail}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    {client.email}
                  </span>
                  {client.phone && (
                    <span className={styles.clientPhone}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {client.phone}
                    </span>
                  )}
                </div>

                <div className={styles.clientWeeklyHours}>
                  <span className={styles.clientHoursValue}>
                    {formatHours(client.weekly_hours ?? 0)}<span className={styles.clientHoursUnit}>h</span>
                  </span>
                  <span className={styles.clientHoursLabel}>{t.clientsWeekLabel}</span>
                </div>
              </div>

              <div className={styles.projectsSection}>
                <h2 className={styles.projectsTitle}>{t.clientDetailProjectsTitle}</h2>
                <div className={styles.list}>
                  {loadingProjects ? (
                    <p className={styles.emptyState}>…</p>
                  ) : clientProjects.length === 0 ? (
                    <p className={styles.emptyState}>{t.clientDetailNoProjects}</p>
                  ) : (
                    clientProjects.map((p) => {
                      const sc = STATUS_COLORS[p.status] ?? STATUS_COLORS.finished;
                      return (
                        <div key={p.id} className={styles.projectCard}>
                          <div className={styles.projectAvatar}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={styles.projectInfo}>
                            <span className={styles.projectName}>{p.name}</span>
                            <span
                              className={styles.projectStatus}
                              style={{ background: sc.bg, color: sc.color }}
                            >
                              {statusLabels[p.status]}
                            </span>
                          </div>
                          <div className={styles.projectStats}>
                            <span className={styles.projectHoursValue}>
                              {formatHours(p.weekly_hours ?? 0)}
                              <span className={styles.projectHoursUnit}>h</span>
                            </span>
                            <span className={styles.projectHoursLabel}>{t.clientsWeekLabel}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showEditModal && (
        <ClientModal client={client} onClose={() => setShowEditModal(false)} />
      )}

      {showRemoveConfirm && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && !removing && setShowRemoveConfirm(false)}
        >
          <div className={styles.confirmCard}>
            <p className={styles.confirmMsg}>{t.clientDetailRemovePhotoConfirm}</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancelBtn}
                onClick={() => setShowRemoveConfirm(false)}
                disabled={removing}
              >
                {t.clientsCancel}
              </button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={handleRemovePhoto}
                disabled={removing}
              >
                {removing ? "…" : t.clientDetailRemovePhotoConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
