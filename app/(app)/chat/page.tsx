"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  MessageCircle,
  MessageSquarePlus,
  Search,
  Send,
  Users,
  UserPlus,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import ChatBubble from "@/components/ChatBubble";
import GroupCreateModal from "@/components/GroupCreateModal";
import NewMessageModal from "@/components/NewMessageModal";
import { useDemo } from "@/components/DemoProvider";
import { GENERAL_CHANNEL_ID } from "@/lib/api";
import { useLang } from "@/lib/useLang";

function ChatContent() {
  const {
    conversations,
    messages,
    peers,
    user,
    sendMessage,
    markRead,
    ensureConversation,
  } = useDemo();
  const { t } = useLang();
  const params = useSearchParams();
  const peerId = params.get("peer");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [startingNewMessage, setStartingNewMessage] = useState(false);
  const requested = conversations.find((c) => c.peer.id === peerId);
  const selected =
    conversations.find((c) => c.id === selectedId) ??
    requested ??
    conversations[0];
  const visibleMessages = messages.filter(
    (m) => m.conversationId === selected?.id,
  );
  const visibleConversations = conversations.filter((c) =>
    `${c.peer.name} ${c.peer.username} ${c.lastMessage}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  const messageList = useRef<HTMLDivElement>(null);
  const selectedVisible = mobileOpen || Boolean(requested);
  const draft = drafts[selected?.id] ?? "";
  const isGeneral = selected?.id === GENERAL_CHANNEL_ID;

  function senderName(senderId: string) {
    if (senderId === user.id) return user.name;
    return (
      peers.find((peer) => peer.id === senderId)?.name ??
      selected?.members?.find((member) => member.id === senderId)?.name ??
      t("chat.default_sender")
    );
  }

  useEffect(() => {
    if (!peerId || requested) return;
    const peer = peers.find((p) => p.id === peerId);
    if (peer) ensureConversation(peer);
  }, [peerId, requested, peers, ensureConversation]);

  useEffect(() => {
    if (!selected) return;
    if (selectedVisible || window.matchMedia("(min-width: 761px)").matches)
      markRead(selected.id);
  }, [selected, selectedVisible, markRead]);

  useEffect(() => {
    const list = messageList.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [selected?.id, visibleMessages.length]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !draft.trim()) return;
    sendMessage(selected.id, draft);
    setDrafts((prev) => ({ ...prev, [selected.id]: "" }));
  }

  return (
    <div className="page-container chat-page">
      <section className="page-intro compact-intro">
        <div>
          <div className="eyebrow intro-eyebrow">
            <span className="tiny-square" />
            {t("chat.eyebrow")}
          </div>
          <h1>{t("chat.heading")}</h1>
          <p>{t("chat.subtitle")}</p>
        </div>
        <span className="intro-side-note">
          <MessageCircle size={18} />
          {t("chat.side_note")}
        </span>
      </section>
      <div
        className={`chat-layout ${selectedVisible ? "conversation-open" : ""}`}
      >
        <aside className="conversation-sidebar" aria-label={t("chat.messages_heading")}>
          <div className="conversation-list-heading">
            <h2>
              {t("chat.messages_heading")}
              <span>{conversations.length}</span>
            </h2>
            <div className="conversation-list-actions">
              <button
                className="icon-button"
                onClick={() => setStartingNewMessage(true)}
                aria-label={t("chat.new_message_title")}
                title={t("chat.new_message")}
              >
                <MessageSquarePlus size={19} />
              </button>
              <button
                className="icon-button"
                onClick={() => setCreatingGroup(true)}
                aria-label={t("chat.new_group_title")}
                title={t("chat.new_group")}
              >
                <UserPlus size={19} />
              </button>
            </div>
          </div>
          <div className="chat-search search-field">
            <Search size={17} />
            <input
              type="search"
              placeholder={t("chat.search_placeholder")}
              aria-label={t("chat.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="conversation-list">
            {visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`conversation-item ${selected?.id === conversation.id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedId(conversation.id);
                  setMobileOpen(true);
                  markRead(conversation.id);
                }}
                aria-pressed={selected?.id === conversation.id}
              >
                <Avatar user={conversation.peer} showStatus />
                <span className="conversation-info">
                  <span className="conversation-name">
                    <strong>{conversation.peer.name}</strong>
                    <time>{conversation.time}</time>
                  </span>
                  <span className="conversation-preview">
                    <span>{conversation.lastMessage}</span>
                    {conversation.unread > 0 && (
                      <span
                        className="unread-count"
                        aria-label={t("chat.unread_aria", { n: conversation.unread })}
                      >
                        {conversation.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {visibleConversations.length === 0 && (
            <p className="empty-conversations">{t("chat.no_conversations")}</p>
          )}
          <div className="chat-sidebar-footer">
            <span className="mini-brand">21</span>
            <span>
              {t("chat.footer_line1")}
              <br />
              <strong>{t("chat.footer_line2")}</strong>
            </span>
            <ArrowUpRight size={19} />
          </div>
        </aside>
        {selected ? (
          <section
            className="conversation-panel"
            aria-label={t("chat.conversation_aria", { name: selected.peer.name })}
          >
            <header className="chat-header">
              <button
                className="icon-button chat-back"
                aria-label={t("chat.back")}
                onClick={() => {
                  setMobileOpen(false);
                  if (peerId) window.history.replaceState(null, "", "/chat");
                }}
              >
                <ArrowLeft size={20} />
              </button>
              {selected.isGroup ? (
                <Avatar
                  user={selected.peer}
                  size="sm"
                  showStatus={!selected.isGroup}
                />
              ) : (
                <Link href={`/peer/${selected.peer.id}`}>
                  <Avatar user={selected.peer} size="sm" showStatus />
                </Link>
              )}
              <div>
                {selected.isGroup ? (
                  <h2>{selected.peer.name}</h2>
                ) : (
                  <h2>
                    <Link
                      href={`/peer/${selected.peer.id}`}
                      className="chat-header-name-link"
                    >
                      {selected.peer.name}
                    </Link>
                  </h2>
                )}
                <span className="small muted">
                  {isGeneral
                    ? t("chat.public_channel")
                    : selected.isGroup
                      ? t("chat.members_count", { n: selected.members?.length ?? 0 })
                      : selected.peer.online
                        ? t("chat.online")
                        : t("chat.offline")}
                </span>
              </div>
              {selected.isGroup ? (
                <span className="tag chat-peer-skill">
                  <Users size={13} /> {isGeneral ? t("chat.channel_tag") : t("chat.group_tag")}
                </span>
              ) : (
                <span className="tag chat-peer-skill">
                  {selected.peer.skills[0]}
                </span>
              )}
            </header>
            <div
              className="messages-scroll"
              ref={messageList}
              role="log"
              aria-label={t("chat.messages_heading")}
              aria-live="polite"
            >
              <div className="chat-date">
                <span>{t("chat.chat_history")}</span>
              </div>
              {visibleMessages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user.id}
                  senderName={
                    selected.isGroup ? senderName(message.senderId) : undefined
                  }
                />
              ))}
              {visibleMessages.length === 0 && (
                <div className="empty-state">
                  <MessageCircle size={28} />
                  <h2>{t("chat.empty_chat_title")}</h2>
                  <p>{t("chat.empty_chat_desc")}</p>
                </div>
              )}
            </div>
            <form className="message-composer" onSubmit={submit}>
              <textarea
                rows={1}
                aria-label={t("chat.message_placeholder")}
                placeholder={t("chat.message_placeholder")}
                value={draft}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [selected.id]: e.target.value,
                  }))
                }
                maxLength={2000}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button
                className="send-message-button"
                type="submit"
                disabled={!draft.trim()}
                aria-label={t("chat.send_message")}
              >
                <Send size={19} />
              </button>
            </form>
          </section>
        ) : (
          <div className="empty-state">
            <MessageCircle size={30} />
            <h2>{t("chat.no_chats_title")}</h2>
          </div>
        )}
      </div>
      {creatingGroup && (
        <GroupCreateModal
          onClose={() => setCreatingGroup(false)}
          onCreated={(id) => {
            setSelectedId(id);
            setMobileOpen(true);
          }}
        />
      )}
      {startingNewMessage && (
        <NewMessageModal
          onClose={() => setStartingNewMessage(false)}
          onSelect={(peer) => {
            const id = ensureConversation(peer);
            setSelectedId(id);
            setMobileOpen(true);
            setStartingNewMessage(false);
          }}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  const { t } = useLang();
  return (
    <Suspense
      fallback={
        <div className="loading-screen" role="status">
          {t("chat.loading")}
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
