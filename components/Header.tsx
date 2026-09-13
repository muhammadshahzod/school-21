"use client";

import Link from "next/link";
import { ArrowUpRight, Bell, LogOut, Search, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import GlobalSearchModal from "./GlobalSearchModal";
import LanguageSwitch from "./LanguageSwitch";
import ThemeToggle from "./ThemeToggle";
import { useDemo } from "./DemoProvider";
import { useLang } from "@/lib/useLang";

export function Brand() {
  return (
    <Link href="/feed" className="brand" aria-label="Peer Space — Lenta">
      <span className="brand-mark">
        21
        <span className="brand-square" />
      </span>
      <span className="brand-name">
        peer<span className="brand-slash">/</span>space
        <span className="brand-caption">SCHOOL 21 HAMJAMIYATI</span>
      </span>
    </Link>
  );
}

function NotificationBell() {
  const { notifications, markNotificationsRead } = useDemo();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  function notificationText(type: string): string {
    if (type === "like") return t("header.notif_like");
    if (type === "comment") return t("header.notif_comment");
    return t("header.notif_message");
  }

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="icon-button"
        aria-label={t("header.notifications")}
        title={t("header.notifications")}
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread > 0) markNotificationsRead();
        }}
      >
        <Bell size={18} />
        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </button>
      {open && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p className="muted small" style={{ padding: 14 }}>
              {t("header.no_notifications")}
            </p>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <Link
                key={n.id}
                href={n.type === "message" ? `/chat?peer=${n.actor.id}` : "/feed"}
                className="notification-item"
                onClick={() => setOpen(false)}
              >
                <Avatar user={n.actor} size="sm" />
                <span>
                  <strong>{n.actor.name}</strong> {notificationText(n.type)}
                  {n.postPreview && (
                    <span className="muted"> — “{n.postPreview}…”</span>
                  )}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user } = useDemo();
  const { t } = useLang();
  const [searching, setSearching] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <div className="campus-label">
          <span className="status-dot" />
          {t("header.campus")}
          <ArrowUpRight size={13} />
        </div>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label={t("header.search")}
            title={t("header.search")}
            onClick={() => setSearching(true)}
          >
            <Search size={18} />
          </button>
          <LanguageSwitch />
          <ThemeToggle />
          <NotificationBell />
          {user.username === "shahzod" && (
            <Link
              href="/admin"
              className="icon-button"
              aria-label={t("header.admin_panel")}
              title={t("header.admin_panel")}
            >
              <ShieldCheck size={18} />
            </Link>
          )}
          <span className="header-divider" />
          <Link
            href="/profile"
            className="header-profile"
            aria-label={t("header.my_profile")}
          >
            <Avatar user={user} size="sm" />
            <span>{user.name.split(" ")[0]}</span>
          </Link>
          <button
            className="icon-button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label={t("header.logout")}
            title={t("header.logout_title")}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      {searching && <GlobalSearchModal onClose={() => setSearching(false)} />}
    </header>
  );
}
