import type { Message } from "./types";

export default function ChatBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  return (
    <div className={`chat-message ${isOwn ? "own" : "incoming"}`}>
      <div className="chat-bubble">
        <p>{message.text}</p>
        <time>{message.time}</time>
      </div>
    </div>
  );
}
