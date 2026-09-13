import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool } from "@/lib/db";

const ADMIN_ID = "u_shahzod";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const session = await auth();
    if (session?.user?.id !== ADMIN_ID) {
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
