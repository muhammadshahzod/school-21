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
  return (
    <div className={`chat-message ${isOwn ? "own" : "incoming"}`}>
      <div className="chat-bubble">
        {senderName && !isOwn && (
          <span className="chat-bubble-sender">{senderName}</span>
        )}
        <p>{message.text}</p>
        <time>{message.time}</time>
      </div>
    </div>
  );
}
