"use client";

import { Search, MessageCircle, Newspaper } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";

export default function GlobalSearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { peers, posts } = useDemo();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const q = trimmed.toLocaleLowerCase();

  const matchedPeers = q
    ? peers
        .filter((peer) =>
          `${peer.name} ${peer.username} ${peer.skills.join(" ")}`
            .toLocaleLowerCase()
            .includes(q),
        )
        .slice(0, 6)
    : [];
  const matchingPostsCount = q
    ? posts.filter((post) =>
        `${post.text} ${post.author.name} ${post.skill}`
          .toLocaleLowerCase()
          .includes(q),
      ).length
    : 0;

  function goToFeed(event?: FormEvent) {
    event?.preventDefault();
    if (!trimmed) return;
    router.push(`/feed?q=${encodeURIComponent(trimmed)}`);
    onClose();
  }

  return (
    <Modal
      title="Qidiruv"
      description="Post, pir yoki skill bo‘yicha butun platformadan qidiring."
      onClose={onClose}
    >
      <form onSubmit={goToFeed} className="stack-form">
        <div className="chat-search search-field">
          <Search size={17} />
          <input
            autoFocus
            type="search"
            placeholder="Qidirish…"
            aria-label="Butun platformadan qidirish"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {q && (
          <button
            type="button"
            className="global-search-result"
            onClick={() => goToFeed()}
          >
            <Newspaper size={17} />
            <span>
              “{trimmed}” bo‘yicha postlarda qidirish
              {matchingPostsCount > 0 && (
                <span className="muted"> · {matchingPostsCount} ta topildi</span>
              )}
            </span>
          </button>
        )}
        {matchedPeers.length > 0 && (
          <div className="group-member-list">
            {matchedPeers.map((peer) => (
              <button
                key={peer.id}
                type="button"
                className="group-member-option"
                onClick={() => {
                  router.push(`/chat?peer=${peer.id}`);
                  onClose();
                }}
              >
                <Avatar user={peer} size="sm" showStatus />
                <span>{peer.name}</span>
                <MessageCircle size={15} style={{ marginLeft: "auto" }} />
              </button>
            ))}
          </div>
        )}
        {q && matchedPeers.length === 0 && matchingPostsCount === 0 && (
          <p className="muted small">Hech narsa topilmadi.</p>
        )}
      </form>
    </Modal>
  );
}
