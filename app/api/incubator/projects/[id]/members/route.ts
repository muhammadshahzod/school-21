import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool } from "@/lib/db";
import { canEditProject } from "@/lib/permissions";

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

    const { id: projectId } = await params;
    const canManage = await canEditProject(session.user.id, projectId);
    if (!canManage) {
      return NextResponse.json(
        { error: "A'zolarni boshqarish faqat jamoa egasiga ruxsat etilgan" },
        { status: 403 }
      );
    }

    const { userId } = await request.json();
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId majburiy" }, { status: 400 });
    }

    // Check if user exists
    const { rows: userRows } = await pool.query(
      `SELECT id FROM app_users WHERE id = $1`,
      [userId]
    );
    if (userRows.length === 0) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    // Upsert member
    await pool.query(
      `INSERT INTO incubator_project_members (project_id, user_id, role, status)
       VALUES ($1, $2, 'member', 'accepted')
       ON CONFLICT (project_id, user_id) 
       DO UPDATE SET status = 'accepted'`,
      [projectId, userId]
    );

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("POST /api/incubator/projects/[id]/members error:", error);
    return NextResponse.json(
      { error: "A'zoni qo'shishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { userId } = await request.json();

    // User can remove themselves OR owner can remove member
    const canManage = await canEditProject(session.user.id, projectId);
    const isSelf = session.user.id === userId;

    if (!canManage && !isSelf) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    // Protect owner from being removed
    const { rows: projectRows } = await pool.query(
      `SELECT owner_id FROM incubator_projects WHERE id = $1`,
      [projectId]
    );
    if (projectRows[0]?.owner_id === userId) {
      return NextResponse.json(
        { error: "Loyiha egasini jamoa a'zoligidan chiqarib bo'lmaydi" },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM incubator_project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    return NextResponse.json({ deleted: true, userId });
  } catch (error) {
    console.error("DELETE /api/incubator/projects/[id]/members error:", error);
    return NextResponse.json(
      { error: "A'zoni chiqarishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
