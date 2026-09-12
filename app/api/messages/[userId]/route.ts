import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { userId: otherUserId } = await params;
    const myId = session.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/messages/[userId] error:", error);
    return NextResponse.json(
      { error: "Xabarlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
