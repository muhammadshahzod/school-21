import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Kommentlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id: postId } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content maydoni majburiy" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post topilmadi" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Komment qo'shishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
