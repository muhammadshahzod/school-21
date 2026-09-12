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

    const { id } = await params;
    if (id === ADMIN_ID) {
      return NextResponse.json(
        { error: "Admin akkauntini o'chirib bo'lmaydi" },
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
