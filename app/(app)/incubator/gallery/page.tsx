"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Sparkles, Users } from "lucide-react";
import { useLang } from "@/lib/useLang";
import { INCUBATOR_MODULES } from "@/lib/incubator";
import {
  getLocalProjects,
  getProjectProgress,
  type StoredProject,
} from "@/lib/incubatorStorage";

function previewSnippet(project: StoredProject, t: (key: string) => string): string {
  for (const mod of INCUBATOR_MODULES) {
    const sub = project.submissions[mod.id];
    if (sub?.status === "submitted") {
      const firstField = mod.fields[0];
      const answer = sub.answers[firstField.id];
      if (answer?.trim()) return answer;
    }
  }
  return t("incubator.gallery_not_started");
}

export default function IncubatorGalleryPage() {
  const { t } = useLang();
  const [projects] = useState<StoredProject[]>(() =>
    typeof window !== "undefined" ? getLocalProjects() : [],
  );

  return (
    <div className="page-container" style={{ paddingBottom: 80 }}>
      <section className="incubator-hero">
        <div className="incubator-hero-top">
          <div>
            <div className="incubator-hero-badge">
              <Sparkles size={14} />
              {t("incubator.hero_badge")}
            </div>
            <h1>{t("incubator.gallery_title")}</h1>
            <p>{t("incubator.gallery_subtitle")}</p>
          </div>
          <Link href="/incubator" className="button button-secondary">
            <ArrowLeft size={16} />
            {t("incubator.back_to_projects")}
          </Link>
        </div>
      </section>

      {projects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: 16,
          }}
        >
          <Sparkles size={36} color="var(--brand-purple)" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: 0 }}>{t("incubator.gallery_empty")}</h3>
        </div>
      ) : (
        <div className="incubator-grid">
          {projects.map((project) => {
            const progress = getProjectProgress(project);
            return (
              <div key={project.id} className="incubator-card">
                <div>
                  <div className="incubator-card-top">
                    <span className={`incubator-stage-pill stage-${project.stage}`}>
                      {t(`incubator.stage_${project.stage}`)}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                          progress.percentage === 100
                            ? "var(--brand-mint-dark)"
                            : "var(--brand-purple)",
                      }}
                    >
                      {progress.percentage}%
                    </span>
                  </div>

                  <h3>{project.title}</h3>
                  <p className="incubator-card-pitch">{project.pitch}</p>
                  <p className="incubator-card-desc">
                    “{previewSnippet(project, t)}”
                  </p>

                  <div style={{ marginBottom: 16 }}>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.max(5, progress.percentage)}%` }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>
                    <Users size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
                    {project.teamMembers.join(", ")}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    borderTop: "1px solid var(--border)",
                    paddingTop: 14,
                    marginTop: 8,
                  }}
                >
                  <Link
                    href={`/incubator/${project.id}/one-pager`}
                    className="button button-primary"
                    style={{ flex: 1, justifyContent: "center", fontSize: 13 }}
                  >
                    <FileText size={15} />
                    <span>{t("incubator.gallery_view_onepager")}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
