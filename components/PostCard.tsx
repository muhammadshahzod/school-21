"use client";

import { Bookmark, Heart, MessageCircle, Pencil, Send, Trash2 } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import Avatar from "./Avatar";
import CreatePostModal from "./CreatePostModal";
import PostImage from "./PostImage";
import { useDemo } from "./DemoProvider";
import type { Post } from "./types";

export default function PostCard({
  post,
  index = 0,
}: {
  post: Post;
  index?: number;
}) {
  const { user, toggleLike, toggleSave, addComment, deletePost } = useDemo();
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
                aria-label="Postni tahrirlash"
                title="Tahrirlash"
                onClick={() => setEditing(true)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-button small-icon"
                aria-label="Postni o'chirish"
                title="O'chirish"
                onClick={() => {
                  if (confirm("Bu postni o'chirmoqchimisiz?")) deletePost(post.id);
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
            alt={`${post.author.name} ulashgan loyiha rasmi`}
          />
        </div>
      )}
      <div className="post-actions">
        <div className="post-actions-left">
          <button
            className={`post-action ${post.liked ? "is-liked" : ""}`}
            onClick={() => toggleLike(post.id)}
            aria-pressed={post.liked}
            aria-label={`Yoqdi: ${post.likes}`}
          >
            <Heart size={20} fill={post.liked ? "currentColor" : "none"} />
            <span>{post.likes}</span>
          </button>
          <button
            className="post-action"
            onClick={() => setCommentsOpen(!commentsOpen)}
            aria-expanded={commentsOpen}
            aria-controls={commentsId}
            aria-label={`Kommentlar: ${post.comments.length}`}
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
            post.saved ? "Saqlanganlardan olib tashlash" : "Postni saqlash"
          }
          title={post.saved ? "Saqlangan" : "Saqlash"}
        >
          <Bookmark size={20} fill={post.saved ? "currentColor" : "none"} />
        </button>
      </div>
      {commentsOpen && (
        <section
          id={commentsId}
          className="comments-section"
          aria-label="Kommentlar"
        >
          <h3>
            Fikrlar <span className="muted">({post.comments.length})</span>
          </h3>
          {post.comments.length === 0 && (
            <p className="muted small">Suhbatni birinchi bo‘lib boshlang.</p>
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
              aria-label="Komment yozish"
              placeholder="Fikringizni yozing…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              required
            />
            <button
              type="submit"
              className="icon-button"
              disabled={!comment.trim()}
              aria-label="Kommentni yuborish"
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
