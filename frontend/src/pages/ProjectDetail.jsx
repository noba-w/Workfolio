import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { getProjects, getClients, getTimeEntries, updateProject, deleteProjectPhoto } from "../lib/api";
import { resizeImageToDataUrl } from "../lib/image";
import Layout from "../components/Layout";
import ProjectModal from "../components/ProjectModal";
import AvatarPickerModal from "../components/AvatarPickerModal";
import WeekHoursChart from "../components/WeekHoursChart";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectActivityList from "../components/ProjectActivityList";
import TimeEntryModal from "../components/TimeEntryModal";
import styles from "./ProjectDetail.module.css";

const STATUS_COLORS = {
  active:   { bg: "#dcfce7", color: "#16a34a" },
  paused:   { bg: "#fef3c7", color: "#d97706" },
  finished: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function ProjectDetail() {
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
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showTimeEntry, setShowTimeEntry] = useState(false);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(session.access_token),
    enabled: !!session?.access_token,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(session.access_token),
    enabled: !!session?.access_token,
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["time-entries", id],
    queryFn: () => getTimeEntries(id, session.access_token),
    enabled: !!session?.access_token,
  });

  const project = projects.find((p) => p.id === id);
  const client = clients.find((c) => c.id === project?.client_id);
  const totalHours = timeEntries.reduce((sum, e) => sum + Number(e.hours), 0);

  const statusLabels = {
    active:   t.statusActive,
    paused:   t.statusPaused,
    finished: t.statusFinished,
  };

  function formatHours(h) {
    if (h === 0) return "0";
    return Number.isInteger(h) ? String(h) : h.toFixed(1);
  }

  async function savePhoto(photo_url) {
    await updateProject(id, { photo_url }, session.access_token);
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const photo_url = await resizeImageToDataUrl(file);
      await savePhoto(photo_url);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    setRemoving(true);
    try {
      await deleteProjectPhoto(id, session.access_token);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    } finally {
      setRemoving(false);
      setShowRemoveConfirm(false);
    }
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>
          <button className={styles.backBtn} onClick={() => navigate("/proyectos")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t.projectDetailBack}
          </button>

          {loadingProjects ? (
            <p className={styles.emptyState}>…</p>
          ) : !project ? (
            <p className={styles.emptyState}>{t.projectsEmpty}</p>
          ) : (
            <>
              <div className={styles.projectCard}>
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
                    onClick={() => setShowAvatarPicker(true)}
                    disabled={uploading}
                    aria-label={t.projectDetailChangePhoto}
                  >
                    {project.photo_url ? (
                      <img src={project.photo_url} alt="" className={styles.projectAvatarImg} />
                    ) : (
                      <div className={styles.projectAvatar}>
                        {project.name.charAt(0).toUpperCase()}
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

                  {project.photo_url && (
                    <button
                      type="button"
                      className={styles.deletePhotoBtn}
                      onClick={() => setShowRemoveConfirm(true)}
                      disabled={uploading || removing}
                      aria-label={t.projectDetailRemovePhoto}
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

                <div className={styles.projectInfo}>
                  <div className={styles.projectNameRow}>
                    <span className={styles.projectName}>{project.name}</span>
                    <span
                      className={styles.projectStatus}
                      style={{ background: STATUS_COLORS[project.status]?.bg, color: STATUS_COLORS[project.status]?.color }}
                    >
                      {statusLabels[project.status]}
                    </span>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => setShowEditModal(true)}
                      aria-label={t.projectDetailEdit}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                  </div>
                  {client && (
                    <span className={styles.projectClient}>
                      {t.projectDetailClient}: {client.name}
                    </span>
                  )}
                  <span className={styles.projectRate}>
                    {t.projectDetailRate}: {project.hourly_rate}€/h
                  </span>
                  <p className={styles.projectDescription}>
                    {project.description || t.projectDetailNoDescription}
                  </p>
                  <span className={styles.projectTotalHours}>
                    {t.projectDetailTotalHours}: {formatHours(totalHours)}h
                  </span>
                </div>

                <div className={styles.projectWeeklyHours}>
                  <span className={styles.projectHoursValue}>
                    {formatHours(project.weekly_hours ?? 0)}<span className={styles.projectHoursUnit}>h</span>
                  </span>
                  <span className={styles.projectHoursLabel}>{t.clientsWeekLabel}</span>
                </div>
              </div>

              <div className={styles.chartSection}>
                <div className={styles.chartCol}>
                  <WeekHoursChart projectId={project.id} active={true} />
                  <ProjectActivityList projectId={project.id} active={true} />
                </div>
                <div className={styles.chartCol}>
                  <ProjectCalendar projectId={project.id} active={true} />
                </div>
              </div>

              <button
                type="button"
                className={styles.fab}
                onClick={() => setShowTimeEntry(true)}
                aria-label={t.clientDetailAddHours}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {showTimeEntry && (
        <TimeEntryModal project={project} onClose={() => setShowTimeEntry(false)} />
      )}

      {showEditModal && (
        <ProjectModal project={project} clients={clients} onClose={() => setShowEditModal(false)} />
      )}

      {showAvatarPicker && (
        <AvatarPickerModal
          onClose={() => setShowAvatarPicker(false)}
          onChooseFile={() => {
            setShowAvatarPicker(false);
            fileInputRef.current?.click();
          }}
          onSelectAvatar={async (url) => {
            await savePhoto(url);
            setShowAvatarPicker(false);
          }}
        />
      )}

      {showRemoveConfirm && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && !removing && setShowRemoveConfirm(false)}
        >
          <div className={styles.confirmCard}>
            <p className={styles.confirmMsg}>{t.projectDetailRemovePhotoConfirm}</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancelBtn}
                onClick={() => setShowRemoveConfirm(false)}
                disabled={removing}
              >
                {t.projectsCancel}
              </button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={handleRemovePhoto}
                disabled={removing}
              >
                {removing ? "…" : t.projectDetailRemovePhotoConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
