"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  MessageCircle,
  Search,
  Send,
  Users,
  UserPlus,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import ChatBubble from "@/components/ChatBubble";
import GroupCreateModal from "@/components/GroupCreateModal";
import { useDemo } from "@/components/DemoProvider";
import { GENERAL_CHANNEL_ID } from "@/lib/api";

function ChatContent() {
  const { conversations, messages, peers, user, sendMessage, markRead } =
    useDemo();
  const params = useSearchParams();
  const peerId = params.get("peer");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [creatingGroup, setCreatingGroup] = useState(false);
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
      "Foydalanuvchi"
    );
  }

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
            SUHBATDAN HAMKORLIKKA
          </div>
          <h1>Aloqada bo‘ling.</h1>
          <p>Keyingi yaxshi g‘oya oddiy salomdan boshlanadi.</p>
        </div>
        <span className="intro-side-note">
          <MessageCircle size={18} />
          Sizning suhbatlaringiz
        </span>
      </section>
      <div
        className={`chat-layout ${selectedVisible ? "conversation-open" : ""}`}
      >
        <aside className="conversation-sidebar" aria-label="Suhbatlar">
          <div className="conversation-list-heading">
            <h2>
              Xabarlar<span>{conversations.length}</span>
            </h2>
            <button
              className="icon-button"
              onClick={() => setCreatingGroup(true)}
              aria-label="Yangi guruh yaratish"
              title="Guruh yaratish"
            >
              <UserPlus size={19} />
            </button>
          </div>
          <div className="chat-search search-field">
            <Search size={17} />
            <input
              type="search"
              placeholder="Pirni qidirish…"
              aria-label="Suhbatlarni qidirish"
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
                        aria-label={`${conversation.unread} ta o‘qilmagan xabar`}
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
            <p className="empty-conversations">Suhbat topilmadi.</p>
          )}
          <div className="chat-sidebar-footer">
            <span className="mini-brand">21</span>
            <span>
              Birga o‘rganish.
              <br />
              <strong>Suhbatdan boshlanadi.</strong>
            </span>
            <ArrowUpRight size={19} />
          </div>
        </aside>
        {selected ? (
          <section
            className="conversation-panel"
            aria-label={`${selected.peer.name} bilan suhbat`}
          >
            <header className="chat-header">
              <button
                className="icon-button chat-back"
                aria-label="Suhbatlar ro‘yxatiga qaytish"
                onClick={() => {
                  setMobileOpen(false);
                  if (peerId) window.history.replaceState(null, "", "/chat");
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <Avatar
                user={selected.peer}
                size="sm"
                showStatus={!selected.isGroup}
              />
              <div>
                <h2>{selected.peer.name}</h2>
                <span className="small muted">
                  {isGeneral
                    ? "Hammaga ochiq"
                    : selected.isGroup
                      ? `${selected.members?.length ?? 0} a’zo`
                      : selected.peer.online
                        ? "Hozir onlayn"
                        : "Hozir oflayn"}
                </span>
              </div>
              {selected.isGroup ? (
                <span className="tag chat-peer-skill">
                  <Users size={13} /> {isGeneral ? "Kanal" : "Guruh"}
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
              aria-label="Xabarlar"
              aria-live="polite"
            >
              <div className="chat-date">
                <span>Suhbat tarixi</span>
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
                  <h2>Salom deb boshlang</h2>
                  <p>Birinchi xabaringizni yuboring.</p>
                </div>
              )}
            </div>
            <form className="message-composer" onSubmit={submit}>
              <textarea
                rows={1}
                aria-label="Xabar yozish"
                placeholder="Xabaringizni yozing…"
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
                aria-label="Xabarni yuborish"
              >
                <Send size={19} />
              </button>
            </form>
          </section>
        ) : (
          <div className="empty-state">
            <MessageCircle size={30} />
            <h2>Suhbatlar hali yo‘q</h2>
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
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-screen" role="status">
          Suhbatlar yuklanmoqda…
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
