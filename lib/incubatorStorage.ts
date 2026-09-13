// Offline-first, resilient LocalStorage + Neon DB synchronization layer for Launch Lab 21
import { calculateProgress, type ProgressSummary } from "@/lib/incubator";

export interface StoredProject {
  id: string;
  title: string;
  pitch: string;
  description: string;
  stage: "idea" | "prototype" | "mvp" | "testing" | "launched";
  teamMembers: string[];
  requiredSkills: string[];
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  submissions: Record<string, {
    answers: Record<string, string>;
    status: "draft" | "submitted";
    version: number;
    updatedAt: string;
  }>;
  feedbacks: Record<string, {
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }[]>;
  snapshots: {
    id: string;
    versionName: string;
    createdAt: string;
    snapshotData: unknown;
  }[];
}

const STORAGE_KEY = "school21_launchlab_projects_v2";

// Two default projects as required by tournament guidelines:
// 1. Filled project (ready demo)
// 2. Empty project (clean demo for live test)
const DEFAULT_PROJECTS: StoredProject[] = [
  {
    id: "proj_peerspace",
    title: "Peer Space 21",
    pitch: "School 21 pirlari uchun aqlli hamkorlik va inkubator ekotizimi",
    description: "Startap g'oyalarini bosqichma-bosqich sinovdan o'tkazish, jamoa yig'ish va avtomatik One-Pager taqdimot tayyorlash platformasi.",
    stage: "mvp",
    teamMembers: ["Shahzod (Lead Full-stack)", "Aziz (UI/UX)", "Malika (Backend)"],
    requiredSkills: ["Frontend", "Python", "UI / UX"],
    ownerName: "shahzod",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    submissions: {
      problem: {
        answers: {
          target_user: "School 21 Toshkent kampusi pirlari, dasturlash talabalari va boshlang'ich startap asoschilari.",
          problem_statement: "Kuchli g'oya bo'lsa ham unga mos ko'nikmali hamkor topish qiyin, muloqot tarqoq Telegram guruhlarda yo'qolib ketadi va g'oyalar qog'ozda qolib ketadi.",
          current_solutions: "Telegram guruhlar, og'zaki suhbatlar va tasodifiy e'lonlar. Ularda ko'nikmalar tekshirilmagan va loyihalar bo'yicha tizimli boshqaruv yo'q.",
        },
        status: "submitted",
        version: 1,
        updatedAt: new Date().toISOString(),
      },
      customer: {
        answers: {
          target_segment: "18-28 yoshdagi faol IT talabalari va junior mutaxassislar.",
          customer_need: "Haqiqiy jamoaviy tajriba to'plash, portfolioga ishchi loyiha qo'shish va mentorlar bilan to'g'ri yo'nalish olish.",
          validation_method: "20 nafar kampus pirlari bilan o'tkazilgan chuqur CustDev intervyulari natijasida 90% respondentlar bu platformaga ehtiyoj borligini tasdiqladi.",
        },
        status: "submitted",
        version: 1,
        updatedAt: new Date().toISOString(),
      },
      solution: {
        answers: {
          solution_overview: "Foydalanuvchi profil ochadi, loyiha e'lon qiladi, tizim mos pirlarni tavsiya qiladi va Launch Lab 21 orqali g'oyani tayyor One-Pager taqdimotga aylantiradi.",
          core_benefit: "Jamoa shakllantirish va loyiha hujjatlarini tayyorlash vaqtini 3 haftadan 2 kungacha qisqartiradi.",
          unfair_advantage: "School 21 ichki peer-to-peer madaniyatiga chuqur integratsiya va bosqichma-bosqich avtomatik generatsiya qilinuvchi taqdimot tizimi.",
        },
        status: "submitted",
        version: 1,
        updatedAt: new Date().toISOString(),
      },
      mvp: {
        answers: {
          core_features: "Loyiha profili, 6 bosqichli inkubator modullari, real-time javob saqlash va A4 formatida avtomatik One-Pager.",
          test_plan: "School 21 turniri davomida hakamlar va jamoalar ishtirokida to'liq tsiklni jonli sinovdan o'tkazish.",
          success_metrics: "100% javoblarning saqlanib qolishi, reload paytida ma'lumot yo'qolmasligi va barcha modullardan One-Pager yig'ilishi.",
        },
        status: "submitted",
        version: 1,
        updatedAt: new Date().toISOString(),
      },
    },
    feedbacks: {
      problem: [
        {
          id: "fb_1",
          author: "Mentor / Xodim",
          text: "Muammo juda aniq ifodalangan. Kampus doirasida ehtiyoj haqiqatda yuqori.",
          createdAt: new Date().toISOString(),
        },
      ],
    },
    snapshots: [
      {
        id: "snap_demo_1",
        versionName: "v1.0 Demo Day",
        createdAt: new Date().toISOString(),
        snapshotData: {},
      },
    ],
  },
  {
    id: "proj_finflow",
    title: "FinFlow AI",
    pitch: "Kichik biznes uchun avtomatlashtirilgan moliyaviy analitika",
    description: "Boshlang'ich g'oya bosqichidagi yangi loyiha. Modullarni to'ldirish orqali startap shakllantiriladi.",
    stage: "idea",
    teamMembers: ["Alisher (Solo founder)"],
    requiredSkills: ["Python", "Backend"],
    ownerName: "alisher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissions: {},
    feedbacks: {},
    snapshots: [],
  },
];

export function getLocalProjects(): StoredProject[] {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return parsed;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveLocalProjects(projects: StoredProject[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("LocalStorage save error:", e);
  }
}

export function getLocalProjectById(id: string): StoredProject | undefined {
  const projects = getLocalProjects();
  return projects.find((p) => p.id === id);
}

export function saveLocalProject(project: StoredProject): void {
  const projects = getLocalProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    projects.unshift({ ...project, updatedAt: new Date().toISOString() });
  }
  saveLocalProjects(projects);
}

export function saveLocalModuleAnswer(
  projectId: string,
  moduleId: string,
  answers: Record<string, string>,
  status: "draft" | "submitted" = "submitted"
): StoredProject {
  const projects = getLocalProjects();
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) {
    throw new Error("Loyiha topilmadi");
  }

  const existingSub = proj.submissions[moduleId];
  const nextVersion = (existingSub?.version || 0) + 1;

  proj.submissions[moduleId] = {
    answers,
    status,
    version: nextVersion,
    updatedAt: new Date().toISOString(),
  };
  proj.updatedAt = new Date().toISOString();

  saveLocalProjects(projects);
  return proj;
}

export function addLocalFeedback(
  projectId: string,
  moduleId: string,
  author: string,
  text: string
): void {
  const projects = getLocalProjects();
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;

  if (!proj.feedbacks[moduleId]) {
    proj.feedbacks[moduleId] = [];
  }
  proj.feedbacks[moduleId].push({
    id: `fb_${Date.now()}`,
    author,
    text,
    createdAt: new Date().toISOString(),
  });
  saveLocalProjects(projects);
}

export function saveLocalSnapshot(
  projectId: string,
  versionName: string
): string {
  const projects = getLocalProjects();
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) throw new Error("Loyiha topilmadi");

  const snapId = `snap_${Date.now()}`;
  proj.snapshots.unshift({
    id: snapId,
    versionName: versionName || `Snapshot ${new Date().toLocaleDateString("uz-UZ")}`,
    createdAt: new Date().toISOString(),
    snapshotData: JSON.parse(JSON.stringify(proj)),
  });

  saveLocalProjects(projects);
  return snapId;
}

export function getProjectProgress(project: StoredProject): ProgressSummary {
  const subs = Object.entries(project.submissions).map(([moduleId, data]) => ({
    moduleId,
    status: data.status,
  }));
  return calculateProgress(subs);
}
