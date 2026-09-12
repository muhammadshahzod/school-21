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

    const existingSave = await prisma.save.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existingSave) {
      await prisma.save.delete({ where: { id: existingSave.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.save.create({ data: { postId, userId } });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("POST /api/posts/[id]/save error:", error);
    return NextResponse.json(
      { error: "Saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
