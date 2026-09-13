import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { ensureSchema, pool } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json(
        { error: "Joriy parolni kiriting" },
        { status: 400 }
      );
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 4) {
      return NextResponse.json(
        { error: "Yangi parol kamida 4 belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `SELECT password FROM app_users WHERE id = $1`,
      [session.user.id]
    );
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) {
      return NextResponse.json(
        { error: "Joriy parol noto'g'ri" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE app_users SET password = $1 WHERE id = $2`, [
      hashed,
      session.user.id,
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/users/me/password error:", error);
    return NextResponse.json(
      { error: "Parolni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
