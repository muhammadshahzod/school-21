"use client";

import { MessageSquare, Trash2, TrendingUp, UserPlus, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import Avatar from "@/components/Avatar";
import { useDemo } from "@/components/DemoProvider";
import { useLang } from "@/lib/useLang";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalMessages: number;
  totalGroups: number;
  topPosters: {
    id: string;
    name: string;
    username: string;
    image: string;
    postCount: number;
  }[];
}

export default function AdminPage() {
  const { user } = useDemo();
  const { t } = useLang();
  const isAdmin = user.username === "shahzod";

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setLoadError(t("admin.load_error"));
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    fetch("/api/admin/users")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch(() => {
        if (active) setLoadError(t("admin.load_error"));
      });
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAdmin, t]);

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>{t("admin.no_access_title")}</h2>
          <p>{t("admin.no_access_desc")}</p>
        </div>
      </div>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!username.trim() || password.length < 4 || submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t("admin.generic_error"));
      setUsername("");
      setPassword("");
      setName("");
      await loadUsers();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("admin.generic_error"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("admin.delete_confirm"))) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    await loadUsers();
  }

  return (
    <div className="page-container">
      <section className="page-intro compact-intro">
        <div>
          <div className="eyebrow intro-eyebrow">
            <span className="tiny-square" />
            {t("admin.eyebrow")}
          </div>
          <h1>{t("admin.heading")}</h1>
          <p>{t("admin.subtitle")}</p>
        </div>
      </section>

      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <Users size={18} />
            <strong>{stats.totalUsers}</strong>
            <span>{t("admin.stat_users")}</span>
          </div>
          <div className="admin-stat-card">
            <TrendingUp size={18} />
            <strong>{stats.totalPosts}</strong>
            <span>{t("admin.stat_posts")}</span>
          </div>
          <div className="admin-stat-card">
            <MessageSquare size={18} />
            <strong>{stats.totalComments}</strong>
            <span>{t("admin.stat_comments")}</span>
          </div>
          <div className="admin-stat-card">
            <TrendingUp size={18} />
            <strong>{stats.totalLikes}</strong>
            <span>{t("admin.stat_likes")}</span>
          </div>
          <div className="admin-stat-card">
            <MessageSquare size={18} />
            <strong>{stats.totalMessages}</strong>
            <span>{t("admin.stat_messages")}</span>
          </div>
          <div className="admin-stat-card">
            <Users size={18} />
            <strong>{stats.totalGroups}</strong>
            <span>{t("admin.stat_groups")}</span>
          </div>
        </div>
      )}

      {stats && stats.topPosters.length > 0 && (
        <div className="admin-top-posters">
          <h2>{t("admin.top_posters")}</h2>
          <div className="conversation-list" style={{ maxWidth: 420 }}>
            {stats.topPosters.map((poster, index) => (
              <div key={poster.id} className="conversation-item" style={{ cursor: "default" }}>
                <span className="admin-rank">{index + 1}</span>
                <Avatar
                  user={{ name: poster.name, avatar: poster.image, online: false }}
                  size="sm"
                />
                <span className="conversation-info">
                  <span className="conversation-name">
                    <strong>{poster.name}</strong>
                  </span>
                  <span className="conversation-preview">
                    <span>@{poster.username}</span>
                  </span>
                </span>
                <span className="tag">
                  {poster.postCount} {t("admin.post_suffix")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="stack-form" style={{ maxWidth: 420, marginBottom: 32 }}>
        <label className="field">
          <span>{t("admin.label_username")}</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("admin.placeholder_username")}
            required
          />
        </label>
        <label className="field">
          <span>{t("admin.label_password")}</span>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("admin.placeholder_password")}
            required
          />
        </label>
        <label className="field">
          <span>{t("admin.label_name")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("admin.placeholder_name")}
          />
        </label>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button
          className="button button-primary"
          type="submit"
          disabled={!username.trim() || password.length < 4 || submitting}
        >
          <UserPlus size={17} />
          {submitting ? t("admin.submitting") : t("admin.submit")}
        </button>
      </form>

      {loadError && <p className="form-error">{loadError}</p>}

      {users && (
        <div className="conversation-list" style={{ maxWidth: 560 }}>
          {users.map((u) => (
            <div
              key={u.id}
              className="conversation-item"
              style={{ cursor: "default" }}
            >
              <span className="conversation-info">
                <span className="conversation-name">
                  <strong>{u.name}</strong>
                </span>
                <span className="conversation-preview">
                  <span>@{u.username}</span>
                </span>
              </span>
              {u.id !== "u_shahzod" && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={t("admin.delete_user_aria", { name: u.name })}
                  onClick={() => remove(u.id)}
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
