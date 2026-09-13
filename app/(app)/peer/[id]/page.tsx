"use client";

import { MapPin, MessageCircle, UserRound } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import { useDemo } from "@/components/DemoProvider";
import { useLang } from "@/lib/useLang";

export default function PeerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, peers, posts } = useDemo();
  const { t } = useLang();
  const isMe = id === user.id;
  const peer = isMe ? user : peers.find((p) => p.id === id);

  if (!peer) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <UserRound size={28} strokeWidth={1.3} />
          <h2>{t("peerProfile.not_found_title")}</h2>
          <p>{t("peerProfile.not_found_desc")}</p>
        </div>
      </div>
    );
  }

  const peerPosts = posts.filter((post) => post.author.id === peer.id);

  return (
    <div className="page-container profile-page">
      <div className="profile-cover">
        <span className="eyebrow">{t("profile.eyebrow")}</span>
        <div className="profile-cover-copy">
          {t("profile.cover_line1")}
          <br />
          <span>{t("profile.cover_line2")}</span>
        </div>
        <span className="profile-cover-number" aria-hidden="true">
          21<span>↗</span>
        </span>
        <div className="profile-cover-footer">
          <span>{t("profile.cover_footer_left")}</span>
          <span>{t("profile.cover_footer_right")}</span>
        </div>
      </div>
      <section className="profile-details">
        <div className="profile-topline">
          <Avatar user={peer} size="xl" />
          {isMe ? (
            <button
              className="button button-secondary"
              onClick={() => router.push("/profile")}
            >
              {t("peerProfile.my_profile_button")}
            </button>
          ) : (
            <button
              className="button button-primary"
              onClick={() => router.push(`/chat?peer=${peer.id}`)}
            >
              <MessageCircle size={16} />
              {t("peerProfile.message_button")}
            </button>
          )}
        </div>
        <div className="profile-identity">
          <div>
            <div className="profile-name-line">
              <h1>{peer.name}</h1>
              <span className="tag">Peer</span>
            </div>
            <p className="profile-handle">
              @{peer.username}
              <span>·</span>
              <MapPin size={14} />
              {t("profile.location")}
            </p>
            <p className="profile-bio">{peer.bio}</p>
            <div className="tag-list">
              {peer.skills.map((skill) => (
                <span className="tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="profile-stats">
            <div>
              <strong>{peerPosts.length.toString().padStart(2, "0")}</strong>
              <span>{t("profile.posts_stat")}</span>
            </div>
            <div>
              <strong>{peer.skills.length.toString().padStart(2, "0")}</strong>
              <span>{t("profile.skills_stat")}</span>
            </div>
            <div>
              <strong>01</strong>
              <span>{t("profile.project_stat")}</span>
            </div>
          </div>
        </div>
      </section>
      <div className="profile-content">
        <div className="profile-posts">
          <div className="profile-tabs" role="tablist" aria-label={t("profile.posts_tab")}>
            <button className="selected" role="tab" aria-selected="true">
              {t("profile.posts_tab")}
              <span>{peerPosts.length}</span>
            </button>
          </div>
          <div className="post-list">
            {peerPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {peerPosts.length === 0 && (
              <div className="empty-state">
                <UserRound size={28} strokeWidth={1.3} />
                <h2>{t("peerProfile.no_posts_title")}</h2>
                <p>{t("peerProfile.no_posts_desc", { name: peer.name })}</p>
              </div>
            )}
          </div>
        </div>
        <aside className="project-sidebar">
          <section className="project-card">
            <h2>{peer.project.name || t("peerProfile.no_project")}</h2>
            <p>{peer.project.description}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
