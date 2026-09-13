"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  History,
  Printer,
} from "lucide-react";
import { useLang } from "@/lib/useLang";
import { INCUBATOR_MODULES } from "@/lib/incubator";
import {
  getLocalProjectById,
  saveLocalSnapshot,
  getProjectProgress,
  type StoredProject,
} from "@/lib/incubatorStorage";

export default function OnePagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const { t } = useLang();

  const [project, setProject] = useState<StoredProject | null>(() => {
    if (typeof window !== "undefined") {
      return getLocalProjectById(projectId) || null;
    }
    return null;
  });
  const [snapshotSaved, setSnapshotSaved] = useState(false);
  const [snapshotVersionInput, setSnapshotVersionInput] = useState("");
  const [showSnapshotsList, setShowSnapshotsList] = useState(false);

  if (!project) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Loyiha topilmadi</h2>
        <Link href="/incubator" className="button button-primary">
          <ArrowLeft size={16} />
          {t("incubator.back_to_projects")}
        </Link>
      </div>
    );
  }

  const progress = getProjectProgress(project);

  function handlePrint() {
    window.print();
  }

  function handleSaveSnapshot() {
    if (!project) return;
    saveLocalSnapshot(projectId, snapshotVersionInput.trim());
    const updated = getLocalProjectById(projectId);
    if (updated) setProject(updated);
    setSnapshotSaved(true);
    setSnapshotVersionInput("");
    setTimeout(() => setSnapshotSaved(false), 3000);
  }

  return (
    <div className="page-container" style={{ paddingBottom: 80 }}>
      {/* Top Action Bar (Hidden on Print) */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <Link
          href={`/incubator/${projectId}`}
          className="button button-secondary"
          style={{ fontSize: 13, gap: 6 }}
        >
          <ArrowLeft size={15} />
          {t("incubator.back_to_workspace")}
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {snapshotSaved && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--brand-mint-dark)",
                background: "var(--brand-mint-subtle)",
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <CheckCircle2 size={15} />
              {t("onepager.snapshot_saved")}
            </span>
          )}

          <button
            className="button button-secondary"
            onClick={() => setShowSnapshotsList(!showSnapshotsList)}
            style={{ fontSize: 13 }}
          >
            <History size={15} />
            {t("onepager.historical_snapshots")} ({project.snapshots.length})
          </button>

          <button
            className="button button-secondary"
            onClick={handleSaveSnapshot}
            style={{ fontSize: 13 }}
          >
            <Camera size={15} />
            {t("onepager.save_snapshot")}
          </button>

          <button
            className="button button-primary"
            onClick={handlePrint}
            style={{
              background: "linear-gradient(135deg, var(--brand-purple) 0%, var(--brand-purple-dark) 100%)",
              color: "#ffffff",
              boxShadow: "0 6px 20px var(--brand-purple-glow)",
              fontSize: 13,
            }}
          >
            <Printer size={16} />
            {t("onepager.print_pdf")}
          </button>
        </div>
      </div>

      {/* Snapshots History Accordion (Hidden on Print) */}
      {showSnapshotsList && (
        <div
          className="no-print"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 18,
            marginBottom: 24,
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontFamily: "var(--font-display)" }}>
            {t("onepager.historical_snapshots")}
          </h4>
          {project.snapshots.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              Hozircha birorta snapshot saqlanmagan. &quot;Save snapshot&quot; tugmasi orqali joriy holatni muzlatib qo&apos;yishingiz mumkin.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {project.snapshots.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "8px 12px",
                    background: "var(--surface-secondary)",
                    borderRadius: 8,
                  }}
                >
                  <strong>{s.versionName}</strong>
                  <span style={{ color: "var(--muted)" }}>
                    {new Date(s.createdAt).toLocaleString("uz-UZ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Official One-Pager Document (A4 Print Ready) */}
      <article className="onepager-document">
        {/* Document Header */}
        <header className="onepager-header">
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--brand-purple)",
                display: "block",
                marginBottom: 6,
              }}
            >
              {t("onepager.school21_certified")}
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                fontWeight: 800,
                margin: "0 0 8px 0",
                color: "var(--text)",
              }}
            >
              {project.title}
            </h1>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--brand-purple)",
                margin: "0 0 10px 0",
                lineHeight: 1.4,
              }}
            >
              {project.pitch}
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, maxWidth: 650, lineHeight: 1.5 }}>
              {project.description}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span className={`incubator-stage-pill stage-${project.stage}`} style={{ fontSize: 12 }}>
              {t(`incubator.stage_${project.stage}`)}
            </span>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--brand-mint-dark)",
                marginTop: 8,
              }}
            >
              {progress.completed}/6 Modullar to&apos;ldirildi ({progress.percentage}%)
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Yangilangan: {new Date(project.updatedAt).toLocaleDateString("uz-UZ")}
            </div>
          </div>
        </header>

        {/* Team & Meta Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            background: "var(--surface-secondary)",
            padding: "14px 20px",
            borderRadius: 12,
            marginBottom: 28,
            fontSize: 13,
          }}
        >
          <div>
            <span style={{ color: "var(--muted)", marginRight: 6 }}>
              <strong>{t("incubator.team_members")}:</strong>
            </span>
            <span>{project.teamMembers.join(", ")}</span>
          </div>
          {project.requiredSkills.length > 0 && (
            <div>
              <span style={{ color: "var(--muted)", marginRight: 6 }}>
                <strong>{t("incubator.required_skills")}:</strong>
              </span>
              <span>{project.requiredSkills.join(", ")}</span>
            </div>
          )}
        </div>

        {/* 6 Sequential Modules Grid (Critical Tournament Rule: Honest Empty Sections if not filled) */}
        <div className="onepager-grid">
          {INCUBATOR_MODULES.map((mod) => {
            const submission = project.submissions[mod.id];
            const hasSubmission = !!submission && Object.keys(submission.answers || {}).length > 0;
            const answers = submission?.answers || {};

            return (
              <section key={mod.id} className="onepager-section">
                <h4>
                  <span>#{mod.order}</span>
                  <span>{t(mod.titleKey)}</span>
                </h4>

                {!hasSubmission ? (
                  /* Critical check: honestly display empty section without breaking layout */
                  <div className="onepager-empty-note">
                    <span style={{ display: "block", marginBottom: 4, color: "var(--muted)" }}>
                      ⚠️ {t("onepager.empty_module")}
                    </span>
                    <Link
                      href={`/incubator/${project.id}/module/${mod.id}`}
                      className="no-print"
                      style={{ fontSize: 12, color: "var(--brand-purple)", textDecoration: "underline" }}
                    >
                      Topshiriqni to&apos;ldirish ➔
                    </Link>
                  </div>
                ) : (
                  <div>
                    {mod.fields.map((field) => {
                      const answerVal = answers[field.id];
                      return (
                        <div key={field.id} className="onepager-item">
                          <div className="onepager-item-label">{t(field.labelKey)}</div>
                          <div className="onepager-item-value">
                            {answerVal && answerVal.trim() ? (
                              answerVal
                            ) : (
                              <span style={{ color: "var(--muted)", fontStyle: "italic" }}>
                                To&apos;ldirilmagan
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer info on document */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 20,
            marginTop: 36,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          <span>School 21 · Launch Lab 21 Inkubatori</span>
          <span>Hujjat avtomatik tarzda modul javoblaridan yig‘ilgan</span>
        </footer>
      </article>
    </div>
  );
}
