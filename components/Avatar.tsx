"use client";

import { useState } from "react";
import type { Peer } from "./types";

export default function Avatar({
  user,
  size = "md",
  showStatus = false,
}: {
  user: Pick<Peer, "name" | "avatar" | "online">;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`avatar avatar-${size}`}>
      {user.avatar && !failed ? (
        // Arbitrary avatar URLs work without a backend image proxy or allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt={user.name}
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span aria-label={user.name}>
          {user.name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </span>
      )}
      {showStatus && user.online && (
        <span className="online-dot" title="Onlayn" />
      )}
    </span>
  );
}
