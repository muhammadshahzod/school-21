import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const users = [
  {
    email: "aziz.karimov@school21.uz",
    username: "akarimov",
    name: "Aziz Karimov",
    image: "https://i.pravatar.cc/150?img=11",
    bio: "Backend va ma'lumotlar bazalari bilan shug'ullanaman.",
    skills: ["Python", "Django", "PostgreSQL"],
    projectTitle: "Smart Attendance",
    projectDescription:
      "Yuz tanish orqali talabalar davomatini avtomatik qayd qiluvchi tizim.",
  },
  {
    email: "dilnoza.yusupova@school21.uz",
    username: "dyusupova",
    name: "Dilnoza Yusupova",
    image: "https://i.pravatar.cc/150?img=32",
    bio: "Interfeyslarni jonlantiraman, React va TypeScript sevaman.",
    skills: ["React", "TypeScript", "Next.js"],
    projectTitle: "PeerBoard",
    projectDescription:
      "School 21 peerlari uchun loyiha va skill almashish platformasi.",
  },
  {
    email: "jasur.tashkentov@school21.uz",
    username: "jtashkentov",
    name: "Jasur Tashkentov",
    image: "https://i.pravatar.cc/150?img=15",
    bio: "Mikroservislar va konteynerlashtirish bo'yicha ishlayman.",
    skills: ["Go", "Docker", "Kubernetes"],
    projectTitle: "MicroDeploy",
    projectDescription:
      "Mikroservislarni bir buyruq bilan Kubernetes klasteriga joylashtiruvchi CLI vosita.",
  },
  {
    email: "malika.rashidova@school21.uz",
    username: "mrashidova",
    name: "Malika Rashidova",
    image: "https://i.pravatar.cc/150?img=47",
    bio: "Kompyuter ko'rish va mashinaviy o'rganish bilan qiziqaman.",
    skills: ["C++", "Algorithms", "Machine Learning"],
    projectTitle: "VisionSort",
    projectDescription:
      "Kompyuter ko'rish yordamida chiqindilarni avtomatik saralovchi tizim prototipi.",
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }
  console.log(`Seed muvaffaqiyatli: ${users.length} ta foydalanuvchi qo'shildi.`);
}

main()
  .catch((error) => {
    console.error("Seed xatoligi:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
