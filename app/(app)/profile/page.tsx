"use client";

import {
  ArrowUpRight,
  Bookmark,
  Code2,
  Grid2X2,
  MapPin,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import Avatar from "@/components/Avatar";
import CreatePostModal from "@/components/CreatePostModal";
import EditProfileModal from "@/components/EditProfileModal";
import PostCard from "@/components/PostCard";
import { useDemo } from "@/components/DemoProvider";

export default function ProfilePage() {
  const { user, posts } = useDemo();
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [notice, setNotice] = useState("");
  const myPosts = posts.filter((post) => post.author.id === user.id);
  const displayed =
    tab === "posts" ? myPosts : posts.filter((post) => post.saved);
  return (
    <div className="page-container profile-page">
      <div className="profile-cover">
        <span className="eyebrow">SCHOOL 21 · TOSHKENT</span>
        <div className="profile-cover-copy">
          Always a peer.
          <br />
          <span>Never stop learning.</span>
        </div>
        <span className="profile-cover-number" aria-hidden="true">
          21<span>↗</span>
        </span>
        <div className="profile-cover-footer">
          <span>LEARN / BUILD / REPEAT</span>
          <span>EST. 2026</span>
        </div>
      </div>
      <section className="profile-details">
        <div className="profile-topline">
          <Avatar user={user} size="xl" />
          <button
            className="button button-secondary"
            onClick={() => setEditing(true)}
          >
            <Pencil size={16} />
            Tahrirlash
          </button>
        </div>
        <div className="profile-identity">
          <div>
            <div className="profile-name-line">
              <h1>{user.name}</h1>
              <span className="tag">Peer</span>
            </div>
            <p className="profile-handle">
              @{user.username}
              <span>·</span>
              <MapPin size={14} />
              Toshkent, Uzbekistan
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
              <span>Postlar</span>
            </div>
            <div>
              <strong>{user.skills.length.toString().padStart(2, "0")}</strong>
              <span>Skill’lar</span>
            </div>
            <div>
              <strong>01</strong>
              <span>Loyiha</span>
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
            aria-label="Bildirishnomani yopish"
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
            aria-label="Profil postlari"
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
              Postlar<span>{myPosts.length}</span>
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
              Saqlangan
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
                    ? "Yaxshi g‘oyalarni saqlab qo‘ying"
                    : "Birinchi postingizni yozing"}
                </h2>
                <p>
                  {tab === "saved"
                    ? "Postdagi xatcho‘p belgisini bosing — u shu yerda ko‘rinadi."
                    : "Davrangiz sizning fikrlaringizni kutmoqda."}
                </p>
                {tab === "posts" && (
                  <button
                    className="button button-primary"
                    onClick={() => setCreating(true)}
                  >
                    <Plus size={16} />
                    Post yozish
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <aside className="project-sidebar">
          <section className="project-card">
            <div className="section-heading">
              <span className="eyebrow">HOZIR QURMOQDAMAN</span>
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
              Ish jarayonida
            </div>
          </section>
          <div className="profile-note">
            <span>01 / KUN SAYIN YAXSHIROQ</span>
            <p>
              Har bir katta loyiha
              <br />
              kichik qadamdan boshlanadi.
            </p>
          </div>
        </aside>
      </div>
      {editing && (
        <EditProfileModal
          onClose={() => setEditing(false)}
          onSaved={() => setNotice("Profilingiz yangilandi.")}
        />
      )}
      {creating && <CreatePostModal onClose={() => setCreating(false)} />}
    </div>
  );
}
