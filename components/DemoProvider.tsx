"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCommunity,
  getConversations,
  getCurrentUser,
  getMessages,
  getPeers,
  getPosts,
} from "./mock-api";
import type { Community, Conversation, Message, Peer, Post } from "./types";

interface DemoState {
  user: Peer;
  posts: Post[];
  conversations: Conversation[];
  messages: Message[];
  peers: Peer[];
  community: Community;
}

interface DemoContextValue extends DemoState {
  addPost: (text: string, skill: string, image?: string) => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  addComment: (id: string, text: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  markRead: (conversationId: string) => void;
  updateProfile: (
    profile: Pick<Peer, "name" | "bio" | "skills" | "project">,
  ) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);
// HTTP over a local Wi-Fi network may not expose crypto.randomUUID.
const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const timeNow = () =>
  new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

export function DemoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoState | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      getCurrentUser(),
      getPosts(),
      getConversations(),
      getMessages(),
      getPeers(),
      getCommunity(),
    ])
      .then(([user, posts, conversations, messages, peers, community]) => {
        if (active) {
          setData({ user, posts, conversations, messages, peers, community });
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const markRead = useCallback((conversationId: string) => {
    setData((prev) => {
      if (
        !prev ||
        !prev.conversations.some((c) => c.id === conversationId && c.unread > 0)
      )
        return prev;
      return {
        ...prev,
        conversations: prev.conversations.map((c) =>
          c.id === conversationId ? { ...c, unread: 0 } : c,
        ),
      };
    });
  }, []);

  if (!data)
    return (
      <div className="loading-screen" role="status">
        <span className="loading-mark">21</span>
        <p>
          {error
            ? "Ma’lumotlarni yuklab bo‘lmadi."
            : "Davrangiz tayyorlanmoqda…"}
        </p>
        {error && (
          <button
            className="button button-primary"
            onClick={() => {
              setError(false);
              setAttempt((n) => n + 1);
            }}
          >
            Qayta urinish
          </button>
        )}
      </div>
    );

  const updatePost = (id: string, update: (post: Post) => Post) => {
    setData(
      (prev) =>
        prev && {
          ...prev,
          posts: prev.posts.map((post) =>
            post.id === id ? update(post) : post,
          ),
        },
    );
  };

  const value: DemoContextValue = {
    ...data,
    addPost(text, skill, image) {
      if (!text.trim()) return;
      const id = newId();
      setData(
        (prev) =>
          prev && {
            ...prev,
            posts: [
              {
                id,
                author: prev.user,
                text: text.trim(),
                skill,
                image,
                time: "Hozirgina",
                likes: 0,
                liked: false,
                saved: false,
                comments: [],
              },
              ...prev.posts,
            ],
          },
      );
    },
    toggleLike(id) {
      updatePost(id, (post) => ({
        ...post,
        liked: !post.liked,
        likes: post.likes + (post.liked ? -1 : 1),
      }));
    },
    toggleSave(id) {
      updatePost(id, (post) => ({ ...post, saved: !post.saved }));
    },
    addComment(id, text) {
      if (!text.trim()) return;
      const comment = {
        id: newId(),
        author: data.user,
        text: text.trim(),
        time: "Hozirgina",
      };
      updatePost(id, (post) => ({
        ...post,
        comments: [...post.comments, comment],
      }));
    },
    sendMessage(conversationId, text) {
      if (!text.trim()) return;
      const id = newId();
      const time = timeNow();
      setData((prev) => {
        if (!prev || !prev.conversations.some((c) => c.id === conversationId))
          return prev;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id,
              conversationId,
              senderId: prev.user.id,
              text: text.trim(),
              time,
            },
          ],
          conversations: prev.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: text.trim(), time, unread: 0 }
              : c,
          ),
        };
      });
    },
    markRead,
    updateProfile(profile) {
      setData((prev) => {
        if (!prev) return prev;
        const user = { ...prev.user, ...profile };
        return {
          ...prev,
          user,
          posts: prev.posts.map((post) => ({
            ...post,
            author: post.author.id === user.id ? user : post.author,
            comments: post.comments.map((comment) =>
              comment.author.id === user.id
                ? { ...comment, author: user }
                : comment,
            ),
          })),
        };
      });
    },
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
