"use client";

import { useCallback, useSyncExternalStore } from "react";
import { translate, type Lang } from "./translations";

const STORAGE_KEY = "peer-space-lang";

function subscribe(callback: () => void) {
  window.addEventListener("lang-change", callback);
  return () => window.removeEventListener("lang-change", callback);
}

function getSnapshot(): Lang {
  const attr = document.documentElement.dataset.lang;
  return attr === "ru" || attr === "en" ? attr : "uz";
}

function getServerSnapshot(): Lang {
  return "uz";
}

export function setLang(lang: Lang) {
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* Language works without storage. */
  }
  window.dispatchEvent(new Event("lang-change"));
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang],
  );
  return { lang, t, setLang };
}
