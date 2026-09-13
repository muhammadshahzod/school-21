"use client";

import { useLang } from "@/lib/useLang";

export default function SkipLink() {
  const { t } = useLang();
  return (
    <a href="#main-content" className="skip-link">
      {t("skipLink.text")}
    </a>
  );
}
