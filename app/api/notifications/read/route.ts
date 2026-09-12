import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool } from "@/lib/db";

export async function POST() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    await pool.query(
      `UPDATE app_notifications SET read = true WHERE user_id = $1 AND read = false`,
      [session.user.id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/notifications/read error:", error);
    return NextResponse.json(
      { error: "Xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
