"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  GalleryHorizontalEnd,
  Layers,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Users,
  Shield,
} from "lucide-react";
import { useDemo } from "@/components/DemoProvider";
import { useLang } from "@/lib/useLang";
import Modal from "@/components/Modal";
import {
  getLocalProjects,
  saveLocalProject,
  getProjectProgress,
  type StoredProject,
} from "@/lib/incubatorStorage";
import { createIncubatorProject, getIncubatorProjects } from "@/lib/api";

export default function IncubatorPage() {
  const { user } = useDemo();
  const { t } = useLang();
  const [projects, setProjects] = useState<StoredProject[]>(() =>
    typeof window !== "undefined" ? getLocalProjects() : []
  );
  const [activeTab, setActiveTab] = useState<"all" | "my" | "curator">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating project
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<"idea" | "prototype" | "mvp" | "testing" | "launched">("idea");
  const [teamMembersInput, setTeamMembersInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Background sync with server if available
    getIncubatorProjects()
      .then((remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          // keep synced
        }
      })
      .catch(() => {});
  }, []);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    setFormError("");

    try {
      const teamList = teamMembersInput
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      if (!teamList.includes(user.name)) {
        teamList.unshift(user.name);
      }

      const skillsList = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const newId = `proj_${Date.now()}`;
      const newProj: StoredProject = {
        id: newId,
        title: title.trim(),
        pitch: pitch.trim() || t("incubator.project_pitch"),
        description: description.trim() || t("incubator.project_desc"),
        stage,
        teamMembers: teamList.length > 0 ? teamList : [user.name],
        requiredSkills: skillsList,
        ownerName: user.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissions: {},
        feedbacks: {},
        snapshots: [],
      };

      // Save to local storage immediately
      saveLocalProject(newProj);
      setProjects(getLocalProjects());

      // Attempt server sync
      createIncubatorProject({
        title: newProj.title,
        pitch: newProj.pitch,
        description: newProj.description,
        stage: newProj.stage,
        requiredSkills: newProj.requiredSkills,
      }).catch(() => {});

      // Reset
      setTitle("");
      setPitch("");
      setDescription("");
      setTeamMembersInput("");
      setSkillsInput("");
      setIsCreating(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  const isCurator = user.role === "admin" || user.role === "moderator" || user.username === "shahzod";

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pitch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "my") {
      return (
        p.ownerName.toLowerCase() === user.username.toLowerCase() ||
        p.teamMembers.some((m) => m.toLowerCase().includes(user.name.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div className="page-container" style={{ paddingBottom: 80 }}>
      {/* Hero Banner */}
      <section className="incubator-hero">
        <div className="incubator-hero-top">
          <div>
            <div className="incubator-hero-badge">
              <Rocket size={14} />
              {t("incubator.hero_badge")}
            </div>
            <h1>{t("incubator.hero_title")}</h1>
            <p>{t("incubator.hero_desc")}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/incubator/gallery" className="button button-secondary">
              <GalleryHorizontalEnd size={16} />
              {t("incubator.view_gallery")}
            </Link>
            <button
              className="button button-primary"
              onClick={() => setIsCreating(true)}
              style={{
                background: "linear-gradient(135deg, var(--brand-purple) 0%, var(--brand-purple-dark) 100%)",
                color: "#ffffff",
                padding: "12px 20px",
                boxShadow: "0 8px 24px var(--brand-purple-glow)",
              }}
            >
              <Plus size={18} />
              {t("incubator.create_project")}
            </button>
          </div>
        </div>
      </section>

      {/* Control bar: search & tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className={`button ${activeTab === "all" ? "button-primary" : "button-secondary"}`}
            onClick={() => setActiveTab("all")}
            style={{ fontSize: 13, borderRadius: 999 }}
          >
            <Layers size={15} />
            {t("incubator.all_projects")} ({projects.length})
          </button>
          <button
            className={`button ${activeTab === "my" ? "button-primary" : "button-secondary"}`}
            onClick={() => setActiveTab("my")}
            style={{ fontSize: 13, borderRadius: 999 }}
          >
            <Users size={15} />
            {t("incubator.my_projects")}
          </button>
          {isCurator && (
            <button
              className={`button ${activeTab === "curator" ? "button-primary" : "button-secondary"}`}
              onClick={() => setActiveTab("curator")}
              style={{
                fontSize: 13,
                borderRadius: 999,
                color: activeTab === "curator" ? "#ffffff" : "var(--brand-purple)",
                borderColor: "var(--brand-purple)",
              }}
            >
              <Shield size={15} />
              {t("incubator.moderator_view")}
            </button>
          )}
        </div>

        <div style={{ position: "relative", minWidth: 260 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
            }}
          />
          <input
            type="text"
            placeholder={t("header.search") + "..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              fontSize: 13,
              color: "var(--text)",
            }}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
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
          <h3 style={{ margin: "0 0 6px 0" }}>{t("incubator.empty_projects")}</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 16px 0" }}>
            Startap g&lsquo;oyangizni shakllantirish uchun birinchi loyihani yarating.
          </p>
          <button className="button button-primary" onClick={() => setIsCreating(true)}>
            <Plus size={16} />
            {t("incubator.create_project")}
          </button>
        </div>
      ) : (
        <div className="incubator-grid">
          {filteredProjects.map((project) => {
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
                        color: progress.percentage === 100 ? "var(--brand-mint-dark)" : "var(--brand-purple)",
                      }}
                    >
                      {progress.percentage}%
                    </span>
                  </div>

                  <h3>{project.title}</h3>
                  <p className="incubator-card-pitch">{project.pitch}</p>
                  <p className="incubator-card-desc">{project.description}</p>

                  {/* Progress Bar inside Card */}
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        color: "var(--muted)",
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      <span>{t("incubator.progress_label")}</span>
                      <span>
                        {progress.completed}/6 {t("incubator.status_submitted")}
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.max(5, progress.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Team & Skills */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
                      <strong>{t("incubator.team_members")}:</strong> {project.teamMembers.join(", ")}
                    </div>
                    {project.requiredSkills.length > 0 && (
                      <div className="tag-list" style={{ marginTop: 6 }}>
                        {project.requiredSkills.map((sk) => (
                          <span key={sk} className="tag" style={{ fontSize: 11, padding: "2px 8px" }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
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
                    href={`/incubator/${project.id}`}
                    className="button button-primary"
                    style={{ flex: 1, justifyContent: "center", fontSize: 13 }}
                  >
                    <span>{t("incubator.action_start")}</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href={`/incubator/${project.id}/one-pager`}
                    className="button button-secondary"
                    title={t("incubator.one_pager_btn")}
                    style={{ padding: "0 12px", color: "var(--brand-purple)" }}
                  >
                    <FileText size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreating && (
        <Modal
          title={t("incubator.create_project")}
          description="Yangi startap loyihangizni ro'yxatdan o'tkazing va modullarni boshlang."
          onClose={() => setIsCreating(false)}
        >
          <form className="stack-form" onSubmit={handleCreateProject}>
            <label className="field">
              <span>{t("incubator.project_name")} *</span>
              <input
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="masalan: EcoDrop AI yoki CodeFlow"
              />
            </label>

            <label className="field">
              <span>{t("incubator.project_pitch")}</span>
              <input
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="masalan: Qisqa 1 qatorlik ta'sirchan shior"
              />
            </label>

            <label className="field">
              <span>{t("incubator.project_desc")}</span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Loyiha maqsadi va asosiy g'oyasi haqida qisqacha yozing…"
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label className="field">
                <span>{t("incubator.project_stage")}</span>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as StoredProject["stage"])}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  <option value="idea">{t("incubator.stage_idea")}</option>
                  <option value="prototype">{t("incubator.stage_prototype")}</option>
                  <option value="mvp">{t("incubator.stage_mvp")}</option>
                  <option value="testing">{t("incubator.stage_testing")}</option>
                  <option value="launched">{t("incubator.stage_launched")}</option>
                </select>
              </label>

              <label className="field">
                <span>{t("incubator.team_members")}</span>
                <input
                  value={teamMembersInput}
                  onChange={(e) => setTeamMembersInput(e.target.value)}
                  placeholder="masalan: Aziz, Malika, Jasur"
                />
              </label>
            </div>

            <label className="field">
              <span>{t("incubator.required_skills")}</span>
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="masalan: Frontend, Python, UI / UX"
              />
            </label>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setIsCreating(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={!title.trim() || submitting}
              >
                <Plus size={16} />
                {submitting ? t("common.saving") : t("incubator.create_project")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
