export const SKILLS = [
  "Frontend",
  "Python",
  "Hardware",
  "C / C++",
  "UI / UX",
] as const;
export type Skill = (typeof SKILLS)[number];

export interface Peer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  skills: string[];
  online: boolean;
  bio: string;
  project: { name: string; description: string };
}

export interface Comment {
  id: string;
  author: Peer;
  text: string;
  time: string;
}

export interface Post {
  id: string;
  author: Peer;
  text: string;
  image?: string;
  skill: string;
  time: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
}

export interface Conversation {
  id: string;
  // For a group, `peer` is a synthetic display identity (name = group
  // name, avatar = group icon) so existing 1-1 rendering keeps working.
  peer: Peer;
  isGroup?: boolean;
  members?: Peer[];
  lastMessage: string;
  time: string;
  unread: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  time: string;
}

export interface Community {
  total: number;
  online: number;
  topics: { name: string; posts: number; skill: string }[];
}
