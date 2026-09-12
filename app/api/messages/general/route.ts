import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool } from "@/lib/db";

const GENERAL_CHANNEL = "general";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { rows } = await pool.query(
      `SELECT * FROM app_messages WHERE channel = $1 ORDER BY created_at ASC`,
      [GENERAL_CHANNEL]
    );

    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        content: row.content,
        createdAt: row.created_at.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/messages/general error:", error);
    return NextResponse.json(
      { error: "Umumiy xabarlarni olishda xatolik yuz berdi" },
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

    const { content } = await request.json();
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content maydoni majburiy" },
        { status: 400 }
      );
    }

    const id = genId("gm");
    const { rows } = await pool.query(
      `INSERT INTO app_messages (id, sender_id, receiver_id, channel, content, read)
       VALUES ($1, $2, NULL, $3, $4, true) RETURNING *`,
      [id, session.user.id, GENERAL_CHANNEL, content.trim()]
    );
    const row = rows[0];

    return NextResponse.json(
      {
        id: row.id,
        senderId: row.sender_id,
        content: row.content,
        createdAt: row.created_at.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/messages/general error:", error);
    return NextResponse.json(
      { error: "Xabar yuborishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
