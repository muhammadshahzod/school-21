"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Bell, LogOut, Rocket, Search, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import GlobalSearchModal from "./GlobalSearchModal";
import HeaderMoreMenu from "./HeaderMoreMenu";
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

const HEADER_NAV_ITEMS = [
  { href: "/feed", key: "nav.feed" },
  { href: "/incubator", key: "nav.incubator", icon: Rocket },
  { href: "/chat", key: "nav.chat" },
];

export default function Header() {
  const { user } = useDemo();
  const { t } = useLang();
  const pathname = usePathname();
  const isAdmin = user.role === "admin" || user.username === "shahzod";
  const [searching, setSearching] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Brand />
          <nav className="header-desktop-only header-nav">
            {HEADER_NAV_ITEMS.map(({ href, key, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`header-nav-link ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {Icon && <Icon size={14} />}
                  {t(key)}
                </Link>
              );
            })}
          </nav>
        </div>
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
          <span className="header-desktop-only">
            <LanguageSwitch />
          </span>
          <span className="header-desktop-only">
            <ThemeToggle />
          </span>
          <NotificationBell />
          {isAdmin && (
            <Link
              href="/admin"
              className="icon-button header-desktop-only"
              aria-label={t("header.admin_panel")}
              title={t("header.admin_panel")}
            >
              <ShieldCheck size={18} />
            </Link>
          )}
          <span className="header-mobile-only">
            <HeaderMoreMenu isAdmin={isAdmin} />
          </span>
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
