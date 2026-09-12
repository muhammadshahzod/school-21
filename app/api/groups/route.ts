import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool, toPublicUser } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { rows: groupRows } = await pool.query(
      `SELECT g.* FROM app_groups g
       JOIN app_group_members m ON m.group_id = g.id
       WHERE m.user_id = $1
       ORDER BY g.created_at DESC`,
      [session.user.id]
    );

    const groups = [];
    for (const group of groupRows) {
      const { rows: memberRows } = await pool.query(
        `SELECT u.* FROM app_users u
         JOIN app_group_members m ON m.user_id = u.id
         WHERE m.group_id = $1`,
        [group.id]
      );
      const { rows: lastMessageRows } = await pool.query(
        `SELECT content, created_at FROM app_messages
         WHERE group_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [group.id]
      );
      const last = lastMessageRows[0];

      groups.push({
        id: group.id,
        name: group.name,
        members: memberRows.map(toPublicUser),
        lastMessage: last?.content ?? "Guruh yaratildi",
        time: (last?.created_at ?? group.created_at).toISOString(),
      });
    }

    return NextResponse.json(groups);
  } catch (error) {
    console.error("GET /api/groups error:", error);
    return NextResponse.json(
      { error: "Guruhlarni olishda xatolik yuz berdi" },
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

    const { name, memberIds } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name maydoni majburiy" },
        { status: 400 }
      );
    }
    const members = Array.isArray(memberIds)
      ? memberIds.filter((id: unknown) => typeof id === "string")
      : [];

    const id = genId("g");
    await pool.query(
      `INSERT INTO app_groups (id, name, created_by) VALUES ($1, $2, $3)`,
      [id, name.trim(), session.user.id]
    );

    const allMemberIds = Array.from(new Set([session.user.id, ...members]));
    for (const memberId of allMemberIds) {
      await pool.query(
        `INSERT INTO app_group_members (group_id, user_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [id, memberId]
      );
    }

    const { rows: memberRows } = await pool.query(
      `SELECT u.* FROM app_users u
       JOIN app_group_members m ON m.user_id = u.id
       WHERE m.group_id = $1`,
      [id]
    );

    return NextResponse.json(
      {
        id,
        name: name.trim(),
        members: memberRows.map(toPublicUser),
        lastMessage: "Guruh yaratildi",
        time: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/groups error:", error);
    return NextResponse.json(
      { error: "Guruh yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
