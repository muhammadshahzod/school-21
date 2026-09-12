"use client";

import { useEffect, useState } from "react";

const VISIBLE_MS = 1100;
const FADE_MS = 400;

export default function IntroOverlay() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "hidden">(
    "visible",
  );

  useEffect(() => {
    const leaveTimer = setTimeout(() => setPhase("leaving"), VISIBLE_MS);
    const hideTimer = setTimeout(
      () => setPhase("hidden"),
      VISIBLE_MS + FADE_MS,
    );
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className={`intro-overlay ${phase === "leaving" ? "leaving" : ""}`}
      aria-hidden="true"
    >
      <span className="intro-overlay-mark">
        21
        <span className="brand-square" />
      </span>
      <span className="intro-overlay-word">
        peer<span className="brand-slash">/</span>space
      </span>
    </div>
  );
}
