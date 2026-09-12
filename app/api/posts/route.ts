import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPostSkill } from "@/lib/skills";
import { personSelect as authorSelect } from "@/lib/selects";

export async function GET() {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: authorSelect },
        _count: { select: { likes: true, comments: true } },
        likes: currentUserId
          ? { where: { userId: currentUserId }, select: { id: true } }
          : false,
        saves: currentUserId
          ? { where: { userId: currentUserId }, select: { id: true } }
          : false,
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: authorSelect } },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Postlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await request.json();
    const { content, imageUrl, skill } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content maydoni majburiy" },
        { status: 400 }
      );
    }

    if (skill !== undefined && !isPostSkill(skill)) {
      return NextResponse.json(
        { error: "skill qiymati noto'g'ri" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl || null,
        skill: skill ?? "Frontend",
        authorId: session.user.id,
      },
      include: {
        author: { select: authorSelect },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Post yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
