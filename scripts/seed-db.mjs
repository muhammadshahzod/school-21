import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      skills TEXT[] NOT NULL DEFAULT '{}',
      project_title TEXT NOT NULL DEFAULT '',
      project_description TEXT NOT NULL DEFAULT '',
      last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app_posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      image_url TEXT,
      skill TEXT NOT NULL DEFAULT 'Frontend',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app_likes (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES app_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      UNIQUE (post_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS app_saves (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES app_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      UNIQUE (post_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS app_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES app_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      receiver_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
      channel TEXT,
      content TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

const users = [
  {
    id: "u_aziz",
    username: "aziz",
    password: "parol123",
    name: "Aziz Karimov",
    image: "https://i.pravatar.cc/150?img=11",
    bio: "Backend va ma'lumotlar bazalari bilan shug'ullanaman.",
    skills: ["Python", "Django", "PostgreSQL"],
    projectTitle: "Smart Attendance",
    projectDescription:
      "Yuz tanish orqali talabalar davomatini avtomatik qayd qiluvchi tizim.",
  },
  {
    id: "u_dilnoza",
    username: "dilnoza",
    password: "parol123",
    name: "Dilnoza Yusupova",
    image: "https://i.pravatar.cc/150?img=32",
    bio: "Interfeyslarni jonlantiraman, React va TypeScript sevaman.",
    skills: ["React", "TypeScript", "Next.js"],
    projectTitle: "PeerBoard",
    projectDescription:
      "School 21 peerlari uchun loyiha va skill almashish platformasi.",
  },
  {
    id: "u_jasurt",
    username: "jasurt",
    password: "parol123",
    name: "Jasur Tashkentov",
    image: "https://i.pravatar.cc/150?img=15",
    bio: "Mikroservislar va konteynerlashtirish bo'yicha ishlayman.",
    skills: ["Go", "Docker", "Kubernetes"],
    projectTitle: "MicroDeploy",
    projectDescription:
      "Mikroservislarni bir buyruq bilan Kubernetes klasteriga joylashtiruvchi CLI vosita.",
  },
  {
    id: "u_malika",
    username: "malika",
    password: "parol123",
    name: "Malika Rashidova",
    image: "https://i.pravatar.cc/150?img=47",
    bio: "Kompyuter ko'rish va mashinaviy o'rganish bilan qiziqaman.",
    skills: ["C++", "Algorithms", "Machine Learning"],
    projectTitle: "VisionSort",
    projectDescription:
      "Kompyuter ko'rish yordamida chiqindilarni avtomatik saralovchi tizim prototipi.",
  },
  {
    id: "u_madina",
    username: "madina",
    password: "parol123",
    name: "Madina Rasulova",
    image: "https://i.pravatar.cc/150?img=25",
    bio: "Interfeyslarni jonlantiraman.",
    skills: ["Frontend", "UI / UX"],
    projectTitle: "Focus",
    projectDescription: "Diqqatni jamlash uchun minimal vosita.",
  },
  {
    id: "u_jasura",
    username: "jasura",
    password: "parol123",
    name: "Jasur Aliyev",
    image: "https://i.pravatar.cc/150?img=53",
    bio: "Ma'lumotlar ortidagi hikoyalarni topaman.",
    skills: ["Python", "AI / ML"],
    projectTitle: "Study Buddy",
    projectDescription: "Birga o'rganish uchun yordamchi bot.",
  },
  {
    id: "u_nilufar",
    username: "nilufar",
    password: "parol123",
    name: "Nilufar Ahmedova",
    image: "https://i.pravatar.cc/150?img=45",
    bio: "Oddiylik — eng yaxshi dizayn.",
    skills: ["UI / UX", "Frontend"],
    projectTitle: "Campus Map",
    projectDescription: "Kampus ichidagi interaktiv yo'l ko'rsatkich.",
  },
  {
    id: "u_sardor",
    username: "sardor",
    password: "parol123",
    name: "Sardor Tursunov",
    image: "https://i.pravatar.cc/150?img=13",
    bio: "G'oyadan prototipgacha.",
    skills: ["Hardware", "C / C++"],
    projectTitle: "Smart Campus",
    projectDescription: "Aqlli kampus uchun IoT sensorlar tarmog'i.",
  },
  {
    id: "u_shahzod",
    username: "shahzod",
    password: "shahzod2026",
    name: "Nosirjonov M",
    image: "",
    bio: "xz",
    skills: [],
    projectTitle: "xz",
    projectDescription: "",
  },
  {
    id: "u_temurbek",
    username: "temurbek",
    password: "temurbek2026",
    name: "Temurbek Tursunov",
    image: "",
    bio: "",
    skills: [],
    projectTitle: "",
    projectDescription: "",
  },
];

const posts = [
  {
    id: "p1",
    authorId: "u_madina",
    content:
      "Kichik g'oya, katta boshlanish. ✨\n\nBugun portfolio loyihamning yangi versiyasini tugatdim. Faqat oq-qora, toza tipografika va bir chimdim React. Ba'zan kamroq — ko'proq degani.",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85",
    skill: "Frontend",
  },
  {
    id: "p2",
    authorId: "u_jasura",
    content:
      "Python o'rganayotgan pirlar, shu yerdamisiz? 👋\n\nErtaga klasterda kichik coding session qilmoqchiman. Pandas bilan real dataset ustida ishlaymiz. Boshlovchilar ham bemalol qo'shiling!\n\n📍 2-klaster · 18:00",
    imageUrl: null,
    skill: "Python",
  },
  {
    id: "p3",
    authorId: "u_sardor",
    content:
      "Birinchi ishlaydigan prototip!\n\nESP32 bilan kampusdagi xona haroratini kuzatadigan sensor yig'dim. Endi ma'lumotlarni kichik dashboardga chiqarish qoldi. Frontend bo'yicha birga ishlaydigan pir bormi?",
    imageUrl: null,
    skill: "Hardware",
  },
  {
    id: "p4",
    authorId: "u_dilnoza",
    content:
      "PeerBoard ustida ish boshlandi. 🚀\n\nBitta joyda fikr almashish, loyihalarga sherik topish va pirlar bilan aloqada bo'lish. School 21 uchun, School 21 pirlari tomonidan. Birga quramiz!",
    imageUrl: null,
    skill: "Frontend",
  },
  {
    id: "p5",
    authorId: "u_nilufar",
    content:
      "Yaxshi interfeys tafsilotlardan boshlanadi.\n\nBugun Campus Map uchun mobil maketlarni tekshirdik: kattaroq tugmalar, o'qilishi oson matn va kamroq qadam. Dizayn haqida fikr almashishga doim tayyorman.",
    imageUrl: null,
    skill: "UI / UX",
  },
  {
    id: "p6",
    authorId: "u_aziz",
    content:
      "Smart Attendance loyihasi uchun yuz tanish modelini o'qitdim — aniqlik 96% ga yetdi. Keyingi qadam: real vaqtda kamera oqimini ulash.",
    imageUrl: null,
    skill: "Python",
  },
  {
    id: "p7",
    authorId: "u_malika",
    content:
      "VisionSort: chiqindilarni kamera orqali avtomatik saralovchi tizim ustida ishlayapman. Bugun birinchi marta plastik va qog'ozni to'g'ri ajratdi. Kichik, lekin muhim qadam!",
    imageUrl: null,
    skill: "C / C++",
  },
  {
    id: "p8",
    authorId: "u_jasurt",
    content:
      "MicroDeploy uchun Docker image hajmini 400MB dan 80MB gacha qisqartirdim (multi-stage build + alpine). Kichik detallar katta farq qiladi.",
    imageUrl: null,
    skill: "C / C++",
  },
];

const comments = [
  { postId: "p1", userId: "u_nilufar", content: "Juda chiroyli! Minimalizm doim yutadi 🙌" },
  { postId: "p1", userId: "u_aziz", content: "Zo'r chiqibdi! Men ham yangi loyihani boshladim." },
  { postId: "p2", userId: "u_sardor", content: "Men ham qatnashaman!" },
  { postId: "p4", userId: "u_malika", content: "G'oya zo'r, omad!" },
  { postId: "p6", userId: "u_jasura", content: "96% zo'r natija! Qanday dataset ishlatdingiz?" },
  {
    postId: "p6",
    userId: "u_malika",
    content: "Menda ham shunga o'xshash loyiha bor, gaplashsak bo'ladimi?",
  },
  { postId: "p8", userId: "u_aziz", content: "Qanday qilganingizni bo'lishasizmi?" },
];

const likePairs = [
  ["p1", "u_aziz"], ["p1", "u_dilnoza"], ["p1", "u_sardor"],
  ["p2", "u_madina"], ["p2", "u_malika"],
  ["p3", "u_jasurt"], ["p3", "u_dilnoza"], ["p3", "u_madina"], ["p3", "u_aziz"],
  ["p4", "u_jasura"], ["p4", "u_nilufar"], ["p4", "u_sardor"],
  ["p5", "u_madina"],
  ["p6", "u_jasura"], ["p6", "u_malika"], ["p6", "u_jasurt"],
  ["p7", "u_aziz"], ["p7", "u_sardor"],
  ["p8", "u_dilnoza"],
];

const dmSeed = [
  ["u_madina", "u_aziz", "u_madina", "Salom, Aziz! Yangi loyihangiz qanday ketyapti?"],
  ["u_madina", "u_aziz", "u_aziz", "Salom! Yaxshi, hozir yuz tanish modelini sozlayapman. Aniqlik yaxshi chiqyapti."],
  ["u_madina", "u_aziz", "u_madina", "Zo'r! Biror yordam kerak bo'lsa, yozing :)"],
  ["u_madina", "u_aziz", "u_aziz", "Rahmat! Keyinroq interfeys bo'yicha fikringizni bilmoqchi edim."],
  ["u_jasura", "u_aziz", "u_jasura", "Salom! Ertaga coding sessionga kelasizmi?"],
  ["u_sardor", "u_aziz", "u_aziz", "Sensor loyihasi qanday ketyapti?"],
  ["u_sardor", "u_aziz", "u_sardor", "Prototip tayyor, ko'rsataman!"],
];

const generalSeed = [
  ["u_aziz", "Salom hammaga! 👋"],
  ["u_dilnoza", "Assalomu alaykum, bugungi kunlar qanday o'tyapti?"],
  ["u_sardor", "Kimda IoT bo'yicha tajriba bor? Maslahat kerak edi."],
  ["u_jasura", "Ertaga 2-klasterda Python session bo'ladi, kelinglar!"],
  ["u_madina", "Frontend bo'yicha peer-review kerak bo'lsa, yordam beraman."],
];

async function main() {
  await ensureSchema();

  for (const u of users) {
    // Only used on a fresh database; existing rows keep whatever password
    // they already have (e.g. changed via the admin panel) instead of
    // being reset back to the seed default on re-run.
    const { rows: existing } = await pool.query(
      `SELECT id FROM app_users WHERE id = $1`,
      [u.id]
    );
    if (existing.length > 0) continue;
    const hashed = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO app_users (id, username, password, name, image, bio, skills, project_title, project_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [u.id, u.username, hashed, u.name, u.image, u.bio, u.skills, u.projectTitle, u.projectDescription]
    );
  }
  console.log(`Foydalanuvchilar: ${users.length} ta tayyor.`);

  let postCount = 0;
  for (const p of posts) {
    const { rows } = await pool.query(`SELECT id FROM app_posts WHERE id = $1`, [p.id]);
    if (rows.length > 0) continue;
    await pool.query(
      `INSERT INTO app_posts (id, author_id, content, image_url, skill) VALUES ($1,$2,$3,$4,$5)`,
      [p.id, p.authorId, p.content, p.imageUrl, p.skill]
    );
    postCount++;
  }
  console.log(`Postlar: ${postCount} ta qo'shildi.`);

  let commentCount = 0;
  for (const c of comments) {
    const { rows } = await pool.query(
      `SELECT id FROM app_comments WHERE post_id = $1 AND user_id = $2 AND content = $3`,
      [c.postId, c.userId, c.content]
    );
    if (rows.length > 0) continue;
    await pool.query(
      `INSERT INTO app_comments (id, post_id, user_id, content) VALUES ($1,$2,$3,$4)`,
      [genId("c"), c.postId, c.userId, c.content]
    );
    commentCount++;
  }
  console.log(`Kommentlar: ${commentCount} ta qo'shildi.`);

  let likeCount = 0;
  for (const [postId, userId] of likePairs) {
    const { rows } = await pool.query(
      `SELECT id FROM app_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    if (rows.length > 0) continue;
    await pool.query(
      `INSERT INTO app_likes (id, post_id, user_id) VALUES ($1,$2,$3)`,
      [genId("l"), postId, userId]
    );
    likeCount++;
  }
  console.log(`Like'lar: ${likeCount} ta qo'shildi.`);

  const { rows: existingDm } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM app_messages WHERE channel IS NULL`
  );
  let dmCount = 0;
  if (existingDm[0].count === 0) {
    for (const [a, b, from, content] of dmSeed) {
      const to = from === a ? b : a;
      await pool.query(
        `INSERT INTO app_messages (id, sender_id, receiver_id, content, read) VALUES ($1,$2,$3,$4,true)`,
        [genId("m"), from, to, content]
      );
      dmCount++;
    }
  }
  console.log(`Shaxsiy xabarlar: ${dmCount} ta qo'shildi.`);

  const { rows: existingGeneral } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM app_messages WHERE channel = 'general'`
  );
  let generalCount = 0;
  if (existingGeneral[0].count === 0) {
    for (const [senderId, content] of generalSeed) {
      await pool.query(
        `INSERT INTO app_messages (id, sender_id, receiver_id, channel, content, read) VALUES ($1,$2,NULL,'general',$3,true)`,
        [genId("gm"), senderId, content]
      );
      generalCount++;
    }
  }
  console.log(`#general xabarlari: ${generalCount} ta qo'shildi.`);
}

main()
  .catch((error) => {
    console.error("Seed xatoligi:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
