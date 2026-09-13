"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Send,
} from "lucide-react";
import { useDemo } from "@/components/DemoProvider";
import { useLang } from "@/lib/useLang";
import { getModuleConfig, INCUBATOR_MODULES } from "@/lib/incubator";
import {
  getLocalProjectById,
  saveLocalModuleAnswer,
  addLocalFeedback,
  type StoredProject,
} from "@/lib/incubatorStorage";
import { saveModuleSubmission, addModuleFeedback } from "@/lib/api";

export default function ModuleAssignmentPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id: projectId, moduleId } = use(params);
  const router = useRouter();
  const { user } = useDemo();
  const { t } = useLang();

  const moduleConfig = getModuleConfig(moduleId);

  const [project, setProject] = useState<StoredProject | null>(() => {
    if (typeof window !== "undefined") {
      return getLocalProjectById(projectId) || null;
    }
    return null;
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const proj = getLocalProjectById(projectId);
      return proj?.submissions[moduleId]?.answers || {};
    }
    return {};
  });
  const [submissionStatus, setSubmissionStatus] = useState<"draft" | "submitted" | null>(() => {
    if (typeof window !== "undefined") {
      const proj = getLocalProjectById(projectId);
      return proj?.submissions[moduleId]?.status || null;
    }
    return null;
  });
  const [version, setVersion] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const proj = getLocalProjectById(projectId);
      return proj?.submissions[moduleId]?.version || 1;
    }
    return 1;
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function handleBackClick(e: React.MouseEvent) {
    if (!dirty) return;
    if (!window.confirm(t("incubator.unsaved_changes_confirm"))) {
      e.preventDefault();
    }
  }

  // Moderator feedback form
  const [feedbackInput, setFeedbackInput] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);

  if (!moduleConfig) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Noma&apos;lum modul</h2>
        <Link href={`/incubator/${projectId}`} className="button button-primary">
          <ArrowLeft size={16} />
          {t("incubator.back_to_workspace")}
        </Link>
      </div>
    );
  }

  function handleFieldChange(fieldId: string, val: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    setSaveStatus("idle");
    setDirty(true);
  }

  async function handleSave(statusToSave: "draft" | "submitted") {
    if (!project) return;
    setSaveStatus("saving");
    setStatusMessage(t("incubator.saving"));

    try {
      // 1. Immediate LocalStorage persistence (guarantees offline & reload survival)
      const updatedProj = saveLocalModuleAnswer(projectId, moduleId, answers, statusToSave);
      setProject(updatedProj);
      setSubmissionStatus(statusToSave);
      const newVer = updatedProj.submissions[moduleId]?.version || version + 1;
      setVersion(newVer);
      setDirty(false);

      // 2. Background DB persistence if online
      saveModuleSubmission(projectId, moduleId, answers, statusToSave, version).catch(() => {});

      setSaveStatus("saved");
      setStatusMessage(
        statusToSave === "submitted"
          ? t("incubator.submit_success")
          : t("incubator.saved_success")
      );

      // Auto clear saved toast after 3s
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (err: unknown) {
      setSaveStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Xatolik yuz berdi");
    }
  }

  async function handleSendFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackInput.trim() || feedbackSending || !project) return;
    setFeedbackSending(true);

    try {
      addLocalFeedback(projectId, moduleId, user.name, feedbackInput.trim());
      addModuleFeedback(projectId, moduleId, feedbackInput.trim()).catch(() => {});

      // Refresh project state
      const updated = getLocalProjectById(projectId);
      if (updated) setProject(updated);
      setFeedbackInput("");
    } catch {
    } finally {
      setFeedbackSending(false);
    }
  }

  const isCurator =
    user.role === "admin" || user.role === "moderator" || user.username === "shahzod";
  const currentFeedbacks = project?.feedbacks[moduleId] || [];

  // Find next module in sequence
  const currentModIndex = INCUBATOR_MODULES.findIndex((m) => m.id === moduleId);
  const nextMod = INCUBATOR_MODULES[currentModIndex + 1];

  return (
    <div className="page-container module-workspace-container">
      {/* Top Bar */}
      <div
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
          onClick={handleBackClick}
        >
          <ArrowLeft size={15} />
          {t("incubator.back_to_workspace")}
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saveStatus === "saved" && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--brand-mint-dark)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--brand-mint-subtle)",
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <Check size={15} />
              {statusMessage}
            </span>
          )}
          <Link
            href={`/incubator/${projectId}/one-pager`}
            className="button button-secondary"
            style={{ fontSize: 13, color: "var(--brand-purple)" }}
          >
            <FileText size={15} />
            {t("incubator.one_pager_btn")}
          </Link>
        </div>
      </div>

      {/* Module Title Banner */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "28px 32px",
          marginBottom: 26,
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--brand-purple)",
                display: "block",
                marginBottom: 6,
              }}
            >
              {project?.title} · Modul #{moduleConfig.order}
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 8px 0" }}>
              {t(moduleConfig.titleKey)}
            </h1>
            <p style={{ fontSize: 15, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {t(moduleConfig.descKey)}
            </p>
          </div>

          <span
            className={`module-step-badge ${
              submissionStatus === "submitted"
                ? "module-badge-submitted"
                : submissionStatus === "draft"
                ? "module-badge-draft"
                : "module-badge-not-started"
            }`}
          >
            {submissionStatus === "submitted" ? (
              <>
                <CheckCircle2 size={13} />
                {t("incubator.status_submitted")}
              </>
            ) : submissionStatus === "draft" ? (
              <>
                <Clock size={13} />
                {t("incubator.status_draft")}
              </>
            ) : (
              t("incubator.status_not_started")
            )}
          </span>
        </div>
      </section>

      {/* Structured Fields Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave("submitted");
        }}
      >
        {moduleConfig.fields.map((field) => {
          const value = answers[field.id] || "";
          return (
            <div key={field.id} className="module-form-field">
              <label htmlFor={`field-${field.id}`}>
                {t(field.labelKey)} {field.required && <span style={{ color: "var(--brand-purple)" }}>*</span>}
              </label>

              <div className="field-help-text">{t(field.helpKey)}</div>

              {/* Real Example Helper Box */}
              <div className="example-box">
                <strong>Namuna:</strong> {t(field.exampleKey)}
              </div>

              <textarea
                id={`field-${field.id}`}
                className="module-textarea"
                required={field.required}
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={t(field.placeholderKey)}
              />
            </div>
          );
        })}

        {/* Action Buttons Bar */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            boxShadow: "var(--shadow)",
          }}
        >
          <button
            type="button"
            className="button button-secondary"
            onClick={() => handleSave("draft")}
            disabled={saveStatus === "saving"}
            style={{ fontSize: 13 }}
          >
            <Clock size={15} />
            {t("incubator.action_save_draft")}
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              className="button button-primary"
              disabled={saveStatus === "saving"}
              style={{
                background: "linear-gradient(135deg, var(--brand-mint) 0%, var(--brand-mint-dark) 100%)",
                color: "#ffffff",
                boxShadow: "0 6px 20px var(--brand-mint-glow)",
                fontSize: 13,
              }}
            >
              <CheckCircle2 size={16} />
              {saveStatus === "saving" ? t("incubator.saving") : t("incubator.action_submit")}
            </button>

            {nextMod && (
              <button
                type="button"
                className="button button-secondary"
                onClick={async () => {
                  await handleSave("submitted");
                  router.push(`/incubator/${projectId}/module/${nextMod.id}`);
                }}
                style={{ fontSize: 13 }}
              >
                <span>Keyingi modul</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Mentor & Moderator Feedback Section */}
      <section style={{ marginTop: 40 }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MessageSquare size={18} color="var(--brand-purple)" />
          {t("incubator.mentor_feedback")}
        </h3>

        {currentFeedbacks.length === 0 ? (
          <div
            style={{
              padding: "20px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            {t("incubator.no_feedback")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {currentFeedbacks.map((fb) => (
              <div
                key={fb.id}
                style={{
                  padding: "16px 20px",
                  background: "var(--surface)",
                  borderLeft: "4px solid var(--brand-purple)",
                  border: "1px solid var(--border)",
                  borderRadius: "0 12px 12px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--brand-purple)",
                    marginBottom: 6,
                  }}
                >
                  <span>{fb.author}</span>
                  <span style={{ fontWeight: 400, color: "var(--muted)" }}>
                    {new Date(fb.createdAt).toLocaleTimeString("uz-UZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text)" }}>
                  {fb.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Curator Feedback Input */}
        {isCurator && (
          <form onSubmit={handleSendFeedback} style={{ marginTop: 18 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder={t("incubator.feedback_placeholder")}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
              <button
                type="submit"
                className="button button-primary"
                disabled={!feedbackInput.trim() || feedbackSending}
                style={{ fontSize: 13 }}
              >
                <Send size={15} />
                {t("incubator.feedback_send")}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
