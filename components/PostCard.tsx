"use client";

import { Bookmark, Heart, MessageCircle, Pencil, Send, SmilePlus, Trash2 } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import CreatePostModal from "./CreatePostModal";
import PostImage from "./PostImage";
import { useDemo } from "./DemoProvider";
import { REACTION_EMOJIS } from "@/lib/reactions";
import { useLang } from "@/lib/useLang";
import type { Post } from "./types";

export default function PostCard({
  post,
  index = 0,
}: {
  post: Post;
  index?: number;
}) {
  const { user, toggleLike, toggleSave, toggleReaction, addComment, deletePost } =
    useDemo();
  const { t } = useLang();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const commentsId = useId();

  function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    addComment(post.id, comment);
    setComment("");
  }

  return (
    <article
      className="post-card"
      style={{ "--card-index": index } as React.CSSProperties}
    >
      <div className="post-header">
        <div className="post-author">
          <Avatar user={post.author} />
          <div>
            <h2>{post.author.name}</h2>
            <span className="post-meta">
              @{post.author.username}
              <span>·</span>
              {post.time}
            </span>
          </div>
        </div>
        <div className="post-header-actions">
          <span className="tag post-skill">{post.skill}</span>
          {post.author.id === user.id && (
            <>
              <button
                className="icon-button small-icon"
                aria-label={t("postCard.edit_post")}
                title={t("postCard.edit_title")}
                onClick={() => setEditing(true)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-button small-icon"
                aria-label={t("postCard.delete_post")}
                title={t("postCard.delete_title")}
                onClick={() => {
                  if (confirm(t("postCard.delete_confirm"))) deletePost(post.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
      <p className="post-text">{post.text}</p>
      {post.image && (
        <div className="post-media">
          <PostImage
            key={post.image}
            src={post.image}
            alt={t("postCard.post_image_alt", { name: post.author.name })}
          />
        </div>
      )}
      <div className="post-actions">
        <div className="post-actions-left">
          <button
            className={`post-action ${post.liked ? "is-liked" : ""}`}
            onClick={() => toggleLike(post.id)}
            aria-pressed={post.liked}
            aria-label={t("postCard.like_aria", { n: post.likes })}
          >
            <Heart size={20} fill={post.liked ? "currentColor" : "none"} />
            <span>{post.likes}</span>
          </button>
          <button
            className="post-action"
            onClick={() => setCommentsOpen(!commentsOpen)}
            aria-expanded={commentsOpen}
            aria-controls={commentsId}
            aria-label={t("postCard.comments_aria", { n: post.comments.length })}
          >
            <MessageCircle size={20} />
            <span>{post.comments.length}</span>
          </button>
        </div>
        <button
          className={`icon-button save-button ${post.saved ? "is-saved" : ""}`}
          onClick={() => toggleSave(post.id)}
          aria-pressed={post.saved}
          aria-label={
            post.saved ? t("postCard.unsave_post") : t("postCard.save_post")
          }
          title={post.saved ? t("postCard.saved") : t("postCard.save")}
        >
          <Bookmark size={20} fill={post.saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="reaction-bar">
        {post.reactions.map((r) => (
          <button
            key={r.emoji}
            className={`reaction-pill ${post.myReaction === r.emoji ? "is-active" : ""}`}
            onClick={() => toggleReaction(post.id, r.emoji)}
            aria-pressed={post.myReaction === r.emoji}
            aria-label={t("postCard.reaction_aria", { emoji: r.emoji, n: r.count })}
          >
            <span>{r.emoji}</span>
            <span>{r.count}</span>
          </button>
        ))}
        <div className="reaction-picker-wrap">
          <button
            className="icon-button small-icon"
            aria-label={t("postCard.add_reaction")}
            title={t("postCard.add_reaction")}
            onClick={() => setPickerOpen((v) => !v)}
          >
            <SmilePlus size={16} />
          </button>
          {pickerOpen && (
            <div className="reaction-picker">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-picker-option"
                  aria-label={t("postCard.reaction_option_aria", { emoji })}
                  onClick={() => {
                    toggleReaction(post.id, emoji);
                    setPickerOpen(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {commentsOpen && (
        <section
          id={commentsId}
          className="comments-section"
          aria-label={t("postCard.comments_section_aria")}
        >
          <h3>
            {t("postCard.comments_heading")}{" "}
            <span className="muted">({post.comments.length})</span>
          </h3>
          {post.comments.length === 0 && (
            <p className="muted small">{t("postCard.first_comment")}</p>
          )}
          <div className="comment-list">
            {post.comments.map((item) => (
              <div key={item.id} className="comment">
                <Avatar user={item.author} size="sm" />
                <div>
                  <div className="comment-heading">
                    <strong>{item.author.name}</strong>
                    <span>{item.time}</span>
                  </div>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="comment-form" onSubmit={submitComment}>
            <Avatar user={user} size="sm" />
            <input
              aria-label={t("postCard.comment_aria")}
              placeholder={t("postCard.comment_placeholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              required
            />
            <button
              type="submit"
              className="icon-button"
              disabled={!comment.trim()}
              aria-label={t("postCard.send_comment")}
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
      {editing && (
        <CreatePostModal editing={post} onClose={() => setEditing(false)} />
      )}
    </article>
  );
}
