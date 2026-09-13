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

    const { id } = await params;
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "O'z admin akkauntingizni o'chirib bo'lmaydi" },
        { status: 400 }
      );
    }

    await pool.query(`DELETE FROM app_users WHERE id = $1`, [id]);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Foydalanuvchini o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
