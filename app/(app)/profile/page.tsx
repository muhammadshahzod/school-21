"use client";

import {
  ArrowUpRight,
  Bookmark,
  Code2,
  Grid2X2,
  KeyRound,
  MapPin,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import Avatar from "@/components/Avatar";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import CreatePostModal from "@/components/CreatePostModal";
import EditProfileModal from "@/components/EditProfileModal";
import PostCard from "@/components/PostCard";
import { useDemo } from "@/components/DemoProvider";
import { useLang } from "@/lib/useLang";

export default function ProfilePage() {
  const { user, posts } = useDemo();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [notice, setNotice] = useState("");
  const myPosts = posts.filter((post) => post.author.id === user.id);
  const displayed =
    tab === "posts" ? myPosts : posts.filter((post) => post.saved);
  return (
    <div className="page-container profile-page">
      <div className="profile-cover">
        <span className="eyebrow">{t("profile.eyebrow")}</span>
        <div className="profile-cover-copy">
          {t("profile.cover_line1")}
          <br />
          <span>{t("profile.cover_line2")}</span>
        </div>
        <span className="profile-cover-number" aria-hidden="true">
          21<span>↗</span>
        </span>
        <div className="profile-cover-footer">
          <span>{t("profile.cover_footer_left")}</span>
          <span>{t("profile.cover_footer_right")}</span>
        </div>
      </div>
      <section className="profile-details">
        <div className="profile-topline">
          <Avatar user={user} size="xl" />
          <div className="profile-topline-actions">
            <button
              className="button button-secondary"
              onClick={() => setEditing(true)}
            >
              <Pencil size={16} />
              {t("profile.edit")}
            </button>
            <button
              className="button button-secondary"
              onClick={() => setChangingPassword(true)}
            >
              <KeyRound size={16} />
              {t("profile.change_password")}
            </button>
          </div>
        </div>
        <div className="profile-identity">
          <div>
            <div className="profile-name-line">
              <h1>{user.name}</h1>
              <span className="tag">Peer</span>
              {user.openToProjects && (
                <span className="open-to-projects-badge">
                  <span className="dot" />
                  {t("profile.open_status_active")}
                </span>
              )}
            </div>
            <p className="profile-handle">
              @{user.username}
              <span>·</span>
              <MapPin size={14} />
              {t("profile.location")}
            </p>
            <p className="profile-bio">{user.bio}</p>
            <div className="tag-list">
              {user.skills.map((skill) => (
                <span className="tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="profile-stats">
            <div>
              <strong>{myPosts.length.toString().padStart(2, "0")}</strong>
              <span>{t("profile.posts_stat")}</span>
            </div>
            <div>
              <strong>{user.skills.length.toString().padStart(2, "0")}</strong>
              <span>{t("profile.skills_stat")}</span>
            </div>
            <div>
              <strong>01</strong>
              <span>{t("profile.project_stat")}</span>
            </div>
          </div>
        </div>
      </section>
      {notice && (
        <div className="inline-notice" role="status">
          {notice}
          <button
            className="icon-button small-icon"
            onClick={() => setNotice("")}
            aria-label={t("profile.dismiss_notice")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="profile-content">
        <div className="profile-posts">
          <div
            className="profile-tabs"
            role="tablist"
            aria-label={t("profile.tabs_aria")}
          >
            <button
              id="my-posts-tab"
              role="tab"
              aria-selected={tab === "posts"}
              aria-controls="profile-post-panel"
              className={tab === "posts" ? "selected" : ""}
              onClick={() => setTab("posts")}
            >
              <Grid2X2 size={17} />
              {t("profile.posts_tab")}
              <span>{myPosts.length}</span>
            </button>
            <button
              id="saved-posts-tab"
              role="tab"
              aria-selected={tab === "saved"}
              aria-controls="profile-post-panel"
              className={tab === "saved" ? "selected" : ""}
              onClick={() => setTab("saved")}
            >
              <Bookmark size={17} />
              {t("profile.saved_tab")}
            </button>
          </div>
          <div
            id="profile-post-panel"
            role="tabpanel"
            aria-labelledby={
              tab === "posts" ? "my-posts-tab" : "saved-posts-tab"
            }
            className="post-list"
          >
            {displayed.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {displayed.length === 0 && (
              <div className="empty-state">
                <Bookmark size={28} strokeWidth={1.3} />
                <h2>
                  {tab === "saved"
                    ? t("profile.empty_saved_title")
                    : t("profile.empty_posts_title")}
                </h2>
                <p>
                  {tab === "saved"
                    ? t("profile.empty_saved_desc")
                    : t("profile.empty_posts_desc")}
                </p>
                {tab === "posts" && (
                  <button
                    className="button button-primary"
                    onClick={() => setCreating(true)}
                  >
                    <Plus size={16} />
                    {t("profile.write_post")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <aside className="project-sidebar">
          <section className="project-card">
            <div className="section-heading">
              <span className="eyebrow">{t("profile.building_now")}</span>
              <Code2 size={20} />
            </div>
            <span className="project-monogram" aria-hidden="true">
              {user.project.name.slice(0, 2).toUpperCase()}
              <ArrowUpRight size={23} />
            </span>
            <h2>{user.project.name}</h2>
            <p>{user.project.description}</p>
            <div className="tag-list">
              {user.skills.slice(0, 3).map((skill) => (
                <span className="tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
            <div className="project-status">
              <span className="status-dot" />
              {t("profile.in_progress")}
            </div>
          </section>
          <div className="profile-note">
            <span>{t("profile.note_heading")}</span>
            <p>
              {t("profile.note_line1")}
              <br />
              {t("profile.note_line2")}
            </p>
          </div>
        </aside>
      </div>
      {editing && (
        <EditProfileModal
          onClose={() => setEditing(false)}
          onSaved={() => setNotice(t("profile.notice_updated"))}
        />
      )}
      {changingPassword && (
        <ChangePasswordModal
          onClose={() => setChangingPassword(false)}
          onSaved={() => setNotice(t("profile.notice_password_updated"))}
        />
      )}
      {creating && <CreatePostModal onClose={() => setCreating(false)} />}
    </div>
  );
}
