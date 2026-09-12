import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { personSelect } from "@/lib/selects";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");

    const users = await prisma.user.findMany({
      where: skill ? { skills: { has: skill } } : undefined,
      orderBy: { createdAt: "desc" },
      select: { ...personSelect, email: true, createdAt: true },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Foydalanuvchilarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
