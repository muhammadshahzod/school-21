// Backend-backed adapter with the same shape as components/mock-api.ts.
// Swap the import in components/DemoProvider.tsx from "./mock-api" to
// "@/lib/api" to switch the frontend from mock data to the real API.
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

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    throw new Error(`So'rov muvaffaqiyatsiz: ${url} (${res.status})`);
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
