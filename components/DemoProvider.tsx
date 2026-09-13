"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import {
  GENERAL_CHANNEL_ID,
  createGroupApi,
  deleteMessage as apiDeleteMessage,
  deletePost as apiDeletePost,
  editPost as apiEditPost,
  getCommunity,
  getConversations,
  getCurrentUser,
  getGeneralMessages,
  getGroupMessages,
  getGroups,
  getMessages,
  getNotifications,
  getPeers,
  getPosts,
  markConversationRead,
  markNotificationsRead as apiMarkNotificationsRead,
  sendComment as apiSendComment,
  sendDirectMessage,
  sendGeneralMessage,
  sendGroupMessage,
  sendPost as apiSendPost,
  toggleLikePost,
  toggleReaction as apiToggleReaction,
  toggleSavePost,
  updateMyProfile,
  type AppNotification,
} from "@/lib/api";
import { useLang } from "@/lib/useLang";
import type { Community, Conversation, Message, Peer, Post } from "./types";

interface DemoState {
  user: Peer;
  posts: Post[];
  conversations: Conversation[];
  messages: Message[];
  peers: Peer[];
  community: Community;
  notifications: AppNotification[];
}

interface DemoContextValue extends DemoState {
  addPost: (text: string, skill: string, image?: string) => Promise<void>;
  deletePost: (id: string) => void;
  editPost: (
    id: string,
    text: string,
    skill: string,
    image?: string,
  ) => Promise<void>;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  toggleReaction: (id: string, emoji: string) => void;
  addComment: (id: string, text: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  deleteMessage: (id: string) => void;
  markRead: (conversationId: string) => void;
  createGroup: (name: string, memberIds: string[]) => Promise<string>;
  ensureConversation: (peer: Peer) => string;
  markNotificationsRead: () => void;
  updateProfile: (
    profile: Pick<Peer, "name" | "bio" | "skills" | "project"> & {
      avatar?: string;
    },
  ) => Promise<void>;
}

const DemoContext = createContext<DemoContextValue | null>(null);
// HTTP over a local Wi-Fi network may not expose crypto.randomUUID.
const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const timeNow = () =>
  new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

export function DemoProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const { t } = useLang();
  const [data, setData] = useState<DemoState | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    Promise.all([
      getCurrentUser(),
      getPosts(),
      getConversations(),
      getGroups(),
      getMessages(),
      getGeneralMessages(),
      getGroupMessages(),
      getPeers(),
      getCommunity(),
      getNotifications(),
    ])
      .then(
        ([
          user,
          posts,
          conversations,
          groups,
          directMessages,
          generalMessages,
          groupMessages,
          peers,
          community,
          notifications,
        ]) => {
          if (!active) return;
          const lastGeneral = generalMessages[generalMessages.length - 1];
          const generalConversation: Conversation = {
            id: GENERAL_CHANNEL_ID,
            peer: {
              id: GENERAL_CHANNEL_ID,
              name: t("demoProvider.general_channel_name"),
              username: "",
              avatar: "",
              skills: [],
              online: false,
              bio: t("demoProvider.general_channel_bio"),
              project: { name: "", description: "" },
            },
            isGroup: true,
            lastMessage: lastGeneral?.text ?? t("demoProvider.no_messages_yet"),
            time: lastGeneral?.time ?? "",
            unread: 0,
          };
          setData({
            user,
            posts,
            conversations: [generalConversation, ...groups, ...conversations],
            messages: [...directMessages, ...generalMessages, ...groupMessages],
            peers,
            community,
            notifications,
          });
          setError(false);
        },
      )
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
    // `t` is intentionally omitted: it only labels the synthetic #general
    // conversation, and refetching all app data on every language switch
    // would be wasteful and would blow away local optimistic state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, attempt]);

  const markRead = useCallback(
    (conversationId: string) => {
      setData((prev) => {
        if (
          !prev ||
          !prev.conversations.some(
            (c) => c.id === conversationId && c.unread > 0,
          )
        )
          return prev;
        return {
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === conversationId ? { ...c, unread: 0 } : c,
          ),
        };
      });
      if (conversationId === GENERAL_CHANNEL_ID) return;
      const conversation = data?.conversations.find(
        (c) => c.id === conversationId,
      );
      if (conversation && !conversation.isGroup) {
        markConversationRead(conversation.peer.id).catch(() => {});
      }
    },
    [data],
  );

  if (status === "loading" || (status === "authenticated" && !data && !error))
    return (
      <div className="loading-screen" role="status">
        <span className="loading-mark">21</span>
        <p>{t("demoProvider.loading")}</p>
      </div>
    );

  if (status === "unauthenticated")
    return (
      <div className="loading-screen" role="status">
        <span className="loading-mark">21</span>
        <p>{t("demoProvider.unauthenticated")}</p>
        <a className="button button-primary" href="/login">
          {t("demoProvider.go_to_login")}
        </a>
      </div>
    );

  if (error || !data)
    return (
      <div className="loading-screen" role="status">
        <span className="loading-mark">21</span>
        <p>{t("demoProvider.load_error")}</p>
        <button
          className="button button-primary"
          onClick={() => {
            setError(false);
            setAttempt((n) => n + 1);
          }}
        >
          {t("demoProvider.retry")}
        </button>
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
    async addPost(text, skill, image) {
      if (!text.trim()) return;
      const post = await apiSendPost(text.trim(), skill, image);
      setData((prev) => prev && { ...prev, posts: [post, ...prev.posts] });
    },
    deletePost(id) {
      const previous = data.posts;
      setData((prev) => prev && { ...prev, posts: prev.posts.filter((p) => p.id !== id) });
      apiDeletePost(id).catch(() => {
        setData((prev) => prev && { ...prev, posts: previous });
        setActionError(t("demoProvider.err_post_delete"));
      });
    },
    async editPost(id, text, skill, image) {
      const updated = await apiEditPost(id, text.trim(), skill, image);
      setData(
        (prev) =>
          prev && {
            ...prev,
            posts: prev.posts.map((post) => (post.id === id ? updated : post)),
          },
      );
    },
    toggleLike(id) {
      const previous = data.posts.find((post) => post.id === id);
      if (!previous) return;
      updatePost(id, (post) => ({
        ...post,
        liked: !post.liked,
        likes: post.likes + (post.liked ? -1 : 1),
      }));
      toggleLikePost(id).catch(() => {
        updatePost(id, () => previous);
        setActionError(t("demoProvider.err_like"));
      });
    },
    toggleSave(id) {
      const previous = data.posts.find((post) => post.id === id);
      if (!previous) return;
      updatePost(id, (post) => ({ ...post, saved: !post.saved }));
      toggleSavePost(id).catch(() => {
        updatePost(id, () => previous);
        setActionError(t("demoProvider.err_save"));
      });
    },
    toggleReaction(id, emoji) {
      const previous = data.posts.find((post) => post.id === id);
      if (!previous) return;
      const removing = previous.myReaction === emoji;
      const nextReactions = previous.reactions
        .map((r) =>
          r.emoji === previous.myReaction ? { ...r, count: r.count - 1 } : r
        )
        .filter((r) => r.count > 0);
      if (!removing) {
        const existing = nextReactions.find((r) => r.emoji === emoji);
        if (existing) existing.count += 1;
        else nextReactions.push({ emoji, count: 1 });
      }
      updatePost(id, (post) => ({
        ...post,
        reactions: nextReactions,
        myReaction: removing ? null : emoji,
      }));
      apiToggleReaction(id, emoji)
        .then((result) => {
          updatePost(id, (post) => ({
            ...post,
            reactions: result.reactions,
            myReaction: result.myReaction,
          }));
        })
        .catch(() => {
          updatePost(id, () => previous);
          setActionError(t("demoProvider.err_reaction"));
        });
    },
    addComment(id, text) {
      if (!text.trim()) return;
      apiSendComment(id, text.trim())
        .then((comment) => {
          updatePost(id, (post) => ({
            ...post,
            comments: [...post.comments, comment],
          }));
        })
        .catch(() => {
          setActionError(t("demoProvider.err_comment"));
        });
    },
    sendMessage(conversationId, text) {
      const trimmed = text.trim();
      if (!trimmed) return;
      const tempId = newId();
      const time = timeNow();
      const conversation = data.conversations.find(
        (c) => c.id === conversationId,
      );
      setData(
        (prev) =>
          prev && {
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: tempId,
                conversationId,
                senderId: prev.user.id,
                text: trimmed,
                time,
              },
            ],
            conversations: prev.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, lastMessage: trimmed, time, unread: 0 }
                : c,
            ),
          },
      );

      const request =
        conversationId === GENERAL_CHANNEL_ID
          ? sendGeneralMessage(trimmed)
          : conversation?.isGroup
            ? sendGroupMessage(conversationId, trimmed)
            : sendDirectMessage(conversation?.peer.id ?? conversationId, trimmed);

      request
        .then((real) => {
          setData(
            (prev) =>
              prev && {
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === tempId ? real : m,
                ),
              },
          );
        })
        .catch(() => {
          setData(
            (prev) =>
              prev && {
                ...prev,
                messages: prev.messages.filter((m) => m.id !== tempId),
              },
          );
          setActionError(t("demoProvider.err_message"));
        });
    },
    deleteMessage(id) {
      const previous = data.messages;
      setData(
        (prev) =>
          prev && {
            ...prev,
            messages: prev.messages.filter((m) => m.id !== id),
          },
      );
      apiDeleteMessage(id).catch(() => {
        setData((prev) => prev && { ...prev, messages: previous });
        setActionError(t("demoProvider.err_message_delete"));
      });
    },
    markRead,
    async createGroup(name, memberIds) {
      const conversation = await createGroupApi(name, memberIds);
      setData(
        (prev) =>
          prev && {
            ...prev,
            conversations: [conversation, ...prev.conversations],
          },
      );
      return conversation.id;
    },
    ensureConversation(peer) {
      setData((prev) => {
        if (!prev) return prev;
        if (prev.conversations.some((c) => c.id === peer.id)) return prev;
        const draft: Conversation = {
          id: peer.id,
          peer,
          lastMessage: "",
          time: "",
          unread: 0,
        };
        return { ...prev, conversations: [draft, ...prev.conversations] };
      });
      return peer.id;
    },
    markNotificationsRead() {
      setData(
        (prev) =>
          prev && {
            ...prev,
            notifications: prev.notifications.map((n) => ({ ...n, read: true })),
          },
      );
      apiMarkNotificationsRead().catch(() => {});
    },
    async updateProfile(profile) {
      const updated = await updateMyProfile(profile);
      setData(
        (prev) =>
          prev && {
            ...prev,
            user: updated,
            posts: prev.posts.map((post) => ({
              ...post,
              author: post.author.id === updated.id ? updated : post.author,
              comments: post.comments.map((comment) =>
                comment.author.id === updated.id
                  ? { ...comment, author: updated }
                  : comment,
              ),
            })),
          },
      );
    },
  };

  return (
    <DemoContext.Provider value={value}>
      {actionError && (
        <div className="action-error-banner" role="alert">
          <span>{actionError}</span>
          <button
            className="icon-button small-icon"
            onClick={() => setActionError(null)}
            aria-label={t("demoProvider.dismiss")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
