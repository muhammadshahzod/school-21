"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  MessageSquare,
  Play,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useLang } from "@/lib/useLang";
import { INCUBATOR_MODULES } from "@/lib/incubator";
import {
  getLocalProjectById,
  saveLocalProject,
  getProjectProgress,
  type StoredProject,
} from "@/lib/incubatorStorage";
import { getIncubatorProject } from "@/lib/api";
import Modal from "@/components/Modal";

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLang();

  const [project, setProject] = useState<StoredProject | null>(() => {
    if (typeof window !== "undefined") {
      return getLocalProjectById(id) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !getLocalProjectById(id);
    }
    return true;
  });
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");

  useEffect(() => {
    let isMounted = true;
    getIncubatorProject(id)
      .then((remote) => {
        if (isMounted && remote && remote.id) {
          // If remote had updates, sync them
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ color: "var(--muted)" }}>{t("common.saving")}…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Loyiha topilmadi</h2>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>
          Bunday identifikatorli loyiha mavjud emas yoki o&apos;chirilgan.
        </p>
        <Link href="/incubator" className="button button-primary">
          <ArrowLeft size={16} />
          {t("incubator.back_to_projects")}
        </Link>
      </div>
    );
  }

  const progress = getProjectProgress(project);

  function handleInvitePeer(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteName.trim() || !project) return;
    const updatedMembers = [...new Set([...project.teamMembers, inviteName.trim()])];
    const updated = { ...project, teamMembers: updatedMembers };
    saveLocalProject(updated);
    setProject(updated);
    setInviteName("");
    setInviteModalOpen(false);
  }

  return (
    <div className="page-container" style={{ paddingBottom: 80 }}>
      {/* Top breadcrumb & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <Link
          href="/incubator"
          className="button button-secondary"
          style={{ fontSize: 13, gap: 6 }}
        >
          <ArrowLeft size={15} />
          {t("incubator.back_to_projects")}
        </Link>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href={`/incubator/${project.id}/one-pager`}
            className="button button-primary"
            style={{
              background: "linear-gradient(135deg, var(--brand-purple) 0%, var(--brand-purple-dark) 100%)",
              color: "#ffffff",
              boxShadow: "0 8px 24px var(--brand-purple-glow)",
              fontSize: 13,
            }}
          >
            <FileText size={16} />
            {t("incubator.one_pager_btn")}
          </Link>
        </div>
      </div>

      {/* Project Identity Header */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "28px 32px",
          marginBottom: 24,
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: 0 }}>
                {project.title}
              </h1>
              <span className={`incubator-stage-pill stage-${project.stage}`}>
                {t(`incubator.stage_${project.stage}`)}
              </span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--brand-purple)", margin: "0 0 10px 0" }}>
              {project.pitch}
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, maxWidth: 740, lineHeight: 1.6 }}>
              {project.description}
            </p>
          </div>

          <button
            className="button button-secondary"
            onClick={() => setInviteModalOpen(true)}
            style={{ fontSize: 13 }}
          >
            <UserPlus size={15} />
            {t("incubator.invite_member")}
          </button>
        </div>

        {/* Team & Skills line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
            marginTop: 20,
            fontSize: 13,
          }}
        >
          <div>
            <span style={{ color: "var(--muted)", marginRight: 6 }}>{t("incubator.team_members")}:</span>
            <strong>{project.teamMembers.join(", ")}</strong>
          </div>
          {project.requiredSkills.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--muted)" }}>{t("incubator.required_skills")}:</span>
              {project.requiredSkills.map((sk) => (
                <span key={sk} className="tag" style={{ fontSize: 11, padding: "2px 8px" }}>
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Progress Panel (Strict Tournament MVP Requirement: "2/6 bajarildi · 4 ta qoldi · 33%") */}
      <section className="incubator-progress-panel">
        <div className="progress-header">
          <span className="progress-title">{t("incubator.progress_label")}</span>
          <span className="progress-summary-pill">{progress.statusText}</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.max(5, progress.percentage)}%` }}
          />
        </div>
      </section>

      {/* Modules Sequence Section (6 sequential modules, shows completed, current and next) */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 6px 0" }}>
          {t("incubator.module_sequence")}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
          Har bir modul topshirig‘ini ketma-ket bajaring. Saqlangan javoblar avtomatik tarzda loyihaning One-Pager taqdimotiga qo‘shiladi.
        </p>
      </div>

      <div className="modules-sequence-grid">
        {INCUBATOR_MODULES.map((mod) => {
          const submission = project.submissions[mod.id];
          const isSubmitted = submission?.status === "submitted";
          const isDraft = submission?.status === "draft";
          const isCurrent = progress.currentModuleId === mod.id;
          const feedbacksCount = project.feedbacks[mod.id]?.length || 0;

          let cardClass = "module-step-card";
          if (isSubmitted) cardClass += " status-submitted";
          else if (isCurrent) cardClass += " status-current";

          return (
            <div key={mod.id} className={cardClass}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span
                    className={`module-step-badge ${
                      isSubmitted
                        ? "module-badge-submitted"
                        : isCurrent
                        ? "module-badge-current"
                        : isDraft
                        ? "module-badge-draft"
                        : "module-badge-not-started"
                    }`}
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle2 size={13} />
                        {t("incubator.status_submitted")}
                      </>
                    ) : isCurrent ? (
                      <>
                        <Sparkles size={13} />
                        {t("incubator.status_current")}
                      </>
                    ) : isDraft ? (
                      <>
                        <Clock size={13} />
                        {t("incubator.status_draft")}
                      </>
                    ) : (
                      t("incubator.status_not_started")
                    )}
                  </span>

                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>
                    #{mod.order}
                  </span>
                </div>

                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, margin: "0 0 6px 0" }}>
                  {t(mod.titleKey)}
                </h3>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                  {t(mod.descKey)}
                </p>

                {feedbacksCount > 0 && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--brand-purple)",
                      background: "var(--brand-purple-subtle)",
                      padding: "4px 10px",
                      borderRadius: 8,
                      marginBottom: 14,
                    }}
                  >
                    <MessageSquare size={13} />
                    <span>{feedbacksCount} ta moderator fikri</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 12 }}>
                <Link
                  href={`/incubator/${project.id}/module/${mod.id}`}
                  className={`button ${isCurrent ? "button-primary" : "button-secondary"}`}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    fontSize: 13,
                    ...(isCurrent && {
                      background: "var(--brand-purple)",
                      color: "#ffffff",
                    }),
                  }}
                >
                  {isSubmitted ? (
                    <>
                      <Edit3 size={15} />
                      {t("incubator.action_edit")}
                    </>
                  ) : isCurrent ? (
                    <>
                      <Play size={15} />
                      {t("incubator.action_continue")}
                    </>
                  ) : (
                    <>
                      <span>{t("incubator.action_start")}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <Modal
          title={t("incubator.invite_member")}
          description="Loyihaga birga ishlaydigan yangi pir yoki do'stingizni taklif qiling."
          onClose={() => setInviteModalOpen(false)}
        >
          <form className="stack-form" onSubmit={handleInvitePeer}>
            <label className="field">
              <span>Ism yoki login *</span>
              <input
                autoFocus
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="masalan: Malika yoki @malika"
              />
            </label>
            <div className="modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setInviteModalOpen(false)}
              >
                {t("common.cancel")}
              </button>
              <button type="submit" className="button button-primary" disabled={!inviteName.trim()}>
                <UserPlus size={16} />
                Qo&apos;shish
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
