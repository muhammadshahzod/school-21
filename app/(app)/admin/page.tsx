"use client";

import { MessageSquare, Trash2, TrendingUp, UserPlus, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import Avatar from "@/components/Avatar";
import { useDemo } from "@/components/DemoProvider";

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
      setLoadError("Foydalanuvchilarni yuklab bo‘lmadi.");
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
        if (active) setLoadError("Foydalanuvchilarni yuklab bo‘lmadi.");
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
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Ruxsat yo‘q</h2>
          <p>Bu sahifa faqat admin uchun.</p>
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
      if (!res.ok) throw new Error(data?.error || "Xatolik");
      setUsername("");
      setPassword("");
      setName("");
      await loadUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Bu foydalanuvchini o‘chirmoqchimisiz?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    await loadUsers();
  }

  return (
    <div className="page-container">
      <section className="page-intro compact-intro">
        <div>
          <div className="eyebrow intro-eyebrow">
            <span className="tiny-square" />
            ADMIN PANEL
          </div>
          <h1>Foydalanuvchilar.</h1>
          <p>Yangi login/parol qo‘shing yoki mavjudlarini o‘chiring.</p>
        </div>
      </section>

      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <Users size={18} />
            <strong>{stats.totalUsers}</strong>
            <span>Foydalanuvchilar</span>
          </div>
          <div className="admin-stat-card">
            <TrendingUp size={18} />
            <strong>{stats.totalPosts}</strong>
            <span>Postlar</span>
          </div>
          <div className="admin-stat-card">
            <MessageSquare size={18} />
            <strong>{stats.totalComments}</strong>
            <span>Kommentlar</span>
          </div>
          <div className="admin-stat-card">
            <TrendingUp size={18} />
            <strong>{stats.totalLikes}</strong>
            <span>Layklar</span>
          </div>
          <div className="admin-stat-card">
            <MessageSquare size={18} />
            <strong>{stats.totalMessages}</strong>
            <span>Xabarlar</span>
          </div>
          <div className="admin-stat-card">
            <Users size={18} />
            <strong>{stats.totalGroups}</strong>
            <span>Guruhlar</span>
          </div>
        </div>
      )}

      {stats && stats.topPosters.length > 0 && (
        <div className="admin-top-posters">
          <h2>Eng faol pirlar</h2>
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
                <span className="tag">{poster.postCount} post</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="stack-form" style={{ maxWidth: 420, marginBottom: 32 }}>
        <label className="field">
          <span>Login</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="masalan: bekzod"
            required
          />
        </label>
        <label className="field">
          <span>Parol</span>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="kamida 4 belgi"
            required
          />
        </label>
        <label className="field">
          <span>Ism (ixtiyoriy)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bekzod Aliyev"
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
          {submitting ? "Qo‘shilmoqda…" : "Foydalanuvchi qo‘shish"}
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
                  aria-label={`${u.name}ni o‘chirish`}
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
