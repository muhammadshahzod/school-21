import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { userId: otherUserId } = await params;
    const myId = session.user.id;

    const { rows } = await pool.query(
      `SELECT * FROM app_messages
       WHERE channel IS NULL
         AND ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1))
       ORDER BY created_at ASC`,
      [myId, otherUserId]
    );

    await pool.query(
      `UPDATE app_messages SET read = true
       WHERE channel IS NULL AND sender_id = $1 AND receiver_id = $2 AND read = false`,
      [otherUserId, myId]
    );

    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        read: row.read,
        createdAt: row.created_at.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/messages/[userId] error:", error);
    return NextResponse.json(
      { error: "Xabarlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
