"use client";

import {
  ArrowUpRight,
  ImagePlus,
  MessageCircle,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Avatar from "@/components/Avatar";
import CreatePostModal from "@/components/CreatePostModal";
import FeedSidebar from "@/components/FeedSidebar";
import PostCard from "@/components/PostCard";
import { useDemo } from "@/components/DemoProvider";
import { SKILLS } from "@/components/types";
import { useLang } from "@/lib/useLang";

const ALL_SKILL = "Barchasi";

function isToday(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function FeedContent({ initialQuery }: { initialQuery: string }) {
  const { posts, conversations, community, user } = useDemo();
  const { data: session } = useSession();
  const { t } = useLang();
  const displayName =
    session?.user?.name?.split(" ")[0] ?? user.name.split(" ")[0];
  const todayPostsCount = posts.filter((post) => isToday(post.createdAt)).length;
  const activeChatsCount = conversations.length;
  const onlinePeersCount = community.online ?? community.total;
  const [search, setSearch] = useState(initialQuery);
  const [skill, setSkill] = useState(ALL_SKILL);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const filteredPosts = posts.filter(
    (post) =>
      (skill === ALL_SKILL || post.skill === skill) &&
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
            {t("feed.eyebrow")}
          </div>
          <h1>
            {t("feed.welcome", { name: displayName })}
            <span className="title-period">.</span>
          </h1>
          <p>{t("feed.subtitle")}</p>
        </div>
        <button
          className="button button-primary new-post-button"
          onClick={() => setCreating(true)}
        >
          <Plus size={18} />
          {t("feed.new_post")}
        </button>
      </section>
      <div className="feed-stats-row">
        <div className="feed-stat-card">
          <Sparkles size={16} />
          <span>{t("feed.stat_new_posts", { n: todayPostsCount })}</span>
        </div>
        <div className="feed-stat-card">
          <MessageCircle size={16} />
          <span>{t("feed.stat_active_chats", { n: activeChatsCount })}</span>
        </div>
        <div className="feed-stat-card">
          <Users size={16} />
          <span>{t("feed.stat_online_peers", { n: onlinePeersCount })}</span>
        </div>
      </div>
      <div className="feed-layout">
        <div className="feed-main">
          <div className="feed-tools">
            <div className="search-field">
              <Search size={19} />
              <input
                type="search"
                aria-label={t("feed.search_placeholder")}
                placeholder={t("feed.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="icon-button small-icon"
                  onClick={() => setSearch("")}
                  aria-label={t("feed.clear_search")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div
              className="skill-filters"
              aria-label={t("feed.filter_aria")}
            >
              {[ALL_SKILL, ...SKILLS].map((item) => (
                <button
                  key={item}
                  className={`filter-button ${skill === item ? "selected" : ""}`}
                  onClick={() => setSkill(item)}
                  aria-pressed={skill === item}
                >
                  {item === ALL_SKILL ? t("feed.filter_all") : item}
                </button>
              ))}
            </div>
          </div>
          <button
            className="composer-trigger"
            onClick={() => setCreating(true)}
          >
            <Avatar user={user} />
            <span>{t("feed.composer_placeholder")}</span>
            <ImagePlus size={21} />
          </button>
          <div className="feed-list-heading">
            <span>
              {query
                ? t("feed.results_heading")
                : skill === ALL_SKILL
                  ? t("feed.community_heading")
                  : t("feed.skill_heading", { skill: skill.toUpperCase() })}
            </span>
            <span>
              {t("feed.posts_count", { n: filteredPosts.length })}
              <span className="small-dot" />
              {t("feed.newest")}
            </span>
          </div>
          {notice && (
            <div className="inline-notice" role="status">
              {notice}
              <button
                className="icon-button small-icon"
                onClick={() => setNotice("")}
                aria-label={t("profile.dismiss_notice")}
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
              <h2>{t("feed.empty_search_title")}</h2>
              <p>{t("feed.empty_search_desc")}</p>
              <button
                className="button button-secondary"
                onClick={() => {
                  setSearch("");
                  setSkill(ALL_SKILL);
                }}
              >
                {t("feed.all_posts")}
              </button>
            </div>
          ) : (
            <div className="feed-end">
              <span className="feed-end-line" />
              <ArrowUpRight size={19} />
              <span className="feed-end-line" />
              <p>{t("feed.feed_end")}</p>
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
            setSkill(ALL_SKILL);
            setNotice(t("feed.notice_post_created"));
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
  const { t } = useLang();
  return (
    <Suspense
      fallback={
        <div className="loading-screen" role="status">
          {t("demoProvider.loading")}
        </div>
      }
    >
      <FeedRoute />
    </Suspense>
  );
}
