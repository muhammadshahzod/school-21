import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { rows } = await pool.query(
      `SELECT * FROM app_messages
       WHERE channel IS NULL AND (sender_id = $1 OR receiver_id = $1)
       ORDER BY created_at ASC`,
      [session.user.id]
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
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { error: "Xabarlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
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

    const { rows: receiverRows } = await pool.query(
      `SELECT id FROM app_users WHERE id = $1`,
      [receiverId]
    );
    if (receiverRows.length === 0) {
      return NextResponse.json(
        { error: "Qabul qiluvchi foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    const id = genId("m");
    const { rows } = await pool.query(
      `INSERT INTO app_messages (id, sender_id, receiver_id, content) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, session.user.id, receiverId, content.trim()]
    );
    const row = rows[0];

    return NextResponse.json(
      {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        read: row.read,
        createdAt: row.created_at.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: "Xabar yuborishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
