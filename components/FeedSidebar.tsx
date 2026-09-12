"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { useDemo } from "./DemoProvider";
import Avatar from "./Avatar";
import UserCard from "./UserCard";

export default function FeedSidebar({
  onFilter,
}: {
  onFilter: (skill: string) => void;
}) {
  const { user, posts, peers, community } = useDemo();
  return (
    <aside className="feed-sidebar">
      <UserCard
        user={user}
        postCount={posts.filter((post) => post.author.id === user.id).length}
      />
      <section className="sidebar-section">
        <div className="section-heading">
          <h2>Hozir davrada</h2>
          <span className="online-count">
            <span className="status-dot" />
            {community.online} onlayn
          </span>
        </div>
        <div className="online-peers">
          {peers
            .filter((peer) => peer.online)
            .map((peer) => (
              <Link
                href={`/chat?peer=${peer.id}`}
                className="online-peer"
                key={peer.id}
                aria-label={`${peer.name} bilan suhbat`}
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
          <h2>Davrada nima gap?</h2>
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
              <small>{topic.posts} ta post</small>
            </span>
            <ArrowUpRight size={15} />
          </button>
        ))}
      </section>
      <div className="community-note">
        <ArrowDownRight size={27} strokeWidth={1.3} />
        <p>
          Bu yerda har bir pirning
          <br />
          <strong>o‘z o‘rni bor.</strong>
        </p>
        <span>{community.total} pir. Cheksiz imkoniyat.</span>
      </div>
      <footer className="sidebar-footer">
        <span>School 21 pirlari tomonidan.</span>
        <span>
          © 2026 Peer Space <span className="footer-symbol">↗</span>
        </span>
      </footer>
    </aside>
  );
}
