import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Matches the online threshold used to bump lastActiveAt in lib/auth.ts.
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    const [total, online, skillCounts] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { lastActiveAt: { gte: new Date(Date.now() - ONLINE_THRESHOLD_MS) } },
      }),
      prisma.post.groupBy({
        by: ["skill"],
        _count: { _all: true },
        orderBy: { _count: { skill: "desc" } },
        take: 3,
      }),
    ]);

    const topics = skillCounts.map((row) => ({
      name: `#${row.skill.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
      posts: row._count._all,
      skill: row.skill,
    }));

    return NextResponse.json({ total, online, topics });
  } catch (error) {
    console.error("GET /api/community error:", error);
    return NextResponse.json(
      { error: "Hamjamiyat statistikasini olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
