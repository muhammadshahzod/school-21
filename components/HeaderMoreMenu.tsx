"use client";

import { EllipsisVertical, Moon, ShieldCheck, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useLang, setLang } from "@/lib/useLang";
import { LANGS } from "@/lib/translations";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    read();
    window.addEventListener("theme-change", read);
    return () => window.removeEventListener("theme-change", read);
  }, []);
  return theme;
}

export default function HeaderMoreMenu({ isAdmin }: { isAdmin: boolean }) {
  const { lang, t } = useLang();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    const next = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("peer-space-theme", next);
      } catch {
        /* Theme works without storage. */
      }
      window.dispatchEvent(new Event("theme-change"));
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion) {
      apply();
      return;
    }
    const { clientX, clientY } = event;
    const radius = Math.hypot(
      Math.max(clientX, window.innerWidth - clientX),
      Math.max(clientY, window.innerHeight - clientY),
    );
    const root = document.documentElement;
    root.style.setProperty("--theme-toggle-x", `${clientX}px`);
    root.style.setProperty("--theme-toggle-y", `${clientY}px`);
    root.style.setProperty("--theme-toggle-r", `${radius}px`);
    document.startViewTransition(apply);
  }

  return (
    <div ref={ref} className="header-more-menu">
      <button
        className="icon-button"
        aria-label={t("header.more")}
        title={t("header.more")}
        onClick={() => setOpen((v) => !v)}
      >
        <EllipsisVertical size={18} />
      </button>
      {open && (
        <div className="header-more-dropdown" role="menu">
          <div className="header-more-row header-more-lang">
            {LANGS.map((item) => (
              <button
                key={item.code}
                role="menuitemradio"
                aria-checked={lang === item.code}
                className={`language-switch-option ${lang === item.code ? "is-active" : ""}`}
                onClick={() => setLang(item.code)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button className="header-more-row header-more-action" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? t("header.theme_to_light") : t("header.theme_to_dark")}
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              className="header-more-row header-more-action"
              onClick={() => setOpen(false)}
            >
              <ShieldCheck size={16} />
              {t("header.admin_panel")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
