"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { useDemo } from "./DemoProvider";
import Avatar from "./Avatar";
import UserCard from "./UserCard";
import { useLang } from "@/lib/useLang";

export default function FeedSidebar({
  onFilter,
}: {
  onFilter: (skill: string) => void;
}) {
  const { user, posts, peers, community } = useDemo();
  const { t } = useLang();
  return (
    <aside className="feed-sidebar">
      <UserCard
        user={user}
        postCount={posts.filter((post) => post.author.id === user.id).length}
      />
      <section className="sidebar-section">
        <div className="section-heading">
          <h2>{t("feedSidebar.online_now")}</h2>
          <span className="online-count">
            <span className="status-dot" />
            {t("feedSidebar.online_count", { n: community.online })}
          </span>
        </div>
        <div className="online-peers">
          {peers
            .filter((peer) => peer.online)
            .map((peer) => (
              <Link
                href={`/peer/${peer.id}`}
                className="online-peer"
                key={peer.id}
                aria-label={peer.name}
              >
                <Avatar user={peer} size="sm" showStatus />
                <div>
                  <strong>{peer.name}</strong>
                  <span>{peer.skills[0]}</span>
                </div>
                <MessageCircle size={17} />
              </Link>
            ))}
        </div>
      </section>
      <section className="sidebar-section topics-section">
        <div className="section-heading">
          <h2>{t("feedSidebar.topics_heading")}</h2>
          <ArrowUpRight size={17} />
        </div>
        {community.topics.map((topic, index) => (
          <button
            key={topic.name}
            className="topic"
            onClick={() => onFilter(topic.skill)}
          >
            <span className="topic-number">0{index + 1}</span>
            <span>
              <strong>{topic.name}</strong>
              <small>
                {topic.posts} {t("feedSidebar.posts_suffix")}
              </small>
            </span>
            <ArrowUpRight size={15} />
          </button>
        ))}
      </section>
      <div className="community-note">
        <ArrowDownRight size={27} strokeWidth={1.3} />
        <p>
          {t("feedSidebar.note_line1")}
          <br />
          <strong>{t("feedSidebar.note_line2")}</strong>
        </p>
        <span>{t("feedSidebar.community_note", { n: community.total })}</span>
      </div>
      <footer className="sidebar-footer">
        <span>{t("feedSidebar.footer_note")}</span>
        <span>
          © 2026 Peer Space <span className="footer-symbol">↗</span>
        </span>
      </footer>
    </aside>
  );
}
