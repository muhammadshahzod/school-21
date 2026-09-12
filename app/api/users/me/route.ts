import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { personSelect } from "@/lib/selects";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ...personSelect, email: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json(
      { error: "Profilni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, skills, projectTitle, projectDescription } = body;

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { error: "name matn bo'lishi kerak" },
        { status: 400 }
      );
    }
    if (skills !== undefined && !Array.isArray(skills)) {
      return NextResponse.json(
        { error: "skills massiv bo'lishi kerak" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: String(bio).trim() }),
        ...(skills !== undefined && {
          skills: skills.filter((s: unknown) => typeof s === "string"),
        }),
        ...(projectTitle !== undefined && {
          projectTitle: String(projectTitle).trim(),
        }),
        ...(projectDescription !== undefined && {
          projectDescription: String(projectDescription).trim(),
        }),
      },
      select: { ...personSelect, email: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH /api/users/me error:", error);
    return NextResponse.json(
      { error: "Profilni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
