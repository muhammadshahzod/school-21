"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useDemo } from "./DemoProvider";
import { useLang } from "@/lib/useLang";
import type { Peer } from "./types";

export default function NewMessageModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (peer: Peer) => void;
}) {
  const { peers } = useDemo();
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState<string | null>(null);
  const allSkills = Array.from(new Set(peers.flatMap((p) => p.skills))).sort();
  const filtered = peers.filter((peer) => {
    const matchesSearch = `${peer.name} ${peer.username}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase());
    const matchesSkill = !skill || peer.skills.includes(skill);
    return matchesSearch && matchesSkill;
  });

  return (
    <Modal
      title={t("newMessageModal.title")}
      description={t("newMessageModal.desc")}
      onClose={onClose}
    >
      <div className="stack-form">
        <div className="chat-search search-field">
          <Search size={17} />
          <input
            autoFocus
            type="search"
            placeholder={t("newMessageModal.search_placeholder")}
            aria-label={t("newMessageModal.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {allSkills.length > 0 && (
          <div className="skill-filters">
            <button
              type="button"
              className={`filter-button ${skill === null ? "selected" : ""}`}
              onClick={() => setSkill(null)}
            >
              {t("newMessageModal.all")}
            </button>
            {allSkills.map((item) => (
              <button
                type="button"
                key={item}
                className={`filter-button ${skill === item ? "selected" : ""}`}
                onClick={() => setSkill(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
        <div className="group-member-list">
          {filtered.map((peer) => (
            <button
              key={peer.id}
              type="button"
              className="group-member-option"
              onClick={() => onSelect(peer)}
            >
              <Avatar user={peer} size="sm" showStatus />
              <span>{peer.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="muted small">{t("newMessageModal.not_found")}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
