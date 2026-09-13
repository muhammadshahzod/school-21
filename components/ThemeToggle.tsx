"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore, type MouseEvent } from "react";
import { useLang } from "@/lib/useLang";

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback);
  return () => {
    window.removeEventListener("theme-change", callback);
  };
}

function getTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");
  const { t } = useLang();
  function toggle(event: MouseEvent<HTMLButtonElement>) {
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

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
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
    <button
      className="icon-button theme-toggle"
      onClick={toggle}
      aria-label={
        theme === "dark" ? t("header.theme_to_light") : t("header.theme_to_dark")
      }
      title={theme === "dark" ? t("header.theme_light") : t("header.theme_dark")}
    >
      <Moon className="moon-icon" size={20} />
      <Sun className="sun-icon" size={20} />
    </button>
  );
}
