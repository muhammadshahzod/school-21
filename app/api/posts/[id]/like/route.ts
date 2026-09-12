import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post topilmadi" }, { status: 404 });
    }

    const existingLike = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.like.create({ data: { postId, userId } });
    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json(
      { error: "Like bosishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
