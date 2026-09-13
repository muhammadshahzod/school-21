// Backend-backed data layer consumed by components/DemoProvider.tsx.
import type {
  Community,
  Conversation,
  Message,
  Peer,
  Post,
  Comment as PeerComment,
} from "@/components/types";

type ApiPerson = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  skills: string[];
  projectTitle: string | null;
  projectDescription: string | null;
  lastActiveAt: string;
  email?: string;
};

// A user counts as "online" if their session was last touched within this
// window (lib/auth.ts bumps lastActiveAt on every authenticated request).
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

type ApiComment = {
  id: string;
  content: string;
  createdAt: string;
  user: ApiPerson;
};

type ApiPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  skill: string;
  createdAt: string;
  author: ApiPerson;
  _count: { likes: number; comments: number };
  likes?: { id: string }[];
  saves?: { id: string }[];
  comments: ApiComment[];
};

type ApiMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
};

type ApiConversation = {
  id: string;
  peer: ApiPerson;
  lastMessage: string;
  time: string;
  unread: number;
};

type ApiCommunity = {
  total: number;
  online: number;
  topics: { name: string; posts: number; skill: string }[];
};

type ApiChannelMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    throw new Error(`So'rov muvaffaqiyatsiz: ${url} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function sendJson<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(
      (payload && typeof payload.error === "string" && payload.error) ||
        `So'rov muvaffaqiyatsiz: ${url} (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

function relativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "Hozirgina";
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} soat oldin`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Kecha";
  if (diffDay < 7) return `${diffDay} kun oldin`;
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}

function shortTime(iso: string): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function toPeer(u: ApiPerson): Peer {
  return {
    id: u.id,
    name: u.name ?? "Foydalanuvchi",
    username: u.username ?? u.email?.split("@")[0] ?? u.id,
    avatar: u.image ?? "",
    skills: u.skills,
    online: Date.now() - new Date(u.lastActiveAt).getTime() < ONLINE_THRESHOLD_MS,
    bio: u.bio ?? "",
    project: {
      name: u.projectTitle ?? "",
      description: u.projectDescription ?? "",
    },
  };
}

function toComment(c: ApiComment): PeerComment {
  return {
    id: c.id,
    author: toPeer(c.user),
    text: c.content,
    time: relativeTime(c.createdAt),
  };
}

function toPost(p: ApiPost): Post {
  return {
    id: p.id,
    author: toPeer(p.author),
    text: p.content,
    image: p.imageUrl ?? undefined,
    skill: p.skill,
    time: relativeTime(p.createdAt),
    likes: p._count.likes,
    liked: (p.likes?.length ?? 0) > 0,
    saved: (p.saves?.length ?? 0) > 0,
    comments: p.comments.map(toComment),
  };
}

function toConversation(c: ApiConversation): Conversation {
  return {
    id: c.id,
    peer: toPeer(c.peer),
    lastMessage: c.lastMessage,
    time: shortTime(c.time),
    unread: c.unread,
  };
}

export async function getPosts(): Promise<Post[]> {
  const posts = await fetchJson<ApiPost[]>("/api/posts");
  return posts.map(toPost);
}

export async function getCurrentUser(): Promise<Peer> {
  const me = await fetchJson<ApiPerson>("/api/users/me");
  return toPeer(me);
}

export async function getPeers(): Promise<Peer[]> {
  const [me, users] = await Promise.all([
    fetchJson<ApiPerson>("/api/users/me"),
    fetchJson<ApiPerson[]>("/api/users"),
  ]);
  return users.filter((u) => u.id !== me.id).map(toPeer);
}

export async function getConversations(): Promise<Conversation[]> {
  const conversations = await fetchJson<ApiConversation[]>(
    "/api/conversations"
  );
  return conversations.map(toConversation);
}

export async function getMessages(): Promise<Message[]> {
  const [me, messages] = await Promise.all([
    fetchJson<ApiPerson>("/api/users/me"),
    fetchJson<ApiMessage[]>("/api/messages"),
  ]);
  return messages.map((m) => ({
    id: m.id,
    conversationId: m.senderId === me.id ? m.receiverId : m.senderId,
    senderId: m.senderId,
    text: m.content,
    time: shortTime(m.createdAt),
  }));
}

export async function getCommunity(): Promise<Community> {
  return fetchJson<ApiCommunity>("/api/community");
}

export async function sendPost(
  content: string,
  skill: string,
  imageUrl?: string
): Promise<Post> {
  const post = await sendJson<ApiPost>("/api/posts", "POST", {
    content,
    skill,
    imageUrl,
  });
  return toPost(post);
}

export async function toggleLikePost(id: string): Promise<{ liked: boolean }> {
  return sendJson(`/api/posts/${id}/like`, "POST");
}

export async function toggleSavePost(id: string): Promise<{ saved: boolean }> {
  return sendJson(`/api/posts/${id}/save`, "POST");
}

export async function sendComment(
  postId: string,
  content: string
): Promise<PeerComment> {
  const comment = await sendJson<ApiComment>(
    `/api/posts/${postId}/comments`,
    "POST",
    { content }
  );
  return toComment(comment);
}

export async function sendDirectMessage(
  receiverId: string,
  content: string
): Promise<Message> {
  const message = await sendJson<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }>("/api/messages", "POST", { receiverId, content });
  return {
    id: message.id,
    conversationId: receiverId,
    senderId: message.senderId,
    text: message.content,
    time: shortTime(message.createdAt),
  };
}

export const GENERAL_CHANNEL_ID = "general";

export async function getGeneralMessages(): Promise<Message[]> {
  const messages = await fetchJson<ApiChannelMessage[]>(
    "/api/messages/general"
  );
  return messages.map((m) => ({
    id: m.id,
    conversationId: GENERAL_CHANNEL_ID,
    senderId: m.senderId,
    text: m.content,
    time: shortTime(m.createdAt),
  }));
}

export async function sendGeneralMessage(content: string): Promise<Message> {
  const message = await sendJson<ApiChannelMessage>(
    "/api/messages/general",
    "POST",
    { content }
  );
  return {
    id: message.id,
    conversationId: GENERAL_CHANNEL_ID,
    senderId: message.senderId,
    text: message.content,
    time: shortTime(message.createdAt),
  };
}

// GET /api/messages/[userId] marks the peer's messages as read as a
// side effect; we already hold the full message list client-side, so the
// response body itself isn't needed here.
export async function markConversationRead(peerId: string): Promise<void> {
  await fetchJson(`/api/messages/${peerId}`);
}

type ApiGroup = {
  id: string;
  name: string;
  members: ApiPerson[];
  lastMessage: string;
  time: string;
};

type ApiGroupMessage = {
  id: string;
  senderId: string;
  groupId: string;
  content: string;
  createdAt: string;
};

function toGroupConversation(g: ApiGroup): Conversation {
  const members = g.members.map(toPeer);
  return {
    id: g.id,
    peer: {
      id: g.id,
      name: g.name,
      username: "",
      avatar: "",
      skills: [],
      online: false,
      bio: `${members.length} a'zo`,
      project: { name: "", description: "" },
    },
    isGroup: true,
    members,
    lastMessage: g.lastMessage,
    time: shortTime(g.time),
    unread: 0,
  };
}

export async function getGroups(): Promise<Conversation[]> {
  const groups = await fetchJson<ApiGroup[]>("/api/groups");
  return groups.map(toGroupConversation);
}

export async function createGroupApi(
  name: string,
  memberIds: string[]
): Promise<Conversation> {
  const group = await sendJson<ApiGroup>("/api/groups", "POST", {
    name,
    memberIds,
  });
  return toGroupConversation(group);
}

export async function getGroupMessages(): Promise<Message[]> {
  const messages = await fetchJson<ApiGroupMessage[]>("/api/groups/messages");
  return messages.map((m) => ({
    id: m.id,
    conversationId: m.groupId,
    senderId: m.senderId,
    text: m.content,
    time: shortTime(m.createdAt),
  }));
}

export async function sendGroupMessage(
  groupId: string,
  content: string
): Promise<Message> {
  const message = await sendJson<ApiGroupMessage>(
    `/api/groups/${groupId}/messages`,
    "POST",
    { content }
  );
  return {
    id: message.id,
    conversationId: message.groupId,
    senderId: message.senderId,
    text: message.content,
    time: shortTime(message.createdAt),
  };
}

export interface AppNotification {
  id: string;
  type: "like" | "comment" | "message";
  read: boolean;
  createdAt: string;
  postId: string | null;
  postPreview: string | null;
  actor: Peer;
}

type ApiNotification = {
  id: string;
  type: "like" | "comment" | "message";
  read: boolean;
  createdAt: string;
  postId: string | null;
  postPreview: string | null;
  actor: ApiPerson;
};

export async function getNotifications(): Promise<AppNotification[]> {
  const notifications = await fetchJson<ApiNotification[]>(
    "/api/notifications"
  );
  return notifications.map((n) => ({
    ...n,
    actor: toPeer(n.actor),
  }));
}

export async function markNotificationsRead(): Promise<void> {
  await sendJson("/api/notifications/read", "POST");
}

export async function updateMyProfile(profile: {
  name: string;
  bio: string;
  skills: string[];
  project: { name: string; description: string };
  avatar?: string;
}): Promise<Peer> {
  const updated = await sendJson<ApiPerson>("/api/users/me", "PATCH", {
    name: profile.name,
    bio: profile.bio,
    skills: profile.skills,
    projectTitle: profile.project.name,
    projectDescription: profile.project.description,
    ...(profile.avatar !== undefined && { image: profile.avatar }),
  });
  return toPeer(updated);
}

export async function deletePost(id: string): Promise<void> {
  await sendJson(`/api/posts/${id}`, "DELETE");
}

export async function deleteMessage(id: string): Promise<void> {
  await sendJson(`/api/admin/messages/${id}`, "DELETE");
}

export async function editPost(
  id: string,
  content: string,
  skill: string,
  imageUrl?: string
): Promise<Post> {
  const post = await sendJson<ApiPost>(`/api/posts/${id}`, "PATCH", {
    content,
    skill,
    imageUrl,
  });
  return toPost(post);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await sendJson("/api/users/me/password", "PATCH", {
    currentPassword,
    newPassword,
  });
}
