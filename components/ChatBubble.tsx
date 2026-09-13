"use client";

import { Trash2 } from "lucide-react";
import { useDemo } from "./DemoProvider";
import { useLang } from "@/lib/useLang";
import type { Message } from "./types";

export default function ChatBubble({
  message,
  isOwn,
  senderName,
}: {
  message: Message;
  isOwn: boolean;
  senderName?: string;
}) {
  const { user, deleteMessage } = useDemo();
  const { t } = useLang();
  const isAdmin = user.username === "shahzod";
  return (
    <div className={`chat-message ${isOwn ? "own" : "incoming"}`}>
      <div className="chat-bubble">
        {isAdmin && (
          <button
            className="chat-bubble-delete"
            aria-label={t("chatBubble.delete_message")}
            title={t("chatBubble.delete_title")}
            onClick={() => {
              if (confirm(t("chatBubble.delete_confirm")))
                deleteMessage(message.id);
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
        {senderName && !isOwn && (
          <span className="chat-bubble-sender">{senderName}</span>
        )}
        <p>{message.text}</p>
        <time>{message.time}</time>
      </div>
    </div>
  );
}
