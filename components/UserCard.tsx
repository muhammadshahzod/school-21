"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import Avatar from "./Avatar";
import type { Peer } from "./types";
import { useLang } from "@/lib/useLang";

export default function UserCard({
  user,
  postCount = 0,
}: {
  user: Peer;
  postCount?: number;
}) {
  const { t } = useLang();
  return (
    <section className="user-card" aria-label={t("userCard.my_profile_link")}>
      <div className="user-cover">
        <span>LEARN. BUILD. REPEAT.</span>
        <span className="cover-number" aria-hidden="true">
          21
        </span>
        <svg className="cover-grid" viewBox="0 0 320 110" aria-hidden="true">
          <path d="M0 27H320M0 55H320M0 83H320M40 0V110M80 0V110M120 0V110M160 0V110M200 0V110M240 0V110M280 0V110" />
        </svg>
      </div>
      <div className="user-card-body">
        <Avatar user={user} size="lg" />
        <h2>{user.name}</h2>
        <p className="muted small">@{user.username}</p>
        <p className="location">
          <MapPin size={13} />
          {t("userCard.location")}
        </p>
        <div className="tag-list">
          {user.skills.map((skill) => (
            <span key={skill} className="tag">
              {skill}
            </span>
          ))}
        </div>
        <div className="user-card-stats">
          <div>
            <strong>{postCount}</strong>
            <span>{t("userCard.post")}</span>
          </div>
          <div>
            <strong>{user.skills.length}</strong>
            <span>{t("userCard.skill")}</span>
          </div>
          <div>
            <strong>1</strong>
            <span>{t("userCard.project")}</span>
          </div>
        </div>
        <Link href="/profile" className="user-profile-link">
          {t("userCard.my_profile_link")}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
