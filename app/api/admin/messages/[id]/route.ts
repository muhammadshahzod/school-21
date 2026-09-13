import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool } from "@/lib/db";
import { getUserRoleAndMembership } from "@/lib/permissions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }
    const { role } = await getUserRoleAndMembership(session.user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id: messageId } = await params;
    const { rows } = await pool.query(
      `DELETE FROM app_messages WHERE id = $1 RETURNING id`,
      [messageId]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Xabar topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/admin/messages/[id] error:", error);
    return NextResponse.json(
      { error: "Xabarni o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
