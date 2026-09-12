import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { personSelect as peerSelect } from "@/lib/selects";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }
    const myId = session.user.id;

    const messages = await prisma.message.findMany({
      where: {
        channel: null,
        OR: [{ senderId: myId }, { receiverId: myId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: peerSelect },
        receiver: { select: peerSelect },
      },
    });

    const unreadCounts = await prisma.message.groupBy({
      by: ["senderId"],
      where: { receiverId: myId, read: false },
      _count: { _all: true },
    });
    const unreadBySender = new Map(
      unreadCounts.map((row) => [row.senderId, row._count._all])
    );

    const conversations = new Map<
      string,
      {
        id: string;
        peer: (typeof messages)[number]["sender"];
        lastMessage: string;
        time: string;
        unread: number;
      }
    >();

    for (const message of messages) {
      const isMine = message.senderId === myId;
      const peer = isMine ? message.receiver : message.sender;
      // channel: null above guarantees a receiver for 1-1 messages, but
      // Prisma's static type still allows null since the column is nullable.
      if (!peer || conversations.has(peer.id)) continue;

      conversations.set(peer.id, {
        id: peer.id,
        peer,
        lastMessage: message.content,
        time: message.createdAt.toISOString(),
        unread: unreadBySender.get(peer.id) ?? 0,
      });
    }

    return NextResponse.json(Array.from(conversations.values()));
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json(
      { error: "Suhbatlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
