import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { rows } = await pool.query(
      `SELECT m.* FROM app_messages m
       JOIN app_group_members gm ON gm.group_id = m.group_id
       WHERE gm.user_id = $1 AND m.group_id IS NOT NULL
       ORDER BY m.created_at ASC`,
      [session.user.id]
    );

    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        groupId: row.group_id,
        content: row.content,
        createdAt: row.created_at.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/groups/messages error:", error);
    return NextResponse.json(
      { error: "Guruh xabarlarini olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
