"use client";

import {
  ArrowUpRight,
  ImagePlus,
  Plus,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import CreatePostModal from "@/components/CreatePostModal";
import FeedSidebar from "@/components/FeedSidebar";
import PostCard from "@/components/PostCard";
import { useDemo } from "@/components/DemoProvider";
import { SKILLS } from "@/components/types";

function FeedContent({ initialQuery }: { initialQuery: string }) {
  const { posts, user } = useDemo();
  const [search, setSearch] = useState(initialQuery);
  const [skill, setSkill] = useState("Barchasi");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const filteredPosts = posts.filter(
    (post) =>
      (skill === "Barchasi" || post.skill === skill) &&
      `${post.text} ${post.author.name} ${post.author.username} ${post.skill}`
        .toLocaleLowerCase()
        .includes(query),
  );

  return (
    <div className="page-container feed-page">
      <section className="page-intro">
        <div>
          <div className="eyebrow intro-eyebrow">
            <span className="tiny-square" />
            BIR KAMPUS. MING G‘OYA.
          </div>
          <h1>
            Sizning davrangiz<span className="title-period">.</span>
          </h1>
          <p>Fikr ulashing. Birga yarating. Birga o‘sing.</p>
        </div>
        <button
          className="button button-primary new-post-button"
          onClick={() => setCreating(true)}
        >
          <Plus size={18} />
          Post yozish
        </button>
      </section>
      <div className="feed-layout">
        <div className="feed-main">
          <div className="feed-tools">
            <div className="search-field">
              <Search size={19} />
              <input
                type="search"
                aria-label="Lentadan qidirish"
                placeholder="Post, pir yoki skill qidirish…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="icon-button small-icon"
                  onClick={() => setSearch("")}
                  aria-label="Qidiruvni tozalash"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div
              className="skill-filters"
              aria-label="Skill bo‘yicha filtrlash"
            >
              {["Barchasi", ...SKILLS].map((item) => (
                <button
                  key={item}
                  className={`filter-button ${skill === item ? "selected" : ""}`}
                  onClick={() => setSkill(item)}
                  aria-pressed={skill === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            className="composer-trigger"
            onClick={() => setCreating(true)}
          >
            <Avatar user={user} />
            <span>Bugun nimalar ustida ishlayapsiz?</span>
            <ImagePlus size={21} />
          </button>
          <div className="feed-list-heading">
            <span>
              {query
                ? "QIDIRUV NATIJALARI"
                : skill === "Barchasi"
                  ? "HAMJAMIYAT LENTASI"
                  : `${skill.toUpperCase()} LENTASI`}
            </span>
            <span>
              {filteredPosts.length} ta post
              <span className="small-dot" />
              Eng yangi
            </span>
          </div>
          {notice && (
            <div className="inline-notice" role="status">
              {notice}
              <button
                className="icon-button small-icon"
                onClick={() => setNotice("")}
                aria-label="Bildirishnomani yopish"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="post-list">
            {filteredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <SearchX size={32} strokeWidth={1.3} />
              <h2>Hozircha hech narsa topilmadi</h2>
              <p>Boshqa so‘z yoki skill bilan qidirib ko‘ring.</p>
              <button
                className="button button-secondary"
                onClick={() => {
                  setSearch("");
                  setSkill("Barchasi");
                }}
              >
                Barcha postlar
              </button>
            </div>
          ) : (
            <div className="feed-end">
              <span className="feed-end-line" />
              <ArrowUpRight size={19} />
              <span className="feed-end-line" />
              <p>Hozircha barchasi shu. Yangi g‘oya sizdan!</p>
            </div>
          )}
        </div>
        <FeedSidebar
          onFilter={(value) => {
            setSkill(value);
            setSearch("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
      {creating && (
        <CreatePostModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setSearch("");
            setSkill("Barchasi");
            setNotice("Postingiz davraga qo‘shildi.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

function FeedRoute() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  // Keying on the query forces a remount (and fresh useState) whenever a
  // new search arrives via URL, including repeat searches from the header
  // modal while already on this page — router.push alone won't reset state
  // on an already-mounted route.
  return <FeedContent key={q} initialQuery={q} />;
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-screen" role="status">
          Lenta yuklanmoqda…
        </div>
      }
    >
      <FeedRoute />
    </Suspense>
  );
}
