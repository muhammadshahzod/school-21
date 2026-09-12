"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

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
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("peer-space-theme", next);
    } catch {
      /* Theme works without storage. */
    }
    window.dispatchEvent(new Event("theme-change"));
  }
  return (
    <button
      className="icon-button theme-toggle"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Yorug‘ rejimga o‘tish" : "Tungi rejimga o‘tish"
      }
      title={theme === "dark" ? "Yorug‘ rejim" : "Tungi rejim"}
    >
      <Moon className="moon-icon" size={20} />
      <Sun className="sun-icon" size={20} />
    </button>
  );
}
