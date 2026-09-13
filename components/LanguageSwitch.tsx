"use client";

import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/useLang";
import { LANGS } from "@/lib/translations";

export default function LanguageSwitch() {
  const { lang, t, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className="icon-button language-switch-trigger"
        aria-label={t("header.language")}
        title={t("header.language")}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe size={18} />
        <span className="language-switch-code">{lang.toUpperCase()}</span>
      </button>
      {open && (
        <div className="language-switch-dropdown" role="menu">
          {LANGS.map((item) => (
            <button
              key={item.code}
              role="menuitemradio"
              aria-checked={lang === item.code}
              className={`language-switch-option ${lang === item.code ? "is-active" : ""}`}
              onClick={() => {
                setLang(item.code);
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
