import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id: groupId } = await params;
    const { content } = await request.json();
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content maydoni majburiy" },
        { status: 400 }
      );
    }

    const { rows: memberRows } = await pool.query(
      `SELECT 1 FROM app_group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, session.user.id]
    );
    if (memberRows.length === 0) {
      return NextResponse.json(
        { error: "Siz bu guruh a'zosi emassiz" },
        { status: 403 }
      );
    }

    const id = genId("gm");
    const { rows } = await pool.query(
      `INSERT INTO app_messages (id, sender_id, group_id, content, read)
       VALUES ($1, $2, $3, $4, true) RETURNING *`,
      [id, session.user.id, groupId, content.trim()]
    );
    const row = rows[0];

    return NextResponse.json(
      {
        id: row.id,
        senderId: row.sender_id,
        groupId: row.group_id,
        content: row.content,
        createdAt: row.created_at.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/groups/[id]/messages error:", error);
    return NextResponse.json(
      { error: "Xabar yuborishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
