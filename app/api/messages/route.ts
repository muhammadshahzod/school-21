import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { error: "Xabarlarni olishda xatolik yuz berdi" },
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

    const { receiverId, content } = await request.json();

    if (!receiverId || typeof receiverId !== "string") {
      return NextResponse.json(
        { error: "receiverId maydoni majburiy" },
        { status: 400 }
      );
    }
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content maydoni majburiy" },
        { status: 400 }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      return NextResponse.json(
        { error: "Qabul qiluvchi foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: "Xabar yuborishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
