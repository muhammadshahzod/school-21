// Frontend-only adapter. Replace these async functions with /lib/api.ts when
// the backend is ready. Components never import the seed data directly.
import type { Community, Conversation, Message, Peer, Post } from "./types";

const portrait = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=120&h=120&q=80`;

const currentUser: Peer = {
  id: "aziz",
  name: "Aziz Karimov",
  username: "akarimov",
  avatar: portrait("photo-1500648767791-00dcc994a43e"),
  skills: ["Frontend", "React", "TypeScript"],
  online: true,
  bio: "Kofe, toza kod va yangi g‘oyalar. Har kuni kechagidan bir oz yaxshiroq.",
  project: {
    name: "Peer Space",
    description:
      "School 21 pirlari uchun g‘oyalar, loyihalar va suhbatlar bir joyda. Hamjamiyatni bir-biriga yaqinlashtiradigan kichik platforma.",
  },
};

const peers: Peer[] = [
  {
    id: "madina",
    name: "Madina Rasulova",
    username: "mrasulov",
    avatar: portrait("photo-1534528741775-53994a69daeb"),
    skills: ["Frontend", "UI / UX"],
    online: true,
    bio: "Interfeyslarni jonlantiraman.",
    project: {
      name: "Focus",
      description: "Diqqatni jamlash uchun minimal vosita.",
    },
  },
  {
    id: "jasur",
    name: "Jasur Aliyev",
    username: "jaliyev",
    avatar: portrait("photo-1506794778202-cad84cf45f1d"),
    skills: ["Python", "AI / ML"],
    online: true,
    bio: "Ma’lumotlar ortidagi hikoyalar.",
    project: {
      name: "Study Buddy",
      description: "Birga o‘rganish uchun yordamchi.",
    },
  },
  {
    id: "nilufar",
    name: "Nilufar Ahmedova",
    username: "nahmedov",
    avatar: portrait("photo-1524504388940-b1c1722653e1"),
    skills: ["UI / UX", "Frontend"],
    online: false,
    bio: "Oddiylik — eng yaxshi dizayn.",
    project: {
      name: "Campus Map",
      description: "Kampus ichidagi yo‘lko‘rsatkich.",
    },
  },
  {
    id: "sardor",
    name: "Sardor Tursunov",
    username: "stursunov",
    avatar: portrait("photo-1519085360753-af0119f7cbe7"),
    skills: ["Hardware", "C / C++"],
    online: true,
    bio: "G‘oyadan prototipgacha.",
    project: {
      name: "Smart Campus",
      description: "Aqlli kampus uchun IoT yechimlari.",
    },
  },
];

const posts: Post[] = [
  {
    id: "post-1",
    author: peers[0],
    skill: "Frontend",
    time: "24 daqiqa oldin",
    text: "Kichik g‘oya, katta boshlanish. ✨\n\nBugun portfolio loyihamning yangi versiyasini tugatdim. Faqat oq-qora, toza tipografika va bir chimdim React. Ba’zan kamroq — ko‘proq degani.\n\nSiz bugun nimalar yaratyapsiz?",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85",
    likes: 24,
    liked: false,
    saved: false,
    comments: [
      {
        id: "comment-1",
        author: peers[2],
        text: "Juda chiroyli! Minimalizm doim yutadi 🙌",
        time: "18 daqiqa oldin",
      },
      {
        id: "comment-2",
        author: currentUser,
        text: "Zo‘r chiqibdi! Men ham yangi loyihani boshladim.",
        time: "12 daqiqa oldin",
      },
    ],
  },
  {
    id: "post-2",
    author: peers[1],
    skill: "Python",
    time: "1 soat oldin",
    text: "Python o‘rganayotgan pirlar, shu yerdamisiz? 👋\n\nErtaga klasterda kichik coding session qilmoqchiman. Pandas bilan real dataset ustida ishlaymiz. Boshlovchilar ham bemalol qo‘shiling!\n\n📍 2-klaster · 18:00",
    likes: 18,
    liked: false,
    saved: false,
    comments: [
      {
        id: "comment-3",
        author: peers[3],
        text: "Men ham qatnashaman!",
        time: "45 daqiqa oldin",
      },
    ],
  },
  {
    id: "post-3",
    author: peers[3],
    skill: "Hardware",
    time: "2 soat oldin",
    text: "Birinchi ishlaydigan prototip!\n\nESP32 bilan kampusdagi xona haroratini kuzatadigan sensor yig‘dim. Endi ma’lumotlarni kichik dashboardga chiqarish qoldi. Frontend bo‘yicha birga ishlaydigan pir bormi?",
    likes: 31,
    liked: false,
    saved: false,
    comments: [],
  },
  {
    id: "post-4",
    author: currentUser,
    skill: "Frontend",
    time: "Kecha",
    text: "Peer Space ustida ish boshlandi. 🚀\n\nBitta joyda fikr almashish, loyihalarga sherik topish va pirlar bilan aloqada bo‘lish. School 21 uchun, School 21 pirlari tomonidan. Birga quramiz!",
    likes: 42,
    liked: false,
    saved: false,
    comments: [],
  },
  {
    id: "post-5",
    author: peers[2],
    skill: "UI / UX",
    time: "Kecha",
    text: "Yaxshi interfeys tafsilotlardan boshlanadi.\n\nBugun Campus Map uchun mobil maketlarni tekshirdik: kattaroq tugmalar, o‘qilishi oson matn va kamroq qadam. Dizayn haqida fikr almashishga doim tayyorman.",
    likes: 16,
    liked: false,
    saved: false,
    comments: [],
  },
];

const conversations: Conversation[] = [
  {
    id: "chat-madina",
    peer: peers[0],
    lastMessage: "Ha, albatta! Birga ko‘rib chiqamiz 🙌",
    time: "14:32",
    unread: 2,
  },
  {
    id: "chat-jasur",
    peer: peers[1],
    lastMessage: "Ertaga coding sessionga kelasizmi?",
    time: "13:45",
    unread: 1,
  },
  {
    id: "chat-sardor",
    peer: peers[3],
    lastMessage: "Prototip tayyor, ko‘rsataman!",
    time: "12:10",
    unread: 0,
  },
  {
    id: "chat-nilufar",
    peer: peers[2],
    lastMessage: "Rahmat, fikrlaringiz juda foydali bo‘ldi.",
    time: "Kecha",
    unread: 0,
  },
];

const messages: Message[] = [
  {
    id: "m-1",
    conversationId: "chat-madina",
    senderId: "madina",
    text: "Salom, Aziz! Yangi loyihangiz qanday ketyapti?",
    time: "14:20",
  },
  {
    id: "m-2",
    conversationId: "chat-madina",
    senderId: "aziz",
    text: "Salom! Yaxshi, hozir lenta sahifasini tugatyapman. Minimal dizayn qilmoqchiman.",
    time: "14:23",
  },
  {
    id: "m-3",
    conversationId: "chat-madina",
    senderId: "madina",
    text: "Zo‘r! Oq-qora uslub menga ham yoqadi. Biror yordam kerak bo‘lsa, yozing :)",
    time: "14:25",
  },
  {
    id: "m-4",
    conversationId: "chat-madina",
    senderId: "aziz",
    text: "Rahmat! Keyinroq interfeys bo‘yicha fikringizni bilmoqchi edim.",
    time: "14:28",
  },
  {
    id: "m-5",
    conversationId: "chat-madina",
    senderId: "madina",
    text: "Ha, albatta! Birga ko‘rib chiqamiz 🙌",
    time: "14:32",
  },
  {
    id: "m-6",
    conversationId: "chat-jasur",
    senderId: "jasur",
    text: "Salom! Ertaga coding sessionga kelasizmi?",
    time: "13:45",
  },
  {
    id: "m-7",
    conversationId: "chat-sardor",
    senderId: "aziz",
    text: "Sensor loyihasi qanday ketyapti?",
    time: "12:05",
  },
  {
    id: "m-8",
    conversationId: "chat-sardor",
    senderId: "sardor",
    text: "Prototip tayyor, ko‘rsataman!",
    time: "12:10",
  },
  {
    id: "m-9",
    conversationId: "chat-nilufar",
    senderId: "nilufar",
    text: "Rahmat, fikrlaringiz juda foydali bo‘ldi.",
    time: "17:40",
  },
];

// Independent copies keep frontend edits from mutating the mock source.
export async function getPosts(): Promise<Post[]> {
  return structuredClone(posts);
}
export async function getMessages(): Promise<Message[]> {
  return structuredClone(messages);
}
export async function getConversations(): Promise<Conversation[]> {
  return structuredClone(conversations);
}
export async function getCurrentUser(): Promise<Peer> {
  return structuredClone(currentUser);
}
export async function getPeers(): Promise<Peer[]> {
  return structuredClone(peers);
}
export async function getCommunity(): Promise<Community> {
  return {
    total: 128,
    online: 12,
    topics: [
      { name: "#buildinpublic", posts: 24, skill: "Frontend" },
      { name: "#python", posts: 18, skill: "Python" },
      { name: "#peerlearning", posts: 12, skill: "Barchasi" },
    ],
  };
}
