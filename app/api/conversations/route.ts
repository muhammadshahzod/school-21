import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool, toPublicUser } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }
    const myId = session.user.id;

    const { rows: messages } = await pool.query(
      `SELECT * FROM app_messages
       WHERE channel IS NULL AND (sender_id = $1 OR receiver_id = $1)
       ORDER BY created_at DESC`,
      [myId]
    );

    const usersMap = new Map(
      (await pool.query(`SELECT * FROM app_users`)).rows.map((row) => [
        row.id,
        toPublicUser(row),
      ])
    );

    const conversations = new Map<
      string,
      { id: string; peer: ReturnType<typeof toPublicUser>; lastMessage: string; time: string; unread: number }
    >();

    for (const message of messages) {
      const isMine = message.sender_id === myId;
      const peerId = isMine ? message.receiver_id : message.sender_id;
      if (!peerId || conversations.has(peerId)) continue;
      const peer = usersMap.get(peerId);
      if (!peer) continue;

      const unread = messages.filter(
        (m) => m.sender_id === peerId && m.receiver_id === myId && !m.read
      ).length;

      conversations.set(peerId, {
        id: peerId,
        peer,
        lastMessage: message.content,
        time: message.created_at.toISOString(),
        unread,
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
